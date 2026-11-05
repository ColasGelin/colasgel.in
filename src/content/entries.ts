import type { Entry } from "./types";

const repo = (name: string) => ({
  label: "View on GitHub",
  href: `https://github.com/ColasGelin/${name}`,
});

export const entries: Entry[] = [
  {
    id: "cyberbridge",
    name: "CyberBridge",
    summary: "Sole AI engineer on a cybersecurity platform",
    tag: "work",
    dates: "Sherpa Tribe · Dec 2025 – Present",
    filters: ["work"],
    built: [
      "Sole AI engineer, backend to frontend",
      "RAG pipelines, agents and an MCP server",
      "Self-hosted, fine-tuned alert triage model",
    ],
    stack: [
      "LangGraph",
      "Qdrant",
      "MCP",
      "Ollama",
    ],
    sample: {
      kind: "diagram",
      id: "cyberbridge",
      caption:
        "Physical and network events are correlated, then the AI layer turns them into reports, briefings and chatbot answers.",
    },
  },
  {
    id: "wisdom",
    name: "Inception-of-Wisdom",
    summary: "Autonomous agent that fixes production errors",
    tag: "42",
    filters: ["projects", "42"],
    built: [
      "Watches production logs and detects errors",
      "Writes a fix and revises it until it passes",
      "Records every decision the LLM makes",
    ],
    stack: [
      "LLM agents",
      "Observability",
    ],
    sample: {
      kind: "diagram",
      id: "wisdom",
      caption:
        "The agent detects an error in the logs, writes a fix, verifies it, and revises it until it passes, recording each decision.",
    },
  },
  {
    id: "context",
    name: "Inception-of-Context",
    summary: "Local AI coding assistant with no cloud dependency",
    tag: "42",
    filters: ["projects", "42"],
    built: [
      "Indexes a codebase into a synced vector store",
      "Answers from the retrieved code",
      "Patch loop with validation and rollback",
    ],
    stack: [
      "RAG",
      "Vector store",
      "Local LLM",
      "Agents",
    ],
    sample: {
      kind: "diagram",
      id: "context",
      caption:
        "A codebase is indexed into a vector store, questions are answered from retrieved code, and patches are validated or rolled back.",
    },
  },
  {
    id: "refresh",
    name: "Re-Fresh",
    summary: "3D simulation of how green zones cool Málaga",
    tag: "1st place",
    dates: "NASA Space Apps Challenge, Málaga · 2025",
    filters: ["hackathons"],
    built: [
      "1st place, NASA Space Apps Challenge, Málaga",
      "Built the interface and the simulation",
      "Landsat data, with an approximate cooling model",
    ],
    stack: [
      "Next.js",
      "Three.js",
      "NASA Landsat",
    ],
    link: repo("Re-fresh.earth"),
    sample: {
      kind: "refresh",
      caption:
        "A heat map of Málaga by month. Placing a green zone lowers nearby temperatures using an approximate model.",
    },
  },
  {
    id: "lanoria",
    name: "Lanoria Hackathon",
    summary: "Vision app for blind and visually impaired people",
    tag: "1st place",
    dates: "Málaga · 2025",
    filters: ["hackathons"],
    built: [
      "1st place, built in a weekend by a team of 4",
      "Describes what's ahead in spoken Spanish",
      "Warns about immediate danger",
    ],
    stack: [
      "Next.js",
      "Gemini",
      "TypeScript",
    ],
    link: repo("Hackathon-LaNoria"),
    sample: {
      kind: "diagram",
      id: "lanoria",
      caption:
        "The phone camera feeds Gemini, the description is spoken aloud in Spanish, and danger triggers a vibration.",
    },
  },
  {
    id: "supermarket",
    name: "Supermarket-Queue-Manager",
    summary: "Self-hosted vision and agent pipeline for queues",
    tag: "personal",
    filters: ["projects"],
    built: [
      "YOLOv8 fine-tuned on video game footage",
      "LangGraph agent suggests actions, on Ollama",
      "A human operator approves each one",
    ],
    stack: [
      "YOLOv8",
      "LangGraph",
      "Ollama",
      "Grafana",
    ],
    link: repo("Supermarket-Queue-Manager"),
    sample: {
      kind: "gallery",
      images: [
        {
          src: "/samples/supermarket/detections.webp",
          alt: "Top-down supermarket frames with detection boxes drawn around customers",
          caption: "Detections from the fine-tuned model on validation frames.",
        },
        {
          src: "/samples/supermarket/training.webp",
          alt: "Training and validation curves from the YOLOv8 fine-tuning run",
          caption: "Loss and accuracy curves from the fine-tuning run.",
        },
      ],
    },
  },
  {
    id: "jobcopilot",
    name: "jobcopilot",
    summary: "Job-search assistant I run every day",
    tag: "personal",
    filters: ["projects"],
    built: [
      "Collects offers from 9 sources, scores them with Claude",
      "Plain-code checks flag invented facts",
      "Never submits a form. 440+ tests",
    ],
    stack: [
      "Python",
      "FastAPI",
      "Claude API",
      "Playwright",
    ],
    link: repo("jobcopilot"),
    sample: {
      kind: "replay",
      src: "/samples/jobcopilot/run.json",
      caption: "Totals from one real daily run, played back step by step.",
    },
  },
  {
    id: "learn2slither",
    name: "Learn2Slither",
    summary: "Snake agent trained with a Deep Q-Network",
    tag: "42",
    filters: ["projects", "42"],
    built: [
      "Deep Q-Network that learns to play Snake",
      "Runs in your browser from saved checkpoints",
    ],
    stack: [
      "Python",
      "PyTorch",
      "Reinforcement learning",
    ],
    link: repo("Learn2Slither"),
    sample: {
      kind: "snake",
      caption:
        "A snake controlled by the trained network. The slider switches between checkpoints from early to late in training.",
    },
  },
  {
    id: "cumarai",
    name: "CumarAI",
    summary: "AI Integration Developer",
    tag: "work",
    dates: "Rota, Cádiz · Sep 2024 – Mar 2025",
    filters: ["work"],
    built: [
      "AI agents connected to backend APIs",
      "RAG chatbot over clients' Google Drive documents",
      "PostgreSQL databases and Next.js features",
    ],
    stack: [
      "FastAPI",
      "LangGraph",
      "Milvus",
      "PostgreSQL",
    ],
    sample: {
      kind: "diagram",
      id: "cumarai",
      caption:
        "Client documents are indexed into Milvus so a chatbot can answer from them.",
    },
  },
  {
    id: "iot",
    name: "Inception-of-Things",
    summary: "Kubernetes and self-hosted GitOps",
    tag: "42",
    filters: ["projects", "42"],
    built: [
      "Kubernetes cluster with K3s, K3d and Vagrant",
      "Multi-app ingress routing",
      "GitOps deployment with Argo CD",
    ],
    stack: [
      "Kubernetes",
      "K3s",
      "Argo CD",
      "Vagrant",
    ],
    link: repo("Inception-of-Things"),
    sample: {
      kind: "diagram",
      id: "iot",
      caption:
        "Argo CD syncs a Git repo to a K3s cluster, rolling out apps behind one ingress.",
    },
  },
  {
    id: "tpv",
    name: "Total-Perspective-Vortex",
    summary: "Brain-computer interface on EEG signals",
    tag: "42",
    filters: ["projects", "42"],
    built: [
      "Classifies EEG signals with scikit-learn",
      "My own CSP implementation and visualisation tool",
    ],
    stack: [
      "Python",
      "scikit-learn",
      "MNE",
    ],
    link: repo("Total-Perspective-Vortex"),
    sample: {
      kind: "gallery",
      images: [
        {
          src: "/samples/tpv/psd.webp",
          alt: "Power spectral density plot of EEG signal, raw against filtered, with the kept 8 to 30 Hz band shaded",
          caption: "Real EEG power spectrum, keeping the 8 to 30 Hz band.",
        },
      ],
    },
  },
  {
    id: "school42",
    name: "42 School",
    summary: "RNCP 7 (Master's level) in Computer Science, in progress",
    tag: "42",
    dates: "Lyon, then Málaga · Nov 2022 – expected May 2027",
    filters: ["42"],
    built: [
      "Peer-to-peer and project-based, with no teachers",
      "Every project meant learning something new alone",
    ],
    stack: [
      "Python",
      "TypeScript",
      "C",
      "C++",
    ],
    sample: {
      kind: "diagram",
      id: "school42",
      caption:
        "A timeline from Lyon in November 2022, to Málaga, to the expected RNCP 7 in May 2027.",
    },
  },
];
