import { invoke, isTauri } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type {
  ActionResult,
  AssistantAction,
  AssistantCatalog,
  Ide,
  Project,
  ProjectCommand,
  ProjectDetail,
  ProjectWorkflow,
  ScanResult,
  Settings,
  Snapshot,
  StatsSnapshot,
} from "./types";
export const native = isTauri();
export const emptyWorkspace: Snapshot = {
  projects: [],
  ides: [],
  activity: [],
  workSessions: [],
  capsules: [],
  commands: [],
  appRules: [],
  databasePath: "",
  settings: {
    roots: [],
    exclusions: [],
    theme: "oled",
    scale: 135,
    reduceMotion: false,
    recordActivity: true,
    shell: "powershell",
  },
};
function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!native)
    return Promise.reject(
      new Error(
        "Open the Windows desktop application to use local workspace features.",
      ),
    );
  return invoke<T>(command, args);
}
export const api = {
  load: () => call<Snapshot>("load_workspace"),
  settings: (settings: Settings) => call<void>("save_settings", { settings }),
  scan: () => call<ScanResult>("discover_projects"),
  cancelScan: () => call<void>("cancel_scan"),
  add: (paths: string[]) => call<void>("add_projects", { paths }),
  detail: (path: string) => call<ProjectDetail>("inspect_project", { path }),
  update: (project: Project) => call<void>("update_project", { project }),
  forget: (path: string) => call<void>("forget_project", { path }),
  detectIdes: () => call<void>("detect_ides"),
  saveIde: (ide: Ide) => call<void>("save_ide", { ide }),
  launchIde: (id: string) => call<void>("launch_application", { id }),
  command: (path: string, command: ProjectCommand) =>
    call<void>("save_command", { path, command }),
  clearActivity: () => call<void>("clear_activity"),
  act: (
    path: string,
    action: string,
    commandId?: string,
    expectedCommand?: string,
  ) =>
    call<ActionResult>("perform_action", {
      path,
      action,
      commandId: commandId ?? null,
      expectedCommand: expectedCommand ?? null,
    }),
  tools: () => call<[string, string][]>("inspect_tools"),
  stats: () => call<StatsSnapshot>("load_stats"),
  setSessionGoal: (id: number, goal: string) =>
    call<void>("set_session_goal", { id, goal }),
  finishSession: (id: number) => call<void>("finish_session", { id }),
  saveCapsule: (path: string, name: string, goal: string) =>
    call<void>("save_context_capsule", { path, name, goal }),
  deleteCapsule: (id: number) => call<void>("delete_context_capsule", { id }),
  exportWorkspace: (destination: string) =>
    call<void>("export_workspace", { destination }),
  saveWorkflow: (workflow: ProjectWorkflow) =>
    call<void>("save_workflow", { workflow }),
  deleteWorkflow: (projectPath: string, id: string) =>
    call<void>("delete_workflow", { projectPath, id }),
  runWorkflow: (projectPath: string, id: string, expectedCommand?: string) =>
    call<ActionResult>("run_workflow", {
      projectPath,
      id,
      expectedCommand: expectedCommand ?? null,
    }),
  saveAppRule: (appId: string, projectPath: string) =>
    call<void>("save_app_rule", { appId, projectPath }),
  assistantCatalog: () => call<AssistantCatalog>("assistant_catalog"),
  executeAssistantAction: (action: AssistantAction) =>
    call<string>("execute_assistant_action", { action }),
};
export async function chooseFolder() {
  if (!native) throw new Error("Folder selection requires the desktop app.");
  return open({
    directory: true,
    multiple: false,
    title: "Choose a project folder",
  });
}
export async function chooseExecutable() {
  if (!native)
    throw new Error("Application selection requires the desktop app.");
  return open({
    multiple: false,
    filters: [{ name: "Windows application", extensions: ["exe"] }],
    title: "Choose your development application",
  });
}
export async function chooseBackupPath() {
  if (!native) throw new Error("Workspace export requires the desktop app.");
  return save({
    title: "Export doaorel workspace",
    defaultPath: `doaorel-workspace-${new Date().toISOString().slice(0, 10)}.json`,
    filters: [{ name: "doaorel workspace backup", extensions: ["json"] }],
  });
}
