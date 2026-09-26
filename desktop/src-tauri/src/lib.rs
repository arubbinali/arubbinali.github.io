mod actions;
mod assistant;
mod database;
mod discovery;
mod git;
mod insights;
mod model;
mod platform;
use database::Result;
use model::*;
use std::{
    path::PathBuf,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
};
use tauri::{Emitter, Manager, State};

#[derive(Clone)]
struct Workspace {
    db: PathBuf,
    scanning: Arc<AtomicBool>,
    cancel: Arc<AtomicBool>,
}
async fn work<T: Send + 'static>(f: impl FnOnce() -> Result<T> + Send + 'static) -> Result<T> {
    tauri::async_runtime::spawn_blocking(f)
        .await
        .map_err(|e| e.to_string())?
}
#[tauri::command]
async fn load_workspace(state: State<'_, Workspace>) -> Result<Snapshot> {
    let path = state.db.clone();
    work(move || database::snapshot(&database::connect(&path)?, &path)).await
}
#[tauri::command]
async fn save_settings(state: State<'_, Workspace>, settings: Settings) -> Result<()> {
    let path = state.db.clone();
    work(move || {
        for root in settings.roots.iter().chain(settings.exclusions.iter()) {
            discovery::canonical(root)?;
        }
        database::save_settings(&database::connect(&path)?, &settings)
    })
    .await
}
#[tauri::command]
async fn discover_projects(
    app: tauri::AppHandle,
    state: State<'_, Workspace>,
) -> Result<ScanResult> {
    if state.scanning.swap(true, Ordering::SeqCst) {
        return Err("A scan is already running".into());
    }
    state.cancel.store(false, Ordering::SeqCst);
    let state = state.inner().clone();
    let finished = state.scanning.clone();
    let result = work(move || {
        let settings = database::settings(&database::connect(&state.db)?)?;
        discovery::scan(
            &settings.roots,
            &settings.exclusions,
            &state.cancel,
            |visited| {
                let _ = app.emit("scan-progress", visited);
            },
        )
    })
    .await;
    finished.store(false, Ordering::SeqCst);
    result
}
#[tauri::command]
fn cancel_scan(state: State<'_, Workspace>) {
    state.cancel.store(true, Ordering::SeqCst);
}
#[tauri::command]
async fn add_projects(state: State<'_, Workspace>, paths: Vec<String>) -> Result<()> {
    let path = state.db.clone();
    work(move || {
        if paths.len() > 500 {
            return Err("Add up to 500 projects at a time".into());
        }
        let mut db = database::connect(&path)?;
        let tx = db.transaction().map_err(|e| e.to_string())?;
        for input in paths {
            let p = discovery::describe(&discovery::canonical(&input)?)?;
            if database::project(&tx, &p.path).is_ok() {
                continue;
            }
            database::save_project(&tx, &p)?;
            database::record(&tx, Some(&p.path), "Added project", &p.name)?;
        }
        tx.commit().map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
}
#[tauri::command]
async fn update_project(state: State<'_, Workspace>, project: Project) -> Result<()> {
    let path = state.db.clone();
    work(move || {
        let db = database::connect(&path)?;
        let mut old = database::project(&db, &project.path)?;
        if !project.dev_url.is_empty() {
            platform::validate_url(&project.dev_url)?;
        }
        old.preferred_ide = project.preferred_ide;
        let name = project.name.trim();
        if name.is_empty() || name.len() > 80 {
            return Err("Project display names must be 1–80 characters".into());
        }
        old.name = name.into();
        old.pinned = project.pinned;
        old.notes = project.notes;
        old.dev_url = project.dev_url;
        old.resume = project.resume;
        database::save_project(&db, &old)
    })
    .await
}
#[tauri::command]
async fn forget_project(state: State<'_, Workspace>, path: String) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || {
        let db = database::connect(&dbpath)?;
        db.execute("DELETE FROM projects WHERE path=?1", [&path])
            .map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
}
#[tauri::command]
async fn inspect_project(state: State<'_, Workspace>, path: String) -> Result<ProjectDetail> {
    let dbpath = state.db.clone();
    work(move || {
        let db = database::connect(&dbpath)?;
        let project = database::project(&db, &path)?;
        let projects: Vec<Project> = database::read_json(&db, "SELECT data FROM projects")?;
        let path = discovery::canonical(&project.path)?;
        let (mut commands, warnings) = discovery::discovered_commands(&path);
        commands.extend(database::commands(&db, &project.path)?);
        let git = git::inspect(&path);
        let health = insights::inspect(&path, &git, &projects);
        let capsules = database::capsules(&db, &project.path)?;
        let workflows = database::workflows(&db, &project.path)?;
        Ok(ProjectDetail {
            git,
            recent_files: discovery::recent_files(&path),
            project,
            commands,
            warnings,
            health,
            capsules,
            workflows,
        })
    })
    .await
}

#[tauri::command]
async fn set_session_goal(state: State<'_, Workspace>, id: i64, goal: String) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || database::set_session_goal(&database::connect(&dbpath)?, id, &goal)).await
}

#[tauri::command]
async fn finish_session(state: State<'_, Workspace>, id: i64) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || database::end_work_session(&database::connect(&dbpath)?, id, now())).await
}

#[tauri::command]
async fn save_context_capsule(
    state: State<'_, Workspace>,
    path: String,
    name: String,
    goal: String,
) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || {
        let db = database::connect(&dbpath)?;
        let project = database::project(&db, &path)?;
        let canonical = discovery::canonical(&path)?;
        let git = git::inspect(&canonical);
        let name = name.trim();
        if name.is_empty() || name.chars().count() > 80 {
            return Err("Context names must be 1–80 characters".into());
        }
        let capsule = ContextCapsule {
            id: 0,
            project_path: project.path.clone(),
            name: name.into(),
            goal: goal.trim().chars().take(160).collect(),
            branch: git.branch,
            latest_commit: git.latest,
            changed_files: git.changes.len(),
            command: project.last_command.clone(),
            dev_url: project.dev_url.clone(),
            notes: project.notes.clone(),
            created_at: now(),
        };
        database::save_capsule(&db, &capsule)?;
        database::record(&db, Some(&project.path), "Saved context", &capsule.name)
    })
    .await
}

