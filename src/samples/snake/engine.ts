export const BOARD_SIZE = 10;
export const MAX_IDLE_STEPS = 300;

type Point = [number, number];

// Same order as SnakeAgent.actions: up, down, left, right.
export const ACTIONS: Point[] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

export type Apple = { position: Point; color: "green" | "red" };

export type Game = {
  body: Point[];
  direction: Point;
  length: number;
  apples: Apple[];
  over: boolean;
  idle: number;
  rng: () => number;
};

const same = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];

function emptyCell(game: Pick<Game, "body" | "apples" | "rng">): Point | null {
  const cells: Point[] = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    for (let y = 0; y < BOARD_SIZE; y++) {
      const cell: Point = [x, y];
      const taken =
        game.body.some((part) => same(part, cell)) ||
        game.apples.some((apple) => same(apple.position, cell));
      if (!taken) cells.push(cell);
    }
  }
  if (cells.length === 0) return null;
  return cells[Math.floor(game.rng() * cells.length)];
}

export function createGame(rng: () => number): Game {
  const x = Math.floor(rng() * (BOARD_SIZE - 2));
  const y = Math.floor(rng() * BOARD_SIZE);
  const game: Game = {
    body: [
      [x, y],
      [x + 1, y],
      [x + 2, y],
    ],
    direction: [1, 0],
    length: 3,
    apples: [],
    over: false,
    idle: 0,
    rng,
  };
  for (const color of ["red", "green", "green"] as const) {
    game.apples.push({ position: emptyCell(game)!, color });
  }
  return game;
}

function scan(
  state: number[],
  offset: number,
  game: Pick<Game, "body" | "apples">,
  [dx, dy]: Point,
) {
  const [headX, headY] = game.body[0];
  const ownBody = game.body.slice(1);
  let x = headX + dx;
  let y = headY + dy;
  let distance = 1;
  let found: "snake" | "green" | "red" | "wall" = "wall";

  while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
    const cell: Point = [x, y];
    if (ownBody.some((part) => same(part, cell))) {
      found = "snake";
      break;
    }
    const apple = game.apples.find((a) => same(a.position, cell));
    if (apple) {
      found = apple.color;
      break;
    }
    x += dx;
    y += dy;
    distance += 1;
  }

  state[offset] = found === "snake" ? 1 : 0;
  state[offset + 1] = found === "green" ? 1 : 0;
  state[offset + 2] = found === "red" ? 1 : 0;
  state[offset + 3] = found === "wall" ? 1 : 0;
  state[offset + 4] = 1 / distance;
}

export function encodeState(
  game: Pick<Game, "body" | "apples" | "direction">,
): number[] {
  const state = new Array<number>(24).fill(0);
  const [dx, dy] = game.direction;
  state[0] = dx === -1 && dy === 0 ? 1 : 0;
  state[1] = dx === 1 && dy === 0 ? 1 : 0;
  state[2] = dx === 0 && dy === -1 ? 1 : 0;
  state[3] = dx === 0 && dy === 1 ? 1 : 0;
  scan(state, 4, game, [-1, 0]);
  scan(state, 9, game, [1, 0]);
  scan(state, 14, game, [0, -1]);
  scan(state, 19, game, [0, 1]);
  return state;
}

export function step(game: Game, action: number): Game {
  if (game.over) return game;

  const direction = ACTIONS[action];
  const head: Point = [
    game.body[0][0] + direction[0],
    game.body[0][1] + direction[1],
  ];
  const body: Point[] = [head, ...game.body];
  if (body.length > game.length) body.pop();

  const next: Game = {
    ...game,
    body,
    direction,
    idle: game.idle + 1,
    apples: [...game.apples],
  };

  const hitWall =
    head[0] < 0 ||
    head[0] >= BOARD_SIZE ||
    head[1] < 0 ||
    head[1] >= BOARD_SIZE;
  const hitBody = body.slice(1).some((part) => same(part, head));
  if (hitWall || hitBody || next.length <= 0) return { ...next, over: true };

  const eaten = next.apples.find((apple) => same(apple.position, head));
  if (eaten) {
    next.length += eaten.color === "green" ? 1 : -1;
    next.idle = 0;
    next.apples = next.apples.filter((apple) => apple !== eaten);
    const cell = emptyCell(next);
    if (!cell) return { ...next, over: true };
    next.apples.push({ position: cell, color: eaten.color });
  }

  return next.idle >= MAX_IDLE_STEPS ? { ...next, over: true } : next;
}
