# 001 — Core types

**Status:** in_progress
**Depends on:** —

## What

Define the core types used by every other module:

- `Tile` enum — `Floor`, `Wall`, `Goal`, `Box`, `BoxOnGoal`, `Player`, `PlayerOnGoal`
- `Grid` — `Tile[][]`, indexed `[y][x]`
- `Direction` — `Up`, `Down`, `Left`, `Right`
- `Pos` — `{ x: number; y: number }`
- `GameState` — `{ grid: Grid; playerPos: Pos; steps: number }`
- `StateSnapshot` — for the controller's subscribe callback (includes `isSolved`)

File: `src/game/types.ts`

## Acceptance

- [ ] `npm run build` passes (typecheck only for now)
- [ ] All enums/types are exported

## Log
