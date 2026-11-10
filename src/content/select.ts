import type { Entry, Filter, SampleSpec } from "./types";

export const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "work", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "hackathons", label: "Hackathons" },
];

export const KIND_COLORS = {
  work: "#93c5fd",
  projects: "#6ee7b7",
  hackathons: "#fda4af",
  education: "#fcd34d",
};

export function entryColor(entry: Entry): string {
  if (entry.tag === "education") return KIND_COLORS.education;
  return KIND_COLORS[entry.filters[0]];
}

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
): "Live" | "Recorded run" | "Simulation" | "Diagram" | null {
  switch (sample?.kind) {
    case "snake":
    case "refresh":
      return "Live";
    case "replay":
      return "Recorded run";
    case "walkthrough":
    case "eeg":
    case "gitops":
    case "queue":
    case "codesearch":
      return "Simulation";
    case "diagram":
      return "Diagram";
    default:
      return null;
  }
}
