function DocumentIcon() {
  return (
    <path
      d="M7 3h7l4 4v14H7zM10 11h5M10 15h5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    />
  );
}

function ContentIcon() {
  return (
    <path
      d="M4 20l1-4L16 5l3 3L8 19zM4 21h16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
    />
  );
}

function StatisticsIcon() {
  return (
    <path
      d="M5 21v-7M12 21V6M19 21v-11M3 21h18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    />
  );
}

const AGENTS = [
  { name: "Document agent", Icon: DocumentIcon },
  { name: "Content agent", Icon: ContentIcon },
  { name: "Statistics agent", Icon: StatisticsIcon },
];

export function Agents() {
  return (
    <div className="flex flex-col items-center gap-2 p-4 font-mono text-xs">
      <div className="flex items-center gap-2">
        <div className="rounded border border-accent bg-bg px-4 py-2 text-accent">
          LangGraph
        </div>
        <span className="text-muted">traces →</span>
        <div className="rounded border border-line bg-bg px-4 py-2">
          LangSmith
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-2">
        {AGENTS.map(({ name, Icon }, index) => (
          <div
            key={name}
            className="agent-card flex flex-col items-center gap-2 rounded border bg-bg px-2 py-4 text-center"
            style={{ animationDelay: `${index * 2}s` }}
          >
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
              <Icon />
            </svg>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className="text-muted">PostgreSQL · Milvus · backend APIs</div>
    </div>
  );
}
