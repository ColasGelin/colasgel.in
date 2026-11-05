const STEPS = [
  ["index", "codebase to vector store"],
  ["sync", "files change, index follows"],
  ["retrieve", "find the relevant code"],
  ["answer", "grounded in that code"],
  ["patch", "apply a change"],
  ["validate", "keep it, or roll back"],
];

export function Steps() {
  return (
    <div className="overflow-hidden font-mono text-sm">
      <div className="flex gap-1.5 border-b border-line px-4 py-2.5">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-2.5 rounded-full bg-line" />
        ))}
        <span className="ml-2 text-xs text-muted">local, no cloud</span>
      </div>
      <ol className="flex min-h-56 flex-col gap-2 p-4">
        {STEPS.map(([name, detail], index) => (
          <li
            key={name}
            className="step-line grid grid-cols-[6rem_1fr] gap-2"
            style={{ animationDelay: `${index * 0.8}s` }}
          >
            <span className="text-accent">{name}</span>
            <span className="text-muted">{detail}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
