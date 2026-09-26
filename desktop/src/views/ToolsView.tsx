import { Monitor, Plus, RefreshCw } from "lucide-react";
import { api, chooseExecutable, native } from "../api";
import type { WorkspaceController } from "../useWorkspace";
import { useState } from "react";
import { builtInTools } from "../tools/registry";

export function ToolsView({ model }: { model: WorkspaceController }) {
  const [section, setSection] = useState("utilities");
  const { workspace, busy, setNotice, tools, setTools, setNewIde, perform } =
    model;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Tools</h1>
          <p>Small utilities. Your applications. All in one place.</p>
        </div>
        {section === "applications" && <div className="button-group">
          <button
            disabled={!native || !!busy}
            onClick={() =>
              void perform("Detecting IDEs", async () => {
                await api.detectIdes();
                setNotice(
                  "Detection complete. Add a custom location if an IDE is missing.",
                );
              })
            }
          >
            <RefreshCw size={15} />
            Detect IDEs
          </button>
          <button
            disabled={!native || !!busy}
            onClick={() =>
              void perform("Choosing application", async () => {
                const path = await chooseExecutable();
                if (path)
                  setNewIde({
                    id: path.toLowerCase(),
                    path,
                    name:
                      path
                        .split(/[\\/]/)
                        .pop()
                        ?.replace(/\.exe$/i, "") ?? "IDE",
                    hidden: false,
                    pinned: true,
                  });
              })
            }
          >
            <Plus size={15} />
            Add application
          </button>
        </div>}
      </div>
      <nav className="section-tabs" aria-label="Tool categories"><button aria-pressed={section === "utilities"} onClick={() => setSection("utilities")}>Utilities</button><button aria-pressed={section === "applications"} onClick={() => setSection("applications")}>Applications & runtimes</button></nav>
      {section === "utilities" && builtInTools.map(({ id, Component }) => <Component key={id}/>)}
      {section === "applications" && <><section className="section">
        <h2>Tracked applications</h2>
        {!workspace.ides.length && (
          <p className="muted padded">
            No applications configured. Detect common development tools or add
            any Windows application you want included in your work statistics.
          </p>
        )}
        {workspace.ides.map((i) => (
          <div className="ide-row" key={i.id}>
            <Monitor size={21} />
            <span>
              <strong>{i.name}</strong>
              <small className="mono">{i.path}</small>
            </span>
            <button
              disabled={!!busy}
              onClick={() =>
                void perform("Opening application", () => api.launchIde(i.id))
              }
            >
              Open
            </button>
            <label className="app-rule">
              Track toward
              <select
                aria-label={`Project tracked by ${i.name}`}
                value={
                  workspace.appRules.find((rule) => rule.appId === i.id)
                    ?.projectPath ?? ""
                }
                onChange={(event) =>
                  void perform("Saving application rule", () =>
                    api.saveAppRule(i.id, event.target.value),
                  )
                }
              >
                <option value="">General work</option>
                {workspace.projects.map((project) => (
                  <option key={project.path} value={project.path}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={i.pinned}
                onChange={(e) =>
                  void perform("Saving IDE", () =>
                    api.saveIde({ ...i, pinned: e.target.checked }),
                  )
                }
              />
              Pin
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={i.hidden}
                onChange={(e) =>
                  void perform("Saving IDE", () =>
                    api.saveIde({ ...i, hidden: e.target.checked }),
                  )
                }
              />
              Hide
            </label>
          </div>
        ))}
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>Runtimes & tools</h2>
          <button
            disabled={!native || !!busy}
            onClick={() =>
              void perform("Checking tools", async () =>
                setTools(await api.tools()),
              )
            }
          >
            Check installed tools
          </button>
        </div>
        <p className="muted small">
          Read-only version probes use this app's PATH. Restart after installing
          tools.
        </p>
        {tools.map(([name, version]) => (
          <div className="tool-row" key={name}>
            <span>{name}</span>
            <code>{version}</code>
          </div>
        ))}
      </section>
      </>}
    </>
  );
}
