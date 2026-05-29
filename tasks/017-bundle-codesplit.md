---
id: 017
title: Bundle code-split / optimization
status: todo
priority: low
depends_on: []
owner: ""
created: 2026-05-23
---

## Context

`npm run build` currently warns that the JS chunk exceeds 500 kB — almost entirely
Phaser. This task reduces or organizes the bundle so the warning is resolved (or
consciously suppressed) without breaking the app or tests.

## Plan

1. Investigate options and pick one:
   - Split Phaser into its own vendor chunk via Vite/Rolldown `output` manualChunks /
     `codeSplitting`.
   - And/or lazy-load the game (dynamic `import()` of the Phaser bootstrap) so the initial
     payload is smaller.
   - Or, if splitting adds no real benefit for this app, raise
     `build.chunkSizeWarningLimit` with a comment explaining why.
2. Implement the chosen approach in `vite.config.ts`.
3. Re-run the build and confirm the app still loads and plays.

## Acceptance Criteria

- [ ] `npm run build` no longer emits the chunk-size warning (or it is intentionally raised
      with a documented rationale).
- [ ] The built app loads and plays (verify `npm run preview`).
- [ ] `npm test` passes (run against dev server as configured).

## Action Log

- 2026-05-23 — Task created.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
