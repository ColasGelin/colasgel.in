type Step = { x: number; y: number; title: string; lines: string[] };

const W = 180;
const H = 72;

// The nightly loop, clockwise from the top left.
const STEPS: Step[] = [
  { x: 10, y: 30, title: "347 test cases", lines: ["across 10 AI features"] },
  { x: 230, y: 30, title: "Two models", lines: ["Cloud · GPT-5", "On-prem · Qwen 3.5-4B"] },
  { x: 450, y: 30, title: "Scoring", lines: ["LLM judges on quality", "tokens, speed, cost"] },
  { x: 450, y: 170, title: "Regression?", lines: ["95% noise band", "vs target"] },
  { x: 230, y: 170, title: "Fixing agent", lines: ["Claude Code, own worktree", "fix + unit tests"] },
  { x: 10, y: 170, title: "Held-out check", lines: ["30% of cases", "then my review"] },
];

const cx = (s: Step) => s.x + W / 2;
const cy = (s: Step) => s.y + H / 2;
const LOOP = `M ${cx(STEPS[0])} ${cy(STEPS[0])} H ${cx(STEPS[2])} V ${cy(STEPS[3])} H ${cx(STEPS[5])} Z`;

export function Benchmark() {
  return (
    <svg viewBox="0 0 640 300" className="w-full">
      <path d={LOOP} fill="none" stroke="var(--line)" strokeWidth={1.5} />
      {/* Drawn under the boxes, so the run shows only between steps. */}
      <circle r={4} fill="var(--accent)" className="trace-dot" style={{ offsetPath: `path("${LOOP}")` }} />

      <text x={320} y={150} textAnchor="middle" dominantBaseline="middle" fill="var(--accent)" fontSize={13}>
        every night
      </text>

      {STEPS.map((step) => (
        <g key={step.title}>
          <rect x={step.x} y={step.y} width={W} height={H} rx={4} fill="var(--bg)" stroke="var(--line)" />
          <text x={cx(step)} y={step.y + 22} textAnchor="middle" fill="var(--text)" fontSize={14}>
            {step.title}
          </text>
          {step.lines.map((line, i) => (
            <text
              key={line}
              x={cx(step)}
              y={step.y + 42 + i * 15}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize={11}
            >
              {line}
            </text>
          ))}
        </g>
      ))}

      <text x={320} y={268} textAnchor="middle" fill="var(--muted)" fontSize={11}>
        Red team (promptfoo): prompt extraction, PII leaks, jailbreaks
      </text>
      <text x={320} y={286} textAnchor="middle" fill="var(--muted)" fontSize={11}>
        Dashboard: scores vs targets, cost and latency, Langfuse tracing
      </text>
    </svg>
  );
}
