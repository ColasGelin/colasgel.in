import type { Game } from "./engine";
import { encodeState } from "./engine";

export type Weights = {
  layers: { weight: number[][]; bias: number[] }[];
};

export function qValues(weights: Weights, state: number[]): number[] {
  let values = state;
  weights.layers.forEach((layer, index) => {
    const next = layer.weight.map((row, i) => {
      const sum = row.reduce((total, w, j) => total + w * values[j], 0);
      return sum + layer.bias[i];
    });
    const isLast = index === weights.layers.length - 1;
    values = isLast ? next : next.map((value) => Math.max(0, value));
  });
  return values;
}

export function chooseAction(weights: Weights, state: number[]): number {
  const values = qValues(weights, state);
  return values.indexOf(Math.max(...values));
}

export function nextAction(weights: Weights, game: Game): number {
  return chooseAction(weights, encodeState(game));
}
