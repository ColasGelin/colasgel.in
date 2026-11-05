const TOTAL = 578;
const STAGES = [
  { label: "Collected", count: 578 },
  { label: "New", count: 570 },
  { label: "Filtered", count: 27 },
  { label: "Scored", count: 27 },
  { label: "Drafted", count: 5 },
  { label: "Auto-submitted", count: 0 },
];

export function Funnel() {
  return (
    <ol className="flex flex-col gap-3 p-4 font-mono text-xs">
      {STAGES.map(({ label, count }, index) => (
        <li
          key={label}
          className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3"
        >
          <span className="text-muted">{label}</span>
          <span className="h-4 rounded-sm bg-bg">
            {count > 0 && (
              <span
                className="funnel-bar block h-full rounded-sm bg-accent"
                style={{
                  width: `${Math.max((count / TOTAL) * 100, 1.5)}%`,
                  animationDelay: `${index * 0.45}s`,
                }}
              />
            )}
          </span>
          <span className="text-right text-sm">{count}</span>
        </li>
      ))}
    </ol>
  );
}
