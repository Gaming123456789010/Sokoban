---
id: 001
title: Engine unit tests (Vitest)
status: done
priority: high
depends_on: []
owner: "claude"
created: 2026-05-23
---

## Context

The game logic in `src/game/engine.ts` (`tryMove`, `isSolved`) and
`src/game/level.ts` (`parseLevel`) is pure and framework-free, but it is currently
only exercised indirectly through the Playwright e2e specs (which run in a real
browser and are slow). Adding fast, in-process unit tests gives millisecond
feedback and lets future mechanic tasks (010, 011, 012) cover edge cases cheaply.

Relevant facts:
- `parseLevel(text)` returns a `GameState { grid, player, goalCount, moves, pushes }`.
- The board is a single grid of the `Tile` enum (see `src/game/types.ts`).
- `tryMove(state, dir)` is immutable and returns `{ state, moved, pushed }`.
- `isSolved(state)` is true when no `Goal`/`PlayerOnGoal` cells remain (and `goalCount > 0`).
- Project uses ESM + TypeScript strict; `tsc` typechecks `src` and `tests`.

## Plan

1. Add Vitest: `npm install -D vitest`. Add script `"test:unit": "vitest run"` to `package.json`.
2. Ensure Vitest only picks up unit specs (e.g. `src/**/*.test.ts`) and does NOT collide
   with Playwright (`tests/*.spec.ts`). Add a minimal `vitest.config.ts` with
   `test.include: ['src/**/*.test.ts']` if needed.
3. Create `src/game/engine.test.ts` covering: simple move into floor/goal; wall blocks;
   push success onto floor and onto goal (→ BoxOnGoal); push blocked by wall, by another
   box, and by grid edge; `moves`/`pushes` increments; immutability (input state unchanged);
   `isSolved` true/false and the `goalCount === 0` guard.
4. Create `src/game/level.test.ts` covering: each legal char maps correctly; `goalCount`
   counts `.`, `*`, `+`; player located for `@` and `+`; errors on unknown char, multiple
   players, and no player; ragged/short lines pad to `Floor`.
5. Update `tsconfig.json` include if necessary so the new `*.test.ts` files typecheck.

## Acceptance Criteria

- [x] `npm run test:unit` runs and passes with meaningful coverage of the branches above.
- [x] Unit tests do not require a browser or the dev server.
- [x] `npm test` (Playwright) still passes and does not pick up the Vitest files (and vice versa).
- [x] `npm run build` is clean (tsc + vite build).

## Action Log

- 2026-05-23 — Task created.
- 2026-05-23 — Claimed by claude; status → in-progress. Starting on Vitest install + config.
- 2026-05-23 — Installed `vitest` (devDep), added `"test:unit": "vitest run"` script.
- 2026-05-23 — Added `vitest.config.ts` with `test.include: ['src/**/*.test.ts']` so Vitest never picks up Playwright's `tests/*.spec.ts` (and Playwright's `testDir: './tests'` never picks up the unit files).
- 2026-05-23 — Added `src/game/engine.test.ts` (14 cases): floor/goal moves, leaving-a-goal restore, wall + edge blocks, push onto floor/goal, push off a goal (→PlayerOnGoal), push blocked by wall/box/edge, immutability, and `isSolved` true/false + `goalCount===0` guard.
- 2026-05-23 — Added `src/game/level.test.ts` (15 cases): full char→tile mapping, moves/pushes init, goal counting (`.`/`*`/`+`), player location for `@`/`+`, errors (unknown char, multiple players, no player, empty), and ragged-line Floor padding.
- 2026-05-23 — Verified: `npm run test:unit` → 29 passed (2 files, ~0.4s, no browser). `npm test` → 13 Playwright specs passed, ran only `tests/`. `npm run build` clean (tsc typechecks the new `*.test.ts` under `src`; pre-existing chunk-size warning is unrelated, see task 017). Status → in-review.

## Review

**Reviewer:** claude
**Verdict:** approve
**Notes:** All 29 unit tests cover the required branches: movement onto floor/goal, wall/edge blocking, push success and failure modes, immutability, isSolved edge cases, full char-to-tile mapping, goal counting, player location, error paths, and ragged-line padding. Vitest config correctly isolates from Playwright. Code is clean and follows project conventions.

**User sign-off:** [x]
