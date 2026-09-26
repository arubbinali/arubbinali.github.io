import { describe, expect, it } from "vitest";
import { visibleProjects } from "./projects";
import type { Project } from "./types";
const project = (
  name: string,
  lastOpened: number | null,
  pinned = false,
): Project => ({
  name,
  path: `C:\\Projects\\${name}`,
  lastOpened,
  pinned,
  kind: "Node.js",
  languages: ["TypeScript"],
  preferredIde: null,
  notes: "",
  devUrl: "",
  lastCommand: null,
  resume: { ide: false, terminal: false, commandId: null, url: false },
});
describe("project selection", () => {
  it("keeps pins first, then recently opened projects, then unopened projects", () => {
    const list = [
      project("new", null),
      project("old", 5),
      project("recent", 10),
      project("pin", 1, true),
    ];
    expect(visibleProjects(list, "", "recent").map((p) => p.name)).toEqual([
      "pin",
      "recent",
      "old",
      "new",
    ]);
    expect(list[0].name).toBe("new");
  });
  it("finds languages and paths case-insensitively", () => {
    const list = [project("Site", 1)];
    expect(visibleProjects(list, " typescript ", "name")).toHaveLength(1);
    expect(visibleProjects(list, "c:\\projects\\site", "name")).toHaveLength(1);
    expect(visibleProjects(list, "rust", "name")).toHaveLength(0);
  });
});
