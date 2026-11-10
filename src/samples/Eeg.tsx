"use client";

import { useEffect, useRef, useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { action, chip, panel } from "./controls";
import { createSignal, power, predict, type Hand } from "./eeg/signal";
import { reducedMotion } from "./motion";

const WIDTH = 640;
const HEIGHT = 56;
const TICK_MS = 33;
const SAMPLES_PER_TICK = 2;
const READ_EVERY = 5;
const FULL_BAR = 45;

const TRACES = [
  { label: "C3 · raw", clean: false, gain: 0.75 },
  { label: "C4 · raw", clean: false, gain: 0.75 },
  { label: "C3 · 8 to 30 Hz", clean: true, gain: 1.5 },
  { label: "C4 · 8 to 30 Hz", clean: true, gain: 1.5 },
];
const HANDS: { id: Hand; label: string }[] = [
  { id: "left", label: "Left hand" },
  { id: "right", label: "Right hand" },
];

function draw(
  canvas: HTMLCanvasElement | null,
  values: number[],
  color: string,
  gain: number,
) {
  const context = canvas?.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.strokeStyle = color;
  context.lineWidth = 1.5;
  context.beginPath();
  const offset = WIDTH - values.length;
  values.forEach((value, index) => {
    const y = HEIGHT / 2 + value * gain;
    if (index === 0) context.moveTo(offset, y);
    else context.lineTo(offset + index, y);
  });
  context.stroke();
}

export default function Eeg({}: SampleProps<Extract<SampleSpec, { kind: "eeg" }>>) {
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const signal = useRef<ReturnType<typeof createSignal> | null>(null);
  const traces = useRef<number[][]>([[], [], [], []]);
  const ticks = useRef(0);
  const [clean, setClean] = useState(false);
  const [hand, setHand] = useState<Hand>("left");
  const [bands, setBands] = useState({ c3: 0, c4: 0 });
  const [playing, setPlaying] = useState(() => !reducedMotion());

  function record(current: Hand) {
    signal.current ??= createSignal(Math.random);
    const reading = signal.current(current);
    const values = [...reading.raw, ...reading.clean];
    traces.current.forEach((trace, index) => {
      trace.push(values[index]);
      if (trace.length > WIDTH) trace.shift();
    });
  }

  function paint(filtered: boolean) {
    const styles = getComputedStyle(document.documentElement);
    TRACES.forEach((trace, index) => {
      const hidden = trace.clean && !filtered;
      draw(
        canvases.current[index],
        hidden ? [] : traces.current[index],
        styles.getPropertyValue(trace.clean ? "--accent" : "--muted"),
        trace.gain,
      );
    });
  }

  const read = () =>
    setBands({ c3: power(traces.current[2]), c4: power(traces.current[3]) });

  // Fill the traces once, so a paused sample still shows a signal.
  useEffect(() => {
    for (let i = 0; i < WIDTH; i++) record("left");
    read();
  }, []);

  useEffect(() => {
    paint(clean);
  }, [clean]);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      for (let i = 0; i < SAMPLES_PER_TICK; i++) record(hand);
      paint(clean);
      ticks.current += 1;
      if (ticks.current % READ_EVERY === 0) read();
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, hand, clean]);

  const prediction = predict(bands.c3, bands.c4);
  const handLabel = HANDS.find((option) => option.id === prediction.hand)!.label;

  return (
    <div className={panel}>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          aria-pressed={clean}
          onClick={() => setClean(!clean)}
          className={
            clean
              ? "cursor-pointer rounded border border-accent bg-accent px-2.5 py-1 text-bg"
              : action
          }
        >
          Remove noise
        </button>
        <span className="ml-auto pr-1 text-muted">Imagined movement</span>
        {HANDS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={hand === option.id}
            onClick={() => setHand(option.id)}
            className={chip(hand === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {TRACES.map((trace, index) => (
          <div key={trace.label}>
            <p className="text-muted">
              {trace.label}
              {trace.clean && !clean && " · noise not removed yet"}
            </p>
            <canvas
              ref={(element) => {
                canvases.current[index] = element;
              }}
              width={WIDTH}
              height={HEIGHT}
              aria-hidden="true"
              className="block h-12 w-full"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[auto_1fr_2rem] items-center gap-x-3 gap-y-1.5">
        {[bands.c3, bands.c4].map((band, index) => (
          <div key={index} className="contents">
            <span className="text-muted">CSP {index + 1}</span>
            <div className="h-2.5 overflow-hidden rounded-full border border-line bg-bg">
              <div
                className="h-full bg-accent"
                style={{ width: clean ? `${Math.min(100, (band / FULL_BAR) * 100)}%` : 0 }}
              />
            </div>
            <span className="text-right tabular-nums">{clean ? Math.round(band) : "–"}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-muted">Classifier</span>
        <span
          aria-live="polite"
          className={`font-sans text-sm font-medium ${clean ? "text-accent" : "text-muted"}`}
        >
          {clean ? handLabel : "Remove noise first"}
        </span>
        <span className="tabular-nums">{clean ? `${prediction.confidence}% sure` : ""}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-muted">
        <span>Synthetic signals, not recorded EEG.</span>
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="cursor-pointer rounded border border-line px-2 py-0.5 text-text hover:text-accent"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
