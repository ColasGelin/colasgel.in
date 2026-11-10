import { describe, expect, test } from "vitest";
import { apply, createLanes, suggest, tick, waiting, type Lane } from "./sim";

const always = () => 0;
const never = () => 1;
const lane = (open: boolean, queue: number, closing = false): Lane => ({
  open,
  closing,
  queue,
  served: 0,
});

describe("queue simulation", () => {
  test("starts with one open till and a short queue", () => {
    const lanes = createLanes();
    expect(lanes.filter((l) => l.open)).toHaveLength(1);
    expect(waiting(lanes)).toBe(4);
  });

  test("a new customer joins the shortest open till", () => {
    const next = tick([lane(true, 3), lane(true, 1), lane(false, 0)], "rush", always);
    expect(next.map((l) => l.queue)).toEqual([3, 2, 0]);
  });

  test("nobody joins a closed or closing till", () => {
    const next = tick([lane(true, 5), lane(true, 0, true), lane(false, 0)], "rush", always);
    expect(next.map((l) => l.queue)).toEqual([6, 0, 0]);
  });

  test("a till serves one customer every 1.5 seconds", () => {
    let lanes = [lane(true, 2)];
    for (let i = 0; i < 6; i++) lanes = tick(lanes, "quiet", never);
    expect(lanes[0].queue).toBe(1);
  });

  test("a closing till closes once it is empty", () => {
    let lanes = [lane(true, 0), lane(true, 1, true)];
    for (let i = 0; i < 6; i++) lanes = tick(lanes, "quiet", never);
    expect(lanes[1]).toMatchObject({ open: false, closing: false, queue: 0 });
  });

  test("tick does not change its input", () => {
    const lanes = [lane(true, 2)];
    tick(lanes, "rush", always);
    expect(lanes[0]).toEqual(lane(true, 2));
  });

  test("long queues suggest opening the first closed till", () => {
    expect(suggest([lane(true, 5), lane(false, 0), lane(false, 0)])).toMatchObject({
      type: "open",
      lane: 1,
    });
  });

  test("short queues suggest closing the last open till", () => {
    expect(suggest([lane(true, 1), lane(true, 0), lane(false, 0)])).toMatchObject({
      type: "close",
      lane: 1,
    });
  });

  test("a single open till is never closed, and steady queues need nothing", () => {
    expect(suggest([lane(true, 0), lane(false, 0)])).toBeNull();
    expect(suggest([lane(true, 2), lane(true, 3)])).toBeNull();
  });

  test("with every till open there is nothing to open", () => {
    expect(suggest([lane(true, 9), lane(true, 9)])).toBeNull();
  });

  test("approving opens or starts closing the till", () => {
    const lanes = [lane(true, 5), lane(false, 0)];
    const opened = apply(lanes, { type: "open", lane: 1, average: 5 });
    expect(opened[1].open).toBe(true);
    const closing = apply(opened, { type: "close", lane: 1, average: 1 });
    expect(closing[1].closing).toBe(true);
  });

  test("approving a stale close never shuts the last till", () => {
    const lanes = [lane(true, 0), lane(false, 0)];
    expect(apply(lanes, { type: "close", lane: 0, average: 0 })[0].closing).toBe(false);
  });
});
