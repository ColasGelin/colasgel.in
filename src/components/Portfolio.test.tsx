import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { lazy, useEffect, type ComponentType } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { entries } from "@/content/entries";
import type { Entry, SampleSpec } from "@/content/types";
import type { SampleProps } from "@/samples";
import { Portfolio } from "./Portfolio";
import { Stage } from "./Stage";

const mock = vi.hoisted(() => ({
  components: {} as Record<string, unknown>,
}));

vi.mock("@/samples", () => ({
  loadSample: (spec: SampleSpec) => mock.components[spec.kind],
}));

const named = (label: string) =>
  function Named() {
    return <div>{label}</div>;
  };

beforeEach(() => {
  for (const kind of ["diagram", "snake", "refresh", "replay", "gallery"]) {
    mock.components[kind] = named(`${kind} sample`);
  }
});

const stageTestEntry: Entry = {
  id: "t",
  name: "Test entry",
  summary: "summary",
  tag: "personal",
  filters: ["projects"],
  built: ["Built a thing"],
  stack: ["Go"],
  link: { label: "View on GitHub", href: "https://github.com/x" },
};

describe("Portfolio", () => {
  test("opens on CyberBridge", async () => {
    render(<Portfolio />);
    expect(
      screen.getByRole("button", { name: /CyberBridge/ }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/An MCP server that lets agents/)).toBeVisible();
    expect(await screen.findByText("diagram sample")).toBeInTheDocument();
  });

  test("Hackathons filter shows 2 rows and selects Re-Fresh", async () => {
    render(<Portfolio />);
    await userEvent.click(screen.getByRole("button", { name: "Hackathons" }));
    const list = screen.getByRole("list", { name: "Work" });
    expect(within(list).getAllByRole("button")).toHaveLength(2);
    expect(screen.getByRole("button", { name: /Re-Fresh/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("clicking a row updates the stage", async () => {
    render(<Portfolio />);
    await userEvent.click(screen.getByRole("button", { name: /CumarAI/ }));
    expect(screen.getByRole("heading", { name: "CumarAI" })).toBeVisible();
  });

  test("selecting a row on desktop does not scroll", async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    render(<Portfolio />);
    await userEvent.click(screen.getByRole("button", { name: /CumarAI/ }));
    expect(scroll).not.toHaveBeenCalled();
  });

  test("filters work from the keyboard", async () => {
    render(<Portfolio />);
    screen.getByRole("button", { name: "All" }).focus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Work" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Work" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("shows the Also built line with every filter", async () => {
    render(<Portfolio />);
    await userEvent.click(screen.getByRole("button", { name: "Work" }));
    expect(screen.getByText(/Also built:/)).toBeVisible();
  });

  test("only the latest selected sample appears when loads finish out of order", async () => {
    let finishDiagram: (m: { default: ComponentType }) => void = () => {};
    let finishSnake: (m: { default: ComponentType }) => void = () => {};
    mock.components.diagram = lazy(
      () => new Promise<{ default: ComponentType }>((r) => (finishDiagram = r)),
    );
    mock.components.snake = lazy(
      () => new Promise<{ default: ComponentType }>((r) => (finishSnake = r)),
    );
    render(<Portfolio />);
    await userEvent.click(
      screen.getByRole("button", { name: /Learn2Slither/ }),
    );
    await act(async () => {
      finishSnake({ default: named("snake sample") });
    });
    await act(async () => {
      finishDiagram({ default: named("diagram sample") });
    });
    expect(screen.getByText("snake sample")).toBeInTheDocument();
    expect(screen.queryByText("diagram sample")).not.toBeInTheDocument();
  });
});

describe("Portfolio on a phone", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    return () =>
      vi.stubGlobal("matchMedia", (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }));
  });

  test("starts closed so every row is visible", () => {
    render(<Portfolio />);
    expect(
      screen.queryByRole("heading", { level: 2 }),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "Work" })).getAllByRole("button"),
    ).toHaveLength(12);
  });

  test("the sample opens inside its row, one at a time", async () => {
    render(<Portfolio />);
    const list = screen.getByRole("list", { name: "Work" });
    await userEvent.click(screen.getByRole("button", { name: /CyberBridge/ }));
    expect(
      within(list).getByRole("heading", { name: "CyberBridge" }),
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: /CumarAI/ }));
    expect(within(list).getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(
      within(list).getByRole("heading", { name: "CumarAI" }),
    ).toBeVisible();
  });

  test("opening a row scrolls that row to the top", async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    render(<Portfolio />);
    expect(scroll).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: /Re-Fresh/ }));
    await userEvent.click(screen.getByRole("button", { name: /Lanoria/ }));
    expect(scroll).toHaveBeenCalledTimes(2);
    expect(scroll.mock.contexts[1]).toBe(
      screen.getByRole("button", { name: /Lanoria/ }).closest("li"),
    );
    expect(scroll).toHaveBeenLastCalledWith({ block: "start" });
  });

  test("tapping the open row closes it", async () => {
    render(<Portfolio />);
    const row = screen.getByRole("button", { name: /CyberBridge/ });
    await userEvent.click(row);
    await userEvent.click(row);
    expect(
      screen.queryByRole("heading", { level: 2 }),
    ).not.toBeInTheDocument();
  });
});

describe("Stage", () => {
  test("an entry with no sample shows text and no label", () => {
    render(<Stage entry={stageTestEntry} />);
    expect(screen.getByText("Built a thing")).toBeVisible();
    expect(screen.queryByText("Live")).not.toBeInTheDocument();
    expect(screen.queryByText("Diagram")).not.toBeInTheDocument();
    expect(screen.queryByText("Recorded run")).not.toBeInTheDocument();
  });

  test("a sample that throws falls back and keeps the link", async () => {
    mock.components.snake = function Throws(): never {
      throw new Error("boom");
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Stage
        entry={{ ...stageTestEntry, sample: { kind: "snake", caption: "c" } }}
      />,
    );
    expect(await screen.findByText(/Sample unavailable/)).toBeVisible();
    expect(screen.getByRole("link", { name: "View on GitHub" })).toBeVisible();
    spy.mockRestore();
  });

  test("a sample that reports an error falls back", async () => {
    mock.components.replay = function Reports({ onError }: SampleProps) {
      useEffect(() => onError(new Error("fetch failed")), [onError]);
      return null;
    };
    render(
      <Stage
        entry={{
          ...stageTestEntry,
          sample: { kind: "replay", src: "/x.json", caption: "c" },
        }}
      />,
    );
    expect(await screen.findByText(/Sample unavailable/)).toBeVisible();
  });

  test("entries in content all render", () => {
    for (const entry of entries) {
      const { unmount } = render(<Stage entry={entry} />);
      expect(screen.getByRole("heading", { name: entry.name })).toBeVisible();
      unmount();
    }
  });
});
