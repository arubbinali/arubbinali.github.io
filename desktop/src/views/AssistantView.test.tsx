import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("metal-fx", () => ({
  MetalFx: ({ children }: { children: ReactNode }) => (
    <span data-metal-fx="">{children}</span>
  ),
}));

vi.mock("voice-glow", () => ({
  VoiceBeam: ({ children }: { children: ReactNode }) => (
    <div data-voice-beam="">{children}</div>
  ),
  useMicrophone: () => ({
    stream: null,
    state: "idle",
    error: null,
    supported: true,
    start: vi.fn(),
    stop: vi.fn(),
  }),
}));

vi.mock("../api", () => ({
  native: false,
  api: {},
}));

import { AssistantView } from "./AssistantView";

describe("assistant presentation", () => {
  it("preserves the original hero, uses the metal send and voice beam, and has no idle feature cards", () => {
    const html = renderToStaticMarkup(<AssistantView onActivity={() => {}} />);

    expect(html).toContain('data-metal-fx=""');
    expect(html).toContain('data-voice-beam=""');
    expect(html).toContain("Say it.");
    expect(html).toContain("It gets done.");
    expect(html).not.toContain("Natural requests");
    expect(html).not.toContain("Local awareness");
    expect(html).not.toContain("You stay in control");
  });
});
