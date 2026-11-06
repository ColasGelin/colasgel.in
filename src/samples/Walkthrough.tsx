"use client";

import { useEffect, useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { STEPS, type Line } from "./wisdomRun";

type Progress = { lines: number; chars: number; grace: number; checks: number };

const EMPTY: Progress = { lines: 0, chars: 0, grace: 0, checks: 0 };
const MAX_LINES = 13;

const toneClass = {
  error: "text-red-400",
  success: "text-accent",
};

function wholeStep(index: number): Progress {
  const step = STEPS[index];
  return {
    lines: step.lines.length,
    chars: 0,
    grace: step.grace ?? 0,
    checks: step.checks?.items.length ?? 0,
  };
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Sparkle() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3 fill-current">
      <path d="M8 1l1.7 5.3L15 8l-5.3 1.7L8 15l-1.7-5.3L1 8l5.3-1.7z" />
    </svg>
  );
}

function TerminalLine({ line, text }: { line: Line; text: string }) {
  const llm = line.tag === "llm";
  return (
    <div
      className={`break-words whitespace-pre-wrap ${line.tone ? toneClass[line.tone] : "text-muted"}`}
    >
      {line.tag === "$" && "$ "}
      {line.tag && line.tag !== "$" && (
        <span className={llm ? "text-violet-300" : "text-muted"}>
          [{line.tag}]{" "}
        </span>
      )}
      {text}
    </div>
  );
}

