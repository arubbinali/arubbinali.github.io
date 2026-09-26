use crate::{database::Result, platform};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::HashSet, path::PathBuf, process::Command};

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantApp {
    pub id: String,
    pub name: String,
    pub category: String,
    #[serde(skip_serializing)]
    executable: String,
    #[serde(skip_serializing)]
    arguments: Vec<String>,
    #[serde(skip_serializing)]
    process_name: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserProfile {
    pub browser_id: String,
    pub directory: String,
    pub name: String,
    pub account: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserBookmark {
    pub title: String,
    pub url: String,
    pub browser_id: String,
    pub profile_directory: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantCatalog {
    pub apps: Vec<AssistantApp>,
    pub profiles: Vec<BrowserProfile>,
    pub bookmarks: Vec<BrowserBookmark>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssistantAction {
    pub kind: String,
    pub app_id: Option<String>,
    pub url: Option<String>,
    pub browser_id: Option<String>,
    pub profile_directory: Option<String>,
}

fn push_app(apps: &mut Vec<AssistantApp>, id: &str, name: &str, category: &str, path: PathBuf, arguments: &[&str], process_name: Option<&str>) {
    if path.is_file() {
        let detected_process = path.file_name().and_then(|name| name.to_str()).unwrap_or("").to_string();
        apps.push(AssistantApp {
            id: id.into(), name: name.into(), category: category.into(),
            executable: path.to_string_lossy().into_owned(),
            arguments: arguments.iter().map(|value| value.to_string()).collect(),
            process_name: process_name.unwrap_or(&detected_process).into(),
        });
    }
}

fn installed_apps() -> Vec<AssistantApp> {
    let local = PathBuf::from(std::env::var_os("LOCALAPPDATA").unwrap_or_default());
    let program = PathBuf::from(std::env::var_os("ProgramFiles").unwrap_or_default());
    let program_x86 = PathBuf::from(std::env::var_os("ProgramFiles(x86)").unwrap_or_default());
    let windows = PathBuf::from(std::env::var_os("SystemRoot").unwrap_or_else(|| "C:\\Windows".into()));
    let mut apps = vec![];
    push_app(&mut apps, "notepad", "Notepad", "Writing", windows.join("System32/notepad.exe"), &[], None);
    push_app(&mut apps, "chrome", "Google Chrome", "Browser", program.join("Google/Chrome/Application/chrome.exe"), &[], None);
    push_app(&mut apps, "chrome", "Google Chrome", "Browser", program_x86.join("Google/Chrome/Application/chrome.exe"), &[], None);
    push_app(&mut apps, "chrome", "Google Chrome", "Browser", local.join("Google/Chrome/Application/chrome.exe"), &[], None);
    push_app(&mut apps, "edge", "Microsoft Edge", "Browser", program_x86.join("Microsoft/Edge/Application/msedge.exe"), &[], None);
    push_app(&mut apps, "edge", "Microsoft Edge", "Browser", program.join("Microsoft/Edge/Application/msedge.exe"), &[], None);
    push_app(&mut apps, "brave", "Brave", "Browser", program.join("BraveSoftware/Brave-Browser/Application/brave.exe"), &[], None);
    push_app(&mut apps, "brave", "Brave", "Browser", local.join("BraveSoftware/Brave-Browser/Application/brave.exe"), &[], None);
    push_app(&mut apps, "word", "Microsoft Word", "Writing", program.join("Microsoft Office/root/Office16/WINWORD.EXE"), &[], None);
    push_app(&mut apps, "word", "Microsoft Word", "Writing", program_x86.join("Microsoft Office/root/Office16/WINWORD.EXE"), &[], None);
    push_app(&mut apps, "discord", "Discord", "Communication", local.join("Discord/Update.exe"), &["--processStart", "Discord.exe"], Some("Discord.exe"));
    push_app(&mut apps, "vscode", "Visual Studio Code", "Development", local.join("Programs/Microsoft VS Code/Code.exe"), &[], Some("Code.exe"));
    let mut seen = HashSet::new();
    apps.retain(|app| seen.insert(app.id.clone()));
    apps
}

fn browser_roots() -> Vec<(&'static str, PathBuf)> {
    let local = PathBuf::from(std::env::var_os("LOCALAPPDATA").unwrap_or_default());
    vec![
        ("chrome", local.join("Google/Chrome/User Data")),
        ("edge", local.join("Microsoft/Edge/User Data")),
        ("brave", local.join("BraveSoftware/Brave-Browser/User Data")),
    ]
}

fn profiles() -> Vec<BrowserProfile> {
    let mut result = vec![];
    for (browser_id, root) in browser_roots() {
        let Ok(bytes) = std::fs::read(root.join("Local State")) else { continue };
        let Ok(value) = serde_json::from_slice::<Value>(&bytes) else { continue };
        let Some(cache) = value.pointer("/profile/info_cache").and_then(Value::as_object) else { continue };
        for (directory, profile) in cache {
            result.push(BrowserProfile {
                browser_id: browser_id.into(),
                directory: directory.clone(),
                name: profile.get("name").and_then(Value::as_str).unwrap_or(directory).into(),
                account: profile.get("user_name").and_then(Value::as_str).unwrap_or("").into(),
            });
        }
    }
    result
}

fn collect_bookmarks(node: &Value, browser_id: &str, profile: &str, output: &mut Vec<BrowserBookmark>) {
    if output.len() >= 1200 { return; }
    if let Some(url) = node.get("url").and_then(Value::as_str) {
        if platform::validate_url(url).is_ok() {
            output.push(BrowserBookmark {
                title: node.get("name").and_then(Value::as_str).unwrap_or(url).into(),
                url: url.into(), browser_id: browser_id.into(), profile_directory: profile.into(),
            });
        }
    }
    if let Some(children) = node.get("children").and_then(Value::as_array) {
        for child in children { collect_bookmarks(child, browser_id, profile, output); }
    }
}

fn bookmarks() -> Vec<BrowserBookmark> {
    let mut result = vec![];
    for (browser_id, root) in browser_roots() {
        let Ok(entries) = std::fs::read_dir(&root) else { continue };
        for entry in entries.flatten() {
            let directory = entry.file_name().to_string_lossy().into_owned();
            if directory != "Default" && !directory.starts_with("Profile ") { continue; }
            let path = entry.path().join("Bookmarks");
            let Ok(bytes) = std::fs::read(path) else { continue };
            let Ok(value) = serde_json::from_slice::<Value>(&bytes) else { continue };
            if let Some(roots) = value.get("roots").and_then(Value::as_object) {
                for node in roots.values() { collect_bookmarks(node, browser_id, &directory, &mut result); }
            }
        }
    }
    result
}

pub fn catalog() -> AssistantCatalog {
    AssistantCatalog { apps: installed_apps(), profiles: profiles(), bookmarks: bookmarks() }
}

pub fn execute(action: AssistantAction) -> Result<String> {
    let catalog = catalog();
    match action.kind.as_str() {
        "launchApp" => {
            let id = action.app_id.ok_or("The action has no application")?;
            let app = catalog.apps.into_iter().find(|item| item.id == id).ok_or("That application is not installed or is no longer available")?;
            Command::new(&app.executable).args(&app.arguments).spawn().map_err(|e| format!("Could not open {}: {e}", app.name))?;
            let verified = (0..12).any(|_| {
                std::thread::sleep(std::time::Duration::from_millis(150));
                platform::application_is_running(&app.process_name).unwrap_or(false)
            });
            if !verified { return Err(format!("{} was launched, but doaorel could not verify that it stayed open", app.name)); }
            Ok(format!("Verified {} is running", app.name))
        }
        "openUrl" => {
            let url = action.url.ok_or("The action has no web address")?;
            platform::open_url(&url)?;
            Ok("Windows accepted the website request".into())
        }
        "openInProfile" => {
            let url = action.url.ok_or("The action has no web address")?;
            platform::validate_url(&url)?;
            let browser_id = action.browser_id.ok_or("The action has no browser")?;
            let directory = action.profile_directory.ok_or("The action has no browser profile")?;
            if !catalog.profiles.iter().any(|profile| profile.browser_id == browser_id && profile.directory == directory) {
                return Err("That browser profile is no longer available".into());
            }
            let browser = catalog.apps.into_iter().find(|item| item.id == browser_id).ok_or("That browser is not installed")?;
            Command::new(&browser.executable).arg(format!("--profile-directory={directory}")).arg(&url).spawn().map_err(|e| format!("Could not open browser: {e}"))?;
            let verified = (0..10).any(|_| {
                std::thread::sleep(std::time::Duration::from_millis(150));
                platform::application_is_running(&browser.process_name).unwrap_or(false)
            });
            if !verified { return Err("The browser launch was requested, but doaorel could not verify the browser process".into()); }
            Ok("Verified the selected browser profile is running".into())
        }
        _ => Err("Unsupported assistant action".into()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_unstructured_actions() {
        assert!(execute(AssistantAction { kind: "shell".into(), app_id: None, url: None, browser_id: None, profile_directory: None }).is_err());
    }
    #[test]
    fn bookmark_reader_ignores_non_web_urls() {
        let mut result = vec![];
        collect_bookmarks(&serde_json::json!({"name":"bad","url":"javascript:alert(1)"}), "chrome", "Default", &mut result);
        assert!(result.is_empty());
    }
    #[test]
    #[cfg(windows)]
    fn discovers_windows_notepad_on_the_real_machine() {
        assert!(installed_apps().iter().any(|app| app.id == "notepad"));
    }
}
