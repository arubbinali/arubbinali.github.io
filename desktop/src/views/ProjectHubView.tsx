import {
  ArrowLeft,
  ArrowRight,
  BookmarkPlus,
  Check,
  GitBranch,
  Pencil,
  Pin,
  Play,
  Plus,
  RefreshCw,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import { when } from "../projects";
import type { WorkspaceController } from "../useWorkspace";

export function ProjectHubView({ model }: { model: WorkspaceController }) {
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [capsuleName, setCapsuleName] = useState("");
  const [capsuleGoal, setCapsuleGoal] = useState("");
  const [workflowName, setWorkflowName] = useState("");
  const {
    workspace,
    setSelected,
    detail,
    detailLoading,
    tab,
    setTab,
    busy,
    setCustom,
    setForget,
    reloadDetail,
    go,
    active,
    saveProject,
    requestAction,
  } = model;
  const liveSession = active
    ? workspace.workSessions.find(
        (session) =>
          session.projectPath === active.path && session.endedAt == null,
      )
    : null;
  useEffect(() => {
    if (!active) return;
    setDraftName(active.name);
    setRenaming(false);
    setCapsuleName("");
    setCapsuleGoal("");
    setWorkflowName("");
  }, [active?.path]);
  const saveName = () => {
    const name = draftName.trim();
    if (!active || !name) return;
    setRenaming(false);
    if (name !== active.name) void saveProject({ ...active, name });
  };
  return (
    <>
      <button className="text-button back" onClick={() => setSelected(null)}>
        <ArrowLeft size={15} />
        All projects
      </button>
      {detailLoading && !detail ? (
        <p role="status">Reading project information…</p>
      ) : active && detail ? (
        <>
          <div className="page-heading">
            <div>
              <p className="eyebrow">{active.kind}</p>
              {renaming ? (
                <form
                  className="project-title-editor"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveName();
                  }}
                >
                  <input
                    autoFocus
                    aria-label="Project display name"
                    value={draftName}
                    maxLength={80}
                    onChange={(event) => setDraftName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setDraftName(active.name);
                        setRenaming(false);
                      }
                    }}
                  />
                  <button
                    className="icon-button"
                    aria-label="Save project name"
                    disabled={!draftName.trim() || !!busy}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label="Cancel renaming"
                    onClick={() => {
                      setDraftName(active.name);
                      setRenaming(false);
                    }}
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <div className="project-title-row">
                  <h1>{active.name}</h1>
                  <button
                    className="icon-button rename-project"
                    aria-label="Rename project display name"
                    title="Rename in doaorel (the folder stays unchanged)"
                    onClick={() => setRenaming(true)}
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}
              <p className="mono path">{active.path}</p>
            </div>
            <button
              className="icon-button"
              aria-label={active.pinned ? "Unpin project" : "Pin project"}
              onClick={() =>
                void saveProject({ ...active, pinned: !active.pinned })
              }
            >
              <Pin size={18} fill={active.pinned ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="project-actions">
            <button
              className="primary"
              disabled={!!busy || !active.preferredIde}
              onClick={() => void requestAction(active, "open")}
            >
              <ArrowUpIcon />
              Open in IDE
            </button>
            <button
              disabled={!!busy}
              onClick={() => void requestAction(active, "resume")}
            >
              <Play size={15} />
              Resume
            </button>
            <button
              disabled={!!busy}
              onClick={() => void requestAction(active, "terminal")}
            >
              <Terminal size={15} />
              Terminal
            </button>
            <button
              className="icon-button"
              aria-label="Refresh project information"
              disabled={!!busy}
              onClick={() => void reloadDetail(active.path)}
            >
              <RefreshCw size={15} />
            </button>
            <span className="muted">{active.languages.join(" · ")}</span>
          </div>
          {liveSession && (
            <div className="project-live-session" role="status">
              <span className="live-pulse" />
              <span>
                Tracking <strong>{liveSession.appName}</strong>
              </span>
              <LiveElapsed startedAt={liveSession.startedAt} />
            </div>
          )}
          <div className="tabs" role="tablist" aria-label="Project sections">
            {[
              "Overview",
              "Memory",
              "Health",
              "Git",
              "Commands",
              "Notes",
              "Resume",
            ].map((t) => (
              <button
                role="tab"
                aria-selected={tab === t}
                key={t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {detail.warnings.map((w) => (
            <p className="warning" key={w}>
              {w}
            </p>
          ))}
          <div className="tab-panel" key={tab}>
            {tab === "Overview" && (
              <div className="overview-grid">
                <section>
                  <h2>Project details</h2>
                  <dl className="facts">
                    <dt>Preferred IDE</dt>
                    <dd>
                      <select
                        aria-label="Preferred IDE"
                        value={active.preferredIde ?? ""}
                        onChange={(e) =>
                          void saveProject({
                            ...active,
                            preferredIde: e.target.value || null,
                          })
                        }
                      >
                        <option value="">Choose an IDE</option>
                        {workspace.ides
                          .filter((i) => !i.hidden)
                          .map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.name}
                            </option>
                          ))}
                      </select>
                      {!workspace.ides.length && (
                        <button
                          className="text-button"
                          onClick={() => go("Tools")}
                        >
                          Detect or add IDEs
                        </button>
                      )}
                    </dd>
                    <dt>Branch</dt>
                    <dd>{detail.git.branch || "No Git branch"}</dd>
                    <dt>Local changes</dt>
                    <dd>
                      {detail.git.repository
                        ? `${detail.git.changes.length} files`
                        : "Not a Git repository"}
                    </dd>
                    <dt>Last opened here</dt>
                    <dd>{when(active.lastOpened)}</dd>
                    <dt>Last command launched</dt>
                    <dd>
                      <code>{active.lastCommand || "None recorded"}</code>
                    </dd>
                  </dl>
                  <button
                    className="text-button danger"
                    onClick={() => setForget(active)}
                  >
                    Remove from workspace
                  </button>
                </section>
                <section>
                  <h2>Recently modified files</h2>
                  <p className="muted small">
                    Filesystem timestamps, not editor activity.
                  </p>
                  <div className="file-list">
                    {detail.recentFiles.map((f) => (
                      <div key={f.path}>
                        <code>{f.path}</code>
                        <small>{when(f.modified)}</small>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
            {tab === "Git" && (
              <section className="section">
                <h2>
                  <GitBranch size={18} />
                  {detail.git.branch || "Git overview"}
                </h2>
                {detail.git.error && (
                  <p className="warning">{detail.git.error}</p>
                )}
                {detail.git.repository ? (
                  <>
                    <p className="muted">
                      {detail.git.ahead} ahead · {detail.git.behind} behind{" "}
                      <span className="small">
                        (last known local refs; no automatic fetch)
                      </span>
                    </p>
                    <p>{detail.git.latest || "No commits yet"}</p>
                    <p className="mono path muted">{detail.git.remote}</p>
                    <div className="file-list">
                      {detail.git.changes.map((c, i) => (
                        <div key={`${c.path}-${i}`}>
                          <code className="git-status">{c.status}</code>
                          <code>{c.path}</code>
                        </div>
                      ))}
                      {!detail.git.changes.length && !detail.git.error && (
                        <p className="muted">
                          <Check size={15} />
                          Working tree is clean.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="muted">
                    {detail.git.available
                      ? "This project is not a Git repository."
                      : "Install Git and restart the app to inspect repositories."}
                  </p>
                )}
              </section>
            )}
            {tab === "Memory" && (
              <div className="memory-layout">
                <section className="section context-capture">
                  <p className="eyebrow">CONTEXT CAPSULE</p>
                  <h2>Save where you are—not just what is open.</h2>
                  <p className="muted">
                    Captures the branch, latest commit, changed-file count, last
                    command, development URL, and your current notes.
                  </p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void model.perform("Saving context", async () => {
                        await api.saveCapsule(
                          active.path,
                          capsuleName,
                          capsuleGoal,
                        );
                        setCapsuleName("");
                        setCapsuleGoal("");
                        await reloadDetail(active.path);
                      });
                    }}
                  >
                    <label>
                      Checkpoint name
                      <input
                        required
                        maxLength={80}
                        value={capsuleName}
                        placeholder="Authentication flow working"
                        onChange={(event) => setCapsuleName(event.target.value)}
                      />
                    </label>
                    <label>
                      Next objective
                      <input
                        maxLength={160}
                        value={capsuleGoal}
                        placeholder="Connect the refresh-token endpoint"
                        onChange={(event) => setCapsuleGoal(event.target.value)}
                      />
                    </label>
                    <button className="primary" disabled={!!busy}>
                      <BookmarkPlus size={15} />
                      Save context
                    </button>
                  </form>
                </section>
                <section className="section">
                  <h2>Saved contexts</h2>
                  <div className="capsule-list">
                    {detail.capsules.map((capsule) => (
                      <article key={capsule.id}>
                        <div>
                          <strong>{capsule.name}</strong>
                          <small>{when(capsule.createdAt)}</small>
                        </div>
                        {capsule.goal && <p>{capsule.goal}</p>}
                        <dl>
                          <dt>Branch</dt>
                          <dd>{capsule.branch || "No Git branch"}</dd>
                          <dt>Working tree</dt>
                          <dd>{capsule.changedFiles} changed files</dd>
                          <dt>Latest commit</dt>
                          <dd>{capsule.latestCommit || "No commits"}</dd>
                        </dl>
                        <footer>
                          <button
                            onClick={() => void requestAction(active, "resume")}
                          >
                            <Play size={14} /> Resume from here
                          </button>
                          <button
                            className="icon-button danger"
                            aria-label={`Delete ${capsule.name}`}
                            onClick={() =>
                              void model.perform(
                                "Deleting context",
                                async () => {
                                  await api.deleteCapsule(capsule.id);
                                  await reloadDetail(active.path);
                                },
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </footer>
                      </article>
                    ))}
                    {!detail.capsules.length && (
                      <p className="muted">No saved contexts yet.</p>
                    )}
                  </div>
                </section>
                <section className="section session-history">
                  <h2>Recent work sessions</h2>
                  {workspace.workSessions
                    .filter((session) => session.projectPath === active.path)
                    .slice(0, 8)
                    .map((session) => (
                      <div key={session.id}>
                        <span>
                          <strong>{session.goal || session.appName}</strong>
                          <small>{when(session.startedAt)}</small>
                        </span>
                        <time>
                          {formatSessionDuration(
                            (session.endedAt ?? Math.floor(Date.now() / 1000)) -
                              session.startedAt,
                          )}
                        </time>
                      </div>
                    ))}
                </section>
              </div>
            )}
            {tab === "Health" && (
              <section className="section project-health">
                <div className="health-summary">
                  <HealthFact
                    label="README"
                    value={detail.health.readme ? "Present" : "Missing"}
                    good={detail.health.readme}
                  />
                  <HealthFact
                    label="License"
                    value={detail.health.license ? "Present" : "Missing"}
                    good={detail.health.license}
                  />
                  <HealthFact
                    label="TODOs"
                    value={String(detail.health.todoCount)}
                    good={detail.health.todoCount === 0}
                  />
                  <HealthFact
                    label="FIXMEs"
                    value={String(detail.health.fixmeCount)}
                    good={detail.health.fixmeCount === 0}
                  />
                  <HealthFact
                    label="Local changes"
                    value={String(detail.health.changedFiles)}
                    good={detail.health.changedFiles === 0}
                  />
                  <HealthFact
                    label="30-day commits"
                    value={String(detail.health.commitCount30d)}
                  />
                </div>
                <div className="health-columns">
                  <div>
                    <h2>Recent commits</h2>
                    <div className="commit-timeline">
                      {detail.health.recentCommits.map((commit) => (
                        <div key={`${commit.hash}-${commit.at}`}>
                          <code>{commit.hash}</code>
                          <span>{commit.subject}</span>
                          <small>{when(commit.at)}</small>
                        </div>
                      ))}
                      {!detail.health.recentCommits.length && (
                        <p className="muted">No local Git history.</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2>Repository context</h2>
                    <p className="muted small">
                      {detail.health.branches.length} local branches ·{" "}
                      {detail.health.dependencies.length} declared dependencies
                    </p>
                    <div className="tag-list">
                      {detail.health.branches.map((branch) => (
                        <span key={branch}>{branch}</span>
                      ))}
                    </div>
                    {!!detail.health.relatedProjects.length && (
                      <>
                        <h3>Connected workspace projects</h3>
                        {detail.health.relatedProjects.map((path) => (
                          <code className="related-project" key={path}>
                            {path}
                          </code>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </section>
            )}
            {tab === "Commands" && (
              <section className="section">
                <div className="section-heading">
                  <h2>Project commands</h2>
                  <button onClick={() => setCustom(true)}>
                    <Plus size={15} />
                    Add command
                  </button>
                </div>
                <p className="muted">
                  Commands open in {workspace.settings.shell} at this project's
                  directory. Review scripts from unfamiliar projects before
                  running them.
                </p>
                <div className="command-list">
                  {detail.commands.map((c) => (
                    <div key={c.id}>
                      <span>
                        <strong>{c.name}</strong>
                        <small>{c.source}</small>
                      </span>
                      <code>{c.command}</code>
                      <button
                        aria-label={`Run ${c.name}`}
                        disabled={!!busy}
                        onClick={() => void requestAction(active, "run", c)}
                      >
                        <Play size={14} />
                        Run
                      </button>
                    </div>
                  ))}
                  {!detail.commands.length && (
                    <p className="muted padded">
                      No commands detected. Add your project's run, build, or
                      test command.
                    </p>
                  )}
                </div>
              </section>
            )}
            {tab === "Notes" && (
              <form
                className="section"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  void saveProject({
                    ...active,
                    notes: String(form.get("notes")),
                  });
                }}
              >
                <h2>Notes for next time</h2>
                <p className="muted">
                  A reminder, a decision, or the next thing to work on. Stored
                  only in this workspace.
                </p>
                <textarea
                  name="notes"
                  aria-label="Project notes"
                  rows={12}
                  defaultValue={active.notes}
                  placeholder="Where did you leave off?"
                />
                <button className="primary" disabled={!!busy}>
                  Save notes
                </button>
              </form>
            )}
            {tab === "Resume" && (
              <div className="workflow-layout">
                <section className="section saved-workflows">
                  <h2>Saved workflows</h2>
                  <p className="muted">
                    Keep named launch setups for focused work, testing, or a
                    full development environment.
                  </p>
                  <div>
                    {detail.workflows.map((workflow) => {
                      const command = detail.commands.find(
                        (item) => item.id === workflow.plan.commandId,
                      );
                      return (
                        <article key={workflow.id}>
                          <span>
                            <strong>{workflow.name}</strong>
                            <small>
                              {[
                                workflow.plan.ide && "IDE",
                                workflow.plan.terminal && "Terminal",
                                command?.name,
                                workflow.plan.url && "URL",
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </small>
                          </span>
                          <button
                            onClick={() =>
                              void model.perform(
                                "Running workflow",
                                async () => {
                                  const result = await api.runWorkflow(
                                    active.path,
                                    workflow.id,
                                    command?.command,
                                  );
                                  model.setNotice(result.completed.join(" · "));
                                  if (result.errors.length)
                                    model.setError(result.errors.join("\n"));
                                },
                              )
                            }
                          >
                            <Play size={14} /> Run
                          </button>
                          <button
                            className="icon-button danger"
                            aria-label={`Delete ${workflow.name}`}
                            onClick={() =>
                              void model.perform(
                                "Deleting workflow",
                                async () => {
                                  await api.deleteWorkflow(
                                    active.path,
                                    workflow.id,
                                  );
                                  await reloadDetail(active.path);
                                },
                              )
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </article>
                      );
                    })}
                  </div>
                  <form
                    className="workflow-create"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void model.perform("Saving workflow", async () => {
                        await api.saveWorkflow({
                          id: "",
                          projectPath: active.path,
                          name: workflowName,
                          plan: active.resume,
                        });
                        setWorkflowName("");
                        await reloadDetail(active.path);
                      });
                    }}
                  >
                    <input
                      required
                      maxLength={60}
                      placeholder="Name the current Resume setup"
                      value={workflowName}
                      onChange={(event) => setWorkflowName(event.target.value)}
                    />
                    <button disabled={!!busy}>Save workflow</button>
                  </form>
                </section>
                <form
                  key={active.path}
                  className="section resume-settings"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    void saveProject({
                      ...active,
                      devUrl: String(f.get("url") ?? "").trim(),
                      resume: {
                        ide: f.has("ide"),
                        terminal: f.has("terminal"),
                        url: f.has("openUrl"),
                        commandId: String(f.get("command") ?? "") || null,
                      },
                    });
                  }}
                >
                  <h2>Make returning easier.</h2>
                  <p className="muted">
                    Choose what Resume does for this project. You'll review the
                    plan before it runs.
                  </p>
                  <label className="check-row">
                    <input
                      name="ide"
                      type="checkbox"
                      defaultChecked={active.resume.ide}
                    />
                    Open the preferred IDE
                  </label>
                  <label className="check-row">
                    <input
                      name="terminal"
                      type="checkbox"
                      defaultChecked={active.resume.terminal}
                    />
                    Open a terminal (shared with the command when one is
                    selected)
                  </label>
                  <label>
                    Run a command
                    <select
                      name="command"
                      defaultValue={active.resume.commandId ?? ""}
                    >
                      <option value="">Don't run a command</option>
                      {detail.commands.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.command}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Development URL
                    <input
                      name="url"
                      type="url"
                      placeholder="http://localhost:5173"
                      defaultValue={active.devUrl}
                    />
                  </label>
                  <label className="check-row">
                    <input
                      name="openUrl"
                      type="checkbox"
                      defaultChecked={active.resume.url}
                    />
                    Open the development URL
                  </label>
                  <p className="muted small">
                    URLs open immediately; this version does not wait for a
                    server to become ready.
                  </p>
                  <button className="primary" disabled={!!busy}>
                    Save Resume plan
                  </button>
                </form>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="muted">
          Project unavailable. Check its path, then select it again.
        </p>
      )}
    </>
  );
}
function ArrowUpIcon() {
  return <ArrowRight size={15} style={{ transform: "rotate(-45deg)" }} />;
}

function LiveElapsed({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const timer = window.setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const seconds = Math.max(0, now - startedAt);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return (
    <time>
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
      {String(remainder).padStart(2, "0")}
    </time>
  );
}

function formatSessionDuration(seconds: number) {
  const hours = Math.floor(Math.max(0, seconds) / 3600);
  const minutes = Math.floor((Math.max(0, seconds) % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function HealthFact({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <article data-good={good == null ? "neutral" : String(good)}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
