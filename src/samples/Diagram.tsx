import type { ComponentType } from "react";
import type { DiagramId, SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { Cluster } from "./diagrams/Cluster";
import { Documents } from "./diagrams/Documents";
import { Graph } from "./diagrams/Graph";
import { Loop } from "./diagrams/Loop";
import { Phone } from "./diagrams/Phone";
import { Steps } from "./diagrams/Steps";
import { Timeline } from "./diagrams/Timeline";

const views: Record<DiagramId, ComponentType> = {
  cyberbridge: Graph,
  wisdom: Loop,
  context: Steps,
  iot: Cluster,
  lanoria: Phone,
  cumarai: Documents,
  school42: Timeline,
};

export const DIAGRAM_IDS = Object.keys(views) as DiagramId[];

export default function Diagram({
  spec,
}: SampleProps<Extract<SampleSpec, { kind: "diagram" }>>) {
  const View = views[spec.id];
  return (
    <div
      role="img"
      aria-label={spec.caption}
      data-diagram={spec.id}
      className="rounded border border-line bg-surface"
    >
      <View />
    </div>
  );
}
