import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Queue from "./Queue";

const spec = { kind: "queue", caption: "c" } as const;
const tick = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const till = (number: number) => screen.getAllByRole("listitem")[number - 1];

describe("Queue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Every tick brings a customer, so the queue outgrows one till.
    vi.spyOn(Math, "random").mockReturnValue(0);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(Math.random).mockRestore();
  });

  test("starts with one open till and nothing to approve", () => {
    render(<Queue spec={spec} onError={vi.fn()} />);
    expect(within(till(1)).getByText("open")).toBeInTheDocument();
    expect(within(till(2)).getByText("closed")).toBeInTheDocument();
    expect(screen.getByText("Nothing to change.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  test("the agent suggests, and only an approval opens the till", async () => {
    render(<Queue spec={spec} onError={vi.fn()} />);
    await tick(3000);
    expect(screen.getByText(/^Open till 2\. Average queue is/)).toBeInTheDocument();
    await tick(5000);
    expect(within(till(2)).getByText("closed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(within(till(2)).getByText("open")).toBeInTheDocument();
    expect(screen.getByText("Nothing to change.")).toBeInTheDocument();
  });

  test("a rejected suggestion changes nothing", async () => {
    render(<Queue spec={spec} onError={vi.fn()} />);
    await tick(3000);
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(within(till(2)).getByText("closed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeDisabled();
    await tick(4000);
    expect(screen.getByText("Nothing to change.")).toBeInTheDocument();
  });

  test("the camera count matches the queue", async () => {
    render(<Queue spec={spec} onError={vi.fn()} />);
    expect(within(till(1)).getByText("4 seen")).toBeInTheDocument();
  });

  test("unmounting clears the timer", async () => {
    const { unmount } = render(<Queue spec={spec} onError={vi.fn()} />);
    await tick(0);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("reduced motion starts paused", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<Queue spec={spec} onError={vi.fn()} />);
    await tick(0);
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });
});
