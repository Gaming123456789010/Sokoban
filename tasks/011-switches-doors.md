---
id: 011
title: Switches & doors
status: todo
priority: low
depends_on: [010]
owner: ""
created: 2026-05-23
---

## Context

Add a switch/door mechanic: standing on (or pushing a box onto) a switch opens its
linked door, making that tile passable; leaving the switch closes it. Builds on the
extensible tile-behavior hook introduced in task 010.

Tile enum is in `src/game/types.ts`; char mapping in `src/game/level.ts`; movement
logic in `src/game/engine.ts`; rendering in `src/scenes/GameScene.ts`.

## Plan

1. Add tiles for switch and door (closed/open) and level chars for them. Decide how a
   switch links to a door — simplest is a global rule: any switch pressed opens all doors
   (document it), or a single switch/door pair. Start simple.
2. In the movement/resolution logic, compute door open/closed from whether any switch is
   currently pressed (player or box on it). Treat closed doors as walls, open doors as floor.
3. Render switch and door states distinctly.
4. Add a level using the mechanic to `levels.ts` or a test fixture.

## Acceptance Criteria

- [ ] Pressing a switch (player or box) opens the linked door; releasing closes it.
- [ ] Closed door blocks movement/pushes; open door is passable.
- [ ] Unit + e2e tests cover open/close transitions and blocking.
- [ ] Existing behavior unaffected when no switches/doors are present.
- [ ] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
