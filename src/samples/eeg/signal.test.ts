import { describe, expect, test } from "vitest";
import { createSignal, power, predict, type Hand } from "./signal";

function record(next: ReturnType<typeof createSignal>, hand: Hand, count: number) {
  const c3: number[] = [];
  const c4: number[] = [];
  for (let i = 0; i < count; i++) {
    const reading = next(hand);
    c3.push(reading.clean[0]);
    c4.push(reading.clean[1]);
  }
  return { c3: power(c3), c4: power(c4) };
}

describe("EEG signal", () => {
  test("imagining the left hand quiets the right side", () => {
    const { c3, c4 } = record(createSignal(Math.random), "left", 400);
    expect(c3).toBeGreaterThan(c4 * 3);
    expect(predict(c3, c4).hand).toBe("left");
  });

  test("the prediction follows a switch to the right hand", () => {
    const next = createSignal(Math.random);
    record(next, "left", 400);
    const { c3, c4 } = record(next, "right", 600);
    expect(predict(c3, c4)).toMatchObject({ hand: "right" });
    expect(predict(c3, c4).confidence).toBeGreaterThan(80);
  });

  test("the raw signal is much noisier than the clean one", () => {
    const next = createSignal(Math.random);
    const raw: number[] = [];
    const clean: number[] = [];
    for (let i = 0; i < 400; i++) {
      const reading = next("left");
      raw.push(reading.raw[1]);
      clean.push(reading.clean[1]);
    }
    expect(power(raw)).toBeGreaterThan(power(clean) * 5);
  });

  test("power of nothing is zero", () => {
    expect(power([])).toBe(0);
  });

  test("equal power is a coin flip, and confidence is capped", () => {
    expect(predict(10, 10).confidence).toBe(50);
    expect(predict(1000, 0).confidence).toBe(99);
  });
});
