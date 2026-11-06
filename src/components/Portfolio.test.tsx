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
  history.replaceState(null, "", "/");
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
    expect(screen.getByText(/RAG pipelines, agents and an MCP server/)).toBeVisible();
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
    expect(screen.getByRole("button", { name: "Experience" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Experience" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("has no Also built paragraph", () => {
    render(<Portfolio />);
    expect(screen.queryByText(/Also built/)).not.toBeInTheDocument();
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

describe("featured work", () => {
  const scroll = vi.fn();
  const card = (name: RegExp) => screen.getByRole("link", { name });

  beforeEach(() => {
    scroll.mockClear();
    Element.prototype.scrollIntoView = scroll;
    window.scrollTo = vi.fn();
    history.replaceState(null, "", "/");
  });

  test("shows the three featured cards in order, with labels", () => {
    render(<Portfolio />);
    const links = within(
      screen.getByRole("region", { name: "Featured work" }),
    ).getAllByRole("link");
    expect(links.slice(0, 3).map((l) => l.getAttribute("href"))).toEqual([
      "#cyberbridge",
      "#wisdom",
      "#school42",
    ]);
    expect(within(links[0]).getByText("Experience")).toBeVisible();
    expect(within(links[1]).getByText("Project")).toBeVisible();
    expect(within(links[2]).getByText("School")).toBeVisible();
  });

  test("the rest of the work stays below the featured section", () => {
    render(<Portfolio />);
    const list = within(screen.getByRole("region", { name: "All work" }));
    expect(list.getAllByRole("listitem").length).toBeGreaterThanOrEqual(12);
    expect(list.getByRole("button", { name: /Total-Perspective/ })).toBeVisible();
  });

  test("clicking a card opens that entry, scrolls, and keeps the hash", async () => {
    render(<Portfolio />);
    await userEvent.click(card(/Inception-of-Wisdom/));
    expect(screen.getByRole("heading", { name: "Inception-of-Wisdom" })).toBeVisible();
    expect(window.location.hash).toBe("#wisdom");
    expect(scroll.mock.contexts[0]).toBe(document.getElementById("showcase"));
    expect(scroll).toHaveBeenCalledWith({ block: "start", behavior: "smooth" });
  });

  test("the destination is briefly highlighted", async () => {
    render(<Portfolio />);
    await userEvent.click(card(/42 School/));
    expect(document.querySelector("[data-landed='true']")).toHaveTextContent(
      "42 School",
    );
  });

  test("a card still works when a filter hides its entry", async () => {
    render(<Portfolio />);
    await userEvent.click(screen.getByRole("button", { name: "Hackathons" }));
    await userEvent.click(card(/Inception-of-Wisdom/));
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("heading", { name: "Inception-of-Wisdom" })).toBeVisible();
  });

  test("cards work from the keyboard", async () => {
    render(<Portfolio />);
    card(/42 School/).focus();
    await userEvent.keyboard("{Enter}");
    expect(window.location.hash).toBe("#school42");
  });

  test("the hackathon line links to both wins", async () => {
    render(<Portfolio />);
    const strip = screen.getByRole("region", { name: "Hackathon wins" });
    expect(strip).toHaveTextContent("Re-Fresh — 1st place");
    expect(strip).toHaveTextContent("Lanoria — 1st place");
    await userEvent.click(within(strip).getByRole("link", { name: /Lanoria/ }));
    expect(screen.getByRole("heading", { name: "Lanoria Hackathon" })).toBeVisible();
  });

  test("a hash in the URL opens that entry", () => {
    history.replaceState(null, "", "/#tpv");
    render(<Portfolio />);
    expect(screen.getByRole("heading", { name: "Total-Perspective-Vortex" })).toBeVisible();
  });

  test("an unknown hash is ignored", () => {
    history.replaceState(null, "", "/#nope");
    render(<Portfolio />);
    expect(screen.getByRole("heading", { name: "CyberBridge" })).toBeVisible();
  });

  test("going back follows the hash", () => {
    render(<Portfolio />);
    history.replaceState(null, "", "/#iot");
    act(() => {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(screen.getByRole("heading", { name: "Inception-of-Things" })).toBeVisible();
  });
});

describe("name header", () => {
  const scrollTo = vi.fn();
  const scrollPageTo = (y: number) => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
  };
  const header = () => screen.getByRole("banner");

  beforeEach(() => {
    scrollTo.mockClear();
    window.scrollTo = scrollTo;
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  });

  test("starts large", () => {
    render(<Portfolio />);
    expect(header()).toHaveAttribute("data-compact", "false");
  });

  test("shrinks on scroll and grows back at the top", () => {
    render(<Portfolio />);
    scrollPageTo(100);
    expect(header()).toHaveAttribute("data-compact", "true");
    scrollPageTo(0);
    expect(header()).toHaveAttribute("data-compact", "false");
  });

  test("starts with the hero positioning", () => {
    render(<Portfolio />);
    expect(header()).toHaveTextContent("systems that actually run");
  });

  test("clicking a row at the top scrolls past the large header", async () => {
    render(<Portfolio />);
    await userEvent.click(screen.getByRole("button", { name: /CumarAI/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 144, behavior: "smooth" });
  });

  test("clicking a filter at the top scrolls past the large header", async () => {
    render(<Portfolio />);
    await userEvent.click(screen.getByRole("button", { name: "Experience" }));
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  test("a click after scrolling does not move the page", async () => {
    render(<Portfolio />);
    scrollPageTo(300);
    await userEvent.click(screen.getByRole("button", { name: /CumarAI/ }));
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test("reduced motion stays compact and never scrolls", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<Portfolio />);
    expect(header()).toHaveAttribute("data-compact", "true");
    await userEvent.click(screen.getByRole("button", { name: /CumarAI/ }));
    expect(scrollTo).not.toHaveBeenCalled();
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
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
      screen.queryByRole("heading", { level: 3 }),
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
    expect(within(list).getAllByRole("heading", { level: 3 })).toHaveLength(1);
    expect(
      within(list).getByRole("heading", { name: "CumarAI" }),
    ).toBeVisible();
  });

  test("a featured card opens its row", async () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    history.replaceState(null, "", "/");
    render(<Portfolio />);
    await userEvent.click(screen.getByRole("link", { name: /42 School/ }));
    const list = screen.getByRole("list", { name: "Work" });
    expect(within(list).getByRole("heading", { name: "42 School" })).toBeVisible();
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toBe(document.getElementById("entry-school42"));
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
      screen.queryByRole("heading", { level: 3 }),
    ).not.toBeInTheDocument();
  });
});

describe("Stage", () => {
  test("the caption is for screen readers only", () => {
    render(
      <Stage
        entry={{ ...stageTestEntry, sample: { kind: "snake", caption: "cap" } }}
      />,
    );
    expect(screen.getByText("cap")).toHaveClass("sr-only");
  });

  test("the stack is shown as tags", () => {
    render(<Stage entry={stageTestEntry} />);
    expect(screen.getByRole("list", { name: "Stack" })).toHaveTextContent("Go");
  });

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
