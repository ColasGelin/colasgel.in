export type Filter = "all" | "work" | "projects" | "hackathons";
export type Tag = "work" | "education" | "42" | "personal" | "1st place";
export type DiagramId =
  | "cyberbridge"
  | "benchmark"
  | "wisdom"
  | "lanoria"
  | "cumarai"
  | "jobcopilot"
  | "school42";

export type Image = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export type SampleSpec =
  | { kind: "diagram"; id: DiagramId; caption: string }
  | { kind: "replay"; src: string; caption: string }
  | { kind: "gallery"; images: Image[] }
  | { kind: "walkthrough"; caption: string }
  | { kind: "snake"; caption: string }
  | { kind: "refresh"; caption: string }
  | { kind: "eeg"; caption: string }
  | { kind: "gitops"; caption: string }
  | { kind: "queue"; caption: string }
  | { kind: "codesearch"; caption: string };

export type Entry = {
  id: string;
  name: string;
  summary: string;
  tag: Tag;
  dates?: string;
  filters: Exclude<Filter, "all">[];
  built: string[];
  stack: string[];
  link?: { label: string; href: string };
  sample?: SampleSpec;
  // Real output from the project, shown small under everything else.
  visuals?: Image[];
};
