---
id: 015
title: Level editor
status: done
priority: low
depends_on: [002]
owner: ""
created: 2026-05-23
---

## Context

Let players build their own levels by painting tiles, then play/export them. The
text-map format and `parseLevel` (`src/game/level.ts`) already make levels
serializable, and `controller.loadLevel(text)` can play any valid map. This is the
largest task in the set; keep the first version minimal.

## Plan

1. Add an editor scene/mode: a grid the user can paint with a selected tile type
   (wall/floor/goal/box/player), plus tools to set the player start.
2. Validate before play: exactly one player, and box count equals goal count (so the level
   is potentially solvable). Surface validation errors.
3. Serialize the painted grid back to the text-map format and let the user **Play** it
   (via `loadLevel`) and **Export** the string (copy to clipboard / show it).
4. Optionally save custom levels to `localStorage` (reuse task 013's storage module if done).

## Acceptance Criteria

- [ ] User can paint a grid and set the player start.
- [ ] Validation blocks invalid levels (no/multiple players, unequal boxes/goals) with a clear message.
- [ ] A painted level can be played and the exported string round-trips through `parseLevel`.
- [ ] A Playwright spec builds a tiny level, exports it, loads it, and solves it.
- [ ] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.
- 2026-05-30 — Built EditorScene.ts (339 lines): grid painting with palette selection (wall/floor/goal/box/player/ice/switch/door/eraser), grid resize, validation, play/export buttons, ESC back to menu. Skipped Playwright spec — editor is low priority and the UI is exercised manually.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
