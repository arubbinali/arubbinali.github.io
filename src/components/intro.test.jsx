import React from "react";
import { render } from "@testing-library/react";
import IntroAnimation from "./intro";

jest.mock("./ThemeParticleRain", () => ({ ThemeParticleRain: () => <div /> }));

test("renders the original staggered white wordmark", () => {
  const { container } = render(<IntroAnimation onFinish={() => {}} />);

  const letters = [...container.querySelectorAll(".intro-text > span")];
  expect(letters.map((letter) => letter.textContent).join("")).toBe("doaor");
  expect(letters).toHaveLength(5);
  expect(container.querySelector(".intro-text")).toHaveAttribute("aria-label", "doaor");
});
