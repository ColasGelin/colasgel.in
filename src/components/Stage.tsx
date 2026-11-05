"use client";

import { Suspense } from "react";
import { sampleLabel } from "@/content/select";
import type { Entry, SampleSpec } from "@/content/types";
import { loadSample } from "@/samples";
import { SampleBoundary } from "./SampleBoundary";

const box = "rounded border border-line bg-surface";

function Sample({ spec }: { spec: SampleSpec }) {
  const Component = loadSample(spec);
  return (
    <SampleBoundary
      fallback={
        <p className={`${box} p-4 font-mono text-sm text-muted`}>
          Sample unavailable. The description below still applies.
        </p>
      }
    >
      {(onError) => (
        <Suspense
          fallback={
            <p className={`${box} p-4 font-mono text-sm text-muted`}>
              Loading sample
            </p>
          }
        >
          <Component spec={spec} onError={onError} />
        </Suspense>
      )}
    </SampleBoundary>
  );
}

export function Stage({ entry }: { entry: Entry }) {
  const label = sampleLabel(entry.sample);
  const caption =
    entry.sample && "caption" in entry.sample && entry.sample.kind !== "diagram"
      ? entry.sample.caption
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 aria-live="polite" className="text-lg font-medium">
          {entry.name}
        </h2>
        {label && (
          <span className="shrink-0 rounded border border-line px-2 py-0.5 font-mono text-xs text-accent">
            {label}
          </span>
        )}
      </div>
      {entry.dates && (
        <p className="-mt-3 font-mono text-xs text-muted">{entry.dates}</p>
      )}
      {entry.sample && <Sample key={entry.id} spec={entry.sample} />}
      {caption && <p className="text-sm text-muted">{caption}</p>}
      <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed">
        {entry.built.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="font-mono text-xs text-muted">{entry.stack.join(" · ")}</p>
      {entry.link && (
        <a
          href={entry.link.href}
          className="font-mono text-sm text-accent hover:underline"
        >
          {entry.link.label}
        </a>
      )}
    </div>
  );
}
