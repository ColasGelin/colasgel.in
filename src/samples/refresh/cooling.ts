const GRID_WIDTH = 94;
const GRID_HEIGHT = 68;
const AREA_WIDTH = 250;
const AREA_DEPTH = 220;

export type Cell = { lat: number; lon: number; temp: number };
export type Zone = { x: number; z: number };

export const CELL_WIDTH = AREA_WIDTH / GRID_WIDTH;
export const CELL_DEPTH = AREA_DEPTH / GRID_HEIGHT;

// The source project's approximation: 5 °C up close, 1 °C less per 5 units.
export function coolingAt(distance: number): number {
  return Math.max(0, 5 - Math.floor(distance / 5));
}

export function cellPosition({
  lat,
  lon,
}: Pick<Cell, "lat" | "lon">): { x: number; z: number } {
  return {
    x: (lon - GRID_WIDTH / 2) * CELL_WIDTH,
    z: (lat - GRID_HEIGHT / 2) * CELL_DEPTH,
  };
}

export function adjustedTemp(
  cell: Cell,
  zones: Zone[],
  monthMin: number,
): number {
  const { x, z } = cellPosition(cell);
  const cooling = zones.reduce(
    (total, zone) => total + coolingAt(Math.hypot(x - zone.x, z - zone.z)),
    0,
  );
  return Math.max(cell.temp - cooling, monthMin);
}

export function averageTemp(cells: Cell[], zones: Zone[]): number {
  const monthMin = Math.min(...cells.map((cell) => cell.temp));
  const total = cells.reduce(
    (sum, cell) => sum + adjustedTemp(cell, zones, monthMin),
    0,
  );
  return total / cells.length;
}
