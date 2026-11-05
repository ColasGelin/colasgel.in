import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Snake from "./Snake";
import { createGame } from "./snake/engine";

vi.mock("./snake/engine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./snake/engine")>();
  return { ...actual, createGame: vi.fn(actual.createGame) };
});

const spec = { kind: "snake", caption: "c" } as const;
const weights = {
  layers: [
    {
      weight: Array.from({ length: 4 }, () => Array(24).fill(0)),
      bias: [0, 0, 1, 0],
    },
  ],
};
const tick = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

describe("Snake", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(createGame).mockClear();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => weights })),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockRestore();
  });

  test("loads the most trained checkpoint first", async () => {
    render(<Snake spec={spec} onError={vi.fn()} />);
    await tick(0);
    expect(fetch).toHaveBeenCalledWith("/samples/snake/sess-50000.json");
  });

  test("unmounting clears the timer", async () => {
    const { unmount } = render(<Snake spec={spec} onError={vi.fn()} />);
    await tick(0);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  test("changing the slider loads that checkpoint", async () => {
    render(<Snake spec={spec} onError={vi.fn()} />);
    await tick(0);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "0" } });
    await tick(0);
    expect(fetch).toHaveBeenCalledWith("/samples/snake/sess-1.json");
    expect(screen.getByText("1 session")).toBeInTheDocument();
  });

  test("pausing and resuming keeps the current game", async () => {
    render(<Snake spec={spec} onError={vi.fn()} />);
    await tick(0);
    expect(createGame).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    await tick(0);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    await tick(0);
    expect(createGame).toHaveBeenCalledTimes(1);
  });

  test("a finished game restarts by itself", async () => {
    render(<Snake spec={spec} onError={vi.fn()} />);
    await tick(0);
    await tick(10000);
    expect(vi.mocked(createGame).mock.calls.length).toBeGreaterThan(1);
  });

  test("a failed weights fetch reports an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500 })),
    );
    const onError = vi.fn();
    render(<Snake spec={spec} onError={onError} />);
    await tick(0);
    expect(onError).toHaveBeenCalled();
  });

  test("reduced motion starts paused", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<Snake spec={spec} onError={vi.fn()} />);
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
