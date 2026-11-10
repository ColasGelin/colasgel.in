export type Lane = { open: boolean; closing: boolean; queue: number; served: number };
export type Level = "quiet" | "busy" | "rush";
export type Suggestion = { type: "open" | "close"; lane: number; average: number };

// Customers arriving per second. Illustrative values, not measured ones.
export const ARRIVALS: Record<Level, number> = { quiet: 0.35, busy: 1, rush: 2.1 };
export const TICK_SECONDS = 0.25;
const SERVICE_SECONDS = 1.5;
const MAX_QUEUE = 14;
const OPEN_ABOVE = 3.5;
const CLOSE_BELOW = 1.2;

export function createLanes(): Lane[] {
  return [0, 1, 2, 3].map((index) => ({
    open: index === 0,
    closing: false,
    queue: index === 0 ? 4 : 0,
    served: 0,
  }));
}

const taking = (lane: Lane) => lane.open && !lane.closing;

export function waiting(lanes: Lane[]): number {
  return lanes.reduce((sum, lane) => sum + lane.queue, 0);
}

export function tick(lanes: Lane[], level: Level, random: () => number): Lane[] {
  const next = lanes.map((lane) => ({ ...lane }));
  const live = next.filter(taking);
  if (live.length > 0 && random() < ARRIVALS[level] * TICK_SECONDS) {
    const shortest = live.reduce((best, lane) => (lane.queue < best.queue ? lane : best));
    if (shortest.queue < MAX_QUEUE) shortest.queue += 1;
  }
  for (const lane of next) {
    if (!lane.open) continue;
    if (lane.queue > 0) {
      lane.served += TICK_SECONDS;
      if (lane.served >= SERVICE_SECONDS) {
        lane.served = 0;
        lane.queue -= 1;
      }
    }
    if (lane.closing && lane.queue === 0) {
      lane.open = false;
      lane.closing = false;
    }
  }
  return next;
}

// What the agent would propose. Nothing changes until the operator approves it.
export function suggest(lanes: Lane[]): Suggestion | null {
  const live = lanes.filter(taking);
  if (live.length === 0) return null;
  const average = waiting(live) / live.length;
  const closed = lanes.findIndex((lane) => !lane.open);
  if (average > OPEN_ABOVE && closed >= 0) return { type: "open", lane: closed, average };
  if (average < CLOSE_BELOW && live.length > 1) {
    return { type: "close", lane: lanes.lastIndexOf(live[live.length - 1]), average };
  }
  return null;
}

export function apply(lanes: Lane[], suggestion: Suggestion): Lane[] {
  return lanes.map((lane, index) => {
    if (index !== suggestion.lane) return lane;
    if (suggestion.type === "open") return { ...lane, open: true, closing: false, served: 0 };
    return lanes.filter(taking).length > 1 ? { ...lane, closing: true } : lane;
  });
}
