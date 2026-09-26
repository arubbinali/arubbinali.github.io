use crate::model::*;
use rusqlite::{params, Connection, OptionalExtension};
use std::path::Path;

pub type Result<T> = std::result::Result<T, String>;
const THEMES: [&str; 6] = ["oled", "light", "stillwater", "sepia", "sage", "aubergine"];
pub fn connect(path: &Path) -> Result<Connection> {
    let db = Connection::open(path).map_err(|e| e.to_string())?;
    db.busy_timeout(std::time::Duration::from_secs(5))
        .map_err(|e| e.to_string())?;
    let version: i64 = db
        .pragma_query_value(None, "user_version", |r| r.get(0))
        .map_err(|e| e.to_string())?;
    if version > 5 {
        return Err(
            "This workspace database was created by a newer app. Update the app before opening it."
                .into(),
        );
    }
    db.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
        CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS projects(path TEXT PRIMARY KEY,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS ides(id TEXT PRIMARY KEY,data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS commands(project_path TEXT NOT NULL REFERENCES projects(path) ON DELETE CASCADE,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(project_path,id));
        CREATE TABLE IF NOT EXISTS activity(id INTEGER PRIMARY KEY,at INTEGER NOT NULL,project_path TEXT,action TEXT NOT NULL,detail TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS work_sessions(id INTEGER PRIMARY KEY,project_path TEXT,app_id TEXT NOT NULL,app_name TEXT NOT NULL,executable_path TEXT NOT NULL,started_at INTEGER NOT NULL,ended_at INTEGER,goal TEXT NOT NULL DEFAULT '');
        CREATE TABLE IF NOT EXISTS context_capsules(id INTEGER PRIMARY KEY,project_path TEXT NOT NULL REFERENCES projects(path) ON DELETE CASCADE,data TEXT NOT NULL,created_at INTEGER NOT NULL);
        CREATE TABLE IF NOT EXISTS workflows(project_path TEXT NOT NULL REFERENCES projects(path) ON DELETE CASCADE,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(project_path,id));
        CREATE TABLE IF NOT EXISTS app_rules(app_id TEXT PRIMARY KEY,project_path TEXT NOT NULL REFERENCES projects(path) ON DELETE CASCADE);
        CREATE INDEX IF NOT EXISTS work_sessions_started ON work_sessions(started_at);
        CREATE INDEX IF NOT EXISTS work_sessions_active ON work_sessions(ended_at);
        CREATE INDEX IF NOT EXISTS capsules_project ON context_capsules(project_path,created_at DESC);
        PRAGMA user_version=5;").map_err(|e| e.to_string())?;
    if version > 0 && version < 3 {
        let has_goal: bool = db
            .prepare("PRAGMA table_info(work_sessions)")
            .map_err(|e| e.to_string())?
            .query_map([], |row| row.get::<_, String>(1))
            .map_err(|e| e.to_string())?
            .filter_map(std::result::Result::ok)
            .any(|name| name == "goal");
        if !has_goal {
            db.execute(
                "ALTER TABLE work_sessions ADD COLUMN goal TEXT NOT NULL DEFAULT ''",
                [],
            )
            .map_err(|e| e.to_string())?;
        }
        db.pragma_update(None, "user_version", 5)
            .map_err(|e| e.to_string())?;
    }
    Ok(db)
}
pub fn workflows(db: &Connection, project_path: &str) -> Result<Vec<ProjectWorkflow>> {
    let mut stmt = db
        .prepare("SELECT data FROM workflows WHERE project_path=?1 ORDER BY id")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([project_path], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?;
    rows.map(|row| {
        serde_json::from_str(&row.map_err(|e| e.to_string())?).map_err(|e| e.to_string())
    })
    .collect()
}
pub fn save_workflow(db: &Connection, workflow: &ProjectWorkflow) -> Result<()> {
    db.execute(
        "INSERT OR REPLACE INTO workflows(project_path,id,data) VALUES(?1,?2,?3)",
        params![
            workflow.project_path,
            workflow.id,
            serde_json::to_string(workflow).map_err(|e| e.to_string())?
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
pub fn delete_workflow(db: &Connection, project_path: &str, id: &str) -> Result<()> {
    db.execute(
        "DELETE FROM workflows WHERE project_path=?1 AND id=?2",
        params![project_path, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
pub fn app_rules(db: &Connection) -> Result<Vec<AppRule>> {
    let mut stmt = db
        .prepare("SELECT app_id,project_path FROM app_rules ORDER BY app_id")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(AppRule {
                app_id: row.get(0)?,
                project_path: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<std::result::Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}
pub fn save_app_rule(db: &Connection, app_id: &str, project_path: &str) -> Result<()> {
    if project_path.is_empty() {
        db.execute("DELETE FROM app_rules WHERE app_id=?1", [app_id])
            .map_err(|e| e.to_string())?;
    } else {
        project(db, project_path)?;
        db.execute(
            "INSERT OR REPLACE INTO app_rules(app_id,project_path) VALUES(?1,?2)",
            params![app_id, project_path],
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}
pub fn read_json<T: serde::de::DeserializeOwned>(db: &Connection, sql: &str) -> Result<Vec<T>> {
    let mut stmt = db.prepare(sql).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |r| r.get::<_, String>(0))
        .map_err(|e| e.to_string())?;
    rows.map(|r| serde_json::from_str(&r.map_err(|e| e.to_string())?).map_err(|e| e.to_string()))
        .collect()
}
pub fn settings(db: &Connection) -> Result<Settings> {
    let json: Option<String> = db
        .query_row("SELECT value FROM meta WHERE key='settings'", [], |r| {
            r.get(0)
        })
        .optional()
        .map_err(|e| e.to_string())?;
    let mut settings: Settings = json
        .map(|s| serde_json::from_str(&s).map_err(|e| e.to_string()))
        .unwrap_or_else(|| Ok(Settings::default()))?;
    if settings.scale < 125 {
        settings.scale = 135;
    } else if settings.scale > 200 {
        settings.scale = 200;
    }
    if !THEMES.contains(&settings.theme.as_str()) {
        settings.theme = "oled".into();
    }
    Ok(settings)
}
pub fn save_settings(db: &Connection, settings: &Settings) -> Result<()> {
    if !(125..=200).contains(&settings.scale)
        || !THEMES.contains(&settings.theme.as_str())
        || !["powershell", "pwsh", "cmd"].contains(&settings.shell.as_str())
    {
        return Err("Unsupported appearance or shell setting".into());
    }
    db.execute(
        "INSERT OR REPLACE INTO meta(key,value) VALUES('settings',?1)",
        [serde_json::to_string(settings).map_err(|e| e.to_string())?],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod scale_tests {
    use super::*;
    #[test]
    fn scale_defaults_limits_and_legacy_preferences() {
        let db = Connection::open_in_memory().unwrap();
        db.execute_batch("CREATE TABLE meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);")
            .unwrap();
        assert_eq!(settings(&db).unwrap().scale, 135);
        assert_eq!(settings(&db).unwrap().theme, "oled");
        let mut s = Settings::default();
        for scale in [125, 135, 200] {
            s.scale = scale;
            save_settings(&db, &s).unwrap();
            assert_eq!(settings(&db).unwrap().scale, scale);
        }
        for theme in THEMES {
            s.scale = 135;
            s.theme = theme.into();
            save_settings(&db, &s).unwrap();
            assert_eq!(settings(&db).unwrap().theme, theme);
        }
        s.theme = "graphite".into();
        db.execute(
            "UPDATE meta SET value=?1 WHERE key='settings'",
            [serde_json::to_string(&s).unwrap()],
        )
        .unwrap();
        assert_eq!(settings(&db).unwrap().theme, "oled");
        for scale in [100, 124, 201, 250] {
            s.scale = scale;
            assert!(save_settings(&db, &s).is_err());
        }
        s.scale = 100;
        db.execute(
            "UPDATE meta SET value=?1 WHERE key='settings'",
            [serde_json::to_string(&s).unwrap()],
        )
        .unwrap();
        assert_eq!(settings(&db).unwrap().scale, 135);
        s.scale = 250;
        db.execute(
            "UPDATE meta SET value=?1 WHERE key='settings'",
            [serde_json::to_string(&s).unwrap()],
        )
        .unwrap();
        assert_eq!(settings(&db).unwrap().scale, 200);
    }
}
pub fn project(db: &Connection, path: &str) -> Result<Project> {
    let value: String = db
        .query_row("SELECT data FROM projects WHERE path=?1", [path], |r| {
            r.get(0)
        })
        .map_err(|_| "Project is not in your workspace. Add it first.".to_string())?;
    serde_json::from_str(&value).map_err(|e| e.to_string())
}
pub fn save_project(db: &Connection, project: &Project) -> Result<()> {
    db.execute("INSERT INTO projects(path,data) VALUES(?1,?2) ON CONFLICT(path) DO UPDATE SET data=excluded.data", params![project.path, serde_json::to_string(project).map_err(|e| e.to_string())?]).map_err(|e| e.to_string())?;
    Ok(())
}
pub fn save_ide(db: &Connection, ide: &Ide) -> Result<()> {
    db.execute(
        "INSERT OR REPLACE INTO ides(id,data) VALUES(?1,?2)",
        params![
            ide.id,
            serde_json::to_string(ide).map_err(|e| e.to_string())?
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
pub fn start_work_session(db: &Connection, project_path: Option<&str>, ide: &Ide) -> Result<i64> {
    if !settings(db)?.record_activity {
        return Ok(0);
    }
    let active: Option<i64> = db
        .query_row(
            "SELECT id FROM work_sessions WHERE ended_at IS NULL AND app_id=?1 AND project_path IS ?2 ORDER BY id DESC LIMIT 1",
            params![ide.id, project_path],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())?;
    if let Some(id) = active {
        return Ok(id);
    }
    db.execute(
        "INSERT INTO work_sessions(project_path,app_id,app_name,executable_path,started_at,goal) VALUES(?1,?2,?3,?4,?5,'')",
        params![project_path, ide.id, ide.name, ide.path, now()],
    )
    .map_err(|e| e.to_string())?;
    Ok(db.last_insert_rowid())
}
pub fn end_work_session(db: &Connection, id: i64, ended_at: i64) -> Result<()> {
    db.execute(
        "UPDATE work_sessions SET ended_at=max(started_at,?1) WHERE id=?2 AND ended_at IS NULL",
        params![ended_at, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}
pub fn work_sessions(db: &Connection, since: i64) -> Result<Vec<WorkSession>> {
    let mut stmt = db
        .prepare("SELECT id,project_path,app_id,app_name,executable_path,started_at,ended_at,goal FROM work_sessions WHERE started_at>=?1 OR ended_at IS NULL ORDER BY started_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([since], |row| {
            Ok(WorkSession {
                id: row.get(0)?,
                project_path: row.get(1)?,
                app_id: row.get(2)?,
                app_name: row.get(3)?,
                executable_path: row.get(4)?,
                started_at: row.get(5)?,
                ended_at: row.get(6)?,
                goal: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<std::result::Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}
pub fn set_session_goal(db: &Connection, id: i64, goal: &str) -> Result<()> {
    if goal.chars().count() > 160 {
        return Err("Session goals must be 160 characters or fewer".into());
    }
    let changed = db
        .execute(
            "UPDATE work_sessions SET goal=?1 WHERE id=?2 AND ended_at IS NULL",
            params![goal.trim(), id],
        )
        .map_err(|e| e.to_string())?;
    if changed == 0 {
        return Err("That work session is no longer active".into());
    }
    Ok(())
}
pub fn save_capsule(db: &Connection, capsule: &ContextCapsule) -> Result<i64> {
    db.execute(
        "INSERT INTO context_capsules(project_path,data,created_at) VALUES(?1,?2,?3)",
        params![
            capsule.project_path,
            serde_json::to_string(capsule).map_err(|e| e.to_string())?,
            capsule.created_at
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(db.last_insert_rowid())
}
pub fn capsules(db: &Connection, project_path: &str) -> Result<Vec<ContextCapsule>> {
    let mut stmt = db
        .prepare(
            "SELECT id,data FROM context_capsules WHERE project_path=?1 ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([project_path], |row| {
            let id: i64 = row.get(0)?;
            let data: String = row.get(1)?;
            Ok((id, data))
        })
        .map_err(|e| e.to_string())?;
    rows.map(|row| {
        let (id, data) = row.map_err(|e| e.to_string())?;
        let mut capsule: ContextCapsule = serde_json::from_str(&data).map_err(|e| e.to_string())?;
        capsule.id = id;
        Ok(capsule)
    })
    .collect()
}
pub fn all_capsules(db: &Connection) -> Result<Vec<ContextCapsule>> {
    let mut stmt = db
        .prepare("SELECT id,data FROM context_capsules ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok((row.get::<_, i64>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;
    rows.map(|row| {
        let (id, data) = row.map_err(|e| e.to_string())?;
        let mut capsule: ContextCapsule = serde_json::from_str(&data).map_err(|e| e.to_string())?;
        capsule.id = id;
        Ok(capsule)
    })
    .collect()
}
pub fn indexed_commands(db: &Connection) -> Result<Vec<IndexedCommand>> {
    let mut stmt = db
        .prepare("SELECT project_path,data FROM commands ORDER BY project_path,id")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;
    rows.map(|row| {
        let (project_path, data) = row.map_err(|e| e.to_string())?;
        Ok(IndexedCommand {
            project_path,
            command: serde_json::from_str(&data).map_err(|e| e.to_string())?,
        })
    })
    .collect()
}
pub fn delete_capsule(db: &Connection, id: i64) -> Result<()> {
    db.execute("DELETE FROM context_capsules WHERE id=?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
pub fn active_work_sessions(db: &Connection) -> Result<Vec<WorkSession>> {
    work_sessions(db, i64::MAX)
}
pub fn commands(db: &Connection, path: &str) -> Result<Vec<ProjectCommand>> {
    let mut stmt = db
        .prepare("SELECT data FROM commands WHERE project_path=?1 ORDER BY id")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([path], |r| r.get::<_, String>(0))
        .map_err(|e| e.to_string())?;
    rows.map(|r| serde_json::from_str(&r.map_err(|e| e.to_string())?).map_err(|e| e.to_string()))
        .collect()
}
pub fn record(db: &Connection, path: Option<&str>, action: &str, detail: &str) -> Result<()> {
    if !settings(db)?.record_activity {
        return Ok(());
    }
    db.execute(
        "INSERT INTO activity(at,project_path,action,detail) VALUES(?1,?2,?3,?4)",
        params![now(), path, action, detail],
    )
    .map_err(|e| e.to_string())?;
    db.execute("DELETE FROM activity WHERE id NOT IN (SELECT id FROM activity ORDER BY id DESC LIMIT 2000)", []).map_err(|e| e.to_string())?;
    Ok(())
}
pub fn snapshot(db: &Connection, path: &Path) -> Result<Snapshot> {
    let mut stmt = db
        .prepare("SELECT id,at,project_path,action,detail FROM activity ORDER BY id DESC LIMIT 200")
        .map_err(|e| e.to_string())?;
    let activity = stmt
        .query_map([], |r| {
            Ok(Activity {
                id: r.get(0)?,
                at: r.get(1)?,
                project_path: r.get(2)?,
                action: r.get(3)?,
                detail: r.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<std::result::Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(Snapshot {
        projects: read_json(db, "SELECT data FROM projects ORDER BY path")?,
        ides: read_json(db, "SELECT data FROM ides ORDER BY id")?,
        settings: settings(db)?,
        activity,
        work_sessions: work_sessions(db, now() - 366 * 86_400)?,
        capsules: all_capsules(db)?,
        commands: indexed_commands(db)?,
        app_rules: app_rules(db)?,
        database_path: path.to_string_lossy().into_owned(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn preferences_resume_and_history_survive_reopening() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("test.db");
        let db = connect(&path).unwrap();
        let p = crate::discovery::describe(dir.path()).unwrap();
        save_project(&db, &p).unwrap();
        let mut p = project(&db, &p.path).unwrap();
        p.notes = "Next: accessibility".into();
        p.resume.ide = true;
        p.last_opened = Some(123);
        save_project(&db, &p).unwrap();
        record(&db, Some(&p.path), "Opened project", "IDE launched").unwrap();
        drop(db);
        let db = connect(&path).unwrap();
        let state = snapshot(&db, &path).unwrap();
        assert_eq!(state.projects[0].notes, "Next: accessibility");
        assert!(state.projects[0].resume.ide);
        assert_eq!(state.projects[0].last_opened, Some(123));
        assert_eq!(state.activity.len(), 1);
        let mut s = settings(&db).unwrap();
        s.record_activity = false;
        save_settings(&db, &s).unwrap();
        record(&db, None, "Hidden", "").unwrap();
        assert_eq!(snapshot(&db, &path).unwrap().activity.len(), 1);
    }

    #[test]
    fn work_sessions_are_deduplicated_persisted_and_closed() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("sessions.db");
        let db = connect(&path).unwrap();
        let ide = Ide {
            id: "code".into(),
            name: "Visual Studio Code".into(),
            path: "C:\\Tools\\Code.exe".into(),
            hidden: false,
            pinned: false,
        };
        let first = start_work_session(&db, Some("C:\\project"), &ide).unwrap();
        let duplicate = start_work_session(&db, Some("C:\\project"), &ide).unwrap();
        assert_eq!(first, duplicate);
        assert_eq!(active_work_sessions(&db).unwrap().len(), 1);
        set_session_goal(&db, first, "Finish the context system").unwrap();
        assert_eq!(
            active_work_sessions(&db).unwrap()[0].goal,
            "Finish the context system"
        );
        end_work_session(&db, first, now() + 2).unwrap();
        drop(db);

        let db = connect(&path).unwrap();
        let sessions = work_sessions(&db, 0).unwrap();
        assert_eq!(sessions.len(), 1);
        assert!(sessions[0].ended_at.is_some());
        assert!(active_work_sessions(&db).unwrap().is_empty());
    }

    #[test]
    fn context_capsules_round_trip_and_delete() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("contexts.db");
        let db = connect(&path).unwrap();
        let project = crate::discovery::describe(dir.path()).unwrap();
        save_project(&db, &project).unwrap();
        let capsule = ContextCapsule {
            id: 0,
            project_path: project.path.clone(),
            name: "Before refactor".into(),
            goal: "Split the database module".into(),
            branch: "main".into(),
            latest_commit: "abc123 Baseline".into(),
            changed_files: 3,
            command: Some("npm test".into()),
            dev_url: "http://localhost:1420".into(),
            notes: "Keep migrations compatible".into(),
            created_at: now(),
        };
        let id = save_capsule(&db, &capsule).unwrap();
        let loaded = capsules(&db, &project.path).unwrap();
        assert_eq!(loaded.len(), 1);
        assert_eq!(loaded[0].id, id);
        assert_eq!(loaded[0].goal, "Split the database module");
        delete_capsule(&db, id).unwrap();
        assert!(capsules(&db, &project.path).unwrap().is_empty());
    }
}
