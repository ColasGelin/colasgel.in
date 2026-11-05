const START = 2022.83;
const END = 2027.4;
const LEFT = 40;
const WIDTH = 560;
const MOVE = 2025.25;
const YEARS = [2023, 2024, 2025, 2026, 2027];

const x = (year: number) => LEFT + ((year - START) / (END - START)) * WIDTH;

export function Timeline() {
  return (
    <svg viewBox="0 0 640 220" className="w-full">
      <line
        x1={LEFT}
        y1={130}
        x2={LEFT + WIDTH}
        y2={130}
        stroke="var(--line)"
        strokeWidth={1.5}
      />
      {YEARS.map((year) => (
        <g key={year}>
          <line x1={x(year)} y1={124} x2={x(year)} y2={136} stroke="var(--line)" />
          <text
            x={x(year)}
            y={158}
            textAnchor="middle"
            fill="var(--muted)"
            fontSize={13}
          >
            {year}
          </text>
        </g>
      ))}
      <rect
        x={x(START)}
        y={68}
        width={x(MOVE) - x(START) - 4}
        height={34}
        rx={4}
        fill="var(--bg)"
        stroke="var(--line)"
      />
      <text x={x(START) + 14} y={86} dominantBaseline="middle" fill="var(--text)" fontSize={15}>
        Lyon
      </text>
      <rect
        x={x(MOVE)}
        y={68}
        width={x(2027.37) - x(MOVE)}
        height={34}
        rx={4}
        fill="var(--bg)"
        stroke="var(--accent)"
      />
      <text x={x(MOVE) + 14} y={86} dominantBaseline="middle" fill="var(--accent)" fontSize={15}>
        Málaga
      </text>
      <text x={x(2027.37)} y={190} textAnchor="end" fill="var(--text)" fontSize={13}>
        RNCP 7 expected, May 2027
      </text>
      <text x={LEFT} y={190} fill="var(--muted)" fontSize={13}>
        Started Nov 2022
      </text>
      <circle cx={x(START)} cy={130} r={5} fill="var(--accent)" className="pulse-dot" />
      <circle cx={x(MOVE)} cy={130} r={5} fill="var(--accent)" className="pulse-dot" />
      <circle cx={x(2027.37)} cy={130} r={5} fill="none" stroke="var(--accent)" strokeWidth={2} />
    </svg>
  );
}
