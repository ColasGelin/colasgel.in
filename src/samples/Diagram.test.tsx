import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { DiagramId } from "@/content/types";
import Diagram, { DIAGRAM_IDS } from "./Diagram";
import { cyberbridgeGraph } from "./diagrams/graphData";

describe("Diagram", () => {
  test("covers all eight diagrams", () => {
    expect([...DIAGRAM_IDS].sort()).toEqual([
      "context",
      "cumarai",
      "cyberbridge",
      "iot",
      "jobcopilot",
      "lanoria",
      "school42",
      "wisdom",
    ]);
  });

  test.each(DIAGRAM_IDS)("%s renders as a labelled image", (id: DiagramId) => {
    const { container } = render(
      <Diagram
        spec={{ kind: "diagram", id, caption: `caption ${id}` }}
        onError={vi.fn()}
      />,
    );
    const image = screen.getByRole("img", { name: `caption ${id}` });
    expect(image.textContent).not.toBe("");
    expect(container.querySelector("[data-diagram]")).toHaveAttribute(
      "data-diagram",
      id,
    );
  });

  test.each([
    ["iot", ["GitLab", "Argo CD", "K3s cluster"]],
    ["cumarai", ["Document agent", "Content agent", "Statistics agent", "LangGraph"]],
    ["jobcopilot", ["578", "27", "5", "0"]],
    ["school42", ["Piscine", "Inner circle", "Outer treks", "No teachers"]],
  ] as const)("%s shows its parts", (id, labels) => {
    render(
      <Diagram spec={{ kind: "diagram", id, caption: "c" }} onError={vi.fn()} />,
    );
    for (const label of labels) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  test("context shows the RAG flow", () => {
    render(
      <Diagram
        spec={{ kind: "diagram", id: "context", caption: "c" }}
        onError={vi.fn()}
      />,
    );
    for (const label of ["Question", "Vector store", "Answer"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  test("each diagram draws something different", () => {
    const shapes = DIAGRAM_IDS.map((id) => {
      const { container, unmount } = render(
        <Diagram
          spec={{ kind: "diagram", id, caption: "c" }}
          onError={vi.fn()}
        />,
      );
      const html = container.innerHTML.replace(`data-diagram="${id}"`, "");
      unmount();
      return html;
    });
    expect(new Set(shapes).size).toBe(DIAGRAM_IDS.length);
  });
});

describe("CyberBridge graph", () => {
  test("edges reference real nodes", () => {
    const ids = new Set(cyberbridgeGraph.nodes.map((n) => n.id));
    for (const [from, to] of cyberbridgeGraph.edges) {
      expect(ids.has(from)).toBe(true);
      expect(ids.has(to)).toBe(true);
    }
  });

  test("names no product screens or customers", () => {
    const text = JSON.stringify(cyberbridgeGraph).toLowerCase();
    for (const banned of ["client", "customer", "dashboard"]) {
      expect(text).not.toContain(banned);
    }
  });
});
