import { describe, expect, test } from "vitest";
import {
  adjustedTemp,
  averageTemp,
  cellPosition,
  coolingAt,
} from "./cooling";
import { parseGrid } from "./grid";

describe("coolingAt", () => {
  test.each([
    [0, 5],
    [4.9, 5],
    [5, 4],
    [10, 3],
    [15, 2],
    [20, 1],
    [25, 0],
    [100, 0],
  ])("at distance %d cools by %d", (distance, expected) => {
    expect(coolingAt(distance)).toBe(expected);
  });
});

describe("cellPosition", () => {
  test("maps the grid corner like the source project", () => {
    expect(cellPosition({ lat: 0, lon: 0 })).toEqual({ x: -125, z: -110 });
  });

  test("maps the grid centre to the origin", () => {
    expect(cellPosition({ lat: 34, lon: 47 })).toEqual({ x: 0, z: 0 });
  });
});

describe("adjustedTemp", () => {
  const cell = { lat: 34, lon: 47, temp: 40 };
  const onCell = { x: 0, z: 0 };

  test("no zones leaves the temperature alone", () => {
    expect(adjustedTemp(cell, [], 20)).toBe(40);
  });

  test("two zones on a cell add up", () => {
    expect(adjustedTemp(cell, [onCell, onCell], 20)).toBe(30);
  });

  test("twenty zones never go below the month minimum", () => {
    expect(adjustedTemp(cell, Array(20).fill(onCell), 20)).toBe(20);
  });
});

describe("averageTemp", () => {
  const cells = [
    { lat: 0, lon: 0, temp: 20 },
    { lat: 34, lon: 47, temp: 40 },
  ];

  test("with no zones equals the plain mean", () => {
    expect(averageTemp(cells, [])).toBe(30);
  });

  test("drops with a zone", () => {
    expect(averageTemp(cells, [{ x: 0, z: 0 }])).toBe(27.5);
  });
});

describe("parseGrid", () => {
  test("reads rows", () => {
    expect(parseGrid("lat,lon,temp\n67,0,45.5\n1,2,30\n")).toEqual([
      { lat: 67, lon: 0, temp: 45.5 },
      { lat: 1, lon: 2, temp: 30 },
    ]);
  });

  test("throws on a bad header", () => {
    expect(() => parseGrid("foo,bar\n1,2")).toThrow();
  });

  test("throws with no rows", () => {
    expect(() => parseGrid("lat,lon,temp\n")).toThrow();
  });
});
