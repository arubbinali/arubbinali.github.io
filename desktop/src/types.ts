export interface ResumePlan {
  ide: boolean;
  terminal: boolean;
  commandId: string | null;
  url: boolean;
}
export interface Project {
  path: string;
  name: string;
  kind: string;
  languages: string[];
  preferredIde: string | null;
  pinned: boolean;
  notes: string;
  devUrl: string;
  lastOpened: number | null;
  lastCommand: string | null;
  resume: ResumePlan;
}
export interface Ide {
  id: string;
  name: string;
  path: string;
  hidden: boolean;
  pinned: boolean;
}
export interface ProjectCommand {
  id: string;
  name: string;
  command: string;
  source: string;
}
export interface IndexedCommand {
  projectPath: string;
  command: ProjectCommand;
}
export interface ProjectWorkflow {
  id: string;
  projectPath: string;
  name: string;
  plan: ResumePlan;
}
export interface AppRule {
  appId: string;
  projectPath: string;
}
export interface Settings {
  roots: string[];
  exclusions: string[];
  theme: string;
  scale: number;
  reduceMotion: boolean;
  recordActivity: boolean;
  shell: string;
}
export interface Activity {
  id: number;
  at: number;
  projectPath: string | null;
  action: string;
  detail: string;
}
export interface WorkSession {
  id: number;
  projectPath: string | null;
  appId: string;
  appName: string;
  executablePath: string;
  startedAt: number;
  endedAt: number | null;
  goal: string;
}
export interface ContextCapsule {
  id: number;
  projectPath: string;
  name: string;
  goal: string;
  branch: string;
  latestCommit: string;
  changedFiles: number;
  command: string | null;
  devUrl: string;
  notes: string;
  createdAt: number;
}
export interface GitCommit {
  hash: string;
  subject: string;
  at: number;
}
export interface ProjectHealth {
  readme: boolean;
  license: boolean;
  todoCount: number;
  fixmeCount: number;
  changedFiles: number;
  commitCount30d: number;
  branches: string[];
  recentCommits: GitCommit[];
  dependencies: string[];
  relatedProjects: string[];
}
export interface CommitPoint {
  projectPath: string;
  at: number;
}
export interface StatsSnapshot {
  sessions: WorkSession[];
  commits: CommitPoint[];
}
export interface Snapshot {
  projects: Project[];
  ides: Ide[];
  settings: Settings;
  activity: Activity[];
  workSessions: WorkSession[];
  capsules: ContextCapsule[];
  commands: IndexedCommand[];
  appRules: AppRule[];
  databasePath: string;
}
export interface ScanResult {
  projects: Project[];
  visited: number;
  warnings: string[];
  truncated: boolean;
}
export interface GitInfo {
  available: boolean;
  repository: boolean;
  branch: string;
  ahead: number;
  behind: number;
  changes: { status: string; path: string }[];
  latest: string;
  remote: string;
  error: string | null;
}
export interface ProjectDetail {
  project: Project;
  git: GitInfo;
  commands: ProjectCommand[];
  recentFiles: { path: string; modified: number }[];
  warnings: string[];
  health: ProjectHealth;
  capsules: ContextCapsule[];
  workflows: ProjectWorkflow[];
}
export interface ActionResult {
  completed: string[];
  errors: string[];
}
export interface AssistantApp {
  id: string;
  name: string;
  category: string;
}
export interface BrowserProfile {
  browserId: string;
  directory: string;
  name: string;
  account: string;
}
export interface BrowserBookmark {
  title: string;
  url: string;
  browserId: string;
  profileDirectory: string;
}
export interface AssistantCatalog {
  apps: AssistantApp[];
  profiles: BrowserProfile[];
  bookmarks: BrowserBookmark[];
}
export interface AssistantAction {
  id: string;
  kind: "launchApp" | "openUrl" | "openInProfile";
  label: string;
  detail: string;
  appId?: string;
  url?: string;
  browserId?: string;
  profileDirectory?: string;
}
