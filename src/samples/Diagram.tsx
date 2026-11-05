import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { diagrams } from "./diagrams";

const NODE_WIDTH = 132;
const NODE_HEIGHT = 56;
const STEP_SECONDS = 0.45;

export default function Diagram({
  spec,
}: SampleProps<Extract<SampleSpec, { kind: "diagram" }>>) {
  const { nodes, edges } = diagrams[spec.id];
  const position = new Map(nodes.map((node) => [node.id, node]));
  const cycle = edges.length * STEP_SECONDS + 1;

  return (
    <svg
      role="img"
      aria-label={spec.caption}
      viewBox="0 0 640 260"
      className="w-full rounded border border-line bg-surface"
    >
      {edges.map(([from, to]) => {
        const a = position.get(from)!;
        const b = position.get(to)!;
        return (
          <line
            key={`${from}-${to}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--line)"
            strokeWidth={1.5}
          />
        );
      })}
      {edges.map(([from, to], index) => {
        const a = position.get(from)!;
        const b = position.get(to)!;
        return (
          <circle
            key={`${from}-${to}`}
            r={4}
            fill="var(--accent)"
            className="flow-dot"
            style={{
              offsetPath: `path("M ${a.x} ${a.y} L ${b.x} ${b.y}")`,
              animationDuration: `${cycle}s`,
              animationDelay: `${index * STEP_SECONDS}s`,
            }}
          />
        );
      })}
      {nodes.map((node) => {
        const lines = node.label.split("\n");
        return (
          <g key={node.id}>
            <rect
              x={node.x - NODE_WIDTH / 2}
              y={node.y - NODE_HEIGHT / 2}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={4}
              fill="var(--bg)"
              stroke="var(--line)"
            />
            <text
              x={node.x}
              y={node.y - ((lines.length - 1) * 17) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text)"
              fontSize={15}
            >
              {lines.map((line, index) => (
                <tspan key={line} x={node.x} dy={index === 0 ? 0 : 17}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
