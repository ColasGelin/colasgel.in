"use client";

import { useEffect, useState } from "react";
import { entries } from "@/content/entries";
import { filterEntries, resolveSelection } from "@/content/select";
import type { Filter } from "@/content/types";
import { EntryList } from "./EntryList";
import { Filters } from "./Filters";
import { Header } from "./Header";
import { Stage } from "./Stage";
import {
  COLLAPSE_DISTANCE,
  prefersReducedMotion,
  useCompactHeader,
} from "./useCompactHeader";
import { useIsPhone } from "./useIsPhone";

export function Portfolio() {
  const isPhone = useIsPhone();
  const compact = useCompactHeader();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(entries[0].id);
  const [closed, setClosed] = useState(true);

  const selected = entries.find((entry) => entry.id === selectedId)!;

  useEffect(() => {
    if (!isPhone || closed) return;
    document
      .getElementById(`entry-${selectedId}`)
      ?.scrollIntoView({ block: "start" });
  }, [isPhone, closed, selectedId]);

  // Visitors who click instead of scrolling get the extra room too.
  function collapseHeader() {
    if (isPhone || prefersReducedMotion() || window.scrollY > 0) return;
    window.scrollTo({ top: COLLAPSE_DISTANCE, behavior: "smooth" });
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
  }

  return (
    <>
      <Header compact={compact} />
      <div className="grid gap-8 pt-5 md:grid-cols-12">
      <div className="min-w-0 md:col-span-5">
        <Filters active={filter} onChange={changeFilter} />
        <div className="mt-3">
          <EntryList
            entries={filterEntries(entries, filter)}
            selectedId={isPhone && closed ? null : selectedId}
            showStageInRow={isPhone}
            onSelect={select}
          />
        </div>
      </div>
      {!isPhone && (
        <div className="min-w-0 md:col-span-7">
          <div className="md:sticky md:top-20">
            <Stage entry={selected} />
          </div>
        </div>
      )}
      </div>
    </>
  );
}
