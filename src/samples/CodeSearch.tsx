"use client";

import { useRef, useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { chip, panel } from "./controls";
import { FILES, SCENARIOS, type Scenario } from "./codesearch/scenarios";
import { useWait } from "./motion";

type Phase = "search" | "patch" | "validate" | "done";

const pill = "rounded-full border px-2.5 py-0.5";
const tone = {
  idle: "border-line text-muted",
  running: "border-[#c4b5fd] text-[#c4b5fd]",
  passed: "border-accent text-accent",
  failed: "border-[#fda4af] text-[#fda4af]",
};

function message(scenario: Scenario, phase: Phase) {
  if (phase === "search") return "Searching the vector store…";
  if (scenario.kind === "ask") return scenario.answer;
  if (phase === "patch") return `Three chunks retrieved. Patching ${scenario.patch}.`;
  if (phase === "validate") return "Running the checks on the patch.";
  return scenario.result;
}

function Steps({ passes, phase }: { passes: boolean; phase: Phase }) {
  const done = phase === "done";
  const outcome = passes ? tone.passed : tone.failed;
  const patch = phase === "patch" ? tone.running : phase === "search" ? tone.idle : tone.passed;
  const validate =
    phase === "validate" ? tone.running : done ? outcome : tone.idle;
  return (
    <ol aria-label="Patch loop" className="flex flex-wrap items-center gap-1.5">
      <li className={`${pill} ${phase === "search" ? tone.running : tone.passed}`}>Retrieve</li>
      <li className={`${pill} ${patch}`}>Patch</li>
      <li className={`${pill} ${validate}`}>Validate</li>
      <li className={`${pill} ${done ? outcome : tone.idle}`}>
        {passes ? "Kept" : "Rolled back"}
      </li>
    </ol>
  );
}

export default function CodeSearch({}: SampleProps<
  Extract<SampleSpec, { kind: "codesearch" }>
>) {
  const [active, setActive] = useState(0);
  const [found, setFound] = useState(SCENARIOS[0].hits.length);
  const [phase, setPhase] = useState<Phase>("done");
  const run = useRef(0);
  const wait = useWait();
  const scenario = SCENARIOS[active];
  const hits = scenario.hits.slice(0, found);

  async function start(index: number) {
    const id = ++run.current;
    const stale = () => id !== run.current;
    const next = SCENARIOS[index];
    setActive(index);
    setFound(0);
    setPhase("search");
    await wait(600);
    for (let count = 1; count <= next.hits.length; count++) {
      if (stale()) return;
      setFound(count);
      await wait(350);
    }
    if (stale()) return;
    if (next.kind === "change") {
      setPhase("patch");
      await wait(900);
      if (stale()) return;
      setPhase("validate");
      await wait(900);
      if (stale()) return;
    }
    setPhase("done");
  }

  return (
    <div className={panel}>
      {(["ask", "change"] as const).map((kind) => (
        <div key={kind} className="flex flex-wrap items-center gap-1">
          <span className="w-12 text-muted">{kind === "ask" ? "Ask" : "Change"}</span>
          {SCENARIOS.map(
            (option, index) =>
              option.kind === kind && (
                <button
                  key={option.prompt}
                  type="button"
                  aria-pressed={active === index}
                  onClick={() => start(index)}
                  className={`${chip(active === index)} text-left`}
                >
                  {option.prompt}
                </button>
              ),
          )}
        </div>
      ))}
      <p className="text-muted">Vector store · {FILES.length} code chunks</p>
      <ul aria-label="Code chunks" className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {FILES.map((file, index) => {
          const hit = hits.find((candidate) => candidate.file === index);
          return (
            <li
              key={file}
              data-hit={hit ? "true" : "false"}
              className={`flex justify-between gap-2 rounded-sm border px-2 py-1 transition-colors ${
                hit ? "border-accent bg-accent text-bg" : "border-line bg-bg text-muted"
              }`}
            >
              <span className="truncate">{file}</span>
              {hit && <span>{hit.score.toFixed(2)}</span>}
            </li>
          );
        })}
      </ul>
      <div
        aria-live="polite"
        className="flex min-h-20 flex-col gap-2 rounded border border-line bg-bg p-2.5"
      >
        <p className="font-sans text-sm leading-relaxed">{message(scenario, phase)}</p>
        {scenario.kind === "change" && <Steps passes={scenario.passes} phase={phase} />}
      </div>
      <p className="text-muted">Illustrative codebase and scores.</p>
    </div>
  );
}
