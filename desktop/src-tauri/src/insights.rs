use crate::{
    git,
    model::{GitCommit, Project, ProjectHealth},
};
use serde_json::Value;
use std::{collections::BTreeSet, fs, path::Path};
use walkdir::{DirEntry, WalkDir};

fn ignored(entry: &DirEntry) -> bool {
    entry.file_type().is_dir()
        && matches!(
            entry.file_name().to_string_lossy().as_ref(),
            ".git" | "node_modules" | "dist" | "build" | "target" | ".venv" | "venv"
        )
}

fn package_dependencies(path: &Path) -> Vec<String> {
    let Ok(text) = fs::read_to_string(path.join("package.json")) else {
        return vec![];
    };
    let Ok(json) = serde_json::from_str::<Value>(&text) else {
        return vec![];
    };
    let mut names = BTreeSet::new();
    for key in ["dependencies", "devDependencies", "peerDependencies"] {
        if let Some(items) = json.get(key).and_then(Value::as_object) {
            names.extend(items.keys().cloned());
        }
    }
    names.into_iter().take(80).collect()
}

fn package_name(path: &Path) -> Option<String> {
    let text = fs::read_to_string(path.join("package.json")).ok()?;
    serde_json::from_str::<Value>(&text)
        .ok()?
        .get("name")?
        .as_str()
        .map(str::to_owned)
}

pub fn inspect(
    path: &Path,
    git_info: &crate::model::GitInfo,
    projects: &[Project],
) -> ProjectHealth {
    let mut todo_count = 0;
    let mut fixme_count = 0;
    let source_extensions = [
        "rs", "ts", "tsx", "js", "jsx", "java", "py", "go", "cs", "cpp", "c", "h", "html", "css",
        "md",
    ];
    for entry in WalkDir::new(path)
        .max_depth(8)
        .into_iter()
        .filter_entry(|entry| !ignored(entry))
        .filter_map(Result::ok)
        .filter(|entry| entry.file_type().is_file())
        .take(3_000)
    {
        let extension = entry.path().extension().and_then(|value| value.to_str());
        if !extension.is_some_and(|value| source_extensions.contains(&value)) {
            continue;
        }
        if entry
            .metadata()
            .map(|value| value.len())
            .unwrap_or(u64::MAX)
            > 1_000_000
        {
            continue;
        }
        if let Ok(text) = fs::read_to_string(entry.path()) {
            todo_count += text.match_indices("TODO").count();
            fixme_count += text.match_indices("FIXME").count();
        }
    }

    let dependencies = package_dependencies(path);
    let related_projects = projects
        .iter()
        .filter(|project| Path::new(&project.path) != path)
        .filter_map(|project| {
            let name = package_name(Path::new(&project.path))?;
            dependencies.contains(&name).then(|| project.path.clone())
        })
        .collect();
    let branches = if git_info.repository {
        git::output("git", &["branch", "--format=%(refname:short)"], Some(path))
            .unwrap_or_default()
            .lines()
            .take(20)
            .map(str::to_owned)
            .collect()
    } else {
        vec![]
    };
    let recent_commits = if git_info.repository {
        git::output(
            "git",
            &["log", "-12", "--format=%h%x1f%ct%x1f%s"],
            Some(path),
        )
        .unwrap_or_default()
        .lines()
        .filter_map(|line| {
            let mut values = line.splitn(3, '\u{1f}');
            Some(GitCommit {
                hash: values.next()?.into(),
                at: values.next()?.parse().ok()?,
                subject: values.next()?.into(),
            })
        })
        .collect::<Vec<_>>()
    } else {
        vec![]
    };
    let commit_count_30d = if git_info.repository {
        git::output(
            "git",
            &["rev-list", "--count", "--since=30.days", "HEAD"],
            Some(path),
        )
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or_default()
    } else {
        0
    };
    let has_named_file = |names: &[&str]| {
        fs::read_dir(path)
            .ok()
            .into_iter()
            .flatten()
            .filter_map(Result::ok)
            .any(|entry| {
                let name = entry.file_name().to_string_lossy().to_ascii_lowercase();
                names.iter().any(|candidate| {
                    name == *candidate || name.starts_with(&format!("{candidate}."))
                })
            })
    };
    ProjectHealth {
        readme: has_named_file(&["readme"]),
        license: has_named_file(&["license", "licence"]),
        todo_count,
        fixme_count,
        changed_files: git_info.changes.len(),
        commit_count_30d,
        branches,
        recent_commits,
        dependencies,
        related_projects,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reports_factual_health_and_workspace_relationships() {
        let root = tempfile::tempdir().unwrap();
        let app = root.path().join("app");
        let shared = root.path().join("shared");
        fs::create_dir_all(app.join("src")).unwrap();
        fs::create_dir_all(&shared).unwrap();
        fs::write(
            app.join("package.json"),
            r#"{"name":"app","dependencies":{"shared-kit":"1.0.0"}}"#,
        )
        .unwrap();
        fs::write(shared.join("package.json"), r#"{"name":"shared-kit"}"#).unwrap();
        fs::write(app.join("README.md"), "# App").unwrap();
        fs::write(app.join("src/main.ts"), "// TODO one\n// FIXME two").unwrap();
        git::output("git", &["init", "-b", "main"], Some(&app)).unwrap();
        let app_project = crate::discovery::describe(&app).unwrap();
        let shared_project = crate::discovery::describe(&shared).unwrap();
        let git_info = git::inspect(&app);
        let health = inspect(&app, &git_info, &[app_project, shared_project.clone()]);
        assert!(health.readme);
        assert!(!health.license);
        assert_eq!(health.todo_count, 1);
        assert_eq!(health.fixme_count, 1);
        assert!(health.dependencies.contains(&"shared-kit".into()));
        assert_eq!(health.related_projects, vec![shared_project.path]);
    }
}
