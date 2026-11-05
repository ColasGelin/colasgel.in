import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { SampleSpec } from "@/content/types";

export type SampleProps<S extends SampleSpec = SampleSpec> = {
  spec: S;
  onError: (error: Error) => void;
};

function sample<K extends SampleSpec["kind"]>(
  load: () => Promise<{
    default: ComponentType<SampleProps<Extract<SampleSpec, { kind: K }>>>;
  }>,
) {
  return dynamic(load as () => Promise<{ default: ComponentType<SampleProps> }>, {
    ssr: false,
  });
}

const samples: Record<SampleSpec["kind"], ComponentType<SampleProps>> = {
  diagram: sample<"diagram">(() => import("./Diagram")),
  replay: sample<"replay">(() => import("./Replay")),
  gallery: sample<"gallery">(() => import("./Gallery")),
  snake: dynamic(() => import("./Stub"), { ssr: false }),
  refresh: dynamic(() => import("./Stub"), { ssr: false }),
};

export function loadSample(spec: SampleSpec) {
  return samples[spec.kind];
}
