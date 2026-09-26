use crate::{
    database::{self, Result},
    discovery,
    model::*,
    platform,
};
use std::path::Path;

// Keeps native process creation out of workflow tests and future terminal adapters.
pub trait Launcher {
    fn ide(&self, ide: &Ide, cwd: &Path) -> Result<()>;
    fn terminal(&self, cwd: &Path, shell: &str, command: Option<&str>) -> Result<()>;
    fn url(&self, url: &str) -> Result<()>;
}
pub struct NativeLauncher;
impl Launcher for NativeLauncher {
    fn ide(&self, ide: &Ide, cwd: &Path) -> Result<()> {
        platform::launch_ide(ide, cwd)
    }
    fn terminal(&self, cwd: &Path, shell: &str, command: Option<&str>) -> Result<()> {
        platform::terminal(cwd, shell, command)
    }
    fn url(&self, url: &str) -> Result<()> {
        platform::open_url(url)
    }
}

fn all_commands(db: &rusqlite::Connection, project: &Project) -> Result<Vec<ProjectCommand>> {
    let (mut commands, _) = discovery::discovered_commands(std::path::Path::new(&project.path));
    commands.extend(database::commands(db, &project.path)?);
    Ok(commands)
}
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActionResult {
    completed: Vec<String>,
    errors: Vec<String>,
}
impl ActionResult {
    pub fn completed(&self) -> &[String] {
        &self.completed
    }
}
pub fn execute(
    dbpath: &Path,
    path: String,
    action: String,
    command_id: Option<String>,
    expected_command: Option<String>,
    launcher: &dyn Launcher,
) -> Result<ActionResult> {
    execute_with_plan(
        dbpath,
        path,
        action,
        command_id,
        expected_command,
        None,
        launcher,
    )
}

