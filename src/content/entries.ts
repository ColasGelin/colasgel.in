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
      "The platform's AI reports, briefings, event correlations, IOC labelling and chatbot, from backend to frontend.",
      "An MCP server that lets agents query the database, create and edit report graphs, send notifications and search the knowledge base.",
      "RAG pipelines over the product documentation and knowledge base.",
      "A LoRA fine-tuned Qwen 3.5-4B alert triage model, self-hosted with Ollama.",
      "An AI benchmark comparing the accuracy and speed of LLMs across every AI feature.",
    ],
    stack: ["LangChain", "LangGraph", "Qdrant", "MCP", "Ollama", "Kubernetes"],
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
      "A fully autonomous agent that continuously watches production logs, detects errors, writes a fix and verifies it, revising the fix until it passes.",
      "A monitoring pipeline that records every decision the LLM makes.",
    ],
    stack: ["LLM agents", "Observability", "Self-healing systems"],
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
      "Indexing of a codebase into a vector store that stays in sync as files change.",
      "Answers grounded in the retrieved code.",
      "An autonomous patch loop that applies, validates and rolls back changes.",
    ],
    stack: ["RAG", "Vector store", "Local LLM", "Agents"],
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
      "1st place, NASA Space Apps Challenge, Málaga.",
      "The interface and the simulation, on top of NASA Landsat surface temperature data.",
      "Green zone cooling uses an approximate model.",
    ],
    stack: ["Next.js", "Three.js", "NASA Landsat"],
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
      "1st place, built in a weekend by a team of 4.",
      "A web app that reads the phone camera, describes what's ahead in spoken Spanish and warns about immediate danger.",
    ],
    stack: ["Next.js", "Gemini", "TypeScript"],
    link: repo("Hackathon-LaNoria"),
  },
  {
    id: "mlops",
    name: "MLOps-Waiting-Queue",
    summary: "Self-hosted vision and agent pipeline for queues",
    tag: "personal",
    filters: ["projects"],
    built: [
      "A YOLOv8 model fine-tuned on top-down supermarket footage from a video game, which counts customers per lane.",
      "A LangGraph agent on Ollama that suggests actions, with a human operator approving each one.",
      "Monitoring with Prometheus, Grafana and Loki, all running in Docker.",
    ],
    stack: ["YOLOv8", "LangGraph", "Ollama", "Docker", "Grafana"],
    link: repo("MLOps-Waiting-Queue"),
    sample: {
      kind: "gallery",
      images: [
        {
          src: "/samples/mlops/detections.webp",
          alt: "Top-down supermarket frames with detection boxes drawn around customers",
          caption: "Detections from the fine-tuned model on validation frames.",
        },
        {
          src: "/samples/mlops/training.webp",
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
      "Collects offers from 9 sources, filters them with rules and scores them with Claude.",
      "Prepares applications, with plain-code checks that flag invented facts.",
      "It fills in forms in a visible browser, and it never submits one.",
      "440+ tests with pytest.",
    ],
    stack: ["Python", "FastAPI", "Claude API", "Playwright", "Docker"],
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
      "A Deep Q-Network that learns Snake from reinforcement alone.",
      "The network plays here, in your browser, from the real saved checkpoints.",
    ],
    stack: ["Python", "PyTorch", "Reinforcement learning"],
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
      "AI agents connected to backend APIs and data pipelines.",
      "A chatbot that answers questions over clients' Google Drive documents, using RAG with Milvus.",
      "The PostgreSQL databases behind the platform.",
      "Frontend features in Next.js and TypeScript.",
    ],
    stack: ["FastAPI", "LangChain", "LangGraph", "Milvus", "PostgreSQL"],
  },
  {
    id: "iot",
    name: "Inception-of-Things",
    summary: "Kubernetes and self-hosted GitOps",
    tag: "42",
    filters: ["projects", "42"],
    built: [
      "A Kubernetes cluster with K3s, K3d and Vagrant, with multi-app ingress routing.",
      "GitOps continuous deployment with Argo CD.",
    ],
    stack: ["Kubernetes", "K3s", "K3d", "Argo CD", "Vagrant"],
    link: repo("Inception-of-Things"),
  },
  {
    id: "tpv",
    name: "Total-Perspective-Vortex",
    summary: "Brain-computer interface on EEG signals",
    tag: "42",
    filters: ["projects", "42"],
    built: [
      "EEG signal classification with scikit-learn.",
      "My own CSP implementation and visualisation tool.",
    ],
    stack: ["Python", "scikit-learn", "MNE"],
    link: repo("Total-Perspective-Vortex"),
  },
  {
    id: "school42",
    name: "42 School",
    summary: "RNCP 7 (Master's level) in Computer Science, in progress",
    tag: "42",
    dates: "Lyon, then Málaga · Nov 2022 – expected May 2027",
    filters: ["42"],
    built: [
      "Peer-to-peer, project-based learning with no teachers or lectures: every project meant learning a new language, tool or domain alone.",
    ],
    stack: ["Python", "TypeScript", "C", "C++", "SQL"],
  },
];
