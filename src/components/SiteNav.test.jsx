import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import SiteNav from "./SiteNav";
jest.mock("react-router-dom", () => ({useNavigate: () => jest.fn()}));

test("sections expand on hover, stay open into links, and close smoothly after leaving", () => {
  jest.useFakeTimers();
  render(<SiteNav/>);
  fireEvent.click(screen.getByRole("button", {name:"Open navigation"}));
  const header = screen.getByRole("button", {name:"The main site"});
  expect(header).toHaveAttribute("aria-expanded", "false");
  fireEvent.mouseEnter(header.parentElement);
  expect(header).toHaveAttribute("aria-expanded", "true");
  fireEvent.click(header);
  expect(header).toHaveAttribute("aria-expanded", "true");
  fireEvent.mouseLeave(header.parentElement);
  act(() => jest.advanceTimersByTime(100));
  expect(header).toHaveAttribute("aria-expanded", "true");
  act(() => jest.advanceTimersByTime(100));
  expect(header).toHaveAttribute("aria-expanded", "false");
  jest.useRealTimers();
});
