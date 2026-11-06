const CENTER = { x: 320, y: 135 };
const RADIUS = 85;
const STOPS = [
  { label: "Patch", x: 320, y: 50 },
  { label: "Verify", x: 394, y: 177 },
  { label: "Retry", x: 246, y: 177 },
];

function Pill({
  x,
  y,
  label,
  accent,
}: {
  x: number;
  y: number;
  label: string;
  accent?: boolean;
}) {
  const width = label.length * 8 + 28;
  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - 17}
        width={width}
        height={34}
        rx={17}
        fill="var(--bg)"
        stroke={accent ? "var(--accent)" : "var(--line)"}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={accent ? "var(--accent)" : "var(--text)"}
        fontSize={14}
      >
        {label}
      </text>
    </g>
  );
}

export function Loop() {
  const circle = `M ${CENTER.x} ${CENTER.y - RADIUS} a ${RADIUS} ${RADIUS} 0 1 1 -0.01 0`;

  return (
    <svg viewBox="0 0 640 260" className="w-full">
      <path d="M 70 50 H 320" stroke="var(--line)" strokeWidth={1.5} />
      <path d="M 394 177 H 540 V 90" stroke="var(--line)" strokeWidth={1.5} fill="none" />
      <circle
        cx={CENTER.x}
        cy={CENTER.y}
        r={RADIUS}
        fill="none"
        stroke="var(--line)"
        strokeWidth={1.5}
        strokeDasharray="6 6"
      />
      <circle
        r={6}
        fill="var(--accent)"
        className="orbit-dot"
        style={{ offsetPath: `path("${circle}")` }}
      />
      <Pill x={80} y={50} label="Crash" />
      <Pill x={186} y={50} label="Diagnosis" />
      {STOPS.map((stop) => (
        <Pill key={stop.label} {...stop} />
      ))}
      <Pill x={500} y={177} label="Healed" accent />
      <Pill x={540} y={70} label="Auto-heal branch" />
    </svg>
  );
}
