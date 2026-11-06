const DECK = "#93c5fd";
const STEEL = "#3b82f6";
const CABLE = "#60a5fa";
const PALE = "#dbeafe";
const NIGHT = "#132238";
const WATER = "#1e3a5f";

const SIGNALS = ["M 56 100 H 170", "M 284 100 H 170"];
const LEDS = [72, 88, 104, 120];

export function Bridge() {
  return (
    <svg viewBox="0 0 340 170" className="h-full w-full" data-visual="bridge">
      <path d="M0 142H340" stroke={WATER} strokeWidth={2} />
      <path d="M56 104H284" stroke={DECK} strokeWidth={5} />
      <path d="M170 30V142" stroke={STEEL} strokeWidth={7} />
      <path
        d="M56 100Q120 94 170 34Q220 94 284 100"
        fill="none"
        stroke={CABLE}
        strokeWidth={2.5}
      />
      <path d="M100 94V104M130 80V104M210 80V104M240 94V104" stroke={STEEL} />
      {SIGNALS.map((path) => (
        <circle
          key={path}
          r={4}
          fill={PALE}
          className="bridge-dot"
          style={{ offsetPath: `path("${path}")` }}
        />
      ))}

      <path
        d="M170 14l20 8v16c0 13-9 21-20 26-11-5-20-13-20-26V22z"
        fill={NIGHT}
        stroke={DECK}
        strokeWidth={2.5}
      />
      <path d="M161 38l7 7 12-13" fill="none" stroke={PALE} strokeWidth={3} />

      <rect x={10} y={78} width={40} height={20} rx={4} fill={PALE} />
      <circle
        cx={50}
        cy={88}
        r={7}
        fill="var(--bg)"
        stroke={CABLE}
        strokeWidth={3}
      />
      <circle cx={20} cy={85} r={2.5} fill={STEEL} className="bridge-rec" />
      <path d="M26 98V142" stroke={STEEL} strokeWidth={4} />

      <rect
        x={290}
        y={64}
        width={40}
        height={78}
        rx={4}
        fill={NIGHT}
        stroke={STEEL}
      />
      {LEDS.map((y, index) => (
        <g key={y}>
          <rect x={296} y={y} width={28} height={12} rx={1} fill="var(--bg)" />
          <circle
            cx={302}
            cy={y + 6}
            r={2.5}
            className="bridge-led"
            style={{ animationDelay: `${index * 0.35}s` }}
          />
        </g>
      ))}
    </svg>
  );
}
