import type { Project } from "./types";
export function visibleProjects(
  projects: Project[],
  query: string,
  sort: string,
) {
  const term = query.trim().toLowerCase();
  return projects
    .filter((p) =>
      `${p.name} ${p.path} ${p.languages.join(" ")} ${p.kind}`
        .toLowerCase()
        .includes(term),
    )
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return Number(b.pinned) - Number(a.pinned);
      if (sort === "name") return a.name.localeCompare(b.name);
      return (
        (b.lastOpened ?? 0) - (a.lastOpened ?? 0) ||
        a.name.localeCompare(b.name)
      );
    });
}
export function when(time: number | null) {
  if (!time) return "Not opened here yet";
  const age = Math.max(0, Date.now() / 1000 - time);
  if (age < 60) return "Just now";
  if (age < 3600) return `${Math.floor(age / 60)} min ago`;
  if (age < 86400) return `${Math.floor(age / 3600)} hr ago`;
  if (age < 604800) return `${Math.floor(age / 86400)} days ago`;
  return new Date(time * 1000).toLocaleDateString();
}
