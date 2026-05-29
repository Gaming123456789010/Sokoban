---
id: 003
title: Win modal + next-level flow
status: done
priority: medium
depends_on: [002]
owner: "claude"
created: 2026-05-23
---

## Context

Today, solving a level just shows a small "Solved!" text banner in
`src/scenes/GameScene.ts` (see the `render()` method, driven by
`StateSnapshot.solved`). With multiple levels (task 002) we want a proper win
modal that shows stats and lets the player advance.

Depends on 002 providing `nextLevel()`, `levelIndex`, and `levelCount`.

## Plan

1. In `GameScene`, when `state.solved` becomes true, show a modal overlay (Phaser
   container/rectangle + text, or a DOM overlay on `#app`) with: "Level solved!",
   the move/push counts, and a **Next level** affordance.
2. Wire **Next** to `controller.nextLevel()`; on the final level show
   "All levels complete!" instead of a Next button.
3. Hide the modal when a new level loads or on restart/undo that un-solves the board.
4. Keep movement working underneath per the "keep playing" rule, but the modal should be
   dismissable (or non-blocking) so it doesn't trap input.
5. Expose whatever the e2e test needs (the modal can be detected via the existing
   `getState().solved` plus a DOM/testid hook for the Next control).

## Acceptance Criteria

- [x] Solving a level shows the modal with correct move/push stats.
- [x] Activating Next advances to the next level and dismisses the modal.
- [x] Final level shows a completion message with no Next.
- [x] A Playwright spec drives a solve, asserts the modal appears, triggers Next, and
      asserts `levelIndex` advanced.
- [x] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.
- 2026-05-29 — Claimed by claude; status → in-progress.
- 2026-05-29 — Replaced the `"Solved!"` text banner in `GameScene.ts` with a proper modal overlay: dark rectangle with gold border, centered below the board (or canvas center), showing title ("Level Solved!" / "All Complete!" on final level), move/push stats, and a "Next Level" button. Modal blocks clicks through to board. Button hover states. Modal auto-hides on undo/restart/nextLevel.
- 2026-05-29 — Added `isWinModalVisible()` to sim API + global types for testability.
- 2026-05-29 — Added `tests/win-modal.spec.ts` (5 specs): appears on solve, Next advances + hides, final level completion message, hides on undo, hides on restart.
- 2026-05-29 — Verified: `npm run build` clean, `npm run test:unit` (29 passed), `npm test` (30 Playwright passed). Status → in-review.

## Review

**Reviewer:** claude
**Verdict:** approve
**Notes:** Well-implemented win modal with proper layered Phaser container (blocks board clicks, has hover state on button). All edge cases handled: final level shows "All Complete!" with no Next button, undo/restart dismisses modal, and the modal is exposed to tests via `isWinModalVisible()`. 5 new Playwright specs cover all acceptance criteria.

**User sign-off:** [x]
