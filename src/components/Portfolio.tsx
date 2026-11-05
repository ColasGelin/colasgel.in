"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { entries } from "@/content/entries";
import { filterEntries, resolveSelection } from "@/content/select";
import type { Filter } from "@/content/types";
import { EntryList } from "./EntryList";
import { FeaturedWork } from "./FeaturedWork";
import { Filters } from "./Filters";
import { Header } from "./Header";
import { Stage } from "./Stage";
import {
  COLLAPSE_DISTANCE,
  prefersReducedMotion,
  useCompactHeader,
} from "./useCompactHeader";
import { useIsPhone } from "./useIsPhone";

const LANDED_MS = 1800;

export function Portfolio() {
  const isPhone = useIsPhone();
  const compact = useCompactHeader();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(entries[0].id);
  const [closed, setClosed] = useState(true);
  const [landedId, setLandedId] = useState<string | null>(null);

  const selected = entries.find((entry) => entry.id === selectedId)!;

  const open = useCallback((id: string) => {
    setFilter("all");
    setSelectedId(id);
    setClosed(false);
    setLandedId(id);
  }, []);

  useEffect(() => {
    function followHash() {
      const id = window.location.hash.slice(1);
      if (entries.some((entry) => entry.id === id)) open(id);
    }
    followHash();
    window.addEventListener("hashchange", followHash);
    return () => window.removeEventListener("hashchange", followHash);
  }, [open]);

  useEffect(() => {
    if (!landedId) return;
    const target = isPhone
      ? document.getElementById(`entry-${landedId}`)
      : document.getElementById("showcase");
    target?.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    const timer = setTimeout(() => setLandedId(null), LANDED_MS);
    return () => clearTimeout(timer);
  }, [landedId, isPhone]);

  useEffect(() => {
    if (!isPhone || closed || landedId) return;
    document
      .getElementById(`entry-${selectedId}`)
      ?.scrollIntoView({ block: "start" });
  }, [isPhone, closed, selectedId, landedId]);

  // Visitors who click instead of scrolling get the extra room too.
  function collapseHeader() {
    if (isPhone || prefersReducedMotion() || window.scrollY > 0) return;
    window.scrollTo({ top: COLLAPSE_DISTANCE, behavior: "smooth" });
  }

  function openFromLink(id: string, event: MouseEvent) {
    event.preventDefault();
    window.history.pushState(null, "", `#${id}`);
    open(id);
  }

  function changeFilter(next: Filter) {
    collapseHeader();
    setFilter(next);
    setSelectedId(resolveSelection(entries, next, selectedId));
  }

  function select(id: string) {
    collapseHeader();
    setClosed(isPhone && id === selectedId && !closed);
    setSelectedId(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <>
      <Header compact={compact} />
      <FeaturedWork onOpen={openFromLink} />
      <section
        id="showcase"
        aria-labelledby="showcase-heading"
        className="scroll-mt-16 pt-8"
      >
        <h2 id="showcase-heading" className="mb-3 font-mono text-xs text-muted">
          All work
        </h2>
        <div className="grid gap-8 md:grid-cols-12">
          <div className="min-w-0 md:col-span-5">
            <Filters active={filter} onChange={changeFilter} />
            <div className="mt-3">
              <EntryList
                entries={filterEntries(entries, filter)}
                selectedId={isPhone && closed ? null : selectedId}
                landedId={landedId}
                showStageInRow={isPhone}
                onSelect={select}
              />
            </div>
          </div>
          <div className="hidden min-w-0 md:col-span-7 md:block">
            {!isPhone && (
              <div className="md:sticky md:top-20">
                <Stage entry={selected} landed={selected.id === landedId} />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
