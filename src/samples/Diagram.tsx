import type { ComponentType } from "react";
import type { DiagramId, SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { Agents } from "./diagrams/Agents";
import { Cluster } from "./diagrams/Cluster";
import { Funnel } from "./diagrams/Funnel";
import { Graph } from "./diagrams/Graph";
import { Loop } from "./diagrams/Loop";
import { Phone } from "./diagrams/Phone";
import { Rag } from "./diagrams/Rag";
import { School } from "./diagrams/School";

const views: Record<DiagramId, ComponentType> = {
  cyberbridge: Graph,
  wisdom: Loop,
  context: Rag,
  iot: Cluster,
  lanoria: Phone,
  cumarai: Agents,
  jobcopilot: Funnel,
  school42: School,
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