#[tauri::command]
async fn delete_context_capsule(state: State<'_, Workspace>, id: i64) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || database::delete_capsule(&database::connect(&dbpath)?, id)).await
}

#[tauri::command]
async fn export_workspace(state: State<'_, Workspace>, destination: String) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || {
        let destination = PathBuf::from(destination);
        if !destination.is_absolute()
            || destination.extension().and_then(|value| value.to_str()) != Some("json")
        {
            return Err("Choose an absolute .json destination for the backup".into());
        }
        let db = database::connect(&dbpath)?;
        let bundle = serde_json::json!({
            "format": "doaor-workspace-backup",
            "version": 1,
            "exportedAt": now(),
            "projects": database::read_json::<Project>(&db, "SELECT data FROM projects ORDER BY path")?,
            "applications": database::read_json::<Ide>(&db, "SELECT data FROM ides ORDER BY id")?,
            "settings": database::settings(&db)?,
            "commands": database::indexed_commands(&db)?,
            "contexts": database::all_capsules(&db)?,
            "sessions": database::work_sessions(&db, 0)?,
        });
        let bytes = serde_json::to_vec_pretty(&bundle).map_err(|e| e.to_string())?;
        std::fs::write(&destination, bytes)
            .map_err(|e| format!("Could not write workspace backup: {e}"))?;
        Ok(())
    })
    .await
}

#[tauri::command]
async fn save_workflow(state: State<'_, Workspace>, mut workflow: ProjectWorkflow) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || {
        database::project(&database::connect(&dbpath)?, &workflow.project_path)?;
        let name = workflow.name.trim();
        if name.is_empty() || name.chars().count() > 60 {
            return Err("Workflow names must be 1–60 characters".into());
        }
        workflow.name = name.into();
        if workflow.id.is_empty() {
            workflow.id = format!("workflow:{}", now());
        }
        database::save_workflow(&database::connect(&dbpath)?, &workflow)
    })
    .await
}

#[tauri::command]
async fn delete_workflow(
    state: State<'_, Workspace>,
    project_path: String,
    id: String,
) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || database::delete_workflow(&database::connect(&dbpath)?, &project_path, &id)).await
}

