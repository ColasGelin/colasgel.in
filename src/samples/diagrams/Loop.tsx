const LLM = "#c4b5fd";
const STEPS = [
  { label: "Observe", x: 16 },
  { label: "Diagnose", x: 96, llm: true },
  { label: "Patch", x: 176, llm: true },
  { label: "Verify", x: 256 },
];

export function Loop() {
  return (
    <svg viewBox="0 0 340 170" className="h-full w-full" fontSize={11}>
      <path d="M96 34H244" stroke={LLM} strokeWidth={2} />
      <text x={170} y={26} fill={LLM} fontSize={10} textAnchor="middle">
        local LLM
      </text>
      <path
        d="M84 76H96M164 76H176M244 76H256"
        stroke="var(--muted)"
        strokeWidth={2}
      />
      {STEPS.map(({ label, x, llm }, index) => (
        <g key={label}>
          <rect
            x={x}
            y={52}
            width={68}
            height={48}
            rx={6}
            strokeWidth={2}
            className={llm ? "workflow-step-llm" : "workflow-step"}
            style={{ animationDelay: `${index * 2}s` }}
          />
          <text
            x={x + 34}
            y={80}
            textAnchor="middle"
            fill={llm ? LLM : "var(--text)"}
          >
            {label}
          </text>
        </g>
      ))}
      <path
        d="M290 100V126H130V100"
        fill="none"
        stroke="var(--muted)"
        strokeDasharray="4 4"
      />
      <text
        x={210}
        y={144}
        fill="var(--muted)"
        fontSize={10}
        textAnchor="middle"
      >
        retry, up to 3
      </text>
    </svg>
  );
}
