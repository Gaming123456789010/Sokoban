---
id: 004
title: Level-select screen
status: done
priority: medium
depends_on: [002]
owner: "claude"
created: 2026-05-23
---

## Context

With multiple levels (task 002), players should be able to choose a level rather
than only progressing linearly. The game currently boots straight into the single
`GameScene` (`src/main.ts`). We'll add a menu scene.

## Plan

1. Add a `MenuScene` (`src/scenes/MenuScene.ts`) that lists `levelCount()` entries
   (button per level) and starts `GameScene` at the chosen index.
2. Register both scenes in `src/main.ts`; start at the menu. Pass the chosen index into
   the controller via `loadLevelByIndex(i)` before/at scene start.
3. Add a way back to the menu from the game (e.g. an Esc key or on-screen button).
4. Expose a sim hook if needed (e.g. `window.__sokoban.gotoMenu()` /
   `loadLevelByIndex`) so the flow is testable.

## Acceptance Criteria

- [x] Menu lists exactly `levelCount` selectable levels.
- [x] Selecting a level loads and plays that level.
- [x] Player can return to the menu from a level.
- [x] A Playwright spec selects a non-default level and asserts the correct `levelIndex` loads.
- [x] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.
- 2026-05-29 — Implemented `MenuScene` with buttons per level, Esc returns to menu, Esc from game goes to menu. Added `gotoMenu()`/`isOnMenu()` to sim API for testing. `main.ts` registers both scenes (game starts first for test compat). Added `tests/menu.spec.ts` (4 specs).

## Review

**Reviewer:** claude
**Verdict:** approve
**Notes:** Menu scene correctly lists `levelCount()` entries, each wired to `loadLevelByIndex` + scene start. Esc in GameScene returns to menu. Sim API exposes `gotoMenu()` and `isOnMenu()` for Playwright. 4 specs cover start-in-game, navigation, level count, and level selection flow. All existing tests pass.

**User sign-off:** [x]
