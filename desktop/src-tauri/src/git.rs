use crate::database::Result;
use crate::model::{GitChange, GitInfo};
use std::{
    path::Path,
    process::{Command, Stdio},
    time::{Duration, Instant},
};

// Pipe readers prevent deadlock on large outputs; timeout avoids hung Git/tool probes.
pub fn output(exe: &str, args: &[&str], cwd: Option<&Path>) -> Result<String> {
    let mut command = Command::new(exe);
    command
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .env("GIT_TERMINAL_PROMPT", "0")
        .env("GIT_OPTIONAL_LOCKS", "0");
    if let Some(path) = cwd {
        command.current_dir(path);
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    let mut child = command.spawn().map_err(|e| e.to_string())?;
    use std::io::Read;
    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    let out = std::thread::spawn(move || {
        let mut buf = vec![];
        let _ = stdout.take(2_000_000).read_to_end(&mut buf);
        buf
    });
    let err = std::thread::spawn(move || {
        let mut buf = vec![];
        let _ = stderr.take(32_000).read_to_end(&mut buf);
        buf
    });
    let start = Instant::now();
    let status = loop {
        match child.try_wait().map_err(|e| e.to_string())? {
            Some(s) => break s,
            None if start.elapsed() > Duration::from_secs(8) => {
                let _ = child.kill();
                let _ = child.wait();
                return Err("Tool probe timed out".into());
            }
            _ => std::thread::sleep(Duration::from_millis(25)),
        }
    };
    let stdout = out.join().unwrap_or_default();
    let stderr = err.join().unwrap_or_default();
    if !status.success() {
        return Err(String::from_utf8_lossy(&stderr).trim().to_string());
    }
    Ok(String::from_utf8_lossy(&stdout)
        .trim_end_matches(['\r', '\n'])
        .to_string())
}
pub fn inspect(path: &Path) -> GitInfo {
    if let Err(error) = output("git", &["--version"], None) {
        return GitInfo {
            error: Some(format!("Git unavailable: {error}")),
            ..GitInfo::default()
        };
    }
    // Optional .git file also supports worktrees. Don't inherit a parent's repository.
    if !path.join(".git").exists() {
        return GitInfo {
            available: true,
            ..GitInfo::default()
        };
    }
    let raw = match output(
        "git",
        &[
            "--no-optional-locks",
            "status",
            "--porcelain=v1",
            "-z",
            "--untracked-files=normal",
        ],
        Some(path),
    ) {
        Ok(v) => v,
        Err(e) => {
            return GitInfo {
                available: true,
                repository: true,
                error: Some(e),
                ..GitInfo::default()
            }
        }
    };
    let mut fields = raw.split('\0');
    let mut changes = vec![];
    while let Some(field) = fields.next() {
        if field.len() < 3 {
            continue;
        }
        let status = &field[..2];
        let name = &field[3..];
        if status.contains('R') || status.contains('C') {
            let _ = fields.next();
        }
        changes.push(GitChange {
            status: status.into(),
            path: name.into(),
        });
    }
    let git = |args: &[&str]| output("git", args, Some(path)).unwrap_or_default();
    let branch = git(&["branch", "--show-current"]);
    let counts = git(&["rev-list", "--left-right", "--count", "HEAD...@{upstream}"]);
    let mut nums = counts
        .split_whitespace()
        .filter_map(|s| s.parse::<usize>().ok());
    GitInfo {
        available: true,
        repository: true,
        branch: if branch.is_empty() {
            "Detached HEAD / no branch".into()
        } else {
            branch
        },
        ahead: nums.next().unwrap_or_default(),
        behind: nums.next().unwrap_or_default(),
        changes,
        latest: git(&["log", "-1", "--format=%h %s"]),
        remote: git(&["remote", "get-url", "origin"]),
        error: None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn reads_a_real_repository_without_modifying_worktree() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path();
        output("git", &["init", "-b", "main"], Some(path)).unwrap();
        std::fs::write(path.join("hello world.txt"), "first").unwrap();
        output("git", &["add", "."], Some(path)).unwrap();
        output(
            "git",
            &[
                "-c",
                "user.name=Test",
                "-c",
                "user.email=test@example.invalid",
                "-c",
                "commit.gpgsign=false",
                "commit",
                "-m",
                "Initial",
            ],
            Some(path),
        )
        .unwrap();
        std::fs::write(path.join("hello world.txt"), "changed").unwrap();
        std::fs::write(path.join("untracked.txt"), "new").unwrap();
        let info = inspect(path);
        assert!(info.repository);
        assert_eq!(info.branch, "main");
        assert_eq!(info.changes.len(), 2);
        assert!(info.latest.ends_with("Initial"));
        assert_eq!(
            std::fs::read_to_string(path.join("hello world.txt")).unwrap(),
            "changed"
        );
    }
}
