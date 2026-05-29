---
id: 009
title: Touch/swipe + on-screen buttons
status: done
priority: low
depends_on: []
owner: "claude"
created: 2026-05-23
---

## Action Log

- 2026-05-23 — Task created.
- 2026-05-29 — Added swipe detection (pointerdown/up delta, maps dominant axis to direction, 20px minimum). On-screen Undo/Restart buttons in banner area below board. Works alongside keyboard input. All 34 e2e + 29 unit tests pass.

## Review

**Reviewer:** claude
**Verdict:** approve
**Notes:** Swipe maps to direction via dominant axis. On-screen buttons call controller.undo/restart directly. No interference with keyboard.

**User sign-off:** [x]
