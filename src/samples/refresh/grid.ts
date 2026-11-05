import type { Cell } from "./cooling";

export type Month = { id: string; file: string };

export function parseGrid(csv: string): Cell[] {
  const [header, ...rows] = csv.trim().split("\n");
  if (header.trim() !== "lat,lon,temp") throw new Error("Unexpected grid header");
  if (rows.length === 0) throw new Error("Grid has no rows");
  return rows.map((row) => {
    const [lat, lon, temp] = row.split(",").map(Number);
    return { lat, lon, temp };
  });
}

export async function fetchGrid(month: Month): Promise<Cell[]> {
  const response = await fetch(`/samples/refresh/${month.file}`);
  if (!response.ok) throw new Error(`Status ${response.status}`);
  return parseGrid(await response.text());
}
