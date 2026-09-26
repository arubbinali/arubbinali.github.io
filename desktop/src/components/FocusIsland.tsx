import { Check, Clock3, Square, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import type { WorkspaceController } from "../useWorkspace";

function elapsed(total: number) {
  const seconds = Math.max(0, total);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function FocusIsland({ model }: { model: WorkspaceController }) {
  const { workspace, perform, select } = model;
  const active = workspace.workSessions.find(
    (session) => session.endedAt == null,
  );
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [editing, setEditing] = useState(false);
  const [goal, setGoal] = useState(active?.goal ?? "");
  useEffect(() => {
    setGoal(active?.goal ?? "");
    setEditing(false);
  }, [active?.id, active?.goal]);
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [active?.id]);
  if (!active) return null;
  const project = workspace.projects.find(
    (item) => item.path === active.projectPath,
  );
  const saveGoal = () =>
    void perform("Saving session goal", async () => {
      await api.setSessionGoal(active.id, goal);
      setEditing(false);
    });
  return (
    <aside className="focus-island" aria-label="Active work session">
      <span className="focus-orb" aria-label="Active session" />
      <button
        className="focus-project"
        disabled={!project}
        onClick={() => project && select(project)}
      >
        <small>WORKING NOW · {active.appName}</small>
        <strong>{project?.name ?? "General work"}</strong>
      </button>
      {editing ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveGoal();
          }}
        >
          <Target size={14} />
          <input
            autoFocus
            aria-label="Session goal"
            maxLength={160}
            placeholder="What are you working toward?"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
          />
          <button className="icon-button" aria-label="Save session goal">
            <Check size={14} />
          </button>
        </form>
      ) : (
        <button className="focus-goal" onClick={() => setEditing(true)}>
          <Target size={14} />
          <span>{active.goal || "Set a goal for this session"}</span>
        </button>
      )}
      <time>
        <Clock3 size={14} />
        {elapsed(now - active.startedAt)}
      </time>
      <button
        className="icon-button focus-stop"
        aria-label="Finish work session"
        title="Finish session"
        onClick={() =>
          void perform("Finishing session", () => api.finishSession(active.id))
        }
      >
        <Square size={13} fill="currentColor" />
      </button>
    </aside>
  );
}
