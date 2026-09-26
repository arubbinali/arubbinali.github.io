use crate::{database::Result, model::*};
use std::{
    collections::{BTreeMap, HashSet},
    fs,
    path::{Path, PathBuf},
    sync::atomic::{AtomicBool, Ordering},
};
use walkdir::{DirEntry, WalkDir};

const IGNORED: &[&str] = &[
    "node_modules",
    ".git",
    "dist",
    "build",
    "target",
    "venv",
    ".venv",
    "__pycache__",
    ".next",
    ".cache",
    ".idea",
    ".vscode",
    "vendor",
    "coverage",
    "$recycle.bin",
    "system volume information",
];
pub fn canonical(path: &str) -> Result<PathBuf> {
    let p = Path::new(path);
    if !p.is_absolute() {
        return Err("Choose an absolute folder path".into());
    }
    let p = fs::canonicalize(p).map_err(|e| format!("Cannot access folder: {e}"))?;
    if !p.is_dir() {
        return Err("Choose a folder".into());
    }
    Ok(p)
}
pub fn display_path(path: &Path) -> String {
    let text = path.to_string_lossy();
    if let Some(unc) = text.strip_prefix("\\\\?\\UNC\\") {
        format!("\\\\{unc}")
    } else {
        text.strip_prefix("\\\\?\\").unwrap_or(&text).to_string()
    }
}
pub fn traversable(entry: &DirEntry) -> bool {
    if entry.depth() == 0 {
        return true;
    }
    if entry.file_type().is_symlink() {
        return false;
    }
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        if entry
            .metadata()
            .map(|m| m.file_attributes() & 0x400 != 0)
            .unwrap_or(true)
        {
            return false;
        }
    }
    !IGNORED.contains(&entry.file_name().to_string_lossy().to_lowercase().as_str())
}
fn kind(path: &Path) -> Option<&'static str> {
    for (marker, label) in [
        ("package.json", "Node.js"),
        ("Cargo.toml", "Rust"),
        ("pom.xml", "Java · Maven"),
        ("build.gradle", "Java · Gradle"),
        ("build.gradle.kts", "JVM · Gradle"),
        ("pyproject.toml", "Python"),
        ("requirements.txt", "Python"),
        ("go.mod", "Go"),
        ("CMakeLists.txt", "C / C++"),
        ("composer.json", "PHP"),
        ("Gemfile", "Ruby"),
        (".git", "Git repository"),
    ] {
        if path.join(marker).exists() {
            return Some(label);
        }
    }
    fs::read_dir(path)
        .ok()?
        .flatten()
        .take(2000)
        .any(|e| {
            matches!(
                e.path().extension().and_then(|e| e.to_str()),
                Some("sln" | "csproj" | "fsproj")
            )
        })
        .then_some(".NET")
}
pub fn describe(path: &Path) -> Result<Project> {
    let path = fs::canonicalize(path).map_err(|e| e.to_string())?;
    let mut counts: BTreeMap<&str, usize> = BTreeMap::new();
    for entry in WalkDir::new(&path)
        .max_depth(5)
        .follow_links(false)
        .into_iter()
        .filter_entry(traversable)
        .take(8000)
        .flatten()
    {
        if !entry.file_type().is_file() {
            continue;
        }
        let language = match entry
            .path()
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
        {
            "ts" | "tsx" => "TypeScript",
            "js" | "jsx" | "mjs" => "JavaScript",
            "rs" => "Rust",
            "java" => "Java",
            "py" => "Python",
            "go" => "Go",
            "cs" => "C#",
            "cpp" | "hpp" | "cc" | "h" | "c" => "C / C++",
            "css" | "scss" => "CSS",
            "html" => "HTML",
            "php" => "PHP",
            "rb" => "Ruby",
            _ => continue,
        };
        *counts.entry(language).or_default() += 1;
    }
    let mut languages: Vec<_> = counts.into_iter().collect();
    languages.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));
    Ok(Project {
        path: display_path(&path),
        name: path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned(),
        kind: kind(&path).unwrap_or("Folder").into(),
        languages: languages
            .iter()
            .take(3)
            .map(|(l, _)| l.to_string())
            .collect(),
        preferred_ide: None,
        pinned: false,
        notes: String::new(),
        dev_url: String::new(),
        last_opened: None,
        last_command: None,
        resume: ResumePlan::default(),
    })
}
pub fn scan(
    roots: &[String],
    exclusions: &[String],
    cancel: &AtomicBool,
    progress: impl Fn(usize),
) -> Result<ScanResult> {
    let excluded: Vec<_> = exclusions
        .iter()
        .map(|p| canonical(p))
        .collect::<Result<_>>()?;
    let mut result = ScanResult {
        projects: vec![],
        visited: 0,
        warnings: vec![],
        truncated: false,
    };
    let mut seen = HashSet::new();
    for root in roots {
        let root = match canonical(root) {
            Ok(p) => p,
            Err(e) => {
                result.warnings.push(e);
                continue;
            }
        };
        let walker = WalkDir::new(root)
            .max_depth(7)
            .follow_links(false)
            .into_iter()
            .filter_entry(|e| traversable(e) && !excluded.iter().any(|p| e.path().starts_with(p)));
        for entry in walker {
            if cancel.load(Ordering::Relaxed) {
                return Err("Scan cancelled. No projects were added.".into());
            }
            let entry = match entry {
                Ok(e) => e,
                Err(e) => {
                    if result.warnings.len() < 20 {
                        result.warnings.push(e.to_string());
                    }
                    continue;
                }
            };
            result.visited += 1;
            if result.visited.is_multiple_of(100) {
                progress(result.visited);
            }
            if result.visited > 30000 || result.projects.len() >= 500 {
                result.truncated = true;
                break;
            }
            if !entry.file_type().is_dir() {
                continue;
            }
            let key = display_path(entry.path()).to_lowercase();
            if kind(entry.path()).is_some() && seen.insert(key) {
                result.projects.push(describe(entry.path())?);
            }
        }
        if result.truncated {
            break;
        }
    }
    result.projects.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(result)
}
pub fn recent_files(path: &Path) -> Vec<RecentFile> {
    let mut files: Vec<_> = WalkDir::new(path)
        .max_depth(5)
        .into_iter()
        .filter_entry(traversable)
        .take(8000)
        .flatten()
        .filter(|e| e.file_type().is_file())
        .filter_map(|e| {
            let modified = e
                .metadata()
                .ok()?
                .modified()
                .ok()?
                .duration_since(std::time::UNIX_EPOCH)
                .ok()?
                .as_secs() as i64;
            Some(RecentFile {
                path: e
                    .path()
                    .strip_prefix(path)
                    .ok()?
                    .to_string_lossy()
                    .into_owned(),
                modified,
            })
        })
        .collect();
    files.sort_by_key(|f| std::cmp::Reverse(f.modified));
    files.truncate(8);
    files
}
pub fn discovered_commands(path: &Path) -> (Vec<ProjectCommand>, Vec<String>) {
    let package = path.join("package.json");
    let mut warnings = vec![];
    let mut commands = vec![];
    if package.exists() {
        let parsed = fs::metadata(&package)
            .map_err(|e| e.to_string())
            .and_then(|m| {
                if m.len() > 2_000_000 {
                    Err("package.json exceeds 2 MB".into())
                } else {
                    fs::read_to_string(&package).map_err(|e| e.to_string())
                }
            })
            .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).map_err(|e| e.to_string()));
        match parsed {
            Ok(v) => {
                if let Some(scripts) = v.get("scripts").and_then(|s| s.as_object()) {
                    let manager = if path.join("pnpm-lock.yaml").exists() {
                        "pnpm"
                    } else if path.join("yarn.lock").exists() {
                        "yarn"
                    } else if path.join("bun.lockb").exists() || path.join("bun.lock").exists() {
                        "bun"
                    } else {
                        "npm"
                    };
                    for (name, value) in scripts {
                        if value.is_string()
                            && name
                                .chars()
                                .all(|c| c.is_ascii_alphanumeric() || "-_:./".contains(c))
                        {
                            commands.push(ProjectCommand {
                                id: format!("script:{name}"),
                                name: name.clone(),
                                command: format!("{manager} run {name}"),
                                source: "package.json".into(),
                            });
                        }
                    }
                }
            }
            Err(e) => warnings.push(format!("Cannot read package scripts: {e}")),
        }
    }
    for (marker, items) in [
        (
            "Cargo.toml",
            vec![
                ("Run", "cargo run"),
                ("Build", "cargo build"),
                ("Test", "cargo test"),
            ],
        ),
        (
            "pom.xml",
            vec![("Test", "mvn test"), ("Package", "mvn package")],
        ),
        (
            "go.mod",
            vec![("Test", "go test ./..."), ("Build", "go build ./...")],
        ),
    ] {
        if path.join(marker).is_file() {
            commands.extend(items.iter().map(|(name, command)| ProjectCommand {
                id: format!("detected:{command}"),
                name: name.to_string(),
                command: command.to_string(),
                source: marker.into(),
            }));
        }
    }
    (commands, warnings)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn discovery_skips_generated_trees_and_respects_exclusions() {
        let dir = tempfile::tempdir().unwrap();
        for sub in [
            "app",
            "app/node_modules/dependency",
            "ignored",
            "plain",
            "mono/packages/core",
        ] {
            fs::create_dir_all(dir.path().join(sub)).unwrap();
        }
        for sub in [
            "app",
            "app/node_modules/dependency",
            "ignored",
            "mono/packages/core",
        ] {
            fs::write(dir.path().join(sub).join("package.json"), "{}").unwrap();
        }
        fs::write(dir.path().join("app/test.ts"), "").unwrap();
        let found = scan(
            &[display_path(dir.path())],
            &[display_path(&dir.path().join("ignored"))],
            &AtomicBool::new(false),
            |_| {},
        )
        .unwrap();
        assert_eq!(found.projects.len(), 2);
        assert_eq!(found.projects[0].languages, vec!["TypeScript"]);
    }
    #[test]
    fn scripts_use_detected_package_manager_and_reject_shell_names() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("pnpm-lock.yaml"), "").unwrap();
        fs::write(
            dir.path().join("package.json"),
            r#"{"scripts":{"dev":"vite","test;bad":"echo nope"}}"#,
        )
        .unwrap();
        let (cmds, _) = discovered_commands(dir.path());
        assert_eq!(cmds.len(), 1);
        assert_eq!(cmds[0].command, "pnpm run dev");
    }
}
