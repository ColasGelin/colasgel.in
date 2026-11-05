import type { DiagramId } from "@/content/types";

type DiagramData = {
  nodes: { id: string; label: string; x: number; y: number }[];
  edges: [string, string][];
};

export const diagrams: Record<DiagramId, DiagramData> = {
  cyberbridge: {
    nodes: [
      { id: "cameras", label: "Cameras", x: 80, y: 50 },
      { id: "switches", label: "Switches", x: 80, y: 130 },
      { id: "networks", label: "Networks", x: 80, y: 210 },
      { id: "correlation", label: "Event\ncorrelation", x: 240, y: 130 },
      { id: "triage", label: "Triage\nmodel", x: 400, y: 50 },
      { id: "agents", label: "Agents\nand MCP", x: 400, y: 130 },
      { id: "rag", label: "RAG", x: 400, y: 210 },
      { id: "alerts", label: "Prioritised\nalerts", x: 560, y: 50 },
      { id: "reports", label: "Reports and\nbriefings", x: 560, y: 130 },
      { id: "chatbot", label: "Chatbot", x: 560, y: 210 },
    ],
    edges: [
      ["cameras", "correlation"],
      ["switches", "correlation"],
      ["networks", "correlation"],
      ["correlation", "triage"],
      ["correlation", "agents"],
      ["correlation", "rag"],
      ["triage", "alerts"],
      ["agents", "reports"],
      ["rag", "chatbot"],
    ],
  },
  wisdom: {
    nodes: [
      { id: "logs", label: "Production\nlogs", x: 80, y: 50 },
      { id: "error", label: "Error\ndetected", x: 240, y: 50 },
      { id: "fix", label: "Agent\nwrites fix", x: 400, y: 50 },
      { id: "verify", label: "Verify", x: 560, y: 50 },
      { id: "failed", label: "Failed:\nrevise", x: 400, y: 130 },
      { id: "passed", label: "Passed", x: 560, y: 210 },
      { id: "trace", label: "Decision\ntrace", x: 400, y: 210 },
    ],
    edges: [
      ["logs", "error"],
      ["error", "fix"],
      ["fix", "verify"],
      ["verify", "failed"],
      ["failed", "fix"],
      ["verify", "passed"],
      ["passed", "trace"],
    ],
  },
  context: {
    nodes: [
      { id: "codebase", label: "Codebase", x: 80, y: 50 },
      { id: "store", label: "Vector store,\nsynced", x: 240, y: 50 },
      { id: "retrieved", label: "Retrieved\ncode", x: 400, y: 50 },
      { id: "answer", label: "Answer", x: 560, y: 50 },
      { id: "question", label: "Question", x: 240, y: 130 },
      { id: "patch", label: "Patch", x: 400, y: 130 },
      { id: "validate", label: "Validate", x: 560, y: 130 },
      { id: "rollback", label: "Roll back", x: 400, y: 210 },
      { id: "apply", label: "Apply", x: 560, y: 210 },
    ],
    edges: [
      ["codebase", "store"],
      ["store", "retrieved"],
      ["question", "retrieved"],
      ["retrieved", "answer"],
      ["retrieved", "patch"],
      ["patch", "validate"],
      ["validate", "apply"],
      ["validate", "rollback"],
    ],
  },
};
