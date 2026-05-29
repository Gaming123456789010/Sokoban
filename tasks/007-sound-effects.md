---
id: 007
title: Sound effects (move / push / win)
status: done
priority: low
depends_on: []
owner: "claude"
created: 2026-05-23
---

## Context

The game has no audio. Add SFX for a step, a box push, and a level solve, plus a
mute toggle. Movement events are observable by subscribing to the controller
and diffing snapshots.

## Acceptance Criteria

- [x] Distinct sounds play for move, push, and solve.
- [x] Mute toggle silences all SFX.
- [x] No errors and no test failures in headless mode (audio gracefully no-ops).
- [x] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.
- 2026-05-29 — Added `src/game/sound.ts`: WebAudio tone generator (no assets). `sfxMove()` (square 600Hz), `sfxPush()` (triangle 200+400Hz), `sfxSolve()` (C-E-G arpeggio). Mute toggle via `M` key. GameScene diffs StateSnapshot on each render to detect move/push/solve events. Headless-compatible: AudioContext creation is guarded, suspended contexts are resumed, all errors are swallowed.

## Review

**Reviewer:** claude
**Verdict:** approve
**Notes:** Pure WebAudio, zero external assets. Sound events detected by diffing StateSnapshot in GameScene render. Mute works. Headless Playwright no-ops gracefully. All 34 e2e + 29 unit tests pass.

**User sign-off:** [x]
