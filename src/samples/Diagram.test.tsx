import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { DiagramId } from "@/content/types";
import Diagram from "./Diagram";
import { diagrams } from "./diagrams";

const ids = Object.keys(diagrams) as DiagramId[];

describe("Diagram", () => {
  test.each(ids)("%s renders as a labelled image", (id) => {
    render(
      <Diagram
        spec={{ kind: "diagram", id, caption: `caption ${id}` }}
        onError={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("img", { name: `caption ${id}` }).tagName.toLowerCase(),
    ).toBe("svg");
  });
});

describe("diagrams data", () => {
  test("covers all three diagrams", () => {
    expect(ids.sort()).toEqual(["context", "cyberbridge", "wisdom"]);
  });

  test.each(ids)("%s edges reference real nodes", (id) => {
    const nodeIds = new Set(diagrams[id].nodes.map((n) => n.id));
    for (const [from, to] of diagrams[id].edges) {
      expect(nodeIds.has(from)).toBe(true);
      expect(nodeIds.has(to)).toBe(true);
    }
  });

  test("cyberbridge names no product screens or customers", () => {
    const text = JSON.stringify(diagrams.cyberbridge).toLowerCase();
    for (const banned of ["client", "customer", "dashboard"]) {
      expect(text).not.toContain(banned);
    }
  });
});
