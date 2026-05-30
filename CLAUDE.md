# Sokoban — Project Guide

A turn-based Sokoban puzzle game. The world only advances when an input is sent
(no real-time movement). Built with **Phaser 3**, **Vite**, **TypeScript**, and
tested with **Playwright**.

## Task workflow (read this first)

Work is tracked as one Markdown file per task under `tasks/`. **Before starting any
work, read `tasks/README.md`** for the full workflow, then pick up a task per its
rules. Tasks are self-contained, logged as you go, and reviewed before they're
marked done. `tasks/INDEX.md` is the registry of all tasks and their status.

## Commands

- `npm run dev` — Vite dev server at http://localhost:5173
- `npm test` — Playwright e2e suite (headless; starts the dev server itself)
- `npm run test:unit` — Vitest unit tests
- `npm run build` — `tsc` typecheck + Vite production build

## Architecture

Pure game logic is decoupled from rendering. A single **controller** is the source
of truth; both the keyboard handler and the simulation API call into it.

```
Keyboard (Phaser)  ─┐
                    ├─► GameController ──► notifies ──► GameScene redraws
window.__sokoban  ──┘   (state + history)
```

- `src/game/types.ts` — `Tile` enum (`Floor=0..Door=9`), `Grid` (`Tile[][]`, indexed `[y][x]`),
  `Direction`, `Pos`, `GameState` (includes `switchPos: Pos[]`), `StateSnapshot`
  (includes `levelIndex`, `levelCount`, `deadlocked`).
- `src/game/level.ts` — `parseLevel(text)` / `serializeLevel(grid)`: classic Sokoban chars
  (`#` wall, `@` player, `$` box, `.` goal, `*` box-on-goal, `+` player-on-goal, ` `
  floor, `_` ice, `^` switch, `=` door).
- `src/game/engine.ts` — pure `tryMove(state, dir)` and `isSolved(state)`. Immutable:
  returns a new state with a cloned grid. Supports ice sliding and switch/door logic.
- `src/game/controller.ts` — `GameController`:
  `move/undo/redo/restart/loadLevel/loadLevelByIndex/nextLevel/isSolved/getState/subscribe/levelCount`.
- `src/game/deadlock.ts` — `deadlockedBoxes(state)`: detects corner-deadlocked boxes.
- `src/game/sound.ts` — Web Audio sound effects (`sfxMove/sfxPush/sfxSolve`, mute support).
- `src/game/storage.ts` — `localStorage` progress persistence (`recordSolve/getProgress/clearProgress`).
- `src/game/stars.ts` — `computeStars(moves, par)`: 3 stars ≤ par, 2 ≤ 1.5×par, else 1.
- `src/game/levels.ts` — the shipped level(s).
- `src/scenes/GameScene.ts` — rendering + input. Exports `TILE`, `HUD_H`, `BANNER_H`, `SCENE_BG`.
- `src/scenes/MenuScene.ts` — level-select menu with play and editor buttons.
- `src/scenes/EditorScene.ts` — point-and-click level editor (paint grid, resize, validate, play/export).
- `src/sim/api.ts` — attaches `window.__sokoban` (drives the controller directly).
- `src/global.d.ts` — `Window.__sokoban` typing.
- `src/main.ts` — bootstrap.

## State model (important)

The board is a **single 2D tile grid** using combined enums
(`Floor=0`/`Wall`/`Goal`/`Box`/`BoxOnGoal`/`Player`/`PlayerOnGoal`/`Ice=7`/`Switch`/`Door`).
Win = no `Goal`/`PlayerOnGoal` cells remain. Undo = clone the whole (small) grid into a
history stack. Redo = pop from a forward stack. Ice causes the player to slide one extra
step; switches open doors when a player or box occupies them.

## Conventions / decisions already made

- **TypeScript strict**; `noUnusedLocals`/`noUnusedParameters` are on — no unused imports
  (note: `tsc` typechecks `tests/` too).
- **Placeholder graphics** (rectangles drawn at runtime), not sprites.
- **Instant snap** movement — logical state and pixels stay in lockstep so Playwright
  can assert immediately after a move. Any animation must NOT delay logical state.
- **One step per discrete keypress** (arrows + WASD; `Z` undo, `R` restart). Auto-repeat
  is ignored via `event.repeat`.
- **Sim API** is the test driver: tests call `window.__sokoban` directly; one spec uses
  real `page.keyboard.press` to guard the input wiring. Use `loadLevel(text)` to set up
  deterministic test scenarios.
- Default to **no comments**; only explain non-obvious *why*.

## Testing

- E2E specs in `tests/*.spec.ts` with shared helpers in `tests/helpers.ts`
  (`ready/state/load/move/undo/restart`).
- Tests wait for `window.__sokoban?.ready` before driving the game.
