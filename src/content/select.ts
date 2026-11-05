import type { Entry, Filter, SampleSpec } from "./types";

export const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "hackathons", label: "Hackathons" },
];

export function filterEntries(list: Entry[], filter: Filter): Entry[] {
  if (filter === "all") return list;
  return list.filter((entry) => entry.filters.includes(filter));
}

export function resolveSelection(
  list: Entry[],
  filter: Filter,
  selectedId: string,
): string {
  const visible = filterEntries(list, filter);
  if (visible.some((entry) => entry.id === selectedId)) return selectedId;
  return visible[0].id;
}

export function sampleLabel(
  sample?: SampleSpec,
): "Live" | "Recorded run" | "Diagram" | null {
  switch (sample?.kind) {
    case "snake":
    case "refresh":
      return "Live";
    case "replay":
      return "Recorded run";
    case "diagram":
      return "Diagram";
    default:
      return null;
  }
}
