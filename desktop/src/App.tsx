import {
  Activity as ActivityIcon,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Folder,
  FolderPlus,
  Home,
  Monitor,
  Pin,
  Play,
  Plus,
  Search,
  Settings as SettingsIcon,
  Wrench,
  UserRound,
} from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import Lenis from "lenis";
import { api, native } from "./api";
import { Dialog, DialogFeedback } from "./components/Dialog";
import { Feedback, Startup, useExperience } from "./components/Experience";
import { EffectBoundary } from "./components/EffectBoundary";
import { ShellDialog } from "./components/ShellDialog";
import { ProfileView } from "./views/ProfileView";
import { HomeView } from "./views/HomeView";
import { FocusIsland } from "./components/FocusIsland";
import { GooeyQuickNav } from "./components/GooeyQuickNav";
import { Palette } from "./components/Palette";
import { WindowBar } from "./components/WindowBar";
import { when } from "./projects";
import { SquishSwitch } from "./components/InteractiveControls";
import type { Project } from "./types";
import { useWorkspace } from "./useWorkspace";
import { ActivityView } from "./views/ActivityView";
import { AssistantView } from "./views/AssistantView";
import { CommandsView } from "./views/CommandsView";
import { ProjectHubView } from "./views/ProjectHubView";
import { ProjectListView } from "./views/ProjectListView";
import { SettingsView } from "./views/SettingsView";
import { StatsView } from "./views/StatsView";
import { ToolsView } from "./views/ToolsView";

const navigation = [
  { name: "Home", icon: Home },
  { name: "Projects", label: "Workspace", icon: Folder },
  { name: "Tools", icon: Wrench },
  { name: "Stats", icon: BarChart3 },
  { name: "Activity", icon: ActivityIcon },
] as const;
const GradientWaves = lazy(() => import("./components/GradientWaves"));

function projectHue(value: string) {
  let hash = 0;
  for (const character of value)
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return 345 + (Math.abs(hash) % 55);
}

