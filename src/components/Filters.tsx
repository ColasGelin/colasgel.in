import type { CSSProperties } from "react";
import { FILTERS, KIND_COLORS } from "@/content/select";
import type { Filter } from "@/content/types";

type Props = {
  active: Filter;
  onChange: (filter: Filter) => void;
};

export function Filters({ active, onChange }: Props) {
  return (
    <div role="group" aria-label="Filter work" className="flex flex-wrap gap-1">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          aria-pressed={filter.id === active}
          onClick={() => onChange(filter.id)}
          style={
            {
              "--kind":
                filter.id === "all" ? "var(--accent)" : KIND_COLORS[filter.id],
            } as CSSProperties
          }
          className={`cursor-pointer rounded px-2.5 py-1 font-mono text-xs transition-colors ${
            filter.id === active
              ? "bg-(--kind) text-bg"
              : "text-muted hover:text-text"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
