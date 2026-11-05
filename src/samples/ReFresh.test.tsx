import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ReFresh from "./ReFresh";

vi.mock("./refresh/HeatScene", () => ({
  default: ({
    cells,
    zones,
    onPlace,
  }: {
    cells: unknown[];
    zones: unknown[];
    onPlace: (zone: { x: number; z: number }) => void;
  }) => (
    <button onClick={() => onPlace({ x: 0, z: 0 })}>
      scene {cells.length} cells {zones.length} zones
    </button>
  ),
}));

const spec = { kind: "refresh", caption: "c" } as const;
const months = [
  { id: "2023-06", file: "a.csv" },
  { id: "2023-07", file: "b.csv" },
];

function stubFetch(failing: string[] = []) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (failing.some((f) => url.endsWith(f))) {
        return { ok: false, status: 404 };
      }
      if (url.endsWith("months.json")) {
        return { ok: true, json: async () => months };
      }
      const temp = url.endsWith("a.csv") ? 20 : 40;
      return {
        ok: true,
        text: async () => `lat,lon,temp\n34,47,${temp + 2}\n0,0,${temp}\n`,
      };
    }),
  );
}

const settle = () => act(async () => {});

describe("ReFresh", () => {
  beforeEach(() => stubFetch());

  test("opens on the latest month and shows the label", async () => {
    render(<ReFresh spec={spec} onError={vi.fn()} />);
    await settle();
    expect(fetch).toHaveBeenCalledWith("/samples/refresh/b.csv");
    expect(screen.getByText(/41\.0 °C/)).toBeInTheDocument();
    expect(screen.getByText(/approximate model/i)).toBeInTheDocument();
  });

  test("placing a zone lowers the average, and Clear removes it", async () => {
    render(<ReFresh spec={spec} onError={vi.fn()} />);
    await settle();
    fireEvent.click(screen.getByText(/scene/));
    expect(screen.getByText("scene 2 cells 1 zones")).toBeInTheDocument();
    expect(screen.getByText(/40\.0 °C/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear zones" }));
    expect(screen.getByText("scene 2 cells 0 zones")).toBeInTheDocument();
  });

  test("a failed month keeps the previous one with a message", async () => {
    render(<ReFresh spec={spec} onError={vi.fn()} />);
    await settle();
    stubFetch(["a.csv"]);
    fireEvent.change(screen.getByLabelText("Month"), {
      target: { value: "2023-06" },
    });
    await settle();
    expect(screen.getByText(/41\.0 °C/)).toBeInTheDocument();
    expect(screen.getByText(/Couldn't load that month/)).toBeInTheDocument();
  });

  test("a failed first load reports an error", async () => {
    stubFetch(["b.csv"]);
    const onError = vi.fn();
    render(<ReFresh spec={spec} onError={onError} />);
    await settle();
    expect(onError).toHaveBeenCalled();
  });
});
