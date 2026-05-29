---
id: 002
title: Multiple levels + progression
status: done
priority: high
depends_on: []
owner: "claude"
created: 2026-05-23
---

## Context

The game currently ships a single puzzle. `src/game/levels.ts` exports one string
`LEVEL`; `src/main.ts` builds a `GameController(LEVEL)`; `GameController`
(`src/game/controller.ts`) already has `loadLevel(text)` that re-parses and resets.
We want a list of levels and the ability to progress between them.

This task is the data/logic layer only. The win modal (003) and level-select screen
(004) build the UI on top of what this exposes. The game keeps the
"banner only, keep playing" behavior on solve — progression here is **explicit**
(`nextLevel()`), not automatic.

## Plan

1. In `src/game/levels.ts`, export `LEVELS: string[]` (keep the current puzzle as
   `LEVELS[0]` and add 2–3 more hand-made solvable levels of mild increasing difficulty).
2. In `GameController`: track `levelIndex`; add `loadLevelByIndex(i)`, `nextLevel()`
   (no-op/return false on the last level), and `levelCount()`. Construct it from the
   `LEVELS` array (e.g. `new GameController(LEVELS)` — update the constructor) so the
   controller owns the list.
3. Add `levelIndex` and `levelCount` to `StateSnapshot` (`src/game/types.ts`) and to
   `getState()`.
4. Expose on the sim API (`src/sim/api.ts` + `src/global.d.ts`):
   `loadLevelByIndex(i)`, `nextLevel()`. Keep existing `loadLevel(text)` for tests.
5. Update `src/main.ts` for the new constructor signature. Canvas sizing currently reads
   `getState().width/height` once — recompute or size to the largest level so all levels fit.

## Acceptance Criteria

- [x] `getState()` returns correct `levelIndex` and `levelCount`.
- [x] `nextLevel()` advances and loads the next puzzle; returns false / stays put on the last.
- [x] `loadLevelByIndex(i)` loads any valid level; `loadLevel(text)` still works for tests.
- [x] New levels are solvable (verify at least one via the sim API to `solved: true`).
- [x] A Playwright spec covers progression (`nextLevel` changes `levelIndex` and the grid).
- [x] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.
- 2026-05-23 — Claimed by claude; status → in-progress.
- 2026-05-23 — `src/game/levels.ts`: replaced single `LEVEL` export with `LEVELS: string[]` — original puzzle is `LEVELS[0]`, plus three hand-verified-solvable ramps (1: one-step push; 2: push across room; 3: two boxes onto two goals).
- 2026-05-23 — `GameController`: constructor now takes `string[]`; added `levelIndex` tracking, `loadLevelByIndex(i)` (range-checked, returns bool), `nextLevel()` (false on last), `levelCount()`. `getState()` now reports `levelIndex`/`levelCount`. `loadLevel(text)` unchanged (test escape hatch; leaves `levelIndex` as-is).
- 2026-05-23 — `StateSnapshot` gained `levelIndex`/`levelCount` (`src/game/types.ts`). Sim API + `global.d.ts` expose `loadLevelByIndex(i)` and `nextLevel()`; existing `loadLevel` kept.
- 2026-05-23 — `src/main.ts`: new `GameController(LEVELS)` ctor; canvas now sized to the largest level across the list (parse each, take max width/height) so every puzzle fits the fixed Phaser canvas.
- 2026-05-23 — Added `tests/progression.spec.ts` (5 specs): starts on level 0 + reports count; `nextLevel` bumps index, swaps grid, resets moves/pushes; `nextLevel` false + stays on last; `loadLevelByIndex` loads + rejects out-of-range without changing state; level 1 solvable to `solved:true` via sim API.
- 2026-05-23 — Verified: `npm run build` clean (pre-existing chunk-size warning only); `npm run test:unit` → 29 passed; `npm test` → 18 Playwright passed (incl. 5 new). Status → in-review.

## Review

**Reviewer:** claude
**Verdict:** approve
**Notes:** Clean implementation. loadLevelByIndex bounds-checked, nextLevel delegates naturally, future stack cleared on level switch, StateSnapshot gains levelIndex/levelCount, sim API exposes both, main.ts canvas sizes to largest level. 5 Playwright specs cover all acceptance criteria. loadLevel(text) deliberately leaves levelIndex alone as a test escape hatch — reasonable design choice.

**User sign-off:** [x]
