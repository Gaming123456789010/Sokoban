---
id: 012
title: Deadlock detection hints
status: todo
priority: low
depends_on: []
owner: ""
created: 2026-05-23
---

## Context

In Sokoban a box pushed into certain spots becomes permanently stuck (e.g. a box
not on a goal jammed into a corner of two walls). Detecting the simplest deadlocks
and warning the player improves UX. Logic lives in `src/game/engine.ts`; the scene
can surface a hint banner.

Keep this advisory only — it must not change movement rules.

## Plan

1. Add a pure helper (e.g. `findDeadlocks(state)` or `isDeadlocked(state)`) in the engine:
   start with **corner deadlocks** — a box not on a goal with two perpendicular walls
   adjacent (e.g. wall above/below AND wall left/right) can never move. Optionally extend
   to boxes frozen along a wall with no goal.
2. Expose the result via `StateSnapshot` (e.g. `deadlocked: boolean` or a list of stuck
   box positions) and `getState()`.
3. In `GameScene`, show a non-blocking hint ("Stuck — press Z to undo or R to restart")
   when a deadlock is detected.
4. Ensure a box sitting on a goal is never flagged.

## Acceptance Criteria

- [ ] A box pushed into a non-goal corner is detected as a deadlock.
- [ ] Boxes on goals, or boxes that can still move, are NOT flagged.
- [ ] Detection is advisory only; movement rules are unchanged.
- [ ] Unit tests (and an e2e via `loadLevel`) cover detected and non-detected cases.
- [ ] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
