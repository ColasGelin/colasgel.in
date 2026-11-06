import type { ComponentType, MouseEvent } from "react";
import { featured, hackathons } from "@/content/featured";
import { Graph } from "@/samples/diagrams/Graph";
import { Loop } from "@/samples/diagrams/Loop";
import { SchoolMap } from "@/samples/diagrams/School";

const visuals: Record<string, ComponentType> = {
  cyberbridge: Graph,
  wisdom: Loop,
  school42: SchoolMap,
};

type Props = {
  onOpen: (id: string, event: MouseEvent) => void;
};

export function FeaturedWork({ onOpen }: Props) {
  return (
    <>
      <section aria-labelledby="featured-heading" className="pt-6">
        <h2
          id="featured-heading"
          className="mb-3 font-mono text-xs text-muted"
        >
          Featured work
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map(({ entryId, category, title, line }) => {
            const Visual = visuals[entryId];
            return (
              <a
                key={entryId}
                href={`#${entryId}`}
                onClick={(event) => onOpen(entryId, event)}
                className="group flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-accent"
              >
                <span
                  aria-hidden="true"
                  className="feature-visual flex h-40 items-center justify-center overflow-hidden border-b border-line p-3"
                >
                  <Visual />
                </span>
                <span className="flex flex-1 flex-col gap-1.5 p-4">
                  <span className="font-mono text-xs text-accent">
                    {category}
                  </span>
                  <span className="text-lg font-semibold">{title}</span>
                  <span className="flex-1 text-sm leading-relaxed text-muted">
                    {line}
                  </span>
                  <span className="mt-2 font-mono text-xs text-text">
                    View details
                    <span className="ml-1.5 inline-block transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
                      →
                    </span>
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>
      <section
        aria-labelledby="hackathon-heading"
        className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg border border-line px-4 py-2.5 font-mono text-xs"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4 text-accent"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path d="M8 4h8v7a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 3 3M16 6h4v2a3 3 0 0 1-3 3M12 15v4M8 20h8" />
        </svg>
        <h2 id="hackathon-heading" className="text-muted">
          Hackathon wins
        </h2>
        {hackathons.map(({ entryId, label }) => (
          <a
            key={entryId}
            href={`#${entryId}`}
            onClick={(event) => onOpen(entryId, event)}
            className="hover:text-accent"
          >
            <span aria-hidden="true" className="mr-3 hidden text-muted sm:inline">
              ·
            </span>
            {label} — 1st place
          </a>
        ))}
      </section>
    </>
  );
}
