import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Eeg from "./Eeg";

const spec = { kind: "eeg", caption: "c" } as const;
const tick = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

describe("Eeg", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockRestore();
  });

  test("does not predict before the noise is removed", async () => {
    render(<Eeg spec={spec} onError={vi.fn()} />);
    await tick(500);
    expect(screen.getByText("Remove noise first")).toBeInTheDocument();
    expect(screen.queryByText(/% sure/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/noise not removed yet/)).toHaveLength(2);
  });

  test("removing the noise comes before the fist choice", () => {
    render(<Eeg spec={spec} onError={vi.fn()} />);
    const names = screen.getAllByRole("button").map((button) => button.textContent);
    expect(names.slice(0, 3)).toEqual(["Remove noise", "Left fist", "Right fist"]);
  });

  test("removing the noise predicts the imagined fist", async () => {
    render(<Eeg spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove noise" }));
    await tick(500);
    expect(screen.getByText("Left fist", { selector: "[aria-live]" })).toBeInTheDocument();
    expect(screen.getByText(/% sure/)).toBeInTheDocument();
    expect(screen.queryByText(/noise not removed yet/)).not.toBeInTheDocument();
    expect(screen.getByText("PCA + LDA")).toBeInTheDocument();
    expect(screen.getByText("C3 power")).toBeInTheDocument();
    expect(screen.queryByText(/CSP/)).not.toBeInTheDocument();
  });

  test("the prediction follows the imagined fist", async () => {
    render(<Eeg spec={spec} onError={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove noise" }));
    fireEvent.click(screen.getByRole("button", { name: "Right fist" }));
    await tick(6000);
    expect(screen.getByText("Right fist", { selector: "[aria-live]" })).toBeInTheDocument();
  });

  test("unmounting clears the timer", async () => {
    const { unmount } = render(<Eeg spec={spec} onError={vi.fn()} />);
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
    render(<Eeg spec={spec} onError={vi.fn()} />);
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
