type Box = { x: number; y: number; w: number; h: number; title: string; sub?: string };

const SOURCES: Box[] = ["Cameras", "Switches", "Networks"].map((title, i) => ({
  x: 10,
  y: 50 + i * 75,
  w: 100,
  h: 36,
  title,
}));

const CORRELATION: Box = { x: 140, y: 112, w: 110, h: 62, title: "Event", sub: "correlation" };

const LAYER = { x: 280, y: 30, w: 190, h: 238 };

const AI: Box[] = [
  { title: "RAG", sub: "docs + knowledge base" },
  { title: "MCP server", sub: "data, charts, alerts" },
  { title: "LangGraph agents", sub: "multi-step tasks" },
  { title: "Triage model", sub: "Qwen 3.5-4B · LoRA" },
].map((box, i) => ({ ...box, x: 292, y: 44 + i * 55, w: 166, h: 46 }));

const FEATURES: Box[] = [
  "Reports",
  "Briefings",
  "Correlations",
  "IOC labels",
  "Chatbot",
  "Alert triage",
].map((title, i) => ({ x: 510, y: 32 + i * 40, w: 120, h: 30, title }));

const mid = (box: Box) => box.y + box.h / 2;
const corrMid = mid(CORRELATION);

// One signal per source: into correlation, through the AI layer, out to a feature.
const SIGNALS = [
  [SOURCES[0], FEATURES[0]],
  [SOURCES[1], FEATURES[4]],
  [SOURCES[2], FEATURES[5]],
].map(
  ([source, feature]) =>
    `M ${source.x + source.w} ${mid(source)} L ${CORRELATION.x} ${corrMid} H ${LAYER.x + LAYER.w} L ${feature.x} ${mid(feature)}`,
);

function Node({ box, accent }: { box: Box; accent?: boolean }) {
  const cx = box.x + box.w / 2;
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={4}
        fill="var(--bg)"
        stroke={accent ? "var(--accent)" : "var(--line)"}
      />
      <text
        x={cx}
        y={box.sub ? mid(box) - 8 : mid(box)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--text)"
        fontSize={14}
      >
        {box.title}
      </text>
      {box.sub && (
        <text
          x={cx}
          y={mid(box) + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--muted)"
          fontSize={11}
        >
          {box.sub}
        </text>
      )}
    </g>
  );
}

export function Graph() {
  return (
    <svg viewBox="0 0 640 300" className="w-full">
      <g stroke="var(--line)" strokeWidth={1.5}>
        {SOURCES.map((source) => (
          <line
            key={source.title}
            x1={source.x + source.w}
            y1={mid(source)}
            x2={CORRELATION.x}
            y2={corrMid}
          />
        ))}
        <line x1={CORRELATION.x + CORRELATION.w} y1={corrMid} x2={LAYER.x} y2={corrMid} />
        {FEATURES.map((feature) => (
          <line
            key={feature.title}
            x1={LAYER.x + LAYER.w}
            y1={corrMid}
            x2={feature.x}
            y2={mid(feature)}
          />
        ))}
      </g>

      {/* Drawn under the boxes, so a signal shows only on the links between them. */}
      {SIGNALS.map((path, i) => (
        <circle
          key={path}
          r={4}
          fill="var(--accent)"
          className="trace-dot"
          style={{ offsetPath: `path("${path}")`, animationDelay: `${i * 2}s` }}
        />
      ))}

      <rect
        x={LAYER.x}
        y={LAYER.y}
        width={LAYER.w}
        height={LAYER.h}
        rx={6}
        fill="var(--surface)"
        stroke="var(--accent)"
        strokeDasharray="4 4"
      />
      <text
        x={LAYER.x + LAYER.w / 2}
        y={LAYER.y - 10}
        textAnchor="middle"
        fill="var(--accent)"
        fontSize={12}
      >
        AI layer · built solo
      </text>

      {SOURCES.map((box) => (
        <Node key={box.title} box={box} />
      ))}
      <Node box={CORRELATION} />
      {AI.map((box) => (
        <Node key={box.title} box={box} accent />
      ))}
      {FEATURES.map((box) => (
        <Node key={box.title} box={box} />
      ))}

      <text x={320} y={290} textAnchor="middle" fill="var(--muted)" fontSize={11}>
        Kubernetes · Docker · CI/CD · Ollama self-hosting
      </text>
    </svg>
  );
}
