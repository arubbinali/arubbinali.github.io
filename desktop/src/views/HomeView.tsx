import { ArrowRight, Monitor, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { api, native } from "../api";
import { Welcome } from "../components/Experience";
import { visibleProjects, when } from "../projects";
import type { Project } from "../types";
import type { WorkspaceController } from "../useWorkspace";

export function HomeView({
  model,
  projectRows,
  empty,
}: {
  model: WorkspaceController;
  projectRows: (projects: Project[]) => ReactNode;
  empty: (title: string, text: string) => ReactNode;
}) {
  const { workspace, busy, perform, go, recent, addFolder, requestAction } =
    model;
  const activeSession = workspace.workSessions.find(
    (session) => session.endedAt == null,
  );
  const latestCapsule = workspace.capsules[0];
  if (!workspace.projects.length)
    return (
      <Welcome
        addFolder={addFolder}
        disabled={!native || !!busy}
        settings={() => go("Settings")}
      />
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>
            {activeSession
              ? "Keep your momentum."
              : "Pick up where you left off."}
          </h1>
          <p>
            {activeSession
              ? `${activeSession.appName} is being tracked right now.`
              : "Your projects, tools, and the context to keep going."}
          </p>
        </div>
        <button disabled={!native || !!busy} onClick={addFolder}>
          <Plus size={16} />
          Add project
        </button>
      </div>
      {recent[0] && (
        <div className="resume-beam">
          <section className="resume-panel">
            <div className="resume-top">
              <span className="eyebrow">
                {activeSession ? "ACTIVE SESSION" : "RESUME"}
              </span>
              <span className="muted">{when(recent[0].lastOpened)}</span>
            </div>
            <h2>{recent[0].name}</h2>
            <p className="mono muted">{recent[0].path}</p>
            {latestCapsule?.projectPath === recent[0].path &&
              latestCapsule.goal && (
                <p className="resume-objective">Next: {latestCapsule.goal}</p>
              )}
            <div className="resume-bottom">
              <span>
                {recent[0].lastCommand ? (
                  <>
                    Last launched <code>{recent[0].lastCommand}</code>
                  </>
                ) : (
                  "Your project preferences and notes are saved here."
                )}
              </span>
              <button
                className="primary"
                onClick={() => void requestAction(recent[0], "resume")}
                disabled={!!busy}
              >
                Resume project
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        </div>
      )}
      <section className="section">
        <div className="section-heading">
          <h2>{recent.length ? "Recent projects" : "Your projects"}</h2>
          <button className="text-button" onClick={() => go("Projects")}>
            View all
            <ArrowRight size={14} />
          </button>
        </div>
        {workspace.projects.length
          ? projectRows(
              visibleProjects(workspace.projects, "", "recent").slice(0, 6),
            )
          : empty(
              "Bring your projects together",
              "Add a project directly, or choose a parent folder to discover repositories and development projects. Your files stay where they are.",
            )}
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>Your tools</h2>
          <button className="text-button" onClick={() => go("Tools")}>
            Manage tools
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="ide-strip">
          {workspace.ides
            .filter((i) => !i.hidden && i.pinned)
            .map((i) => (
              <button
                key={i.id}
                disabled={!!busy}
                onClick={() =>
                  void perform("Opening application", () => api.launchIde(i.id))
                }
              >
                <Monitor size={20} />
                <span>
                  {i.name}
                  <small>Available for your projects</small>
                </span>
              </button>
            ))}
          {!workspace.ides.some((i) => !i.hidden && i.pinned) && (
            <p className="muted">
              Detect your IDEs in Tools, or add an application manually.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
