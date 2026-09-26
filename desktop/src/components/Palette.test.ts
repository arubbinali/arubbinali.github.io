import { describe, expect, it } from "vitest";
import { searchActions, type PaletteAction } from "./Palette";
const actions: PaletteAction[] = [
  {id:"a",title:"Open Settings",detail:"Interface and privacy", category:"Navigation", run:()=>{}},
  {id:"b",title:"Studio",detail:"C:/Projects/studio", category:"Project", run:()=>{}},
  {id:"c",title:"Run test",detail:"Studio · npm test", category:"Command", run:()=>{}},
];
describe("global search", () => {
  it("keeps empty queries quiet", () => { expect(searchActions(actions,"")).toEqual([]); expect(searchActions(actions,"  ")).toEqual([]); });
  it("matches context, category, and multiple words", () => { expect(searchActions(actions,"studio command").map(a=>a.id)).toEqual(["c"]); expect(searchActions(actions,"PRIVACY")[0].id).toBe("a"); });
  it("does not invent matches", () => expect(searchActions(actions,"missing")).toEqual([]));
});
