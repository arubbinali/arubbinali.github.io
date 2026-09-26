import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Feedback, Welcome } from "./Experience";

describe("stable workspace presentation", () => {
  const props = {
    busy: "",
    error: "",
    notice: "",
    visited: 0,
    dismiss: () => {},
    cancel: () => {},
  };
  it("keeps instant operations hidden until the delay has elapsed", () => {
    const html = renderToStaticMarkup(
      <Feedback {...props} busy="Saving settings" />,
    );
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain("Saving settings");
  });
  it("shows errors immediately and prioritizes them over progress", () => {
    const html = renderToStaticMarkup(
      <Feedback {...props} busy="Saving settings" error="Could not save" />,
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain("Could not save");
  });
  it("renders success feedback with a dismiss control", () => {
    const html = renderToStaticMarkup(
      <Feedback {...props} notice="Settings saved" />,
    );
    expect(html).toContain("Settings saved");
    expect(html).toContain("Dismiss message");
  });
  it("labels the onboarding as an inert example and offers one primary import", () => {
    const html = renderToStaticMarkup(
      <Welcome
        addFolder={() => {
          throw new Error("Must not launch during preview");
        }}
        disabled={false}
        settings={() => {}}
      />,
    );
    expect(html).toContain(
      "Demo only. No files, commands, or history are created.",
    );
    expect(html).toContain("Choose my first project");
    expect(html).toContain("INTERACTIVE EXAMPLE");
  });
});
