---
id: 016
title: CI workflow
status: todo
priority: medium
depends_on: [001]
owner: ""
created: 2026-05-23
---

## Context

There is no continuous integration. Add a GitHub Actions workflow that installs
dependencies, runs the unit tests (task 001) and the Playwright e2e suite, and
builds the project. Note: the project may not have a Git remote yet — the workflow
file should be correct and ready for when the repo is pushed.

Relevant scripts: `npm test` (Playwright, starts its own dev server via
`playwright.config.ts` `webServer`), `npm run build`, and `npm run test:unit`
(added by task 001).

## Plan

1. Add `.github/workflows/ci.yml` triggered on push and pull_request.
2. Steps: checkout; setup Node (match local major, currently Node 24); `npm ci`;
   `npx playwright install --with-deps chromium`; run `npm run test:unit`; run `npm test`;
   run `npm run build`.
3. Cache npm and the Playwright browser download where reasonable.
4. Upload the Playwright HTML report / `test-results` as an artifact on failure (optional).

## Acceptance Criteria

- [ ] `ci.yml` is valid YAML and runs unit tests, e2e tests, and build in order.
- [ ] Uses `npm ci` and installs the Chromium browser for Playwright.
- [ ] Documented in `CLAUDE.md` or `README` how CI maps to the local commands.
- [ ] (If a remote exists) the workflow passes on a test run; otherwise verified by lint/dry review.

## Action Log

- 2026-05-23 — Task created.

## Review

**Reviewer:**
**Verdict:** pending
**Notes:**

**User sign-off:** [ ]
