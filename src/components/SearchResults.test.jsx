import React from "react";
import { act, render, screen } from "@testing-library/react";
import SearchResults from "./SearchResults";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test("dismissal retains results for the exit animation, but makes them inert", () => {
  const { rerender } = render(<SearchResults open><button>Docs</button></SearchResults>);
  rerender(<SearchResults open={false}><p>No matches</p></SearchResults>);
  const panel = screen.getByText("Docs").parentElement;
  expect(panel).toHaveClass("is-closing");
  expect(panel).toHaveAttribute("inert");
  expect(panel).toHaveAttribute("aria-hidden", "true");
  act(() => jest.advanceTimersByTime(200));
  expect(screen.queryByText("Docs")).not.toBeInTheDocument();
});

test("reopening during dismissal cancels unmount and shows fresh results", () => {
  const { rerender } = render(<SearchResults open><button>Docs</button></SearchResults>);
  rerender(<SearchResults open={false}>Hidden</SearchResults>);
  act(() => jest.advanceTimersByTime(100));
  rerender(<SearchResults open><button>Projects</button></SearchResults>);
  act(() => jest.advanceTimersByTime(200));
  expect(screen.getByRole("button", { name: "Projects" }).parentElement).not.toHaveAttribute("inert");
});

test("an initially closed search does not render a dropdown", () => {
  render(<SearchResults open={false}><button>Docs</button></SearchResults>);
  expect(screen.queryByText("Docs")).not.toBeInTheDocument();
});
