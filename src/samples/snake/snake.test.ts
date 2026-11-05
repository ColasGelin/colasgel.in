import { describe, expect, test } from "vitest";
import {
  ACTIONS,
  MAX_IDLE_STEPS,
  createGame,
  encodeState,
  step,
  type Game,
} from "./engine";
import fixtures from "./fixtures.json";
import { chooseAction, qValues, type Weights } from "./network";
import { readFileSync } from "node:fs";

const UP = 0;
const DOWN = 1;
const LEFT = 2;

function game(overrides: Partial<Game> = {}): Game {
  return {
    body: [
      [5, 5],
      [6, 5],
      [7, 5],
    ],
    direction: [-1, 0],
    length: 3,
    apples: [{ position: [0, 0], color: "green" }],
    over: false,
    idle: 0,
    rng: () => 0,
    ...overrides,
  };
}

describe("network", () => {
  for (const [sessions, expected] of Object.entries(fixtures.qValues)) {
    test(`matches PyTorch for ${sessions} sessions`, () => {
      const weights: Weights = JSON.parse(
        readFileSync(`public/samples/snake/sess-${sessions}.json`, "utf8"),
      );
      fixtures.positions.forEach((position, index) => {
        const actual = qValues(weights, position.state);
        expect(actual).toHaveLength(4);
        actual.forEach((value, i) => {
          expect(Math.abs(value - expected[index][i])).toBeLessThan(1e-3);
        });
      });
    });
  }

  test("chooseAction picks the highest Q value", () => {
    const weights: Weights = {
      layers: [
        {
          weight: [
            [0, 0],
            [0, 0],
            [0, 0],
            [0, 0],
          ],
          bias: [1, 3, 2, 0],
        },
      ],
    };
    expect(chooseAction(weights, [0, 0])).toBe(1);
  });
});

describe("encodeState", () => {
  test.each(fixtures.positions.map((p, i) => [i, p] as const))(
    "matches Python for position %i",
    (_, position) => {
      const state = encodeState(position.game as Game);
      expect(state).toHaveLength(24);
      state.forEach((value, i) => {
        expect(Math.abs(value - position.state[i])).toBeLessThan(1e-6);
      });
    },
  );
});

describe("step", () => {
  test("ACTIONS match the training order", () => {
    expect(ACTIONS).toEqual([
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]);
  });

  test("moving forward keeps the length", () => {
    const next = step(game(), LEFT);
    expect(next.body).toEqual([
      [4, 5],
      [5, 5],
      [6, 5],
    ]);
    expect(next.over).toBe(false);
  });

  test("does not mutate its input", () => {
    const start = game();
    step(start, LEFT);
    expect(start.body[0]).toEqual([5, 5]);
  });

  test("hitting a wall ends the game", () => {
    const start = game({
      body: [
        [0, 5],
        [1, 5],
        [2, 5],
      ],
    });
    expect(step(start, LEFT).over).toBe(true);
  });

  test("hitting the body ends the game", () => {
    const next = step(game({ direction: [1, 0] }), 3);
    expect(next.over).toBe(true);
  });

  test("a green apple grows the snake and is replaced", () => {
    const next = step(
      game({ apples: [{ position: [4, 5], color: "green" }] }),
      LEFT,
    );
    expect(next.length).toBe(4);
    expect(next.apples).toHaveLength(1);
    expect(next.apples[0].position).not.toEqual([4, 5]);
  });

  test("a red apple shrinks the snake", () => {
    const next = step(
      game({ apples: [{ position: [4, 5], color: "red" }] }),
      LEFT,
    );
    expect(next.length).toBe(2);
  });

  test("the game ends after MAX_IDLE_STEPS with no apple eaten", () => {
    let current = game();
    const loop = [UP, LEFT, DOWN, 3];
    let steps = 0;
    while (!current.over && steps < MAX_IDLE_STEPS + 10) {
      current = step(current, loop[steps % 4]);
      steps += 1;
    }
    expect(current.over).toBe(true);
    expect(steps).toBe(MAX_IDLE_STEPS);
  });

  test("createGame starts with 3 cells, 1 red and 2 green apples", () => {
    const start = createGame(Math.random);
    expect(start.body).toHaveLength(3);
    expect(start.apples.filter((a) => a.color === "red")).toHaveLength(1);
    expect(start.apples.filter((a) => a.color === "green")).toHaveLength(2);
  });
});
