"use client";

import { useEffect, useRef, useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";
import { BOARD_SIZE, createGame, step, type Game } from "./snake/engine";
import { nextAction, type Weights } from "./snake/network";

const CHECKPOINTS = [1, 10, 100, 30000, 50000];
const TICK_MS = 110;
const PAUSE_TICKS = 8;
const CANVAS_SIZE = 400;

function draw(canvas: HTMLCanvasElement | null, game: Game) {
  const context = canvas?.getContext("2d");
  if (!context) return;
  const cell = CANVAS_SIZE / BOARD_SIZE;
  const styles = getComputedStyle(document.documentElement);
  context.fillStyle = styles.getPropertyValue("--surface");
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  for (const apple of game.apples) {
    context.fillStyle = apple.color === "green" ? "#4ade80" : "#f87171";
    const [x, y] = apple.position;
    context.fillRect(x * cell + 8, y * cell + 8, cell - 16, cell - 16);
  }
  game.body.forEach(([x, y], index) => {
    context.fillStyle = index === 0 ? "#ffffff" : styles.getPropertyValue("--accent");
    context.globalAlpha = game.over ? 0.4 : 1;
    context.fillRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4);
    context.globalAlpha = 1;
  });
}

export default function Snake({
  onError,
}: SampleProps<Extract<SampleSpec, { kind: "snake" }>>) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const pausedTicks = useRef(0);
  const [checkpoint, setCheckpoint] = useState(CHECKPOINTS.length - 1);
  const [weights, setWeights] = useState<Weights | null>(null);
  const [score, setScore] = useState({ current: 3, best: 3 });
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const sessions = CHECKPOINTS[checkpoint];

  useEffect(() => {
    let cancelled = false;
    fetch(`/samples/snake/sess-${sessions}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Status ${response.status}`);
        return response.json();
      })
      .then((json: Weights) => {
        if (cancelled) return;
        setWeights(json);
        setScore({ current: 3, best: 3 });
      })
      .catch((error) => {
        if (!cancelled) onError(error);
      });
    return () => {
      cancelled = true;
    };
  }, [sessions, onError]);

  useEffect(() => {
    if (!weights) return;
    game.current = createGame(Math.random);
    pausedTicks.current = 0;
    draw(canvas.current, game.current);
  }, [weights]);

  useEffect(() => {
    if (!weights || !playing) return;

    const timer = setInterval(() => {
      const current = game.current!;
      if (current.over) {
        pausedTicks.current += 1;
        if (pausedTicks.current >= PAUSE_TICKS) {
          game.current = createGame(Math.random);
          pausedTicks.current = 0;
          setScore((s) => ({ ...s, current: 3 }));
        }
      } else {
        game.current = step(current, nextAction(weights, current));
        const length = game.current.length;
        setScore((s) => ({
          current: length,
          best: Math.max(s.best, length),
        }));
      }
      draw(canvas.current, game.current!);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [weights, playing]);

  return (
    <div className="rounded border border-line bg-surface p-3">
      <canvas
        ref={canvas}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        aria-hidden="true"
        className="mx-auto block aspect-square w-full max-w-72"
      />
      <div className="mt-3 flex items-center gap-3 font-mono text-xs">
        <label htmlFor="snake-sessions" className="shrink-0 text-muted">
          Training
        </label>
        <input
          id="snake-sessions"
          type="range"
          min={0}
          max={CHECKPOINTS.length - 1}
          value={checkpoint}
          onChange={(event) => setCheckpoint(Number(event.target.value))}
          aria-valuetext={`${sessions} sessions`}
          className="min-w-0 flex-1 accent-(--accent)"
        />
        <span className="shrink-0 text-right whitespace-nowrap">
          {sessions.toLocaleString("en-US")} session{sessions > 1 ? "s" : ""}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-xs text-muted">
        <span>
          Length {score.current} · best {score.best}
        </span>
        <button
          type="button"
          onClick={() => setPlaying(!playing)}
          className="cursor-pointer rounded border border-line px-2 py-0.5 text-text hover:text-accent"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
