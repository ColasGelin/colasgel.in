import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ProfileBlock } from "./ProfileBlock";

test("shows every skill group", () => {
  render(<ProfileBlock />);
  for (const group of [
    "LLM systems",
    "Machine learning",
    "Infrastructure",
    "Data and backend",
    "Languages",
    "Frontend",
  ]) {
    expect(screen.getByText(group)).toBeInTheDocument();
  }
});

test("shows spoken languages with levels", () => {
  render(<ProfileBlock />);
  expect(screen.getByText(/Spanish \(C1\)/)).toBeInTheDocument();
});

test("shows the certification", () => {
  render(<ProfileBlock />);
  expect(screen.getByText("Certifications")).toBeInTheDocument();
  expect(screen.getByText(/Claude Academy, Anthropic/)).toBeInTheDocument();
  expect(screen.getByText(/Claude Code in action/)).toBeInTheDocument();
});
