import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { SampleSpec } from "@/content/types";
import Walkthrough from "./Walkthrough";
import { SCENARIOS } from "./wisdomRun";

const spec: Extract<SampleSpec, { kind: "walkthrough" }> = {
  kind: "walkthrough",
  caption: "c",
};

const tick = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const click = (name: string | RegExp) =>
  act(async () => {
    screen.getByRole("button", { name }).click();
  });
const stepNames = () =>
  within(screen.getByRole("list", { name: "Steps" }))
    .getAllByRole("button")
    .map((button) => button.textContent?.replace(/Uses the local LLM/, ""));
const current = () =>
  screen.getByRole("button", { current: "step" }).textContent;
const renderIt = () => render(<Walkthrough spec={spec} onError={vi.fn()} />);

describe("wisdom scenarios", () => {
  const scenario = (id: string) => SCENARIOS.find((s) => s.id === id)!;
  const names = (id: string) => scenario(id).steps.map((step) => step.name);

  test("each bug has its own path", () => {
    expect(names("import")).toEqual([
      "Crash",
      "Detect",
      "Diagnose",
      "Patch",
      "Commit",
      "Verify",
      "Try 2",
      "Verify",
      "PR",
    ]);
    expect(names("env")).toEqual([
      "Crash",
      "Detect",
      "Diagnose",
      "Patch",
      "Commit",
      "Verify",
      "Try 2",
      "Try 3",
      "Rollback",
    ]);
    expect(names("syntax")).toEqual([
      "Crash",
      "Detect",
      "Diagnose",
      "Patch",
      "Commit",
      "Verify",
      "PR",
    ]);
  });

  test("only thinking steps use the LLM", () => {
    for (const { steps } of SCENARIOS) {
      for (const step of steps) {
        expect(Boolean(step.llm), step.name).toBe(
          ["Diagnose", "Patch", "Try 2", "Try 3"].includes(step.name),
        );
      }
    }
  });

  test("the rollback leaves the service crashed for a human", () => {
    expect(scenario("env").steps.at(-1)?.target).toBe("crashed");
    expect(scenario("import").steps.at(-1)?.target).toBe("healed");
    expect(scenario("syntax").steps.at(-1)?.target).toBe("healed");
  });
});

describe("Walkthrough", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  test("waits for a bug and has no extra controls", () => {
    renderIt();
    expect(screen.getByText(/Pick a bug to start/)).toBeInTheDocument();
    expect(screen.getByText(/target running/)).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "missing import",
      "bad env var",
      "syntax error",
    ]);
  });

  test("picking a bug types the crash into the terminal", async () => {
    renderIt();
    await click("syntax error");
    expect(current()).toContain("Crash");
    await tick(6000);
    expect(screen.getByText(/SyntaxError: expected ':'/)).toBeInTheDocument();
  });

  test.each([
    ["missing import", "PR", "healed"],
    ["bad env var", "Rollback", "crashed"],
    ["syntax error", "PR", "healed"],
  ])("%s plays through to %s", async (bug, last, target) => {
    renderIt();
    await click(bug);
    for (let i = 0; i < 80; i++) await tick(2000);
    expect(current()).toContain(last);
    expect(screen.getByTestId("target")).toHaveTextContent(target);
  });

  test("clicking a step jumps there and shows the earlier output", async () => {
    renderIt();
    await click("syntax error");
    await click(/Patch/);
    expect(current()).toContain("Patch");
    expect(screen.getByText(/SyntaxError/)).toBeInTheDocument();
    expect(screen.getByText("Local LLM")).toBeInTheDocument();
    await click(/Commit/);
    expect(screen.getByText("Plain code")).toBeInTheDocument();
  });

  test("a new bug replaces the steps", async () => {
    renderIt();
    await click("syntax error");
    expect(stepNames()).toHaveLength(7);
    await click("bad env var");
    expect(stepNames()).toHaveLength(9);
    expect(stepNames().at(-1)).toContain("Rollback");
  });

  test("a failed verification crosses out its last check", async () => {
    renderIt();
    await click("bad env var");
    await click(/Verify/);
    await tick(7000);
    expect(screen.getByLabelText("Failed")).toBeInTheDocument();
  });

  test("announces the step for screen readers", async () => {
    renderIt();
    await click("syntax error");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Step 1 of 7: Crash. A bug is planted",
    );
  });

  test("reduced motion shows each step whole and does not advance", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    renderIt();
    await click("syntax error");
    expect(screen.getByText(/SyntaxError/)).toBeInTheDocument();
    await tick(60000);
    expect(current()).toContain("Crash");
    await click(/Detect/);
    expect(screen.getByText(/crash event raised/)).toBeInTheDocument();
  });
});
