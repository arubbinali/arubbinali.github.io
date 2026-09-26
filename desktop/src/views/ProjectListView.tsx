import {
  Check,
  ChevronDown,
  List,
  Network,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { native } from "../api";
import type { Project } from "../types";
import type { WorkspaceController } from "../useWorkspace";

export function ProjectListView({
  model,
  projectRows,
  empty,
}: {
  model: WorkspaceController;
  projectRows: (projects: Project[]) => ReactNode;
  empty: (title: string, text: string) => ReactNode;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const [layout, setLayout] = useState<"list" | "map">("list");
  const sortMenu = useRef<HTMLDivElement>(null);
  const {
    workspace,
    query,
    setQuery,
    sort,
    setSort,
    busy,
    projects,
    addFolder,
    scanProjects,
    select,
  } = model;
  useEffect(() => {
    if (!sortOpen) return;
    const close = (event: PointerEvent) => {
      if (!sortMenu.current?.contains(event.target as Node)) setSortOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSortOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", escape);
    };
  }, [sortOpen]);
  const chooseSort = (next: string) => {
    setSort(next);
    setSortOpen(false);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Projects</h1>
          <p>Independent of the tools you use to build them.</p>
        </div>
        <div className="button-group">
          <button
            disabled={!native || !!busy || !workspace.settings.roots.length}
            onClick={scanProjects}
          >
            <RefreshCw size={15} />
            Discover
          </button>
          <button
            className="primary"
            disabled={!native || !!busy}
            onClick={addFolder}
          >
            <Plus size={16} />
            Add project
          </button>
        </div>
      </div>
      <div className="list-toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search projects"
            placeholder="Search by name, language, or path…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="layout-switch" aria-label="Project layout">
          <button
            className={layout === "list" ? "active" : ""}
            aria-label="List layout"
            onClick={() => setLayout("list")}
          >
            <List size={15} />
          </button>
          <button
            className={layout === "map" ? "active" : ""}
            aria-label="Relationship map"
            onClick={() => setLayout("map")}
          >
            <Network size={15} />
          </button>
        </div>
        <div className="sort-menu" ref={sortMenu}>
          <button
            className="sort-trigger"
            aria-label="Sort projects"
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            onClick={() => setSortOpen((open) => !open)}
          >
            {sort === "recent" ? "Recently opened" : "Name"}
            <ChevronDown size={15} />
          </button>
          <div
            className={`sort-options ${sortOpen ? "open" : ""}`}
            role="listbox"
            aria-hidden={!sortOpen}
          >
            {(
              [
                ["recent", "Recently opened"],
                ["name", "Name"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                role="option"
                aria-selected={sort === value}
                onClick={() => chooseSort(value)}
              >
                {label}
                {sort === value && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>
      {projects.length && layout === "map" ? (
        <ProjectMap projects={projects} open={select} />
      ) : projects.length ? (
        projectRows(projects)
      ) : query ? (
        <p className="muted padded">No projects match “{query}”.</p>
      ) : (
        empty(
          "All your work, one place",
          "Discovery scans only the folders you choose. Review the results before adding anything.",
        )
      )}
    </>
  );
}

function ProjectMap({
  projects,
  open,
}: {
  projects: Project[];
  open: (project: Project) => void;
}) {
  const shown = projects.slice(0, 18);
  const center = { x: 450, y: 235 };
  const nodes = shown.map((project, index) => {
    const angle =
      (index / Math.max(1, shown.length)) * Math.PI * 2 - Math.PI / 2;
    const ring = shown.length < 7 ? 145 : 185 + (index % 2) * 35;
    return {
      project,
      x: center.x + Math.cos(angle) * ring,
      y: center.y + Math.sin(angle) * ring,
    };
  });
  const links = nodes.flatMap((source, index) =>
    nodes
      .slice(index + 1)
      .flatMap((target) =>
        source.project.languages.some((language) =>
          target.project.languages.includes(language),
        )
          ? [{ source, target }]
          : [],
      ),
  );
  return (
    <section className="project-map">
      <div className="map-key">
        <strong>Workspace relationships</strong>
        <span>Lines connect projects sharing a primary language.</span>
      </div>
      <svg
        viewBox="0 0 900 470"
        role="img"
        aria-label="Project relationship map"
      >
        {links.map((link) => (
          <line
            key={`${link.source.project.path}-${link.target.project.path}`}
            x1={link.source.x}
            y1={link.source.y}
            x2={link.target.x}
            y2={link.target.y}
          />
        ))}
        {nodes.map((node) => (
          <g
            key={node.project.path}
            role="button"
            tabIndex={0}
            aria-label={`Open ${node.project.name}`}
            transform={`translate(${node.x} ${node.y})`}
            onClick={() => open(node.project)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ")
                open(node.project);
            }}
          >
            <circle r="38" />
            <text y="4">{node.project.name.slice(0, 16)}</text>
            <text className="map-language" y="55">
              {node.project.languages.slice(0, 2).join(" · ") ||
                node.project.kind}
            </text>
          </g>
        ))}
      </svg>
      {projects.length > shown.length && (
        <p className="muted small">
          Showing the first {shown.length} filtered projects.
        </p>
      )}
    </section>
  );
}
