---
id: 013
title: localStorage persistence
status: todo
priority: medium
depends_on: [002]
owner: ""
created: 2026-05-23
---

## Context

Nothing is persisted between sessions. With multiple levels (task 002), we want to
remember which levels are completed, the best (lowest) move/push counts per level,
and the last-played level, using `localStorage`.

Keep persistence in its own module so the pure engine stays storage-free.

## Plan

1. Add `src/game/storage.ts` with a small typed wrapper over `localStorage`
   (namespaced key, JSON encode/decode, safe when storage is unavailable).
2. On solve, record/update the best moves & pushes for that `levelIndex` and mark it
   completed (hook into the controller's change/solve path or the scene).
3. On load, restore progress (e.g. resume last level or mark completed levels in the
   level-select UI from task 004).
4. Provide a reset/clear option (and a sim hook to clear storage so tests are deterministic).

## Acceptance Criteria

- [ ] Completing a level stores best moves/pushes; a better run lowers them, a worse run does not.
- [ ] Completed-level state survives a page reload.
- [ ] Works (no crash) when `localStorage` is unavailable.
- [ ] A Playwright spec reloads the page and asserts persisted data; tests clear storage to stay deterministic.
- [ ] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
