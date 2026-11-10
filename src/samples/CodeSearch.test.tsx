import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import CodeSearch from "./CodeSearch";
import { FILES, SCENARIOS } from "./codesearch/scenarios";

const spec = { kind: "codesearch", caption: "c" } as const;
const tick = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const hits = (container: HTMLElement) =>
  container.querySelectorAll('[data-hit="true"]').length;

describe("CodeSearch", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test("every scenario points at three real chunks", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.hits).toHaveLength(3);
      for (const hit of scenario.hits) expect(FILES[hit.file]).toBeDefined();
    }
  });

  test("opens on an answered question", () => {
    const { container } = render(<CodeSearch spec={spec} onError={vi.fn()} />);
    expect(hits(container)).toBe(3);
    expect(screen.getByText(/Passwords are checked in api\/auth\.py/)).toBeInTheDocument();
    expect(screen.getByText("0.91")).toBeInTheDocument();
    expect(screen.getByText(/Illustrative codebase/)).toBeInTheDocument();
  });

  test("a question searches, lights up chunks, then answers", async () => {
    const { container } = render(<CodeSearch spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "How are failed payments retried?" }));
    expect(hits(container)).toBe(0);
    expect(screen.getByText("Searching the vector store…")).toBeInTheDocument();
    await tick(600);
    expect(hits(container)).toBe(1);
    await tick(2000);
    expect(hits(container)).toBe(3);
    expect(screen.getByText(/utils\/retry\.py\. Payments/)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Patch loop" })).not.toBeInTheDocument();
  });

  test("a change that passes validation is kept", async () => {
    render(<CodeSearch spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Add a timeout to the HTTP client" }));
    await tick(1700);
    expect(screen.getByText(/Patching http\/client\.py/)).toBeInTheDocument();
    await tick(900);
    expect(screen.getByText("Running the checks on the patch.")).toBeInTheDocument();
    await tick(900);
    expect(screen.getByText("Checks pass. The patch is kept.")).toBeInTheDocument();
    expect(screen.getByText("Kept")).toHaveClass("text-accent");
  });

  test("a change that fails validation is rolled back", async () => {
    render(<CodeSearch spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Rename the users table" }));
    await tick(5000);
    expect(screen.getByText(/The patch is rolled back/)).toBeInTheDocument();
    expect(screen.getByText("Rolled back")).not.toHaveClass("text-accent");
  });

  test("picking another prompt drops the run in progress", async () => {
    render(<CodeSearch spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Rename the users table" }));
    await tick(700);
    fireEvent.click(screen.getByRole("button", { name: "Where do we check a password?" }));
    await tick(5000);
    expect(screen.getByText(/Passwords are checked/)).toBeInTheDocument();
    expect(screen.queryByText(/rolled back/i)).not.toBeInTheDocument();
  });

  test("unmounting mid-run clears the timers", async () => {
    const { unmount } = render(<CodeSearch spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Rename the users table" }));
    await tick(100);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
