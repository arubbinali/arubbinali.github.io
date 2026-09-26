import { describe, expect, it } from "vitest";
import { planAssistantRequest, stripWakePhrase } from "./assistant";
import type { AssistantCatalog } from "./types";

const catalog: AssistantCatalog = {
  apps: [
    { id: "discord", name: "Discord", category: "Communication" },
    { id: "chrome", name: "Google Chrome", category: "Browser" },
    { id: "word", name: "Microsoft Word", category: "Writing" },
  ],
  profiles: [
    {
      browserId: "chrome",
      directory: "Profile 2",
      name: "Work",
      account: "me@company.test",
    },
  ],
  bookmarks: [
    {
      title: "University Moodle",
      url: "https://moodle.example.test",
      browserId: "chrome",
      profileDirectory: "Profile 2",
    },
  ],
};

describe("assistant planner", () => {
  it("removes supported wake phrases", () => {
    expect(stripWakePhrase("What's up, doaorel, open Discord")).toBe(
      "open Discord",
    );
  });
  it("plans installed applications without inventing execution", () => {
    const plan = planAssistantRequest("open Discord for me", catalog);
    expect(plan.actions[0]).toMatchObject({
      kind: "launchApp",
      appId: "discord",
    });
  });
  it("uses a named browser profile for Gmail", () => {
    const plan = planAssistantRequest("open Gmail on my work account", catalog);
    expect(plan.actions[0]).toMatchObject({
      kind: "openInProfile",
      profileDirectory: "Profile 2",
    });
  });
  it("finds saved bookmarks", () => {
    const plan = planAssistantRequest(
      "look through bookmarks and open Moodle",
      catalog,
    );
    expect(plan.actions[0]?.url).toBe("https://moodle.example.test");
  });
  it("opens Discord in the browser when explicitly requested", () => {
    const plan = planAssistantRequest(
      "open Discord in my browser instead",
      catalog,
    );
    expect(plan.actions[0]).toMatchObject({
      kind: "openUrl",
      url: "https://discord.com/app",
    });
  });
  it("does not invent an unavailable application", () => {
    const plan = planAssistantRequest("open Spotify", catalog);
    expect(plan.actions).toHaveLength(0);
    expect(plan.notes[0]).toContain("couldn’t safely map");
  });
  it("keeps unsupported writing automation honest", () => {
    const plan = planAssistantRequest("write my essay in Word", catalog);
    expect(plan.actions).toHaveLength(1);
    expect(plan.notes[0]).toContain("screen-control and writing layer");
  });
});
