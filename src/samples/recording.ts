export type Recording = {
  steps: { t: number; label: string; output: string }[];
};

export function parseRecording(json: unknown): Recording {
  const steps = (json as Recording | null)?.steps;
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error("Recording has no steps");
  }
  steps.forEach((step, index) => {
    if (
      typeof step?.t !== "number" ||
      typeof step.label !== "string" ||
      typeof step.output !== "string"
    ) {
      throw new Error(`Recording step ${index} is invalid`);
    }
    if (index > 0 && step.t <= steps[index - 1].t) {
      throw new Error(`Recording step ${index} is out of order`);
    }
  });
  return { steps };
}
