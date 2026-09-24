import React from "react";
import { render, screen } from "@testing-library/react";
import MetalWordmark from "./MetalWordmark";

test("renders the accessible logo as plain white text without the metal shader", () => {
  const { container } = render(<MetalWordmark />);

  expect(screen.getByRole("img", { name: "doaor" })).toBeInTheDocument();
  expect(container.querySelector(".metal-wordmark")).toHaveClass("is-plain");
  expect(container.querySelector(".metal-wordmark-plain")).toHaveStyle({ color: "rgb(255, 255, 255)" });
  expect(container.querySelector(".metal-fx-root")).toBeNull();
});
