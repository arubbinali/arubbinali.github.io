use crate::{database::Result, model::Ide};
use base64::Engine;
use std::{
    collections::HashSet,
    path::{Path, PathBuf},
    process::Command,
};

pub fn detect_ides() -> Vec<Ide> {
    let mut found = vec![];
    let bases: Vec<_> = ["LOCALAPPDATA", "ProgramFiles", "ProgramFiles(x86)"]
        .iter()
        .filter_map(std::env::var_os)
        .map(PathBuf::from)
        .collect();
    for base in &bases {
        for (name, relative) in [
            ("Visual Studio Code", "Programs/Microsoft VS Code/Code.exe"),
            ("Visual Studio Code", "Microsoft VS Code/Code.exe"),
            (
                "VS Code Insiders",
                "Programs/Microsoft VS Code Insiders/Code - Insiders.exe",
            ),
            ("Sublime Text", "Sublime Text/sublime_text.exe"),
            ("Android Studio", "Android/Android Studio/bin/studio64.exe"),
            ("Cursor", "Programs/cursor/Cursor.exe"),
        ] {
            push_ide(&mut found, name, base.join(relative));
        }
        let jetbrains = base.join("JetBrains");
        for e in walkdir::WalkDir::new(&jetbrains)
            .max_depth(6)
            .follow_links(false)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if !e.file_type().is_file() {
                continue;
            }
            let name = match e.file_name().to_string_lossy().to_lowercase().as_str() {
                "idea64.exe" => "IntelliJ IDEA",
                "pycharm64.exe" => "PyCharm",
                "webstorm64.exe" => "WebStorm",
                "rider64.exe" => "Rider",
                "clion64.exe" => "CLion",
                _ => continue,
            };
            push_ide(&mut found, name, e.path().to_path_buf());
        }
    }
    if let Ok(text) = crate::git::output(
        "C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe",
        &["-latest", "-products", "*", "-property", "installationPath"],
        None,
    ) {
        if !text.is_empty() {
            push_ide(
                &mut found,
                "Visual Studio",
                Path::new(&text).join("Common7/IDE/devenv.exe"),
            );
        }
    }
    let mut seen = HashSet::new();
    found.retain(|ide| seen.insert(ide.path.to_lowercase()));
    found
}
fn push_ide(found: &mut Vec<Ide>, name: &str, path: PathBuf) {
    if path.is_file() {
        let path = crate::discovery::display_path(&path);
        found.push(Ide {
            id: path.to_lowercase(),
            name: name.into(),
            path,
            hidden: false,
            pinned: true,
        });
    }
}
pub fn validate_ide(ide: &Ide) -> Result<()> {
    let path = Path::new(&ide.path);
    if !path.is_absolute() || !path.is_file() {
        return Err("Choose an installed application's executable".into());
    }
    #[cfg(windows)]
    if !path
        .extension()
        .map(|e| e.eq_ignore_ascii_case("exe"))
        .unwrap_or(false)
    {
        return Err("Choose an .exe application".into());
    }
    if ide.name.trim().is_empty() {
        return Err("Give the application a name".into());
    }
    Ok(())
}
pub fn launch_ide(ide: &Ide, cwd: &Path) -> Result<()> {
    validate_ide(ide)?;
    Command::new(&ide.path)
        .arg(cwd)
        .spawn()
        .map_err(|e| format!("Could not launch {}: {e}", ide.name))?;
    Ok(())
}
pub fn application_is_running(executable_path: &str) -> Result<bool> {
    let name = Path::new(executable_path)
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or("Tracked application path has no executable name")?;
    #[cfg(windows)]
    {
        let tasklist = format!(
            "{}\\System32\\tasklist.exe",
            std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".into())
        );
        let filter = format!("IMAGENAME eq {name}");
        let output = Command::new(tasklist)
            .args(["/FI", &filter, "/FO", "CSV", "/NH"])
            .output()
            .map_err(|e| format!("Could not inspect tracked applications: {e}"))?;
        if !output.status.success() {
            return Err("Windows process inspection failed".into());
        }
        let text = String::from_utf8_lossy(&output.stdout).to_lowercase();
        Ok(text.contains(&format!("\"{}\"", name.to_lowercase())))
    }
    #[cfg(not(windows))]
    {
        let _ = name;
        Err("Application tracking is currently implemented for Windows".into())
    }
}
pub fn powershell_script(path: &Path, command: Option<&str>) -> String {
    // Literal path stays data, including spaces, quotes, Unicode, $, &, and parentheses.
    format!(
        "Set-Location -LiteralPath '{}'; {}",
        crate::discovery::display_path(path).replace('\'', "''"),
        command.unwrap_or("")
    )
}
pub fn terminal(path: &Path, shell: &str, command: Option<&str>) -> Result<()> {
    #[cfg(not(windows))]
    {
        let _ = (path, shell, command);
        return Err("Terminal launching is currently implemented for Windows".into());
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        // Encoded PowerShell wrapper safely sets cwd and launches the user's selected shell.
        // Command text is deliberately executable, and always reviewed in the UI before launch.
        let script = if shell == "cmd" {
            if let Some(cmd) = command {
                format!(
                    "Set-Location -LiteralPath '{}'; & cmd.exe /d /k '{}'",
                    crate::discovery::display_path(path).replace('\'', "''"),
                    cmd.replace('\'', "''")
                )
            } else {
                format!(
                    "Set-Location -LiteralPath '{}'; & cmd.exe /d /k",
                    crate::discovery::display_path(path).replace('\'', "''")
                )
            }
        } else {
            powershell_script(path, command)
        };
        let bytes: Vec<u8> = script.encode_utf16().flat_map(u16::to_le_bytes).collect();
        let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);
        let exe = if shell == "pwsh" {
            "pwsh.exe".into()
        } else {
            format!(
                "{}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
                std::env::var("SystemRoot").unwrap_or_else(|_| "C:\\Windows".into())
            )
        };
        Command::new(exe)
            .args([
                "-NoLogo",
                "-NoProfile",
                "-NoExit",
                "-EncodedCommand",
                &encoded,
            ])
            .current_dir(path)
            .creation_flags(0x00000010)
            .spawn()
            .map_err(|e| format!("Could not open {shell}: {e}"))?;
        Ok(())
    }
}
pub fn validate_url(url: &str) -> Result<()> {
    let parsed = url::Url::parse(url)
        .map_err(|_| "Enter a complete http:// or https:// development URL".to_string())?;
    if !["http", "https"].contains(&parsed.scheme())
        || parsed.host_str().is_none()
        || !parsed.username().is_empty()
        || parsed.password().is_some()
    {
        return Err("Only HTTP(S) URLs without embedded credentials are supported".into());
    }
    Ok(())
}
pub fn open_url(url: &str) -> Result<()> {
    validate_url(url)?;
    #[cfg(windows)]
    {
        Command::new("explorer.exe")
            .arg(url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(windows))]
    {
        return Err("URL launching is currently implemented for Windows".into());
    }
    Ok(())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn literal_paths_do_not_become_shell_code() {
        assert_eq!(
            powershell_script(Path::new("C:\\a'b & $env:TEMP"), Some("npm test")),
            "Set-Location -LiteralPath 'C:\\a''b & $env:TEMP'; npm test"
        );
    }
    #[test]
    fn only_web_urls_can_be_opened() {
        assert!(validate_url("http://localhost:5173").is_ok());
        assert!(validate_url("file:///C:/a.exe").is_err());
        assert!(validate_url("https://user:pass@example.com").is_err());
    }
    #[test]
    #[cfg(windows)]
    fn powershell_enters_a_literal_directory_with_special_characters() {
        let temp = tempfile::tempdir().unwrap();
        let path = temp.path().join("project's & folder");
        std::fs::create_dir(&path).unwrap();
        let script = powershell_script(&path, Some("(Get-Location).Path"));
        let bytes: Vec<u8> = script.encode_utf16().flat_map(u16::to_le_bytes).collect();
        let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);
        let output = crate::git::output(
            "powershell.exe",
            &["-NoProfile", "-EncodedCommand", &encoded],
            None,
        )
        .unwrap();
        assert_eq!(
            output.to_lowercase(),
            crate::discovery::display_path(&path).to_lowercase()
        );
    }
}
