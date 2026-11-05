"use client";

import { useEffect, useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { parseRecording, type Recording } from "./recording";

const button =
  "cursor-pointer rounded border border-line px-2 py-0.5 font-mono text-xs hover:text-accent";

export default function Replay({
  spec,
  onError,
}: SampleProps<Extract<SampleSpec, { kind: "replay" }>>) {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    let cancelled = false;
    fetch(spec.src)
      .then((response) => {
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return response.json();
      })
      .then((json) => {
        if (!cancelled) setRecording(parseRecording(json));
      })
      .catch((error) => {
        if (!cancelled) onError(error);
      });
    return () => {
      cancelled = true;
    };
  }, [spec.src, onError]);

  const last = recording ? recording.steps.length - 1 : 0;
  const finished = index >= last;

  useEffect(() => {
    if (!recording || !playing || finished) return;
    const delay = recording.steps[index + 1].t - recording.steps[index].t;
    const timer = setTimeout(() => setIndex((i) => i + 1), delay * 1000);
    return () => clearTimeout(timer);
  }, [recording, playing, finished, index]);

  if (!recording) {
    return (
      <p className="rounded border border-line bg-surface p-4 font-mono text-sm text-muted">
        Loading sample
      </p>
    );
  }

  return (
    <div className="rounded border border-line bg-surface p-4">
      <ol className="flex min-h-40 flex-col gap-2 font-mono text-sm">
        {recording.steps.slice(0, index + 1).map((step) => (
          <li key={step.label} className="grid grid-cols-[5rem_1fr] gap-2">
            <span className="text-accent">{step.label}</span>
            <span>{step.output}</span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex gap-2">
        {finished ? (
          <button
            type="button"
            className={button}
            onClick={() => {
              setIndex(0);
              setPlaying(true);
            }}
          >
            Replay
          </button>
        ) : (
          <>
            <button
              type="button"
              className={button}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              className={button}
              onClick={() => setIndex(index + 1)}
            >
              Step
            </button>
          </>
        )}
      </div>
    </div>
  );
}
