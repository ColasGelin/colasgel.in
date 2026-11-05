# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace colasgel.in with a static one-page portfolio: a filterable list of 12 entries beside a stage that shows a live, recorded, or diagram sample of the selected entry.

**Architecture:** A Next.js static export. All content lives in one typed file. `Stage` picks a lazy-loaded sample component from the entry's `sample` field, and an error boundary falls back to text. Pure logic (filters, snake engine, network, cooling) is separate from React and unit tested.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, Vitest, Testing Library, three + @react-three/fiber (Re-Fresh only). Python with torch for one export script.

**Spec:** `docs/superpowers/specs/2026-11-05-portfolio-rebuild-design.md`

## Global Constraints

- Work on branch `portfolio-rebuild`, never on `main`. Do not push.
- End every commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Static export only: no server, API routes, or secrets.
- This repo is public. Phone number, salary, and job-search filters never enter it.
- All copy follows the spec's Content rules. Take facts from `~/Programmation/job-search/data/cv.yaml` or the project's repo, and never invent one.
- Dark and technical: near-black background, monospace details, one accent colour. No intro animation.
- Phone layout applies below 768px.
- Filters, in order: All · Work · Projects · Hackathons · 42.
- Source repos: `~/Programmation/42Projects/Learn2Slither`, `~/Programmation/hackathon-nasa-2025` (same content as public `Re-fresh.earth`), and `github.com/ColasGelin/MLOps-Waiting-Queue`.

## Review Focus

- Clicking through entries quickly while a sample loads: only the latest selected sample appears, with no flash of an earlier one. (Task 3)
- A sample file fails to download on a bad connection: the stage shows the entry's text and link, and the rest of the page keeps working. (Tasks 3, 7)
- An untrained snake circles forever without eating or dying: the game restarts after a step limit, and the page never hangs. (Task 6)
- A visitor collapses a row or changes entry while the snake plays: its timer stops and no background CPU is used. (Task 6)
- A visitor stacks many green zones in one spot: cooling adds up but never goes below that month's minimum, and zones can be cleared. (Task 7)

---

### Task 1: Clean slate and tooling

**Files:**
- Delete: `src/`, `public/` contents, `README.md`
- Modify: `package.json`, `next.config.ts`, `eslint.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `vitest.config.ts`, `src/smoke.test.ts`, `README.md`

**Interfaces:**
- Produces: `npm test`, `npm run build`, CSS variables `--bg`, `--surface`, `--line`, `--text`, `--muted`, `--accent`, and fonts as `--font-sans` and `--font-mono`.

- [ ] **Step 1:** Create branch `portfolio-rebuild`. Commit the spec and this plan as the first commit.
- [ ] **Step 2:** Delete the files above. Remove `animejs`, `lucide-react`, and `@react-three/drei`. Upgrade `next` and `eslint-config-next` to 16.x, and set the `dev` script's port to stay 3001. Replace the `lint` script with `eslint .`, since Next 16 has no `next lint`.
- [ ] **Step 3:** Set `output: "export"` and `images: { unoptimized: true }` in `next.config.ts`.
- [ ] **Step 4:** Add `vitest`, `jsdom`, `@testing-library/react`, and `@testing-library/user-event`, a `test` script, and `src/smoke.test.ts` asserting `1 + 1 === 2`.
- [ ] **Step 5:** Write the layout with title "Colas Gelin", description "AI Engineer", the colour variables, Inter and JetBrains Mono through `next/font`, and a placeholder page.
- [ ] **Step 6:** Run `npm test && npm run lint && npm run build`. Expected: all pass, and `out/index.html` exists.
- [ ] **Step 7:** Write a short `README.md` covering the commands and that content lives in `src/content/`. Commit.

### Task 2: Content and filter logic

**Files:**
- Create: `src/content/types.ts`, `src/content/entries.ts`, `src/content/profile.ts`, `src/content/select.ts`, `src/content/content.test.ts`

**Interfaces:**
- Produces:
```ts
type Filter = "all" | "work" | "projects" | "hackathons" | "42";
type Tag = "work" | "42" | "personal" | "1st place";
type DiagramId = "cyberbridge" | "wisdom" | "context";
type SampleSpec =
  | { kind: "diagram"; id: DiagramId; caption: string }
  | { kind: "replay"; src: string; caption: string }
  | { kind: "gallery"; images: { src: string; alt: string; caption: string }[] }
  | { kind: "snake"; caption: string }
  | { kind: "refresh"; caption: string };
type Entry = { id: string; name: string; summary: string; tag: Tag; dates?: string;
  filters: Exclude<Filter, "all">[]; built: string[]; stack: string[];
  link?: { label: string; href: string }; sample?: SampleSpec };
