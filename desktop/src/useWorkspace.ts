import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, chooseFolder, emptyWorkspace, native } from "./api";
import type { PaletteAction } from "./components/Palette";
import { builtInTools } from "./tools/registry";
import type { AssistantCatalog } from "./types";
import { visibleProjects } from "./projects";
import type {
  Ide,
  Project,
  ProjectCommand,
  ProjectDetail,
  ScanResult,
  Settings,
  Snapshot,
} from "./types";
export type View =
  | "Profile"
  | "Home"
  | "Projects"
  | "Commands"
  | "Tools"
  | "Stats"
  | "Activity"
  | "Settings";
interface PendingAction {
  project: Project;
  action: string;
  command?: ProjectCommand;
}
export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Snapshot>(emptyWorkspace);
  const [catalog, setCatalog] = useState<AssistantCatalog>({ apps: [], profiles: [], bookmarks: [] });
  useEffect(() => { if (native) void api.assistantCatalog().then(setCatalog).catch(() => {}); }, []);
  const [view, setView] = useState<View>("Home");
  const viewHistory = useRef<View[]>(["Home"]);
  const viewHistoryIndex = useRef(0);
  const [historyState, setHistoryState] = useState({
    back: false,
    forward: false,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [palette, setPalette] = useState(false);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [visited, setVisited] = useState(0);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [custom, setCustom] = useState(false);
  const [tools, setTools] = useState<[string, string][]>([]);
  const [newIde, setNewIde] = useState<Ide | null>(null);
  const [forget, setForget] = useState<Project | null>(null);
  const [clearHistory, setClearHistory] = useState(false);
  const detailRequest = useRef(0);
  const actionLock = useRef(false);
  const started = useRef(false);
  const refresh = useCallback(async () => {
    if (native) setWorkspace(await api.load());
  }, []);
  useEffect(() => {
    if (!native) return;
    let stopped = false;
    let unlisten: (() => void) | undefined;
    listen("work-session-updated", () => void refresh()).then((fn) => {
      if (stopped) fn();
      else unlisten = fn;
    });
    return () => {
      stopped = true;
      unlisten?.();
    };
  }, [refresh]);
  useEffect(() => {
    if (!native || started.current) return;
    started.current = true;
    void (async () => {
      let loaded = await api.load();
      if (localStorage.getItem("doaorel-visual-migration-v1") !== "done") {
        const settings = { ...loaded.settings, theme: "oled" };
        await api.settings(settings);
        loaded = { ...loaded, settings };
        localStorage.setItem("doaorel-visual-migration-v1", "done");
      }
      setWorkspace(loaded);
      if (!loaded.ides.length) {
        await api.detectIdes();
        await refresh();
      }
    })().catch((e) => setError(String(e)));
  }, [refresh]);
  const reloadDetail = useCallback(async (path: string) => {
    const request = ++detailRequest.current;
    setDetailLoading(true);
    try {
      const next = await api.detail(path);
      if (request === detailRequest.current) setDetail(next);
    } catch (e) {
      if (request === detailRequest.current) setError(String(e));
    } finally {
      if (request === detailRequest.current) setDetailLoading(false);
    }
  }, []);
  useEffect(() => {
    if (selected) void reloadDetail(selected);
    else {
      detailRequest.current++;
      setDetail(null);
      setDetailLoading(false);
    }
  }, [selected, reloadDetail]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette(true);
        document.querySelector<HTMLInputElement>('.search-field input')?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!native) return;
    let stopped = false;
    let unlisten: (() => void) | undefined;
    listen<number>("scan-progress", (e) => setVisited(e.payload)).then((fn) => {
      if (stopped) fn();
      else unlisten = fn;
    });
    return () => {
      stopped = true;
      unlisten?.();
    };
  }, []);
  useEffect(() => {
    const { scale, reduceMotion } = workspace.settings;
    document.documentElement.dataset.theme = "oled";
    document.documentElement.dataset.motion = reduceMotion
      ? "reduce"
      : "normal";
    document.documentElement.style.fontSize = `${(scale / 100) * 14}px`;
  }, [workspace.settings]);
  async function perform(label: string, fn: () => Promise<void>) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(String(e));
    } finally {
      actionLock.current = false;
      setBusy("");
    }
  }
  const resetForView = (next: View) => {
    setSelected(null);
    setView(next);
    setQuery("");
  };
  const go = (next: View) => {
    if (viewHistory.current[viewHistoryIndex.current] !== next) {
      viewHistory.current = viewHistory.current.slice(
        0,
        viewHistoryIndex.current + 1,
      );
      viewHistory.current.push(next);
      viewHistoryIndex.current = viewHistory.current.length - 1;
      setHistoryState({ back: viewHistoryIndex.current > 0, forward: false });
    }
    resetForView(next);
  };
  const goBack = () => {
    if (viewHistoryIndex.current <= 0) return;
    viewHistoryIndex.current -= 1;
    resetForView(viewHistory.current[viewHistoryIndex.current]);
    setHistoryState({
      back: viewHistoryIndex.current > 0,
      forward: viewHistoryIndex.current < viewHistory.current.length - 1,
    });
  };
  const goForward = () => {
    if (viewHistoryIndex.current >= viewHistory.current.length - 1) return;
    viewHistoryIndex.current += 1;
    resetForView(viewHistory.current[viewHistoryIndex.current]);
    setHistoryState({
      back: viewHistoryIndex.current > 0,
      forward: viewHistoryIndex.current < viewHistory.current.length - 1,
    });
  };
  const select = (p: Project) => {
    if (selected !== p.path) setDetail(null);
    setView("Projects");
    setSelected(p.path);
    setTab("Overview");
    setError("");
  };
  const projects = visibleProjects(workspace.projects, query, sort);
  const recent = [...workspace.projects]
    .filter((p) => p.lastOpened)
    .sort((a, b) => b.lastOpened! - a.lastOpened!);
  const active = detail?.project;
  const saveProject = (p: Project) =>
    perform("Saving project", async () => {
      await api.update(p);
      await reloadDetail(p.path);
      setNotice("Project preferences saved");
    });
  const saveSettings = (s: Settings) =>
    perform("Saving settings", async () => {
      await api.settings(s);
      setNotice("Settings saved");
    });
  const addFolder = () =>
    perform("Adding project", async () => {
      const path = await chooseFolder();
      if (path) {
        await api.add([path]);
        setNotice("Project added to your workspace");
      }
    });
  const addRoot = (exclude = false) =>
    perform("Choosing folder", async () => {
      const path = await chooseFolder();
      if (path) {
        const key = exclude ? "exclusions" : "roots";
        await api.settings({
          ...workspace.settings,
          [key]: [...new Set([...workspace.settings[key], path])],
        });
      }
    });
  const scanProjects = () =>
    perform("Scanning projects", async () => {
      setVisited(0);
      const found = await api.scan();
      setScan(found);
      setChosen(
        found.projects
          .filter(
            (p) =>
              !workspace.projects.some(
                (k) => k.path.toLowerCase() === p.path.toLowerCase(),
              ),
          )
          .map((p) => p.path),
      );
    });
  const requestAction = async (
    project: Project,
    action: string,
    command?: ProjectCommand,
  ) => {
    try {
      const current =
        detail?.project.path === project.path
          ? detail
          : await api.detail(project.path);
      const commandToRun =
        command ??
        (action === "resume"
          ? current.commands.find(
              (c) => c.id === current.project.resume.commandId,
            )
          : undefined);
      if (
        action === "resume" &&
        current.project.resume.commandId &&
        !commandToRun
      )
        throw new Error(
          "Saved Resume command is missing. Update the Resume plan.",
        );
      setPending({ project: current.project, action, command: commandToRun });
    } catch (e) {
      setError(String(e));
    }
  };
  const execute = () => {
    if (!pending) return;
    const item = pending;
    void perform("Launching", async () => {
      const result = await api.act(
        item.project.path,
        item.action,
        item.command?.id,
        item.command?.command,
      );
      setPending(null);
      setNotice(result.completed.join(" · "));
      if (result.errors.length) setError(result.errors.join("\n"));
      if (selected === item.project.path) await reloadDetail(selected);
    });
  };
  const paletteActions: PaletteAction[] = [
    ...builtInTools.map(tool => ({ id: tool.id, title: tool.name, detail: tool.description, category: "Tool", run: () => go("Tools") })),
    ...catalog.apps.filter(app => !workspace.ides.some(ide => ide.name.toLowerCase() === app.name.toLowerCase())).map(app => ({
      id: `app:${app.id}`, title: `Open ${app.name}`, detail: app.category, category: "Application",
      run: () => { void perform("Opening application", async () => { await api.executeAssistantAction({ id: app.id, kind: "launchApp", appId: app.id, label: app.name, detail: app.category }); }); },
    })),
    ...workspace.ides
      .filter((i) => !i.hidden)
      .map((i) => ({
        id: `ide:${i.id}`,
        title: `Launch ${i.name}`,
        detail: "Development application",
        category: "Application",
        run: () => {
          void perform("Opening application", () => api.launchIde(i.id));
        },
      })),
    ...workspace.projects.map((p) => ({
      id: p.path,
      title: p.name,
      detail: p.path,
      category: "Project",
      run: () => select(p),
    })),
    ...workspace.capsules.map((capsule) => ({
      id: `context:${capsule.id}`,
      title: capsule.name,
      detail: `${workspace.projects.find((project) => project.path === capsule.projectPath)?.name ?? capsule.projectPath} · Saved context${capsule.goal ? ` · ${capsule.goal}` : ""}`,
      run: () => {
        const project = workspace.projects.find(
          (item) => item.path === capsule.projectPath,
        );
        if (project) {
          setTab("Memory");
          select(project);
        }
      },
    })),
    ...workspace.commands.flatMap((item) => {
      const project = workspace.projects.find(
        (candidate) => candidate.path === item.projectPath,
      );
      return project
        ? [
            {
              id: `command:${item.projectPath}:${item.command.id}`,
              title: `Run ${item.command.name}`,
              detail: `${project.name} · ${item.command.command}`,
              category: "Command",
              run: () => void requestAction(project, "run", item.command),
            },
          ]
        : [];
    }),
    ...workspace.workSessions
      .filter((session) => session.goal)
      .slice(0, 30)
      .map((session) => ({
        id: `session:${session.id}`,
        title: session.goal,
        detail: `Work session · ${session.appName}`,
        run: () => go("Stats"),
      })),
    ...(detail?.commands ?? []).map((c) => ({
      id: c.id,
      title: `Run ${c.name}`,
      detail: c.command,
      run: () => {
        if (active) void requestAction(active, "run", c);
      },
    })),
    ...(
      [
        "Home",
        "Projects",
        "Commands",
        "Tools",
        "Stats",
        "Activity",
        "Settings",
        "Profile",
      ] as View[]
    ).map((name) => ({
      id: name,
      title: `Open ${name === "Projects" ? "Workspace" : name === "Commands" ? "Saved commands" : name}`,
      detail: "Navigation",
      category: "Navigation",
      run: () => go(name),
    })),
    {
      id: "add-project",
      title: "Add a project",
      detail: "Choose a local folder",
      run: addFolder,
    },
  ];

  return {
    workspace,
    setWorkspace,
    view,
    selected,
    setSelected,
    detail,
    detailLoading,
    tab,
    setTab,
    query,
    setQuery,
    sort,
    setSort,
    palette,
    setPalette,
    busy,
    setNotice,
    error,
    setError,
    notice,
    scan,
    setScan,
    chosen,
    setChosen,
    visited,
    pending,
    setPending,
    custom,
    setCustom,
    tools,
    setTools,
    newIde,
    setNewIde,
    forget,
    setForget,
    clearHistory,
    setClearHistory,
    refresh,
    reloadDetail,
    perform,
    go,
    goBack,
    goForward,
    canGoBack: historyState.back,
    canGoForward: historyState.forward,
    select,
    projects,
    recent,
    active,
    saveProject,
    saveSettings,
    addFolder,
    addRoot,
    scanProjects,
    requestAction,
    execute,
    paletteActions,
  };
}
export type WorkspaceController = ReturnType<typeof useWorkspace>;
