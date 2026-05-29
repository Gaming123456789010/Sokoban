---
id: 008
title: Sprite art / tilesheet
status: todo
priority: low
depends_on: []
owner: ""
created: 2026-05-23
---

## Context

Rendering currently uses placeholder rectangles/circles drawn at runtime in
`GameScene.drawTile()`. This task replaces them with sprite art (a tilesheet) for
floor, wall, goal, box, box-on-goal, and player, while keeping the single-grid
logic untouched.

The grid model and `StateSnapshot` do not change — this is purely a rendering swap.
`TILE` is the cell size exported from `src/scenes/GameScene.ts`.

## Plan

1. Add a tilesheet/spritesheet under `public/` (or `src/assets/` imported via Vite).
   Either source CC0 art or generate a simple set; document the source/license.
2. Preload it in the scene's `preload()` and map each `Tile` enum value to a frame.
3. Replace the `Graphics` drawing with sprites/images, sized to `TILE`. Keep player
   distinguishable and goal/box-on-goal states clear.
4. Ensure the production build bundles the asset (check `dist/` after `npm run build`).

## Acceptance Criteria

- [ ] All tile types render with sprites; box-on-goal is visually distinct from box.
- [ ] Asset is bundled and loads in `npm run build` output.
- [ ] Game logic unaffected — **all existing Playwright specs pass unchanged**.
- [ ] Asset license/source documented.
- [ ] `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
