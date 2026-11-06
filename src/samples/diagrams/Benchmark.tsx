const PROFILES = ["Cloud", "On-prem"];
const TASKS = [
  "MITRE",
  "Report",
  "Chart",
  "Summary",
  "Briefing",
  "Chatbot",
  "Routing",
  "Retrieval",
  "IOC",
  "Correlation",
];
const METRICS = ["quality", "tokens", "speed", "cost"];

export function Benchmark() {
  return (
    <div className="flex flex-col gap-3 p-4 font-mono text-xs">
      <div className="flex items-center justify-center gap-3">
        <span className="rounded border border-accent bg-bg px-4 py-2 text-accent">
          {PROFILES[0]}
        </span>
        <span className="text-muted">against</span>
        <span className="rounded border border-accent bg-bg px-4 py-2 text-accent">
          {PROFILES[1]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        {TASKS.map((task, index) => (
          <span
            key={task}
            className="agent-card rounded border bg-bg px-1 py-2 text-center"
            style={{ animationDelay: `${index * 0.6}s` }}
          >
            {task}
          </span>
        ))}
      </div>
      <p className="flex justify-center gap-4 text-muted">
        {METRICS.map((metric) => (
          <span key={metric}>{metric}</span>
        ))}
      </p>
    </div>
  );
}
