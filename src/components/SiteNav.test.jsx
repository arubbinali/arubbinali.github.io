import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import SiteNav from "./SiteNav";
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn() }));

const openNav = () => fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
const sectionBody = (header) => header.parentElement.querySelector(".site-nav-section-body");

test("opens the current site's section and adds the other on hover without closing it", () => {
  jest.useFakeTimers();
  render(<SiteNav site="main" />);
  openNav();

  const mainHeader = screen.getByRole("button", { name: "The main site" });
  const portfolioHeader = screen.getByRole("button", { name: "Portfolio" });
  expect(mainHeader).toHaveAttribute("aria-expanded", "true");
  expect(portfolioHeader).toHaveAttribute("aria-expanded", "false");

  // Hovering must leave the section above alone, otherwise it would slide up
  // out from under the pointer and the panel would flicker.
  fireEvent.mouseEnter(portfolioHeader.parentElement);
  expect(portfolioHeader).toHaveAttribute("aria-expanded", "true");
  expect(mainHeader).toHaveAttribute("aria-expanded", "true");

  fireEvent.mouseLeave(portfolioHeader.parentElement);
  act(() => jest.advanceTimersByTime(300));
  expect(portfolioHeader).toHaveAttribute("aria-expanded", "false");
  expect(mainHeader).toHaveAttribute("aria-expanded", "true");
  jest.useRealTimers();
});

test("starts with the portfolio section expanded on the works site", () => {
  render(<SiteNav site="works" currentKey="home" />);
  openNav();

  expect(screen.getByRole("button", { name: "Portfolio" })).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("button", { name: "The main site" })).toHaveAttribute("aria-expanded", "false");
});

test("a real click opens a section and never closes the one hover just opened", () => {
  jest.useFakeTimers();
  render(<SiteNav site="main" />);
  openNav();

  const mainHeader = screen.getByRole("button", { name: "The main site" });
  const portfolioSection = screen.getByRole("button", { name: "Portfolio" }).parentElement;

  // A pointer click arrives after mouseenter: the section must stay open.
  fireEvent.mouseEnter(portfolioSection);
  fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));
  expect(screen.getByRole("button", { name: "Portfolio" })).toHaveAttribute("aria-expanded", "true");
  expect(sectionBody(mainHeader)).toHaveAttribute("aria-hidden", "false");

  // Moving the pointer away is what closes it again.
  fireEvent.mouseLeave(portfolioSection);
  act(() => jest.advanceTimersByTime(300));
  expect(screen.getByRole("button", { name: "Portfolio" })).toHaveAttribute("aria-expanded", "false");
  expect(mainHeader).toHaveAttribute("aria-expanded", "true");
  jest.useRealTimers();
});
