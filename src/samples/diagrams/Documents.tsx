const DOCS = [40, 95, 150];
const LINES = [0, 1, 2];

export function Documents() {
  return (
    <svg viewBox="0 0 640 260" className="w-full">
      {DOCS.map((y) => (
        <g key={y}>
          <path
            d={`M 50 ${y} h 36 l 14 14 v 32 h -50 z`}
            fill="var(--bg)"
            stroke="var(--line)"
          />
          <path d={`M 60 ${y + 22} h 30 M 60 ${y + 32} h 22`} stroke="var(--line)" />
        </g>
      ))}
      {DOCS.map((y, index) => (
        <rect
          key={y}
          width={8}
          height={8}
          fill="var(--accent)"
          className="chunk-dot"
          style={{
            offsetPath: `path("M 104 ${y + 22} L 290 110")`,
            animationDelay: `${index * 0.5}s`,
          }}
        />
      ))}
      <path
        d="M 270 70 v 80 a 60 16 0 0 0 120 0 v -80"
        fill="var(--bg)"
        stroke="var(--line)"
      />
      <ellipse cx={330} cy={70} rx={60} ry={16} fill="var(--bg)" stroke="var(--line)" />
      <text x={330} y={118} textAnchor="middle" fill="var(--text)" fontSize={15}>
        Milvus
      </text>
      <path d="M 396 110 H 450" stroke="var(--line)" strokeWidth={1.5} />
      <rect x={450} y={60} width={140} height={100} rx={12} fill="var(--bg)" stroke="var(--accent)" />
      {LINES.map((line) => (
        <rect
          key={line}
          x={468}
          y={82 + line * 20}
          width={104 - line * 24}
          height={8}
          rx={4}
          fill="var(--line)"
          className="answer-line"
          style={{ animationDelay: `${line * 0.3}s` }}
        />
      ))}
      <text x={75} y={222} textAnchor="middle" fill="var(--muted)" fontSize={13}>
        Client documents
      </text>
      <text x={520} y={190} textAnchor="middle" fill="var(--muted)" fontSize={13}>
        Chatbot
      </text>
    </svg>
  );
}
