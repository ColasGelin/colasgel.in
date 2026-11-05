import dynamic from "next/dynamic";
import { createElement, type ComponentType } from "react";
import type { SampleSpec } from "@/content/types";
import Diagram from "./Diagram";
import Gallery from "./Gallery";
import { SampleSkeleton } from "./SampleSkeleton";

export type SampleProps<S extends SampleSpec = SampleSpec> = {
  spec: S;
  onError: (error: Error) => void;
};

function lazySample<K extends SampleSpec["kind"]>(
  load: () => Promise<{
    default: ComponentType<SampleProps<Extract<SampleSpec, { kind: K }>>>;
  }>,
  skeleton: string,
) {
  return dynamic(load as () => Promise<{ default: ComponentType<SampleProps> }>, {
    ssr: false,
    loading: () => createElement(SampleSkeleton, { className: skeleton }),
  });
}

// Diagrams and images are light, so they ship with the page and never pop in.
const samples: Record<SampleSpec["kind"], ComponentType<SampleProps>> = {
  diagram: Diagram as unknown as ComponentType<SampleProps>,
  gallery: Gallery as unknown as ComponentType<SampleProps>,
  replay: lazySample<"replay">(() => import("./Replay"), "h-60"),
  snake: lazySample<"snake">(() => import("./Snake"), "h-97"),
  refresh: lazySample<"refresh">(() => import("./ReFresh"), "aspect-[4/3]"),
};

export function loadSample(spec: SampleSpec) {
  return samples[spec.kind];
}
