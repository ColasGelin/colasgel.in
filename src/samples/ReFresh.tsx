"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { averageTemp, type Cell, type Zone } from "./refresh/cooling";
import { fetchGrid, type Month } from "./refresh/grid";

const HeatScene = dynamic(() => import("./refresh/HeatScene"), { ssr: false });

const controls =
  "cursor-pointer rounded border border-line bg-bg px-2 py-0.5 font-mono text-xs hover:text-accent";

export default function ReFresh({
  onError,
}: SampleProps<Extract<SampleSpec, { kind: "refresh" }>>) {
  const [months, setMonths] = useState<Month[]>([]);
  const [monthId, setMonthId] = useState("");
  const [cells, setCells] = useState<Cell[] | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [monthFailed, setMonthFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch("/samples/refresh/months.json");
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const list: Month[] = await response.json();
      const latest = list[list.length - 1];
      const grid = await fetchGrid(latest);
      if (cancelled) return;
      setMonths(list);
      setMonthId(latest.id);
      setCells(grid);
    })().catch((error) => {
      if (!cancelled) onError(error);
    });
    return () => {
      cancelled = true;
    };
  }, [onError]);

  async function changeMonth(id: string) {
    const month = months.find((m) => m.id === id)!;
    try {
      const grid = await fetchGrid(month);
      setCells(grid);
      setMonthId(id);
      setMonthFailed(false);
    } catch {
      setMonthFailed(true);
    }
  }

  if (!cells) {
    return (
      <p className="rounded border border-line bg-surface p-4 font-mono text-sm text-muted">
        Loading sample
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <HeatScene
        cells={cells}
        zones={zones}
        onPlace={(zone) => setZones([...zones, zone])}
      />
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
        <label className="flex items-center gap-2 text-muted">
          Month
          <select
            value={monthId}
            onChange={(event) => changeMonth(event.target.value)}
            className={controls}
          >
            {months.map((month) => (
              <option key={month.id} value={month.id}>
                {month.id}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setZones([])}
          className={controls}
        >
          Clear zones
        </button>
        <span>Average {averageTemp(cells, zones).toFixed(1)} °C</span>
      </div>
      <p className="font-mono text-xs text-muted">
        Click the map to add a green zone. Cooling uses an approximate model.
      </p>
      {monthFailed && (
        <p className="font-mono text-xs text-muted">
          Couldn&apos;t load that month.
        </p>
      )}
    </div>
  );
}
