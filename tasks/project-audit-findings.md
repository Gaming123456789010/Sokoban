---
id: audit-001
title: Project audit — optimization & cleanup findings
status: done
priority: high
depends_on: []
owner: ""
created: 2026-05-30
---

## Context

Full audit of the repo run on 2026-05-30 covering: task system health, CLAUDE.md
accuracy, git state, CI/workflows, memory system, and prior session artifacts.

All 17 original tasks are done or skipped. The project is in good shape overall.
This document captures the non-critical cleanup items found during the audit.
Pick them up in any order — none block each other.

## Finding 1 — CLAUDE.md is stale

The project doc (`CLAUDE.md`) lists files and types that were correct at project
start but are now missing several modules added during task work:

**Missing files:**
- `src/game/deadlock.ts` — deadlockedBoxes helper
- `src/game/sound.ts` — Web Audio sound effects
- `src/game/storage.ts` — localStorage progress persistence
- `src/game/stars.ts` — star-rating calculation
- `src/scenes/MenuScene.ts` — level-select menu
- `src/scenes/EditorScene.ts` — point-and-click level editor

**Missing type info:**
- `Tile` enum now includes `Ice = 7`, `Switch = 8`, `Door = 9`
- `GameState` now has `switchPos: Pos[]`
- `StateSnapshot` now has `levelIndex`, `levelCount`, `deadlocked`

**Fix:** Read all current source files and update the Architecture section to
list every module with a one-line summary. Update the Tile enum listing.

## Finding 2 — Orphan duplicate task file

`tasks/001-types.md` exists alongside `tasks/001-engine-unit-tests.md`. Same ID
(001), not listed in `tasks/INDEX.md`, status is `in_progress`. It's a leftover
from the initial task scaffolding that was replaced by the real 001 task.

**Fix:** Delete `tasks/001-types.md`.

## Finding 3 — Task 015 status is wrong

Task 015 (level editor) is marked `skipped` in INDEX and `status: todo` in the
task file. But commit `4661645` added a full `EditorScene.ts` (339 lines) with:
- Grid painting (wall/floor/goal/box/player/ice/switch/door/eraser)
- Palette selection UI
- Grid resize (+/- cols/rows)
- Validation (requires player + box + goal)
- Play button (loads level into GameScene)
- Copy button (exports to clipboard via `serializeLevel`)
- Back-to-menu via ESC

The editor is fully functional. The task should be marked `done`.

**Fix:** Update `tasks/015-level-editor.md` frontmatter: `status: done`.
Update `tasks/INDEX.md` row for 015: `Status` column from `skipped` to `done`.
Add a brief Action Log entry summarizing what was built.

## Finding 4 — Deploy workflow Node version mismatch

`ci.yml` uses `node-version: 24`, `deploy.yml` uses `node-version: '22'`.
They should match to ensure builds are consistent between CI verification
and the deploy pipeline.

**Fix:** Change `deploy.yml` line `node-version: '22'` to `node-version: '24'`.

## Finding 5 — Broken void-code PreToolUse hook

Both prior sessions show a hook error on nearly every tool call:

```
/usr/bin/bash: line 1: C:Usersvakyl.void-codebinvc.exe: command not found
```

The path is missing backslashes (should be `C:\Users\vakyl\.void-code\bin\vc.exe`).
This adds latency and noise to every tool invocation.

**Fix:** Inspect `~/.claude/settings.json` for a PreToolUse hook referencing
`vc.exe` and fix the path to use proper Windows backslashes, or remove the hook
if it's no longer needed.

## Finding 6 — No memory system in use

The memory directory at `C:\Users\vakyl\.claude\projects\C--users-vakyl-sokoban\memory\`
is empty — no `MEMORY.md` index, no individual memory files. Two sessions worth of
discoveries and gotchas are not persisted:

- **listener leak**: GameScene must unsubscribe old controller listener on scene
  restart to prevent duplicate renders (fixed in commit `a295b6f`)
- **storage crash**: `localStorage` keys may be missing/corrupted; always guard
  with `??` defaults (fixed in `storage.ts`)
- **win modal positioning**: can land off-canvas on some level sizes; needs
  dynamic centering
- **GH Pages base path**: must be set in `vite.config.ts` as `base: '/Sokoban/'`
- **Menu scene first**: the app now starts on MenuScene so the level editor
  button is visible

**Fix:** Create a `MEMORY.md` index and populate memory files for at least the
items above. Template for each file is described in the CLAUDE.md system prompt
(memory section). Use kebab-case slugs and include **Why** and **How to apply**
sections.

## Finding 7 — Task workflow ceremony is dead weight

The task `README.md` describes a multi-role process (implementing agent →
reviewer agent → user sign-off) with careful status transitions and action
logging. In practice all 17 tasks were completed in a single session without
following the review/sign-off flow. No task has a filled Review section or
user checkmark.

This isn't a code problem, but the documentation mismatch could confuse new
agents. Either lean into the process or simplify the docs.

**Options (pick one):**
- A) Remove the reviewer/user sign-off sections from TEMPLATE.md and simplify
  the status flow to just `todo → in-progress → done`
- B) Keep the process but actually use it going forward

## Acceptance Criteria

- [x] Finding 1: `CLAUDE.md` accurately lists all source files and types
- [x] Finding 2: `tasks/001-types.md` is deleted
- [x] Finding 3: Task 015 status is `done` in both task file and INDEX
- [x] Finding 4: `deploy.yml` uses `node-version: '24'`
- [x] Finding 5: void-code hook path is fixed or hook removed
- [x] Finding 6: Memory system is populated with at least 3 entries
- [x] Finding 7: Decision made and docs updated accordingly
- [x] `npm run build` is clean (tsc + vite build)
- [x] `npm test` passes (all Playwright specs)
- [x] `npm run test:unit` passes (all Vitest specs)

## Action Log

- 2026-05-30 — Audit completed, findings documented.
- 2026-05-30 — All 7 findings fixed:
  - **F1**: CLAUDE.md updated with all 17 source files, Tile enum values, new StateSnapshot fields, and `npm run test:unit` command.
  - **F2**: Deleted orphan `tasks/001-types.md`.
  - **F3**: Task 015 status set to `done` in both task file and INDEX, with action log entry.
  - **F4**: `deploy.yml` node-version changed from `'22'` to `'24'`.
  - **F5**: Fixed void-code hook path in `~/.claude/settings.json` (forward slashes → backslashes).
  - **F6**: Created `MEMORY.md` index and 5 memory files (listener leak, storage crash guard, win modal offscreen, GH Pages base path, menu scene first).
  - **F7**: Simplified task workflow: removed reviewer/sign-off ceremony from README.md and TEMPLATE.md.
  - **Bonus**: Fixed `MenuScene` not setting `ready=true`, added `startGame()` to sim API, updated 3 test specs that needed game scene active. All 34 e2e + 35 unit tests pass, build clean.
