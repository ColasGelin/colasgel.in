import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SampleSpec } from "@/content/types";

export type SampleProps<S extends SampleSpec = SampleSpec> = {
  spec: S;
  onError: (error: Error) => void;
};

const samples: Record<SampleSpec["kind"], ComponentType<SampleProps>> = {
  diagram: dynamic(() => import("./Diagram") as never, { ssr: false }),
  replay: dynamic(() => import("./Stub"), { ssr: false }),
  gallery: dynamic(() => import("./Stub"), { ssr: false }),
  snake: dynamic(() => import("./Stub"), { ssr: false }),
  refresh: dynamic(() => import("./Stub"), { ssr: false }),
};

export function loadSample(spec: SampleSpec) {
  return samples[spec.kind];
}