const entries: Entry[];            // src/content/entries.ts, spec order
const FILTERS: { id: Filter; label: string }[];
filterEntries(list: Entry[], filter: Filter): Entry[];
resolveSelection(list: Entry[], filter: Filter, selectedId: string): string;
sampleLabel(sample?: SampleSpec): "Live" | "Recorded run" | "Diagram" | null;
```
`caption` is the sample's text equivalent, used for accessibility.

- [ ] **Step 1: Write failing tests** in `content.test.ts`:
  - `entries` has length 12, and `entries[0].id === "cyberbridge"`.
  - `filterEntries(entries, "all")` returns all 12. `"work"` returns 2 ids: `cyberbridge`, `cumarai`. `"hackathons"` returns 2. `"projects"` returns 7. `"42"` returns 6 and includes `school42` and `wisdom`.
  - `wisdom` is in both `"projects"` and `"42"`.
  - `resolveSelection(entries, "hackathons", "cyberbridge")` returns `"refresh"`, and `resolveSelection(entries, "all", "wisdom")` returns `"wisdom"`.
  - `sampleLabel({ kind: "snake", caption: "" })` is `"Live"`, gallery returns `null`, and undefined returns `null`.
  - Every entry has a non-empty name, summary, and `built`, and at least one filter.
  - `JSON.stringify(entries)` and `JSON.stringify(profile)` don't contain a phone number or a salary figure.
  - Every `link.href` starts with `https://`.
  - No string in `entries` contains `Master` without `RNCP 7`, and the `refresh` entry contains `Málaga` and `approximate model`.
- [ ] **Step 2:** Run `npx vitest run src/content`. Expected: FAIL, modules not found.
- [ ] **Step 3:** Write the types and `select.ts`. Write all 12 entries from the spec's table and Content rules, with samples added as their tasks land. For now set only `diagram`, `snake`, and `refresh` specs. `cumarai`, `iot`, `tpv`, and `school42` have no sample. Lanoria has no sample and says "Team of 4". Write `profile.ts` with the header strings, skill groups from `cv.yaml`, languages, and the spec's Also built line.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Commit.

### Task 3: Page shell, list, and stage

