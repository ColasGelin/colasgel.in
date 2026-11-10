"use client";

import { useEffect, useRef, useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { action, chip, panel } from "./controls";
import { reducedMotion } from "./motion";
import {
  apply,
  createLanes,
  suggest,
  tick,
  TICK_SECONDS,
  waiting,
  type Level,
  type Suggestion,
} from "./queue/sim";

const LEVELS: { id: Level; label: string }[] = [
  { id: "quiet", label: "Quiet" },
  { id: "busy", label: "Busy" },
  { id: "rush", label: "Rush hour" },
];
const TICK_MS = TICK_SECONDS * 1000;
const CHECK_EVERY = 6;
const AFTER_APPROVE = 12;
const AFTER_REJECT = 32;
const HISTORY = 120;
const SHOWN = 7;

function describe(suggestion: Suggestion) {
  const till = `till ${suggestion.lane + 1}`;
  const average = `Average queue is ${suggestion.average.toFixed(1)}.`;
  return suggestion.type === "open"
    ? `Open ${till}. ${average}`
    : `Close ${till} once it empties. ${average}`;
}

function laneState(lane: { open: boolean; closing: boolean }) {
  if (!lane.open) return "closed";
  return lane.closing ? "closing" : "open";
}

export default function Queue({}: SampleProps<Extract<SampleSpec, { kind: "queue" }>>) {
  const [lanes, setLanes] = useState(createLanes);
  const [level, setLevel] = useState<Level>("busy");
  const [pending, setPending] = useState<Suggestion | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [playing, setPlaying] = useState(() => !reducedMotion());
  const current = useRef(lanes);
  const asked = useRef(false);
  const cooldown = useRef(0);
  const sinceCheck = useRef(0);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      const next = tick(current.current, level, Math.random);
      current.current = next;
      setLanes(next);
      setHistory((values) => [...values, waiting(next)].slice(-HISTORY));
      if (asked.current) return;
      if (cooldown.current > 0) {
        cooldown.current -= 1;
        return;
      }
      sinceCheck.current += 1;
      if (sinceCheck.current < CHECK_EVERY) return;
      sinceCheck.current = 0;
      const suggestion = suggest(next);
      if (suggestion) {
        asked.current = true;
        setPending(suggestion);
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, level]);

  function answer(approved: boolean) {
    if (!pending) return;
    if (approved) {
      current.current = apply(current.current, pending);
      setLanes(current.current);
    }
    cooldown.current = approved ? AFTER_APPROVE : AFTER_REJECT;
    asked.current = false;
    setPending(null);
  }

  const peak = Math.max(8, ...history);
  const points = history
    .map((value, index) => `${index},${22 - (value / peak) * 20}`)
    .join(" ");

  return (
    <div className={panel}>
      <div className="flex flex-wrap items-center gap-1">
        <span className="pr-1 text-muted">The shop is</span>
        {LEVELS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={level === option.id}
            onClick={() => setLevel(option.id)}
            className={chip(level === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ul aria-label="Tills" className="grid grid-cols-4 gap-2">
        {lanes.map((lane, index) => (
          <li
            key={index}
            className={`flex min-h-48 flex-col items-center gap-1.5 rounded border bg-bg px-1 py-2 ${
              lane.open ? "border-accent" : "border-line"
            }`}
          >
            <span>Till {index + 1}</span>
            <span className={lane.open ? "text-accent" : "text-muted"}>
              {laneState(lane)}
            </span>
            <span className="text-[#93c5fd]">{lane.queue} seen</span>
            <span aria-hidden="true" className="flex flex-col items-center gap-0.5">
              {Array.from({ length: Math.min(lane.queue, SHOWN) }, (_, person) => (
                <span
                  key={person}
                  className="flex size-4 items-center justify-center rounded-sm border border-[#93c5fd]"
                >
                  <span className="size-2 rounded-full bg-text" />
                </span>
              ))}
            </span>
            {lane.queue > SHOWN && (
              <span className="text-muted">+{lane.queue - SHOWN}</span>
            )}
          </li>
        ))}
      </ul>
      <div
        className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded border bg-bg p-2.5 ${
          pending ? "border-[#c4b5fd]" : "border-line"
        }`}
      >
        <p aria-live="polite">
          <span className="block text-[#c4b5fd]">LangGraph agent suggests</span>
          <span className="font-sans text-sm">
            {pending ? describe(pending) : "Nothing to change."}
          </span>
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={!pending}
            onClick={() => answer(true)}
            className={action}
          >
            Approve
          </button>
          <button
            type="button"
            disabled={!pending}
            onClick={() => answer(false)}
            className={action}
          >
            Reject
          </button>
        </div>
      </div>
      <div>
        <p className="text-muted">People waiting</p>
        <svg
          viewBox={`0 0 ${HISTORY - 1} 24`}
          preserveAspectRatio="none"
          aria-hidden="true"
          className="h-10 w-full"
        >
          <polyline
            points={points}
            fill="none"
            stroke="#93c5fd"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="flex items-center justify-between gap-3 text-muted">
        <span>You are the operator. Nothing changes until you approve.</span>
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="shrink-0 cursor-pointer rounded border border-line px-2 py-0.5 text-text hover:text-accent"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
