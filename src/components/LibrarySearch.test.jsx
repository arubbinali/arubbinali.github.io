import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import LibrarySearch, { libraryResults } from "./LibrarySearch";

test("library search finds writeups without leaking portfolio pages", () => {
  const results = libraryResults("creator");
  expect(results.some((result) => result.path === "/light/creator")).toBe(true);
  expect(results.every((result) => !result.path.startsWith("/works"))).toBe(true);
  expect(libraryResults("About", [], "/about").some((result) => result.path === "/about")).toBe(false);
});
test("Enter without a query does not navigate; typing and selecting sends the highlight", () => {
  const navigate = jest.fn();
  render(<LibrarySearch sections={[]} currentPath="/" onNavigate={navigate}/>);
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  fireEvent.keyDown(input, {key:"Enter"});
  expect(navigate).not.toHaveBeenCalled();
  fireEvent.change(input, {target:{value:"creator"}});
  fireEvent.keyDown(input, {key:"Enter"});
  expect(navigate).toHaveBeenCalledWith(expect.stringContaining("/light/"), expect.objectContaining({highlight:"creator"}));
});
