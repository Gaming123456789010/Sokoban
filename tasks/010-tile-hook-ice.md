---
id: 010
title: Tile-behavior hook + ice floor
status: todo
priority: medium
depends_on: [001]
owner: ""
created: 2026-05-23
---

## Context

`tryMove` in `src/game/engine.ts` is a single monolithic function handling walls,
boxes, and pushes. Before adding new mechanics (this task and 011), introduce a
clean extension point, then implement the first new mechanic: **ice / slippery
floor**, where stepping onto ice makes the player (and a box being pushed)
continue sliding in the same direction until blocked.

Depends on 001 so the new behavior is covered by fast unit tests.

Tile enum lives in `src/game/types.ts`; level chars are mapped in
`src/game/level.ts` (`CHAR_TO_TILE`).

## Plan

1. Add `Tile.Ice` and a level character for it (pick an unused char, e.g. `~`); map it in
   `parseLevel`. Render it distinctly in `GameScene.drawTile()`.
2. Refactor `tryMove` so post-move resolution is pluggable (e.g. after a base move, run a
   "slide" resolution while the entity stands on ice). Keep the existing wall/box/push
   semantics identical for non-ice tiles.
3. Sliding rules: when the player lands on ice, continue one tile at a time in the same
   direction until the next tile is not enterable (wall/box that can't be pushed) or is
   non-ice floor. A pushed box on ice slides the same way. Decide & document counter
   behavior: the whole slide counts as **one** move (one input); pushes counted per box step.
4. Keep everything immutable and pure (clone grid as today).

## Acceptance Criteria

- [ ] Non-ice behavior is byte-for-byte unchanged (existing unit + e2e tests pass).
- [ ] Player slides across ice and stops correctly at walls/boxes/normal floor.
- [ ] A pushed box slides on ice per the documented rule.
- [ ] Unit tests (task 001 harness) cover slide start/stop and box-on-ice cases; an e2e
      spec covers a sliding level via `loadLevel`.
- [ ] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
