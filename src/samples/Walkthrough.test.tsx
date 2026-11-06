import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { SampleSpec } from "@/content/types";
import Walkthrough from "./Walkthrough";
import { STEPS } from "./wisdomRun";

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
const current = () =>
  screen.getByRole("button", { current: "step" }).textContent;
const renderIt = () => render(<Walkthrough spec={spec} onError={vi.fn()} />);

describe("wisdom run", () => {
  test("retries once, then heals and opens a pull request", () => {
    expect(STEPS.map((step) => step.name)).toEqual([
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
    expect(STEPS.at(-1)?.target).toBe("healed");
  });

  test("only thinking steps use the LLM", () => {
    for (const step of STEPS) {
      expect(Boolean(step.llm), step.name).toBe(
        ["Diagnose", "Patch", "Try 2"].includes(step.name),
      );
    }
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

  test("waits for one start button", () => {
    renderIt();
    expect(screen.queryByTestId("target")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Start workflow",
    ]);
  });

  test("starting types the crash into the terminal", async () => {
    renderIt();
    await click("Start workflow");
    expect(current()).toContain("Crash");
    await tick(6000);
    expect(screen.getByText(/ModuleNotFoundError/)).toBeInTheDocument();
  });

  test("plays through to the pull request", async () => {
    renderIt();
    await click("Start workflow");
    for (let i = 0; i < 80; i++) await tick(2000);
    expect(current()).toContain("PR");
    expect(screen.getByTestId("target")).toHaveTextContent("healed");
  });

  test("clicking a step jumps there and shows the earlier output", async () => {
    renderIt();
    await click("Start workflow");
    await click(/Patch/);
    expect(current()).toContain("Patch");
    expect(screen.getByText(/ModuleNotFoundError/)).toBeInTheDocument();
    expect(screen.getByText("Local LLM")).toBeInTheDocument();
    await click(/Commit/);
    expect(screen.getByText("Plain code")).toBeInTheDocument();
  });

  test("clicking the current step keeps it playing", async () => {
    renderIt();
    await click("Start workflow");
    await tick(6000);
    await click(/Crash/);
    expect(screen.getByText(/ModuleNotFoundError/)).toBeInTheDocument();
  });

  test("a failed verification crosses out its last check", async () => {
    renderIt();
    await click("Start workflow");
    await act(async () => {
      within(screen.getByRole("list", { name: "Steps" }))
        .getAllByRole("button", { name: /Verify/ })[0]
        .click();
    });
    await tick(7000);
    expect(screen.getByLabelText("Failed")).toBeInTheDocument();
  });

  test("only real checks get boxes", async () => {
    renderIt();
    await click("Start workflow");
    await click(/Commit/);
    await tick(6000);
    expect(screen.getByText("Original commit saved")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Passed|Pending/)).not.toBeInTheDocument();
    await click(/Detect/);
    expect(screen.getAllByLabelText("Pending")).toHaveLength(4);
  });

  test("announces the step for screen readers", async () => {
    renderIt();
    await click("Start workflow");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Step 1 of 9: Crash. A bug is planted",
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
    await click("Start workflow");
    expect(screen.getByText(/ModuleNotFoundError/)).toBeInTheDocument();
    await tick(60000);
    expect(current()).toContain("Crash");
    await click(/Detect/);
    expect(screen.getByText(/crash event raised/)).toBeInTheDocument();
  });
});