export default function App() {
  const model = useWorkspace();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zen, setZen] = useState(false);
  const [waveTheme, setWaveTheme] = useState<"vivid" | "noir">(() =>
    localStorage.getItem("doaorel-wave-theme") === "noir" ? "noir" : "vivid",
  );
  const scrollRef = useRef<HTMLElement>(null);
  const scrollBodyRef = useRef<HTMLDivElement>(null);
  const smoothScrollRef = useRef<Lenis | null>(null);
  const [workspaceOverview, setWorkspaceOverview] = useState(false);
  const [shellDialog, setShellDialog] = useState<"exit" | "about" | null>(null);
  const { preferences } = useExperience();
  const [clearHistoryClosing, setClearHistoryClosing] = useState(false);
  const {
    workspace,
    view,
    selected,
    setSelected,
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
    newIde,
    setNewIde,
    forget,
    setForget,
    clearHistory,
    setClearHistory,
    reloadDetail,
    perform,
    go,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    select,
    active,
    addFolder,
    execute,
    paletteActions,
  } = model;
  useEffect(() => {
    if (clearHistory) setClearHistoryClosing(false);
  }, [clearHistory]);
  useEffect(() => localStorage.setItem("doaorel-wave-theme", waveTheme), [waveTheme]);
  useEffect(() => {
    const wrapper = scrollRef.current;
    const content = scrollBodyRef.current;
    if (!wrapper || !content || workspace.settings.reduceMotion) return;
    const smoothScroll = new Lenis({
      wrapper,
      content,
      duration: 0.95,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      prevent: (node) => Boolean(node.closest?.("[data-lenis-prevent], dialog, .palette-results, .contribution-scroll, .glide-select-menu, textarea, [contenteditable]")),
    });
    smoothScrollRef.current = smoothScroll;
    let frame = 0;
    const tick = (time: number) => {
      smoothScroll.raf(time);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); smoothScroll.destroy(); smoothScrollRef.current = null; };
  }, [workspace.settings.reduceMotion]);
  useEffect(() => {
    smoothScrollRef.current?.scrollTo(0, { immediate: true });
    scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [view, selected, workspaceOverview]);
  const closeClearHistory = () => {
    if (clearHistoryClosing) return;
    setClearHistoryClosing(true);
    window.setTimeout(() => setClearHistory(false), 260);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey &&
        event.code === "Space" &&
        !event.altKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        go("Home");
        window.setTimeout(
          () => document.getElementById("doaorel-command-input")?.focus(),
          40,
        );
        return;
      }
      if (!event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarOpen((open) => !open);
      } else if (event.key === "[") {
        event.preventDefault();
        goBack();
      } else if (event.key === "]") {
        event.preventDefault();
        goForward();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack, goForward]);
  function projectRows(list: Project[]) {
    return (
      <div className="project-list">
        {list.map((p) => (
          <button
            key={p.path}
            className="project-row"
            style={{ "--project-hue": projectHue(p.path) } as CSSProperties}
            onClick={() => select(p)}
          >
            <span className="project-symbol">
              <Folder size={18} />
            </span>
            <span className="project-name">
              <strong>
                {p.name}
                {p.pinned && <Pin size={12} />}
              </strong>
              <small>{p.path}</small>
            </span>
            <span className="languages">
              {p.languages.slice(0, 2).map((l) => (
                <span key={l}>
                  <i data-language={l} />
                  {l}
                </span>
              ))}
            </span>
            <span className="last-opened">{when(p.lastOpened)}</span>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    );
  }
  function empty(title: string, text: string) {
    return (
      <div className="empty">
        <FolderPlus size={32} />
        <h2>{title}</h2>
        <p>{text}</p>
        <button
          className="primary"
          disabled={!native || !!busy}
          onClick={addFolder}
        >
          <Plus size={16} />
          Add a project
        </button>
        <button className="text-button" onClick={() => go("Settings")}>
          Configure discovery folders <ArrowRight size={14} />
        </button>
      </div>
    );
  }
  return (
    <DialogFeedback.Provider value={error}>
      <div className={`app-shell ${sidebarOpen ? "" : "sidebar-collapsed"} ${zen ? "zen-mode" : ""}`} data-wave-theme={waveTheme}>
        {preferences.atmosphere && !workspace.settings.reduceMotion && <div className="workspace-waves" aria-hidden="true"><EffectBoundary fallback={<div/>}><Suspense fallback={null}><GradientWaves horizonColor={waveTheme === "vivid" ? "#3300ff" : "#000000"} waveColor="#ff0000" crestColor="#ff00cd" speed={0.4} amplitude={2.5} waveScale={0.85} waveRatio={1} swell={35} turbulence={4} tilt={1.11} zoom={0.9} height={2} fogDepth={15} detail="high" brightness={1} opacity={1} mouseInteraction parallaxStrength={0.47} grain grainIntensity={0.05}/></Suspense></EffectBoundary></div>}
        <WindowBar
          sidebarOpen={sidebarOpen}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          onBack={goBack}
          onForward={goForward}
          onAddProject={addFolder}
          onSettings={() => go("Settings")}
          onHome={() => { go("Home"); setTimeout(() => document.getElementById("doaorel-command-input")?.focus(), 40); }}
          onAbout={() => setShellDialog("about")}
          onExit={() => setShellDialog("exit")}
          zen={zen}
          onZen={() => { setZen(!zen); setSidebarOpen(zen); }}
          onReset={() => { setZen(false); setSidebarOpen(true); }}
        />
        <Startup reduceMotion={workspace.settings.reduceMotion} />
        <aside className="sidebar">
          <a
            className="brand"
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              go("Home");
            }}
          >
            <span className="doaor-logo metallic-wordmark native-metal-wordmark brand-full">
              doaorel
            </span>
            <span className="brand-initial" aria-hidden="true">d</span>
          </a>
          <button className="search-trigger" title="Search · Ctrl K" aria-label="Search" onClick={() => setPalette(true)}>
            <Search size={15} />
            <span>Search</span>
            <kbd>Ctrl K</kbd>
          </button>
          <nav aria-label="Main navigation">
            {navigation.map((entry) => {
              const { name, icon: Icon } = entry;
              const label = "label" in entry ? entry.label : name;
              const current = view === name || (name === "Projects" && view === "Commands");
              return (
              <button
                key={name}
                className={current ? "active" : ""}
                aria-current={current ? "page" : undefined}
                title={label}
                aria-label={label}
                onClick={() => go(name)}
              >
                <Icon size={17} />
                <span className="nav-label">{label}</span>
                {name === "Projects" && (
                  <small>{workspace.projects.length}</small>
                )}
              </button>
            ); })}
          </nav>
          <div className="sidebar-bottom">
            <span className="local-status">
              <span className="local-dot" />
              Local workspace
            </span>
            <button
              className={view === "Settings" ? "active" : ""}
              onClick={() => go("Settings")}
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={17} />
              <span className="nav-label">Settings</span>
            </button>
            <button title="Profile" aria-label="Profile" className={view === "Profile" ? "active" : ""} onClick={() => go("Profile")}><UserRound size={17}/><span className="nav-label">Local profile</span></button>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <span>
              Doaorel <ChevronRight size={12} /> {view === "Projects" || view === "Commands" ? "Workspace" : view}
              {active && (
                <>
                  <ChevronRight size={12} />
                  <strong>{active.name}</strong>
                </>
              )}
            </span>
            <div className="topbar-actions">
              <SquishSwitch checked={waveTheme === "noir"} onChange={(checked) => setWaveTheme(checked ? "noir" : "vivid")} ariaLabel="Switch gradient theme" width={48} height={26} stretch={10} trackColor="#27212e" trackOnColor="#3a1725" thumbColor="#e4dfff" thumbOnColor="#ff5875" className="wave-theme-switch" />
              <GooeyQuickNav
                onHome={() => go("Home")}
                onProjects={() => go("Projects")}
                onSettings={() => go("Settings")}
              />
              <span className="local-label">
                <Monitor size={13} />
                Windows
              </span>
            </div>
          </header>
          {!native && (
            <div className="preview-banner">
              Interface preview · Local features work in the Windows desktop
              app. The interactive example is a safe walkthrough, not a real
              project.
            </div>
          )}
          <Feedback
            busy={busy}
            error={error}
            notice={notice}
            visited={visited}
            dismiss={() => {
              setError("");
              setNotice("");
            }}
            cancel={() => {
              void api.cancelScan().catch((e) => setError(String(e)));
            }}
          />
          <main className="content" ref={scrollRef}>
          <div className="content-scroll-body" ref={scrollBodyRef}>
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => { smoothScrollRef.current?.scrollTo(0, { immediate: true }); scrollRef.current?.scrollTo({ top: 0, behavior: "instant" }); }}>
          <motion.div className="page-motion" key={`${view}-${selected ?? ""}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: workspace.settings.reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}>
            {zen && <button className="zen-exit" onClick={() => { setZen(false); setSidebarOpen(true); }}>Leave Zen mode</button>}
            {view === "Home" && (
              <AssistantView onActivity={() => go("Activity")} />
            )}
            {(view === "Projects" || view === "Commands") && <nav className="section-tabs" aria-label="Workspace sections"><button aria-pressed={view === "Projects" && workspaceOverview && !selected} onClick={() => { go("Projects"); setWorkspaceOverview(true); }}>Overview</button><button aria-pressed={view === "Projects" && (!workspaceOverview || !!selected)} onClick={() => { go("Projects"); setWorkspaceOverview(false); }}>Projects</button><button aria-pressed={view === "Commands"} onClick={() => go("Commands")}>Saved commands</button></nav>}
            {view === "Projects" && workspaceOverview && !selected && <HomeView model={model} projectRows={projectRows} empty={empty}/>}
            {view === "Projects" && !workspaceOverview && !selected && (
              <ProjectListView
                model={model}
                projectRows={projectRows}
                empty={empty}
              />
            )}
            {selected && view === "Projects" && (
              <ProjectHubView model={model} />
            )}
            {view === "Commands" && (
              <CommandsView
                model={model}
                projectRows={projectRows}
                empty={empty}
              />
            )}
            {view === "Tools" && <ToolsView model={model} />}
            {view === "Stats" && <StatsView model={model} />}
            {view === "Activity" && <ActivityView model={model} />}
            {view === "Settings" && <SettingsView model={model} />}
            {view === "Profile" && <ProfileView />}
          </motion.div>
          </AnimatePresence>
          </div>
          </main>
          <footer className="statusbar">
            <span>{workspace.projects.length} projects</span>
            <span>{busy || "Saved on this device"}</span>
          </footer>
        </div>
        <FocusIsland model={model} />
        {shellDialog && <ShellDialog kind={shellDialog} close={() => setShellDialog(null)}/>}
        {palette && (
          <Palette actions={paletteActions} close={() => setPalette(false)} />
        )}
        {scan && (
          <Dialog
            title="Review discovered projects"
            wide
            onClose={() => setScan(null)}
          >
            <p className="muted">
              {scan.projects.length} candidates · {scan.visited} entries
              checked. Nothing is imported until you add it.
            </p>
            {scan.truncated && (
              <p className="warning">
                Scan limit reached. Select smaller folders for more results.
              </p>
            )}
            {scan.warnings.map((w) => (
              <p className="warning" key={w}>
                {w}
              </p>
            ))}
            <div className="scan-results">
              {scan.projects.map((p) => {
                const known = workspace.projects.some(
                  (k) => k.path.toLowerCase() === p.path.toLowerCase(),
                );
                return (
                  <label key={p.path} className="scan-row">
                    <input
                      type="checkbox"
                      disabled={known}
                      checked={known || chosen.includes(p.path)}
                      onChange={(e) =>
                        setChosen((old) =>
                          e.target.checked
                            ? [...old, p.path]
                            : old.filter((path) => path !== p.path),
                        )
                      }
                    />
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.path}</small>
                    </span>
                    <small>{known ? "Already added" : p.kind}</small>
                  </label>
                );
              })}
              {!scan.projects.length && (
                <p>
                  No matching project markers found. You can add any project
                  folder manually.
                </p>
              )}
            </div>
            <footer>
              <button onClick={() => setScan(null)}>Cancel</button>
              <button
                className="primary"
                disabled={!chosen.length || !!busy}
                onClick={() =>
                  void perform("Adding projects", async () => {
                    await api.add(chosen);
                    setScan(null);
                    go("Projects");
                    setNotice(`${chosen.length} projects added`);
                  })
                }
              >
                Add {chosen.length} projects
              </button>
            </footer>
          </Dialog>
        )}
        {pending && (
          <Dialog
            title={
              pending.action === "resume"
                ? `Resume ${pending.project.name}`
                : `Open ${pending.project.name}`
            }
            onClose={() => {
              if (!busy) setPending(null);
            }}
          >
            <p className="muted">Working directory</p>
            <code className="command-preview">{pending.project.path}</code>
            <ul className="action-plan">
              {(pending.action === "open" ||
                (pending.action === "resume" &&
                  pending.project.resume.ide)) && (
                <li>
                  Open{" "}
                  {workspace.ides.find(
                    (i) => i.id === pending.project.preferredIde,
                  )?.name ?? "preferred IDE (not configured)"}
                </li>
              )}
              {(pending.action === "terminal" ||
                (pending.action === "resume" &&
                  pending.project.resume.terminal)) && (
                <li>Open {workspace.settings.shell}</li>
              )}
              {pending.command && (
                <li>
                  Run in {workspace.settings.shell}
                  <code className="command-preview">
                    {pending.command.command}
                  </code>
                </li>
              )}
              {(pending.action === "url" ||
                (pending.action === "resume" &&
                  pending.project.resume.url)) && (
                <li>
                  Open{" "}
                  {pending.project.devUrl || "development URL (not configured)"}
                </li>
              )}
            </ul>
            {pending.command && (
              <p className="muted small">
                This executes the project's command with your account
                permissions. Activity records the launch; the external terminal
                reports its result.
              </p>
            )}
            <footer>
              <button disabled={!!busy} onClick={() => setPending(null)}>
                Cancel
              </button>
              <button className="primary" disabled={!!busy} onClick={execute}>
                <Play size={14} />
                {busy ? "Launching…" : "Launch"}
              </button>
            </footer>
          </Dialog>
        )}
        {custom && active && (
          <Dialog
            title="Add a project command"
            onClose={() => setCustom(false)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void perform("Saving command", async () => {
                  await api.command(active.path, {
                    id: "",
                    name: String(f.get("name")),
                    command: String(f.get("command")),
                    source: "Custom",
                  });
                  setCustom(false);
                  await reloadDetail(active.path);
                });
              }}
            >
              <label>
                Name
                <input name="name" required placeholder="Development server" />
              </label>
              <label>
                Command
                <input
                  name="command"
                  required
                  className="mono"
                  placeholder="npm run dev"
                />
              </label>
              <p className="muted small">
                Runs in {active.path}. Saving does not execute it.
              </p>
              <footer>
                <button type="button" onClick={() => setCustom(false)}>
                  Cancel
                </button>
                <button className="primary" disabled={!!busy}>
                  Save command
                </button>
              </footer>
            </form>
          </Dialog>
        )}
        {newIde && (
          <Dialog
            title="Add development application"
            onClose={() => setNewIde(null)}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void perform("Saving IDE", async () => {
                  await api.saveIde(newIde);
                  setNewIde(null);
                });
              }}
            >
              <label>
                Name
                <input
                  required
                  value={newIde.name}
                  onChange={(e) =>
                    setNewIde({ ...newIde, name: e.target.value })
                  }
                />
              </label>
              <p className="mono path">{newIde.path}</p>
              <footer>
                <button className="primary" disabled={!!busy}>
                  Add application
                </button>
              </footer>
            </form>
          </Dialog>
        )}
        {forget && (
          <Dialog
            title="Remove project from workspace?"
            onClose={() => setForget(null)}
          >
            <p>
              {forget.name} will be removed from this app. Its files on disk
              will stay untouched. Saved project notes, commands, and Resume
              preferences will be removed.
            </p>
            <footer>
              <button onClick={() => setForget(null)}>Keep project</button>
              <button
                className="danger"
                disabled={!!busy}
                onClick={() =>
                  void perform("Removing project", async () => {
                    await api.forget(forget.path);
                    setForget(null);
                    setSelected(null);
                  })
                }
              >
                Remove project
              </button>
            </footer>
          </Dialog>
        )}
        {clearHistory && (
          <Dialog
            title="Clear local activity history?"
            closing={clearHistoryClosing}
            onClose={closeClearHistory}
          >
            <p>
              This removes recorded activity and all work-time statistics. Your
              projects and Resume settings are kept.
            </p>
            <footer>
              <button onClick={closeClearHistory}>Cancel</button>
              <button
                disabled={!!busy}
                onClick={() =>
                  void perform("Clearing history", async () => {
                    await api.clearActivity();
                    closeClearHistory();
                  })
                }
              >
                Clear history
              </button>
            </footer>
          </Dialog>
        )}
      </div>
    </DialogFeedback.Provider>
  );
}
