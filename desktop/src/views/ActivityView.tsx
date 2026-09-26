import { when } from "../projects";
import type { WorkspaceController } from "../useWorkspace";

import { native } from "../api";

export function ActivityView({ model }: { model: WorkspaceController }) {
  const { workspace, busy, setClearHistory } = model;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Activity</h1>
          <p>Actions performed through your workspace. Stored locally.</p>
        </div>
        <button
          disabled={!native || !workspace.activity.length || !!busy}
          onClick={() => setClearHistory(true)}
        >
          Clear history
        </button>
      </div>
      {!workspace.settings.recordActivity && (
        <p className="warning">
          Activity recording is disabled. Existing history remains until
          cleared.
        </p>
      )}
      {workspace.activity.length ? (
        <div className="activity-list">
          {workspace.activity.map((a) => (
            <div key={a.id}>
              <span className="activity-dot" />
              <span>
                <strong>{a.action}</strong>
                <small>{a.detail}</small>
              </span>
              <time title={new Date(a.at * 1000).toLocaleString()}>
                {when(a.at)}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted padded">
          Your project opens and command launches will appear here.
        </p>
      )}
    </>
  );
}
