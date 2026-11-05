const CHUNK = { width: 44, height: 22, gap: 8, x: 226, y: 62 };
const COLUMNS = [0, 1, 2];
const ROWS = [0, 1, 2, 3];
const HITS = ["0-1", "2-2"];
const LINES = [84, 104, 64];
const QUESTION = { x: 80, y: 130 };
const ANSWER = { x: 460, y: 75 };

const chunkX = (column: number) => CHUNK.x + column * (CHUNK.width + CHUNK.gap);
const chunkY = (row: number) => CHUNK.y + row * (CHUNK.height + CHUNK.gap);

export function Rag() {
  return (
    <svg viewBox="0 0 640 260" className="w-full">
      <path d="M 124 130 H 222" stroke="var(--line)" strokeWidth={1.5} />
      <path d="M 390 130 H 460" stroke="var(--line)" strokeWidth={1.5} />

      <rect
        x={QUESTION.x - 54}
        y={QUESTION.y - 18}
        width={108}
        height={36}
        rx={18}
        fill="var(--bg)"
        stroke="var(--accent)"
      />
      <text
        x={QUESTION.x}
        y={QUESTION.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--accent)"
        fontSize={15}
      >
        Question
      </text>

      <text x={CHUNK.x} y={44} fill="var(--muted)" fontSize={14}>
        Vector store
      </text>
      {COLUMNS.flatMap((column) =>
        ROWS.map((row) => (
          <rect
            key={`${column}-${row}`}
            x={chunkX(column)}
            y={chunkY(row)}
            width={CHUNK.width}
            height={CHUNK.height}
            rx={3}
            fill="var(--bg)"
            stroke="var(--line)"
            className={HITS.includes(`${column}-${row}`) ? "rag-hit" : undefined}
          />
        )),
      )}

      <rect
        x={ANSWER.x}
        y={ANSWER.y}
        width={140}
        height={110}
        rx={8}
        fill="var(--bg)"
        stroke="var(--line)"
      />
      <text x={ANSWER.x + 16} y={ANSWER.y + 26} fill="var(--text)" fontSize={15}>
        Answer
      </text>
      {LINES.map((width, index) => (
        <rect
          key={width}
          x={ANSWER.x + 16}
          y={ANSWER.y + 44 + index * 18}
          width={width}
          height={8}
          rx={4}
          fill="var(--accent)"
          className="rag-line"
          style={{ animationDelay: `${index * 0.2}s` }}
        />
      ))}

      <circle
        r={6}
        fill="var(--accent)"
        className="rag-query"
        style={{ offsetPath: 'path("M 124 130 H 222")' }}
      />
      {HITS.map((hit) => {
        const [column, row] = hit.split("-").map(Number);
        const x = chunkX(column) + CHUNK.width / 2;
        const y = chunkY(row) + CHUNK.height / 2;
        return (
          <rect
            key={hit}
            width={12}
            height={12}
            rx={2}
            fill="var(--accent)"
            className="rag-chunk"
            style={{ offsetPath: `path("M ${x} ${y} L 460 130")` }}
          />
        );
      })}
    </svg>
  );
}