#[tauri::command]
async fn run_workflow(
    state: State<'_, Workspace>,
    project_path: String,
    id: String,
    expected_command: Option<String>,
) -> Result<actions::ActionResult> {
    let dbpath = state.db.clone();
    work(move || {
        let db = database::connect(&dbpath)?;
        let workflow = database::workflows(&db, &project_path)?
            .into_iter()
            .find(|workflow| workflow.id == id)
            .ok_or("Workflow no longer exists")?;
        let result = actions::execute_with_plan(
            &dbpath,
            project_path.clone(),
            "resume".into(),
            workflow.plan.command_id.clone(),
            expected_command,
            Some(workflow.plan),
            &actions::NativeLauncher,
        )?;
        if result.completed().iter().any(|item| item == "Opened IDE") {
            let project = database::project(&db, &project_path)?;
            let ides: Vec<Ide> = database::read_json(&db, "SELECT data FROM ides")?;
            if let Some(ide) = ides
                .iter()
                .find(|ide| Some(&ide.id) == project.preferred_ide.as_ref())
            {
                database::start_work_session(&db, Some(&project_path), ide)?;
            }
        }
        Ok(result)
    })
    .await
}

#[tauri::command]
async fn save_app_rule(
    state: State<'_, Workspace>,
    app_id: String,
    project_path: String,
) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || database::save_app_rule(&database::connect(&dbpath)?, &app_id, &project_path))
        .await
}
#[tauri::command]
async fn detect_ides(state: State<'_, Workspace>) -> Result<()> {
    let path = state.db.clone();
    work(move || {
        let db = database::connect(&path)?;
        let existing: Vec<Ide> = database::read_json(&db, "SELECT data FROM ides")?;
        for ide in platform::detect_ides() {
            if !existing
                .iter()
                .any(|i| i.path.eq_ignore_ascii_case(&ide.path))
            {
                database::save_ide(&db, &ide)?;
            }
        }
        Ok(())
    })
    .await
}
#[tauri::command]
async fn save_ide(state: State<'_, Workspace>, mut ide: Ide) -> Result<()> {
    let path = state.db.clone();
    work(move || {
        platform::validate_ide(&ide)?;
        ide.id = ide.path.to_lowercase();
        database::save_ide(&database::connect(&path)?, &ide)
    })
    .await
}
#[tauri::command]
async fn save_command(
    state: State<'_, Workspace>,
    path: String,
    mut command: ProjectCommand,
) -> Result<()> {
    let dbpath = state.db.clone();
    work(move || {
        let db = database::connect(&dbpath)?;
        database::project(&db, &path)?;
        if command.command.trim().is_empty()
            || command.name.trim().is_empty()
            || command.command.len() > 8000
        {
            return Err("Enter a name and command (up to 8,000 characters)".into());
        }
        command.id = format!("custom:{}", command.name);
        command.source = "Custom".into();
        db.execute(
            "INSERT OR REPLACE INTO commands(project_path,id,data) VALUES(?1,?2,?3)",
            rusqlite::params![
                path,
                command.id,
                serde_json::to_string(&command).map_err(|e| e.to_string())?
            ],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
}
#[tauri::command]
async fn clear_activity(state: State<'_, Workspace>) -> Result<()> {
    let path = state.db.clone();
    work(move || {
        database::connect(&path)?
            .execute_batch("DELETE FROM activity; DELETE FROM work_sessions;")
            .map_err(|e| e.to_string())?;
        Ok(())
    })
    .await
}
#[tauri::command]
async fn launch_application(state: State<'_, Workspace>, id: String) -> Result<()> {
    let path = state.db.clone();
    work(move || {
        let db = database::connect(&path)?;
        let ides: Vec<Ide> = database::read_json(&db, "SELECT data FROM ides")?;
        let ide = ides
            .iter()
            .find(|ide| ide.id == id)
            .ok_or("Application is not configured")?;
        platform::validate_ide(ide)?;
        std::process::Command::new(&ide.path)
            .spawn()
            .map_err(|e| e.to_string())?;
        let project_path = database::app_rules(&db)?
            .into_iter()
            .find(|rule| rule.app_id == ide.id)
            .map(|rule| rule.project_path);
        database::start_work_session(&db, project_path.as_deref(), ide)?;
        database::record(&db, None, "Opened application", &ide.name)
    })
    .await
}
#[tauri::command]
async fn perform_action(
    state: State<'_, Workspace>,
    path: String,
    action: String,
    command_id: Option<String>,
    expected_command: Option<String>,
) -> Result<actions::ActionResult> {
    let dbpath = state.db.clone();
    work(move || {
        let result = actions::execute(
            &dbpath,
            path.clone(),
            action,
            command_id,
            expected_command,
            &actions::NativeLauncher,
        )?;
        if result.completed().iter().any(|item| item == "Opened IDE") {
            let db = database::connect(&dbpath)?;
            let project = database::project(&db, &path)?;
            let ides: Vec<Ide> = database::read_json(&db, "SELECT data FROM ides")?;
            if let Some(ide) = ides
                .iter()
                .find(|ide| Some(&ide.id) == project.preferred_ide.as_ref())
            {
                database::start_work_session(&db, Some(&path), ide)?;
            }
        }
        Ok(result)
    })
    .await
}

#[tauri::command]
async fn load_stats(state: State<'_, Workspace>) -> Result<StatsSnapshot> {
    let dbpath = state.db.clone();
    work(move || {
        let db = database::connect(&dbpath)?;
        let sessions = database::work_sessions(&db, 0)?;
        let projects: Vec<Project> = database::read_json(&db, "SELECT data FROM projects")?;
        let mut commits = vec![];
        for project in projects {
            let path = std::path::Path::new(&project.path);
            if !path.join(".git").exists() {
                continue;
            }
            if let Ok(output) = git::output("git", &["log", "--all", "--format=%ct"], Some(path)) {
                commits.extend(output.lines().filter_map(|line| {
                    line.parse::<i64>().ok().map(|at| CommitPoint {
                        project_path: project.path.clone(),
                        at,
                    })
                }));
            }
        }
        Ok(StatsSnapshot { sessions, commits })
    })
    .await
}

fn start_session_monitor(app: tauri::AppHandle, dbpath: PathBuf) {
    std::thread::spawn(move || loop {
        std::thread::sleep(std::time::Duration::from_secs(3));
        let Ok(db) = database::connect(&dbpath) else {
            continue;
        };
        let Ok(active) = database::active_work_sessions(&db) else {
            continue;
        };
        let mut changed = false;
        for session in active
            .into_iter()
            .filter(|session| session.ended_at.is_none())
        {
            if now() - session.started_at < 7 {
                continue;
            }
            if matches!(
                platform::application_is_running(&session.executable_path),
                Ok(false)
            ) {
                let _ = database::end_work_session(&db, session.id, now());
                changed = true;
            }
        }
        if changed {
            let _ = app.emit("work-session-updated", ());
        }
    });
}
#[tauri::command]
async fn inspect_tools() -> Vec<(String, String)> {
    tauri::async_runtime::spawn_blocking(|| {
        [
            ("Git", "git", "--version"),
            ("Node.js", "node", "--version"),
            ("Python", "python", "--version"),
            ("Java", "java", "--version"),
            ("Rust", "rustc", "--version"),
            ("Cargo", "cargo", "--version"),
            ("PowerShell 7", "pwsh", "--version"),
        ]
        .iter()
        .map(|(name, exe, arg)| {
            (
                name.to_string(),
                git::output(exe, &[*arg], None)
                    .map(|s| s.lines().next().unwrap_or("").to_string())
                    .unwrap_or_else(|_| "Not detected on PATH".into()),
            )
        })
        .collect()
    })
    .await
    .unwrap_or_default()
}
#[tauri::command]
async fn assistant_catalog() -> assistant::AssistantCatalog {
    tauri::async_runtime::spawn_blocking(assistant::catalog)
        .await
        .unwrap_or_else(|_| assistant::catalog())
}

#[tauri::command]
async fn execute_assistant_action(
    state: State<'_, Workspace>,
    action: assistant::AssistantAction,
) -> Result<String> {
    let dbpath = state.db.clone();
    work(move || {
        let result = assistant::execute(action)?;
        let db = database::connect(&dbpath)?;
        database::record(&db, None, "Assistant action", &result)?;
        Ok(result)
    }).await
}
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let dir = app.path().app_local_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            let db = dir.join("workspace.sqlite3");
            database::connect(&db).map_err(std::io::Error::other)?;
            start_session_monitor(app.handle().clone(), db.clone());
            app.manage(Workspace {
                db,
                scanning: Arc::new(AtomicBool::new(false)),
                cancel: Arc::new(AtomicBool::new(false)),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_workspace,
            save_settings,
            discover_projects,
            cancel_scan,
            add_projects,
            update_project,
            forget_project,
            inspect_project,
            detect_ides,
            save_ide,
            save_command,
            clear_activity,
            launch_application,
            perform_action,
            inspect_tools,
            load_stats,
            set_session_goal,
            finish_session,
            save_context_capsule,
            delete_context_capsule,
            export_workspace,
            save_workflow,
            delete_workflow,
            run_workflow,
            save_app_rule,
            assistant_catalog,
            execute_assistant_action
        ])
        .run(tauri::generate_context!())
        .expect("Could not start doaorel");
}
