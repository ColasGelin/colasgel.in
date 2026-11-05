"use client";

import { useState } from "react";
import { entries } from "@/content/entries";
import { profile } from "@/content/profile";
import { filterEntries, resolveSelection } from "@/content/select";
import type { Filter } from "@/content/types";
import { EntryList } from "./EntryList";
import { Filters } from "./Filters";
import { Stage } from "./Stage";
import { useIsPhone } from "./useIsPhone";

export function Portfolio() {
  const isPhone = useIsPhone();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(entries[0].id);
  const [closed, setClosed] = useState(true);

  const selected = entries.find((entry) => entry.id === selectedId)!;

  function changeFilter(next: Filter) {
    setFilter(next);
    setSelectedId(resolveSelection(entries, next, selectedId));
  }

  function select(id: string) {
    setClosed(isPhone && id === selectedId && !closed);
    setSelectedId(id);
  }

  return (
    <div className="mt-5 grid gap-8 md:grid-cols-12">
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
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {profile.alsoBuilt.text}{" "}
          <a
            href={profile.alsoBuilt.link.href}
            className="text-accent hover:underline"
          >
            {profile.alsoBuilt.link.label}
          </a>
        </p>
      </div>
      {!isPhone && (
        <div className="min-w-0 md:col-span-7">
          <div className="md:sticky md:top-5">
            <Stage entry={selected} />
          </div>
        </div>
      )}
    </div>
  );
}
