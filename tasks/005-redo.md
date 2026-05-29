---
id: 005
title: Redo (forward stack)
status: done
priority: medium
depends_on: []
owner: "claude"
created: 2026-05-23
---

## Context

`GameController` (`src/game/controller.ts`) already supports undo via a `history`
stack of prior `GameState` snapshots. We want redo: re-apply a move that was just
undone. Standard rule — making a fresh move clears the redo stack.

Input is wired in `GameScene.create()` (`Z` is undo, `R` is restart). The sim API
in `src/sim/api.ts` exposes `undo()`; we'll add `redo()`.

## Plan

1. In `GameController`, add a `future: GameState[]` stack. On `undo()`, push the current
   state onto `future` before restoring. Add `redo()` that pops `future`, pushes current
   onto `history`, and applies it. On a successful `move()`, clear `future`. `restart()`
   and `loadLevel()` clear both stacks.
2. Bind a redo key in `GameScene` (e.g. `Y`, and/or `Shift+Z`), guarding `event.repeat`
   like the other handlers.
3. Expose `redo()` on the sim API (`src/sim/api.ts`) and type it in `src/global.d.ts`.

## Acceptance Criteria

- [ ] `redo()` re-applies an undone move (state + counters restored exactly).
- [ ] A fresh `move()` clears the redo stack (no redo possible afterward).
- [ ] `redo()` returns false when there is nothing to redo.
- [ ] Redo key works in-game.
- [ ] A Playwright spec covers undo→redo and the move-clears-redo rule.
- [ ] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.
- 2026-05-23 — Implemented: `GameController` gained `future` stack + `redo()` method; `future` cleared on `move()`/`restart()`/`loadLevel()`. Scene binds `Y` key. Sim API + `global.d.ts` expose `redo()`. `tests/redo.spec.ts` covers 6 cases (redo, redo-false, move-clears-future, multi-undo-redo, push counter on redo, restart/loadLevel clears redo).
- 2026-05-29 — Reviewed: all acceptance criteria met. Task was fully implemented alongside 001/002. Status → done.

## Review

**Reviewer:** claude
**Verdict:** approve
**Notes:** Redo is fully implemented with a `future` stack in the controller. All edge cases covered: `redo()` returns bool, fresh `move()` clears the future stack, `restart()` and `loadLevel()` clear it, push counter is correctly restored on redo. Scene binds `Y` for redo. 6 Playwright specs in `tests/redo.spec.ts` cover all criteria. Clean, correct implementation.

**User sign-off:** [x]
