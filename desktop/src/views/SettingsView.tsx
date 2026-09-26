import { Download, Folder, Plus, X } from "lucide-react";
import { api, chooseBackupPath, native } from "../api";
import { ExperienceSettings } from "../components/Experience";
import { GlideSelect } from "../components/InteractiveControls";
import type { WorkspaceController } from "../useWorkspace";
export function SettingsView({ model }: { model: WorkspaceController }) {
  const {
    workspace,
    setWorkspace,
    busy,
    saveSettings,
    addRoot,
    scanProjects,
    perform,
    setNotice,
  } = model;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p>A workspace that works the way you do.</p>
        </div>
      </div>
      <section className="settings-section">
        <h2>Project discovery</h2>
        <p className="muted">
          Scan only folders you choose. Generated folders and linked directories
          are skipped. Scans reach 7 levels deep; nested packages can appear
          separately.
        </p>
        <div className="folder-list">
          {workspace.settings.roots.map((root) => (
            <div key={root}>
              <Folder size={16} />
              <code>{root}</code>
              <button
                aria-label={`Remove scan folder ${root}`}
                onClick={() =>
                  void saveSettings({
                    ...workspace.settings,
                    roots: workspace.settings.roots.filter((r) => r !== root),
                  })
                }
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="button-group">
          <button disabled={!native || !!busy} onClick={() => addRoot()}>
            <Plus size={14} />
            Add scan folder
          </button>
          <button
            disabled={!native || !!busy || !workspace.settings.roots.length}
            onClick={scanProjects}
          >
            Scan & review
          </button>
        </div>
        <h3>Excluded folders</h3>
        {workspace.settings.exclusions.map((root) => (
          <div className="folder-row" key={root}>
            <code>{root}</code>
            <button
              aria-label={`Remove exclusion ${root}`}
              onClick={() =>
                void saveSettings({
                  ...workspace.settings,
                  exclusions: workspace.settings.exclusions.filter(
                    (r) => r !== root,
                  ),
                })
              }
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <button disabled={!native || !!busy} onClick={() => addRoot(true)}>
          Exclude a folder
        </button>
      </section>
      <section className="settings-section">
        <h2>Interface & motion</h2>
        <ExperienceSettings />
        <div className="setting-row">
          <span>Interface scale</span>
          <GlideSelect
            ariaLabel="Interface scale"
            value={String(workspace.settings.scale)}
            options={[125, 135, 150, 175, 200].map((scale) => ({ value: String(scale), label: `${scale}%` }))}
            onChange={(value) => {
              const next = {
                ...workspace.settings,
                scale: Number(value),
              };
              if (native) void saveSettings(next);
              else setWorkspace((w) => ({ ...w, settings: next }));
            }}
            menuWidth={180}
            showTags={false}
          />
        </div>
        <label className="setting-row">
          Reduce animation
          <input
            type="checkbox"
            checked={workspace.settings.reduceMotion}
            onChange={(e) =>
              void saveSettings({
                ...workspace.settings,
                reduceMotion: e.target.checked,
              })
            }
          />
        </label>
      </section>
      <section className="settings-section">
        <h2>Terminal</h2>
        <div className="setting-row">
          <span>External shell</span>
          <GlideSelect
            ariaLabel="External shell"
            value={workspace.settings.shell}
            options={[{ value: "powershell", label: "Windows PowerShell" }, { value: "pwsh", label: "PowerShell 7", tag: "Requires installation" }, { value: "cmd", label: "Command Prompt" }]}
            onChange={(value) =>
              void saveSettings({
                ...workspace.settings,
                shell: value,
              })
            }
            menuWidth={260}
          />
        </div>
        <p className="muted small">
          Command output stays in your terminal. Output inside doaorel is not
          captured.
        </p>
      </section>
      <section className="settings-section">
        <h2>Privacy & storage</h2>
        <label className="setting-row">
          Record activity, recent launches, and work time
          <input
            type="checkbox"
            checked={workspace.settings.recordActivity}
            onChange={(e) =>
              void saveSettings({
                ...workspace.settings,
                recordActivity: e.target.checked,
              })
            }
          />
        </label>
        <p className="muted">
          No account, telemetry, source uploads, or background network requests.
          IDEs and commands you launch have their own behavior.
        </p>
        <label>
          Workspace database
          <code className="storage-path">
            {workspace.databasePath || "Available in the desktop app"}
          </code>
        </label>
        <button
          disabled={!native || !!busy}
          onClick={() =>
            void perform("Exporting workspace", async () => {
              const destination = await chooseBackupPath();
              if (!destination) return;
              await api.exportWorkspace(destination);
              setNotice("Workspace backup exported");
            })
          }
        >
          <Download size={15} />
          Export portable backup
        </button>
      </section>
    </>
  );
}
