const CENTER = { x: 130, y: 130 };
const RINGS = [
  { radius: 58, count: 6 },
  { radius: 108, count: 10 },
];

const dots = RINGS.flatMap(({ radius, count }, ring) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2 + ring * 0.3;
    return {
      key: `${ring}-${index}`,
      x: CENTER.x + radius * Math.cos(angle),
      y: CENTER.y + radius * Math.sin(angle),
      delay: ring * 1.4 + index * 0.14,
      ring,
    };
  }),
);

const STAGES = [
  ["Piscine", "the selection stage"],
  ["Inner circle", "shell, threads, raytracer, IRC, C++"],
  ["Outer treks", "ML, Kubernetes, AI agents, full stack"],
];

const FACTS = ["No teachers", "Peer-graded projects", "Levels, not years"];

export function School() {
  return (
    <div className="grid items-center gap-2 p-3 sm:grid-cols-[17rem_1fr]">
      <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-64">
        {RINGS.map(({ radius }) => (
          <circle
            key={radius}
            cx={CENTER.x}
            cy={CENTER.y}
            r={radius}
            fill="none"
            stroke="var(--line)"
          />
        ))}
        {dots.map((dot) => (
          <line
            key={dot.key}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={dot.x}
            y2={dot.y}
            stroke="var(--line)"
            strokeOpacity={0.5}
          />
        ))}
        <circle cx={CENTER.x} cy={CENTER.y} r={26} fill="var(--accent)" />
        <text
          x={CENTER.x}
          y={CENTER.y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--bg)"
          fontSize={24}
          fontWeight={700}
        >
          42
        </text>
        {dots.map((dot) => (
          <circle
            key={dot.key}
            cx={dot.x}
            cy={dot.y}
            r={dot.ring === 0 ? 8 : 9}
            className="graph-node"
            style={{ animationDelay: `${dot.delay}s` }}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-3 font-mono text-xs">
        <dl className="flex flex-col gap-2">
          {STAGES.map(([name, detail]) => (
            <div key={name}>
              <dt className="text-accent">{name}</dt>
              <dd className="text-muted">{detail}</dd>
            </div>
          ))}
        </dl>
        <ul className="flex flex-wrap gap-1.5">
          {FACTS.map((fact) => (
            <li key={fact} className="rounded border border-line px-2 py-0.5">
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
