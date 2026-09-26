import type { ReactNode } from "react";
import type { Project } from "../types";
import type { WorkspaceController } from "../useWorkspace";

export function CommandsView({
  model,
  projectRows,
  empty,
}: {
  model: WorkspaceController;
  projectRows: (projects: Project[]) => ReactNode;
  empty: (title: string, text: string) => ReactNode;
}) {
  const { workspace, projects } = model;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Commands</h1>
          <p>Choose a project to inspect its scripts and saved commands.</p>
        </div>
      </div>
      {workspace.projects.length
        ? projectRows(projects)
        : empty(
            "Commands belong to projects",
            "Add a project to discover its scripts and save the commands you use.",
          )}
    </>
  );
}
