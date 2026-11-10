export type Hand = "left" | "right";
// One reading from the two electrodes over the motor cortex: C3 (left side) and C4 (right side).
export type Reading = { raw: [number, number]; clean: [number, number] };

const SAMPLE_RATE = 120;
const RHYTHM_HZ = 10;
const QUIET = 0.3;

// Imagining a hand movement quiets the 8 to 30 Hz rhythm on the opposite side of the head.
export function createSignal(random: () => number) {
  let time = 0;
  let c3 = 1;
  let c4 = QUIET;
  const noise = (size: number) => (random() - 0.5) * size;

  return function next(hand: Hand): Reading {
    time += 1 / SAMPLE_RATE;
    c3 += ((hand === "right" ? QUIET : 1) - c3) * 0.02;
    c4 += ((hand === "left" ? QUIET : 1) - c4) * 0.02;
    const swell = 0.75 + 0.25 * Math.sin(time * 1.3);
    const phase = 2 * Math.PI * RHYTHM_HZ * time;
    const rhythm3 = Math.sin(phase) * c3 * swell * 9;
    const rhythm4 = Math.sin(phase + 1) * c4 * swell * 9;
    const drift3 = Math.sin(time * 2.1) * 9 + Math.sin(time * 0.7) * 5;
    const drift4 = Math.sin(time * 1.7 + 2) * 9 + Math.sin(time * 0.9) * 5;
    return {
      raw: [rhythm3 + drift3 + noise(12), rhythm4 + drift4 + noise(12)],
      clean: [rhythm3 + noise(2.5), rhythm4 + noise(2.5)],
    };
  };
}

export function power(values: number[], window = 140): number {
  const recent = values.slice(-window);
  if (recent.length === 0) return 0;
  return recent.reduce((sum, value) => sum + value * value, 0) / recent.length;
}

export function predict(c3: number, c4: number): { hand: Hand; confidence: number } {
  const ratio = Math.log((c3 + 0.01) / (c4 + 0.01));
  return {
    hand: ratio > 0 ? "left" : "right",
    confidence: Math.min(99, Math.round(50 + Math.abs(ratio) * 28)),
  };
}
