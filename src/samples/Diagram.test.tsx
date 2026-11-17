import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { DiagramId } from "@/content/types";
import Diagram, { DIAGRAM_IDS } from "./Diagram";

describe("Diagram", () => {
  test("covers all seven diagrams", () => {
    expect([...DIAGRAM_IDS].sort()).toEqual([
      "benchmark",
      "cumarai",
      "cyberbridge",
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
    ["cyberbridge", ["Cameras", "Event", "RAG", "MCP server", "Triage model", "Reports", "Chatbot"]],
    ["benchmark", ["347 test cases", "Cloud · GPT-5", "On-prem · Qwen 3.5-4B", "Regression?", "Fixing agent", "every night"]],
    ["wisdom", ["Observe", "Diagnose", "Patch", "Verify", "local LLM"]],
    ["cumarai", ["Document agent", "Content agent", "Statistics agent", "LangGraph", "LangSmith"]],
    ["jobcopilot", ["578", "27", "5", "0"]],
    ["school42", ["Lyon, then Málaga", "Foundations", "AI and data", "No teachers"]],
  ] as const)("%s shows its parts", (id, labels) => {
    render(
      <Diagram spec={{ kind: "diagram", id, caption: "c" }} onError={vi.fn()} />,
    );
    for (const label of labels) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
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

describe("CyberBridge diagrams", () => {
  test.each(["cyberbridge", "benchmark"] as const)(
    "%s names no product screens or customers",
    (id) => {
      const { container } = render(
        <Diagram spec={{ kind: "diagram", id, caption: "c" }} onError={vi.fn()} />,
      );
      const text = container.textContent!.toLowerCase();
      for (const banned of ["client", "customer"]) {
        expect(text).not.toContain(banned);
      }
    },
  );

  test.each(["cyberbridge", "benchmark"] as const)(
    "%s animates only with the trace dot",
    (id) => {
      const { container } = render(
        <Diagram spec={{ kind: "diagram", id, caption: "c" }} onError={vi.fn()} />,
      );
      const animated = container.querySelectorAll("svg [class]");
      for (const el of animated) {
        expect(el.getAttribute("class")).toBe("trace-dot");
      }
      expect(container.querySelectorAll(".trace-dot").length).toBeGreaterThan(0);
    },
  );
});
