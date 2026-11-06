import type { CSSProperties } from "react";
import { entryColor } from "@/content/select";
import type { Entry } from "@/content/types";
import { Stage } from "./Stage";

type Props = {
  entries: Entry[];
  selectedId: string | null;
  landedId: string | null;
  showStageInRow: boolean;
  onSelect: (id: string) => void;
};

export function EntryList({
  entries,
  selectedId,
  landedId,
  showStageInRow,
  onSelect,
}: Props) {
  return (
    <ul aria-label="Work" className="border-t border-line">
      {entries.map((entry) => {
        const selected = entry.id === selectedId;
        return (
          <li
            key={entry.id}
            id={`entry-${entry.id}`}
            style={{ "--kind": entryColor(entry) } as CSSProperties}
            className="scroll-mt-16 border-b border-line"
          >
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(entry.id)}
              className={`flex w-full cursor-pointer items-center justify-between gap-3 px-2 py-2 text-left transition-colors ${
                selected ? "bg-surface" : "hover:bg-surface/60"
              }`}
            >
              <span className="min-w-0">
                <span
                  className={`block text-sm font-medium ${selected ? "text-(--kind)" : ""}`}
                >
                  {entry.name}
                </span>
                <span className="block truncate text-xs text-muted">
                  {entry.summary}
                </span>
              </span>
              <span className="shrink-0 font-mono text-xs text-(--kind)">
                {entry.tag}
              </span>
            </button>
            {showStageInRow && selected && (
              <div className="px-2 pt-2 pb-5">
                <Stage entry={entry} landed={entry.id === landedId} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
