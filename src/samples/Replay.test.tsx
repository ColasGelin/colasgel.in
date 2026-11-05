import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { SampleSpec } from "@/content/types";
import Gallery from "./Gallery";
import Replay from "./Replay";
import { parseRecording } from "./recording";

const spec: Extract<SampleSpec, { kind: "replay" }> = {
  kind: "replay",
  src: "/run.json",
  caption: "c",
};
const recording = {
  steps: [
    { t: 0, label: "One", output: "first" },
    { t: 1, label: "Two", output: "second" },
    { t: 2, label: "Three", output: "third" },
  ],
};

const tick = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
const click = (name: string) =>
  act(async () => {
    screen.getByRole("button", { name }).click();
  });

describe("parseRecording", () => {
  test("accepts a valid recording", () => {
    expect(parseRecording(recording).steps).toHaveLength(3);
  });

  test("rejects empty steps", () => {
    expect(() => parseRecording({ steps: [] })).toThrow();
  });

  test("rejects a non-increasing t", () => {
    expect(() =>
      parseRecording({
        steps: [
          { t: 1, label: "a", output: "b" },
          { t: 1, label: "c", output: "d" },
        ],
      }),
    ).toThrow();
  });

  test("rejects a missing field", () => {
    expect(() => parseRecording({ steps: [{ t: 0 }] })).toThrow();
  });
});

describe("Replay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => recording })),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("plays through the steps and stops on the last", async () => {
    render(<Replay spec={spec} onError={vi.fn()} />);
    await tick(0);
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.queryByText("second")).not.toBeInTheDocument();
    await tick(1000);
    expect(screen.getByText("second")).toBeInTheDocument();
    await tick(5000);
    expect(screen.getByText("third")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replay" })).toBeInTheDocument();
  });

  test("pause holds the current step", async () => {
    render(<Replay spec={spec} onError={vi.fn()} />);
    await tick(0);
    await click("Pause");
    await tick(5000);
    expect(screen.queryByText("second")).not.toBeInTheDocument();
  });

  test("step moves one forward", async () => {
    render(<Replay spec={spec} onError={vi.fn()} />);
    await tick(0);
    await click("Pause");
    await click("Step");
    expect(screen.getByText("second")).toBeInTheDocument();
    expect(screen.queryByText("third")).not.toBeInTheDocument();
  });

  test("reduced motion starts paused", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<Replay spec={spec} onError={vi.fn()} />);
    await tick(5000);
    expect(screen.queryByText("second")).not.toBeInTheDocument();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  });

  test("a failed fetch reports an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 404 })),
    );
    const onError = vi.fn();
    render(<Replay spec={spec} onError={onError} />);
    await tick(0);
    expect(onError).toHaveBeenCalled();
  });
});

describe("Gallery", () => {
  test("a failed image reports an error", async () => {
    const onError = vi.fn();
    render(
      <Gallery
        spec={{
          kind: "gallery",
          images: [{ src: "/a.webp", alt: "alt text", caption: "cap" }],
        }}
        onError={onError}
      />,
    );
    expect(screen.getByText("cap")).toBeInTheDocument();
    act(() => {
      screen
        .getByAltText("alt text")
        .dispatchEvent(new Event("error", { bubbles: false }));
    });
    expect(onError).toHaveBeenCalled();
  });
});
