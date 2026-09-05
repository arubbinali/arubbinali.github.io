import React, { StrictMode, useContext } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import AnimatedDetails, { DetailsRevealed } from "./AnimatedDetails";

let animations;
beforeEach(() => {
  animations = [];
  Element.prototype.animate = jest.fn(() => {
    const animation = { cancel: jest.fn(), onfinish: null };
    animations.push(animation);
    return animation;
  });
});
afterEach(() => { delete Element.prototype.animate; });

function LazyCode() {
  return useContext(DetailsRevealed) ? <p>Code loaded</p> : null;
}

test("starts closed in StrictMode; content is ready before measuring first expansion", () => {
  render(<StrictMode><AnimatedDetails summary="Source"><LazyCode/></AnimatedDetails></StrictMode>);
  const summary = screen.getByText("Source");
  expect(summary.closest("details")).not.toHaveAttribute("open");
  expect(animations).toHaveLength(0);
  fireEvent.click(summary);
  expect(screen.getByText("Code loaded")).toBeInTheDocument();
  expect(summary).toHaveAttribute("aria-expanded", "true");
  expect(animations).toHaveLength(1);
  act(() => animations[0].onfinish());
  expect(summary.closest("details")).toHaveAttribute("open");
});

test("collapse keeps content mounted until the animation completes", () => {
  render(<AnimatedDetails summary="Video">Content</AnimatedDetails>);
  const summary = screen.getByText("Video");
  fireEvent.click(summary);
  act(() => animations[0].onfinish());
  fireEvent.click(summary);
  expect(summary.closest("details")).toHaveAttribute("open");
  expect(summary.nextElementSibling).toHaveAttribute("inert");
  act(() => animations[1].onfinish());
  expect(summary.closest("details")).not.toHaveAttribute("open");
});

test("rapid toggles cancel older animation completions", () => {
  render(<AnimatedDetails summary="Details">Content</AnimatedDetails>);
  const summary = screen.getByText("Details");
  fireEvent.click(summary);
  fireEvent.click(summary);
  fireEvent.click(summary);
  expect(animations[0].cancel).toHaveBeenCalled();
  expect(animations[1].cancel).toHaveBeenCalled();
  act(() => { animations[1].onfinish(); animations[2].onfinish(); });
  expect(summary.closest("details")).toHaveAttribute("open");
  expect(summary.closest("details").style.height).toBe("");
});