pub fn execute_with_plan(
    dbpath: &Path,
    path: String,
    action: String,
    command_id: Option<String>,
    expected_command: Option<String>,
    plan: Option<ResumePlan>,
    launcher: &dyn Launcher,
) -> Result<ActionResult> {
    let db = database::connect(dbpath)?;
    let mut p = database::project(&db, &path)?;
    let cwd = discovery::canonical(&p.path)?;
    let settings = database::settings(&db)?;
    let ides: Vec<Ide> = database::read_json(&db, "SELECT data FROM ides")?;
    let resume = action == "resume";
    let resume_plan = plan.unwrap_or_else(|| p.resume.clone());
    if !["open", "terminal", "run", "resume", "url"].contains(&action.as_str()) {
        return Err("Unknown project action".into());
    }
    let run_id = if resume {
        resume_plan.command_id.clone()
    } else {
        command_id
    };
    let command = if action == "run" || (resume && run_id.is_some()) {
        let cmd = all_commands(&db, &p)?
            .into_iter()
            .find(|c| Some(&c.id) == run_id.as_ref())
            .ok_or("The selected command is no longer available")?;
        if expected_command.as_deref() != Some(&cmd.command) {
            return Err("The command changed. Review it again before running.".into());
        }
        Some(cmd)
    } else {
        None
    };
    let mut result = ActionResult {
        completed: vec![],
        errors: vec![],
    };
    let mut record = |label: &str, outcome: Result<()>| match outcome {
        Ok(()) => {
            result.completed.push(label.into());
            if let Err(e) = database::record(&db, Some(&p.path), label, &p.name) {
                result
                    .errors
                    .push(format!("Activity could not be saved: {e}"));
            }
        }
        Err(e) => result.errors.push(format!("{label}: {e}")),
    };
    if action == "open" || (resume && resume_plan.ide) {
        record(
            "Opened IDE",
            ides.iter()
                .find(|i| Some(&i.id) == p.preferred_ide.as_ref())
                .ok_or("Choose a preferred IDE in this project first".to_string())
                .and_then(|i| launcher.ide(i, &cwd)),
        );
    }
    if action == "terminal" || (resume && resume_plan.terminal && command.is_none()) {
        record(
            "Opened terminal",
            launcher.terminal(&cwd, &settings.shell, None),
        );
    }
    if let Some(c) = command {
        let outcome = launcher.terminal(&cwd, &settings.shell, Some(&c.command));
        let launched = outcome.is_ok();
        record(&format!("Launched command: {}", c.command), outcome);
        if launched {
            p.last_command = Some(c.command);
        }
    }
    if action == "url" || (resume && resume_plan.url) {
        record("Opened development URL", launcher.url(&p.dev_url));
    }
    if result.completed.is_empty() && result.errors.is_empty() {
        result
            .errors
            .push("Choose at least one Resume action in the project settings".into());
    }
    if !result.completed.is_empty() {
        if settings.record_activity {
            p.last_opened = Some(now());
        } else {
            p.last_command = None;
        }
        database::save_project(&db, &p)?;
    }
    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{cell::RefCell, fs, sync::atomic::AtomicBool};
    #[derive(Default)]
    struct Recorder {
        calls: RefCell<Vec<String>>,
        fail_ide: bool,
    }
    impl Launcher for Recorder {
        fn ide(&self, _: &Ide, _: &Path) -> Result<()> {
            if self.fail_ide {
                return Err("IDE unavailable".into());
            }
            self.calls.borrow_mut().push("ide".into());
            Ok(())
        }
        fn terminal(&self, cwd: &Path, _: &str, command: Option<&str>) -> Result<()> {
            assert!(cwd.is_dir());
            self.calls
                .borrow_mut()
                .push(command.unwrap_or("terminal").to_string());
            Ok(())
        }
        fn url(&self, url: &str) -> Result<()> {
            platform::validate_url(url)?;
            self.calls.borrow_mut().push(url.into());
            Ok(())
        }
    }
    fn fixture() -> (tempfile::TempDir, std::path::PathBuf, Project) {
        let dir = tempfile::tempdir().unwrap();
        let project_dir = dir.path().join("Project's Unicode 日本 & space");
        fs::create_dir(&project_dir).unwrap();
        fs::write(
            project_dir.join("package.json"),
            r#"{"scripts":{"dev":"vite"}}"#,
        )
        .unwrap();
        let found = discovery::scan(
            &[discovery::display_path(dir.path())],
            &[],
            &AtomicBool::new(false),
            |_| {},
        )
        .unwrap();
        assert_eq!(found.projects.len(), 1);
        let mut project = found.projects[0].clone();
        let path = dir.path().join("workspace.db");
        let db = database::connect(&path).unwrap();
        let ide = Ide {
            id: "editor".into(),
            name: "Test editor".into(),
            path: "stub".into(),
            pinned: true,
            hidden: false,
        };
        database::save_ide(&db, &ide).unwrap();
        project.preferred_ide = Some(ide.id);
        project.resume = ResumePlan {
            ide: true,
            terminal: true,
            command_id: Some("script:dev".into()),
            url: false,
        };
        database::save_project(&db, &project).unwrap();
        (dir, path, project)
    }
    #[test]
    fn discover_select_launch_record_restart_resume() {
        let (_dir, dbpath, project) = fixture();
        let launcher = Recorder::default();
        let first = execute(
            &dbpath,
            project.path.clone(),
            "open".into(),
            None,
            None,
            &launcher,
        )
        .unwrap();
        assert_eq!(first.completed.len(), 1);
        assert!(first.errors.is_empty());
        let run = execute(
            &dbpath,
            project.path.clone(),
            "run".into(),
            Some("script:dev".into()),
            Some("npm run dev".into()),
            &launcher,
        )
        .unwrap();
        assert_eq!(run.completed.len(), 1);
        // Fresh connection simulates returning after quitting the app.
        let db = database::connect(&dbpath).unwrap();
        let saved = database::project(&db, &project.path).unwrap();
        assert_eq!(saved.last_command.as_deref(), Some("npm run dev"));
        assert!(saved.last_opened.is_some());
        drop(db);
        let resumed = execute(
            &dbpath,
            project.path,
            "resume".into(),
            None,
            Some("npm run dev".into()),
            &launcher,
        )
        .unwrap();
        assert_eq!(resumed.completed.len(), 2);
        assert_eq!(
            *launcher.calls.borrow(),
            vec!["ide", "npm run dev", "ide", "npm run dev"]
        );
        assert_eq!(
            database::snapshot(&database::connect(&dbpath).unwrap(), &dbpath)
                .unwrap()
                .activity
                .len(),
            4
        );
    }
    #[test]
    fn changed_command_is_rejected_before_any_resume_action() {
        let (_dir, dbpath, project) = fixture();
        let launcher = Recorder::default();
        assert!(execute(
            &dbpath,
            project.path,
            "resume".into(),
            None,
            Some("old script".into()),
            &launcher
        )
        .is_err());
        assert!(launcher.calls.borrow().is_empty());
    }
    #[test]
    fn partial_resume_records_only_successful_launches() {
        let (_dir, dbpath, project) = fixture();
        let launcher = Recorder {
            fail_ide: true,
            ..Default::default()
        };
        let result = execute(
            &dbpath,
            project.path,
            "resume".into(),
            None,
            Some("npm run dev".into()),
            &launcher,
        )
        .unwrap();
        assert_eq!(result.errors.len(), 1);
        assert_eq!(result.completed.len(), 1);
        assert_eq!(
            database::snapshot(&database::connect(&dbpath).unwrap(), &dbpath)
                .unwrap()
                .activity
                .len(),
            1
        );
    }
    #[test]
    fn private_mode_does_not_record_new_history_or_recent_launches() {
        let (_dir, dbpath, project) = fixture();
        let db = database::connect(&dbpath).unwrap();
        let mut settings = database::settings(&db).unwrap();
        settings.record_activity = false;
        database::save_settings(&db, &settings).unwrap();
        drop(db);
        execute(
            &dbpath,
            project.path,
            "resume".into(),
            None,
            Some("npm run dev".into()),
            &Recorder::default(),
        )
        .unwrap();
        let snapshot = database::snapshot(&database::connect(&dbpath).unwrap(), &dbpath).unwrap();
        assert!(snapshot.activity.is_empty());
        assert!(snapshot.projects[0].last_opened.is_none());
        assert!(snapshot.projects[0].last_command.is_none());
    }
}
