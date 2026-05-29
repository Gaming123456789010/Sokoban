---
id: 014
title: Par / star rating
status: todo
priority: low
depends_on: [002, 013]
owner: ""
created: 2026-05-23
---

## Context

Add a per-level "par" (target move count) and award a star rating based on how the
player's solve compares to par. Requires multiple levels (002) for per-level par and
persistence (013) to store earned stars.

## Plan

1. Attach a `par` value to each level (extend the level data from task 002, e.g. levels
   become objects `{ map: string, par: number }` or a parallel `PARS` array). Update the
   controller/types accordingly.
2. On solve, compute stars (e.g. 3 stars ≤ par, 2 stars ≤ 1.5×par, else 1 star) from the
   move count.
3. Display stars on the win modal (task 003) and persist best stars per level (task 013).
4. Show earned stars in the level-select screen (task 004) if present.

## Acceptance Criteria

- [ ] Each level has a par; stars are computed correctly at the boundaries.
- [ ] Stars show on the win modal and persist across reloads.
- [ ] A Playwright spec solves a level and asserts the expected star count.
- [ ] `npm test` passes; `npm run build` is clean.

## Action Log

- 2026-05-23 — Task created.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
