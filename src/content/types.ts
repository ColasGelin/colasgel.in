export type Filter = "all" | "work" | "projects" | "hackathons";
export type Tag = "work" | "education" | "42" | "personal" | "1st place";
export type DiagramId =
  | "cyberbridge"
  | "benchmark"
  | "wisdom"
  | "context"
  | "iot"
  | "lanoria"
  | "cumarai"
  | "jobcopilot"
  | "school42";

export type SampleSpec =
  | { kind: "diagram"; id: DiagramId; caption: string }
  | { kind: "replay"; src: string; caption: string }
  | {
      kind: "gallery";
      images: {
        src: string;
        alt: string;
        caption: string;
        width: number;
        height: number;
      }[];
    }
  | { kind: "walkthrough"; caption: string }
  | { kind: "snake"; caption: string }
  | { kind: "refresh"; caption: string };

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
};
