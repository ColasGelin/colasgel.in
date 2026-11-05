type Graph = {
  nodes: { id: string; label: string; x: number; y: number }[];
  edges: [string, string][];
};

export const cyberbridgeGraph: Graph = {
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
};
