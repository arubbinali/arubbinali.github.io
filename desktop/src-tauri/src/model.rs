use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ResumePlan {
    pub ide: bool,
    pub terminal: bool,
    pub command_id: Option<String>,
    pub url: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub path: String,
    pub name: String,
    pub kind: String,
    pub languages: Vec<String>,
    pub preferred_ide: Option<String>,
    pub pinned: bool,
    pub notes: String,
    pub dev_url: String,
    pub last_opened: Option<i64>,
    pub last_command: Option<String>,
    pub resume: ResumePlan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Ide {
    pub id: String,
    pub name: String,
    pub path: String,
    pub hidden: bool,
    pub pinned: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectCommand {
    pub id: String,
    pub name: String,
    pub command: String,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IndexedCommand {
    pub project_path: String,
    pub command: ProjectCommand,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectWorkflow {
    pub id: String,
    pub project_path: String,
    pub name: String,
    pub plan: ResumePlan,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppRule {
    pub app_id: String,
    pub project_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub roots: Vec<String>,
    pub exclusions: Vec<String>,
    pub theme: String,
    pub scale: u16,
    pub reduce_motion: bool,
    pub record_activity: bool,
    pub shell: String,
}
impl Default for Settings {
    fn default() -> Self {
        Self {
            roots: vec![],
            exclusions: vec![],
            theme: "oled".into(),
            scale: 135,
            reduce_motion: false,
            record_activity: true,
            shell: "powershell".into(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Activity {
    pub id: i64,
    pub at: i64,
    pub project_path: Option<String>,
    pub action: String,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkSession {
    pub id: i64,
    pub project_path: Option<String>,
    pub app_id: String,
    pub app_name: String,
    pub executable_path: String,
    pub started_at: i64,
    pub ended_at: Option<i64>,
    pub goal: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContextCapsule {
    pub id: i64,
    pub project_path: String,
    pub name: String,
    pub goal: String,
    pub branch: String,
    pub latest_commit: String,
    pub changed_files: usize,
    pub command: Option<String>,
    pub dev_url: String,
    pub notes: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GitCommit {
    pub hash: String,
    pub subject: String,
    pub at: i64,
}

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct ProjectHealth {
    pub readme: bool,
    pub license: bool,
    pub todo_count: usize,
    pub fixme_count: usize,
    pub changed_files: usize,
    pub commit_count_30d: usize,
    pub branches: Vec<String>,
    pub recent_commits: Vec<GitCommit>,
    pub dependencies: Vec<String>,
    pub related_projects: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommitPoint {
    pub project_path: String,
    pub at: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsSnapshot {
    pub sessions: Vec<WorkSession>,
    pub commits: Vec<CommitPoint>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    pub projects: Vec<Project>,
    pub ides: Vec<Ide>,
    pub settings: Settings,
    pub activity: Vec<Activity>,
    pub work_sessions: Vec<WorkSession>,
    pub capsules: Vec<ContextCapsule>,
    pub commands: Vec<IndexedCommand>,
    pub app_rules: Vec<AppRule>,
    pub database_path: String,
}

#[derive(Debug, Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct GitInfo {
    pub available: bool,
    pub repository: bool,
    pub branch: String,
    pub ahead: usize,
    pub behind: usize,
    pub changes: Vec<GitChange>,
    pub latest: String,
    pub remote: String,
    pub error: Option<String>,
}
#[derive(Debug, Serialize)]
pub struct GitChange {
    pub status: String,
    pub path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectDetail {
    pub project: Project,
    pub git: GitInfo,
    pub commands: Vec<ProjectCommand>,
    pub recent_files: Vec<RecentFile>,
    pub warnings: Vec<String>,
    pub health: ProjectHealth,
    pub capsules: Vec<ContextCapsule>,
    pub workflows: Vec<ProjectWorkflow>,
}
#[derive(Debug, Serialize)]
pub struct RecentFile {
    pub path: String,
    pub modified: i64,
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub projects: Vec<Project>,
    pub visited: usize,
    pub warnings: Vec<String>,
    pub truncated: bool,
}

pub fn now() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}