**Files:**
- Create: `src/components/Header.tsx`, `Filters.tsx`, `EntryList.tsx`, `Stage.tsx`, `ProfileBlock.tsx`, `Portfolio.tsx`, `SampleBoundary.tsx`, `src/samples/index.ts`, `src/components/Portfolio.test.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: Task 2 exports.
- Produces: `loadSample(spec: SampleSpec)` in `src/samples/index.ts`, mapping each `kind` to a `next/dynamic` component with `ssr: false`. Every sample is a default export taking `{ spec, onError }: { spec: SampleSpec; onError: (e: Error) => void }`. A sample calls `onError` for failed fetches, and `SampleBoundary` catches render and chunk errors. Both show the entry's text with a "Sample unavailable" note.
- Task 3 uses a stub sample for each kind, replaced in later tasks.

- [ ] **Step 1: Write failing tests:**
  - On load, CyberBridge is selected, and its `built` text is in the stage.
  - Clicking "Hackathons" shows 2 rows and selects Re-Fresh.
  - Clicking a row updates the stage. Rows are buttons with `aria-pressed`, and the filter row works with Tab and Enter.
  - Rendering `Stage` with an entry with no sample shows text and no label.
  - `Stage` with a sample that throws, or calls `onError`, shows "Sample unavailable", and the link stays visible.
  - After selecting A then B quickly, with mocked samples that resolve in reverse order, only B's sample is in the document.
- [ ] **Step 2:** Run `npx vitest run src/components`. Expected: FAIL.
- [ ] **Step 3:** Build the components. `Portfolio` is the client component that owns `filter` and `selectedId`. `Stage` renders title, label, sample, `built`, stack, and link, and keys the sample by entry id. The stage region uses `aria-live="polite"`.
- [ ] **Step 4:** Layout: above 768px, two columns with the list at about 5/12, and all 12 rows fit a 900px-high screen. Below 768px, `EntryList` renders the `Stage` inside the open row, and tapping the open row closes it. The Also built line sits below the list.
- [ ] **Step 5:** Run tests, lint, and build. Expected: all pass, and `out/index.html` contains every entry's name, so content is readable without JavaScript.
- [ ] **Step 6:** Commit.

### Task 4: Diagrams

**Files:**
- Create: `src/samples/Diagram.tsx`, `src/samples/diagrams.ts`, `src/samples/Diagram.test.tsx`

**Interfaces:**
- Consumes: `spec: { kind: "diagram"; id; caption }`.
- Produces: `diagrams: Record<DiagramId, { nodes: { id: string; label: string; x: number; y: number }[]; edges: [string, string][] }>`.

- [ ] **Step 1: Write failing tests:** each `DiagramId` renders an SVG with `role="img"` and `aria-label` equal to the caption. Every edge references existing node ids. `cyberbridge` has no node containing a product screen name or customer name, using a banned-word list of `client`, `customer`, and `dashboard`.
- [ ] **Step 2:** Run the test. Expected: FAIL.
- [ ] **Step 3:** Implement. A dot travels along the edges with CSS, and motion is disabled under `prefers-reduced-motion`. Node content:
  - `cyberbridge`: cameras, switches, and networks → event correlation → triage model, RAG, agents, MCP → reports, briefings, chatbot.
  - `wisdom`: production logs → error detected → agent writes fix → verify, with a failed branch back to the fix → passed → decision trace.
  - `context`: codebase → vector store, synced on change → question → retrieved code → answer, and patch → validate → apply or roll back.
- [ ] **Step 4:** Run tests. Expected: PASS. Commit.

### Task 5: Recorded run and gallery

**Files:**
- Create: `src/samples/Replay.tsx`, `src/samples/replay.ts`, `src/samples/Gallery.tsx`, `src/samples/Replay.test.tsx`, `public/samples/jobcopilot/run.json`, `public/samples/mlops/*.webp`
- Modify: `src/content/entries.ts`

**Interfaces:**
- Produces: `type Recording = { steps: { t: number; label: string; output: string }[] }` and `parseRecording(json: unknown): Recording`, which throws on an invalid shape.

- [ ] **Step 1: Write failing tests:** `parseRecording` rejects an empty `steps` array and a non-increasing `t`. Play advances through steps with fake timers and stops on the last one. Pause holds. Step moves one forward. Reduced motion starts paused. A failed fetch calls `onError`.
- [ ] **Step 2:** Run the test. Expected: FAIL.
- [ ] **Step 3:** Implement `Replay` and `Gallery`. `Gallery` shows the images with `alt` and caption, and a failed image calls `onError`.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5: Capture assets.** Fetch `val_batch0_pred.jpg` and `results.png` from MLOps-Waiting-Queue (`runs/detect/runs/detect/supermarket_finetune/`), convert to WebP under 300 KB each, and set the `gallery` spec. For jobcopilot, build `run.json` from a real run's output in `~/Programmation/job-search`, removing names, emails, phone numbers, salary figures, and employer-specific data. If no real output can be cleaned, leave the entry without a sample and report it. Never write invented steps.
- [ ] **Step 6:** Read `run.json` in full and confirm that nothing personal remains. Commit.

### Task 6: Live snake

**Files:**
- Create: `scripts/export_snake_weights.py`, `src/samples/snake/engine.ts`, `network.ts`, `src/samples/Snake.tsx`, `src/samples/snake/snake.test.ts`, `src/samples/Snake.test.tsx`, `public/samples/snake/*.json`, `src/samples/snake/fixtures.json`

**Interfaces:**
- Produces:
```ts
type Weights = { layers: { weight: number[][]; bias: number[] }[] };
qValues(w: Weights, state: number[]): number[];   // ReLU between layers, length 4
createGame(rng: () => number): Game;
encodeState(g: Game): number[];                   // length 24
step(g: Game, action: number): Game;              // pure
const MAX_IDLE_STEPS = 300;
```

- [ ] **Step 1: Write the export script.** Run it with `~/Programmation/42Projects/Learn2Slither/venv/bin/python`. Load each checkpoint from `sess1-max3-sm0`, `sess10-max4-sm0`, `sess100-max5-sm0`, `sess30000-max62-sm0`, and `sess50000-max61-sm0`, and read `checkpoint['policy_net']`. Keep a checkpoint only if the first layer has 24 inputs, the last has 4 outputs, and there are 3 layers, since hidden width may differ. Write `public/samples/snake/sess-<n>.json`, rounded to 6 decimals. Also write `fixtures.json` with 5 states per checkpoint and their PyTorch Q-values, and 5 hand-built game positions with `State.process_single_snake_state` output. Print which checkpoints were kept.
- [ ] **Step 2: Write failing tests:**
  - `qValues` matches every fixture within `1e-3`.
  - `encodeState` matches every position fixture within `1e-6`.
  - Hitting a wall or body ends the game. Eating grows the snake.
  - With no apple eaten for `MAX_IDLE_STEPS`, `step` ends the game.
  - In `Snake.test.tsx`, unmounting clears the timer, using fake timers. Changing the slider resets the game. A failed weights fetch calls `onError`. Reduced motion starts paused.
- [ ] **Step 3:** Run tests. Expected: FAIL.
- [ ] **Step 4:** Implement `network.ts` and `engine.ts`. Port the rules from `src/game_manager.py`, `src/snake.py`, and `src/board.py`, the action mapping from `agent/snake_agent.py`, and the scan from `agent/state.py`, including apple colours. Board is 10×10.
- [ ] **Step 5:** Implement `Snake.tsx`: canvas, a slider over kept checkpoints labelled by session count, a current and best score, and play/pause. If fewer than 3 checkpoints were kept, replace the slider with play controls on the best one. On game over, restart automatically after a short pause. Weights load only on selection.
- [ ] **Step 6:** Run tests. Expected: PASS. Run the sample and confirm the 50,000-session model scores far above the 1-session model. Commit.

### Task 7: Live Re-Fresh

**Files:**
- Create: `src/samples/refresh/cooling.ts`, `grid.ts`, `src/samples/ReFresh.tsx`, `src/samples/refresh/refresh.test.ts`, `public/samples/refresh/*.csv`, optional `public/samples/refresh/city.glb`
- Modify: `package.json`

**Interfaces:**
- Produces:
```ts
type Cell = { lat: number; lon: number; temp: number };
type Zone = { x: number; z: number };
coolingAt(distance: number): number;
cellPosition(cell: Pick<Cell, "lat" | "lon">): { x: number; z: number };
adjustedTemp(cell: Cell, zones: Zone[], monthMin: number): number;
parseGrid(csv: string): Cell[];                  // throws on a bad header or no rows
averageTemp(cells: Cell[], zones: Zone[]): number;
```

- [ ] **Step 1: Write failing tests:**
  - `coolingAt` returns 5 at 0 and 4.9, 4 at 5, 3 at 10, 2 at 15, 1 at 20, and 0 at 25 and beyond.
  - `cellPosition({ lat: 0, lon: 0 })` is `{ x: -125, z: -110 }`, using grid 94 × 68 and `(lon - 47) * (250 / 94)`, `(lat - 34) * (220 / 68)`.
  - Two zones on a cell cool it by 10 °C, and twenty zones never go below `monthMin`.
  - `parseGrid` reads `lat,lon,temp` rows and throws on `foo,bar`.
  - `averageTemp` with no zones equals the plain mean.
  - In a component test, a failed month fetch keeps the previous month on screen with a message. A failed first load calls `onError`. Clear removes all zones.
- [ ] **Step 2:** Run tests. Expected: FAIL.
- [ ] **Step 3:** Implement the pure modules. Confirm the width and height against `src/app/theproject/page.tsx` in the source repo, and if they differ, update the tests to match the source.
- [ ] **Step 4: Prepare data.** Copy `public/processed_data/*.csv` to `public/samples/refresh/`, then scan them all. Any file with no rows or a temperature outside -30 to 70 °C is removed and left out of the month list. Report anything removed.
- [ ] **Step 5: Size gate.** Compress `scene.glb` with `@gltf-transform/cli` (meshopt plus simplify). Keep `city.glb` only if it's 2.5 MB or less. Otherwise skip it and render the grid alone. Measure the sample's initial download in the browser, which must stay under 3 MB.
- [ ] **Step 6:** Implement `ReFresh.tsx`, adding `three` and `@react-three/fiber`: an `InstancedMesh` of cells coloured by temperature, a month picker, click or tap to place a zone, Clear, an average readout, and the visible label "approximate model". Under reduced motion there's no auto-rotation.
- [ ] **Step 7:** Run tests and build. Confirm in the build output that `three` is in a separate chunk not loaded by the first page. Commit.

### Task 8: Launch checks

**Files:**
- Modify: anything these checks show is wrong
- Create: `scripts/check-export.mjs`

- [ ] **Step 1:** Write `check-export.mjs`, which scans `out/` text files for terms from a gitignored local file, plus `API_KEY` and `sk-ant`, and exits non-zero on a match. Add it as `npm run check:export`.
- [ ] **Step 2:** Run `npm test && npm run lint && npm run build && npm run check:export`. Expected: all pass.
- [ ] **Step 3:** Serve `out/` locally, then check in a real browser at 1440×900 and at 375×812: each filter, every entry, every sample, tab order, and no horizontal scroll. Block one sample file to confirm the fallback. Check again with reduced motion emulated.
- [ ] **Step 4:** Measure first-page transfer size, and confirm that no sample code or data loads before selection, except the default CyberBridge diagram.
- [ ] **Step 5:** List for the user what's still needed before going live: Sherpa Tribe's review, the Lanoria role, and any sample left out. Commit. Do not push or deploy.