export default function Walkthrough({}: SampleProps<
  Extract<SampleSpec, { kind: "walkthrough" }>
>) {
  const [index, setIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(EMPTY);

  function open(next: number) {
    if (next === index) return;
    setProgress(reducedMotion() ? wholeStep(next) : EMPTY);
    setIndex(next);
  }

  useEffect(() => {
    if (index === null || reducedMotion()) return;
    const step = STEPS[index];
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const sleep = (ms: number) =>
      new Promise((resolve) => {
        timer = setTimeout(resolve, ms);
      });

    async function play() {
      await sleep(900);
      for (let line = 0; line < step.lines.length; line++) {
        const { length } = step.lines[line].text;
        for (let chars = 2; chars < length + 2; chars += 2) {
          setProgress((p) => ({ ...p, lines: line, chars }));
          await sleep(32);
        }
        setProgress((p) => ({ ...p, lines: line + 1, chars: 0 }));
        await sleep(650);
      }
      for (let grace = 4; grace <= (step.grace ?? 0); grace += 4) {
        setProgress((p) => ({ ...p, grace }));
        await sleep(70);
      }
      const checks = step.checks?.items.length ?? 0;
      for (let done = 1; done <= checks; done++) {
        await sleep(520);
        setProgress((p) => ({ ...p, checks: done }));
      }
      if (index !== null && index < STEPS.length - 1) {
        await sleep(2200);
        if (!cancelled) {
          setProgress(EMPTY);
          setIndex(index + 1);
        }
      }
    }

    play();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [index]);

  if (index === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded border border-line bg-surface px-4 py-12 text-center">
        <p className="text-2xl font-semibold">See the agent in action</p>
        <p className="text-sm text-muted">
          A simulated run: a bug crashes the service and the agent fixes it.
        </p>
        <button
          type="button"
          onClick={() => open(0)}
          className="mt-2 flex cursor-pointer items-center gap-2.5 rounded bg-accent px-6 py-3 font-mono text-lg font-medium text-bg transition-transform hover:brightness-110 motion-safe:hover:scale-105"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 fill-current">
            <path d="M3 1l11 7-11 7z" />
          </svg>
          Start workflow
        </button>
      </div>
    );
  }

  const step = STEPS[index];
  const earlier = STEPS.slice(0, index).flatMap((s) => s.lines);
  const shown = step.lines.slice(0, progress.lines);
  const typing = progress.chars > 0 ? step.lines[progress.lines] : null;
  const items = step.checks?.items ?? [];

  return (
    <div className="flex flex-col gap-3 rounded border border-line bg-surface p-3">
      <ol
        aria-label="Steps"
        className="grid grid-cols-[repeat(auto-fit,minmax(4.25rem,1fr))] gap-1.5 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none lg:gap-1"
      >
        {STEPS.map((item, position) => {
          const now = position === index;
          const highlight = item.llm
            ? "border-violet-300 bg-violet-300/10 text-violet-300"
            : "border-accent bg-accent/10 text-accent";
          return (
            <li key={`${item.name}-${position}`} className="min-w-0">
              <button
                type="button"
                aria-current={now ? "step" : undefined}
                onClick={() => open(position)}
                className={`relative h-full w-full cursor-pointer rounded border-2 px-1.5 py-1.5 text-left lg:px-1 transition-colors duration-300 ${
                  now
                    ? highlight
                    : "border-line hover:border-muted text-muted"
                }`}
              >
                {item.llm && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 rounded-full bg-surface p-px ${now ? "" : "text-violet-300"}`}
                  >
                    <Sparkle />
                    <span className="sr-only">Uses the local LLM</span>
                  </span>
                )}
                <span className="block truncate text-xs font-medium lg:text-[0.7rem]">
                  {item.name}
                </span>
                <span
                  aria-hidden="true"
                  className="block truncate font-mono text-[0.65rem]"
                >
                  {item.part}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="flex min-h-7 items-center gap-2.5 text-sm text-muted">
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs ${
            step.llm
              ? "border-violet-300 text-violet-300"
              : "border-line"
          }`}
        >
          {step.llm && <Sparkle />}
          {step.llm ? "Local LLM" : "Plain code"}
        </span>
        <span aria-hidden="true">{step.say}</span>
      </div>

      <p role="status" className="sr-only">
        {`Step ${index + 1} of ${STEPS.length}: ${step.name}. ${step.say}`}
      </p>

      <div className="grid gap-2 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0 overflow-hidden rounded border border-line">
          <div className="flex justify-between gap-2 border-b border-line px-3 py-1.5 font-mono text-xs text-muted">
            <span data-testid="target">
              target:{" "}
              <span
                className={
                  step.target === "crashed" ? "text-red-400" : "text-accent"
                }
              >
                {step.target}
              </span>
            </span>
            <span>{step.attempt}</span>
          </div>
          <div className="flex h-60 flex-col justify-end overflow-hidden p-3 font-mono text-xs leading-relaxed">
            {[...earlier, ...shown].slice(-MAX_LINES).map((line, index) => (
              <TerminalLine key={index} line={line} text={line.text} />
            ))}
            {typing && (
              <TerminalLine
                line={typing}
                text={typing.text.slice(0, progress.chars)}
              />
            )}
          </div>
        </div>
        <div className="flex min-w-0 flex-col rounded border border-line">
          <div className="flex justify-between gap-2 border-b border-line px-3 py-1.5 font-mono text-xs text-muted">
            <span>{step.checks?.title ?? "Checks"}</span>
            {items.length > 0 && (
              <span>
                {progress.checks} of {items.length}
              </span>
            )}
          </div>
          <ul className="flex flex-1 flex-col gap-1.5 p-3 text-xs">
            {items.map((item, index) => {
              const done = index < progress.checks;
              const failed =
                done && step.checks?.lastFails && index === items.length - 1;
              return (
                <li
                  key={item}
                  className={`flex gap-2 ${done ? "text-text" : "text-muted"}`}
                >
                  <span
                    aria-label={failed ? "Failed" : done ? "Passed" : "Pending"}
                    className={`flex size-4 shrink-0 items-center justify-center rounded-sm border font-mono text-[0.65rem] ${
                      failed
                        ? "border-red-400 text-red-400"
                        : done
                          ? "border-accent text-accent"
                          : "border-muted"
                    }`}
                  >
                    {failed ? "✕" : done ? "✓" : ""}
                  </span>
                  {item}
                </li>
              );
            })}
          </ul>
          {step.grace !== undefined && (
            <div className="px-3 pb-3">
              <p className="mb-1 font-mono text-xs text-muted">grace period</p>
              <div className="h-1 overflow-hidden rounded bg-line">
                <div
                  className={`h-full ${step.target === "crashed" ? "bg-red-400" : "bg-accent"}`}
                  style={{ width: `${progress.grace}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
