import { Direction, GameState, Grid, Pos, Tile } from './types';

const DELTAS: Record<Direction, Pos> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}

function inBounds(grid: Grid, x: number, y: number): boolean {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[y].length;
}

function isBox(t: Tile): boolean {
  return t === Tile.Box || t === Tile.BoxOnGoal;
}

function isWalkable(t: Tile, doorOpen: boolean): boolean {
  if (t === Tile.Door) return doorOpen;
  return t === Tile.Floor || t === Tile.Goal || t === Tile.Ice;
}

function vacated(t: Tile): Tile {
  return t === Tile.PlayerOnGoal || t === Tile.BoxOnGoal ? Tile.Goal : Tile.Floor;
}

function isSwitchPressed(grid: Grid, sw: Pos): boolean {
  const t = grid[sw.y][sw.x];
  return t === Tile.Player || t === Tile.PlayerOnGoal || t === Tile.Box || t === Tile.BoxOnGoal;
}

function doorsAreOpen(state: GameState): boolean {
  return state.switchPos.some((sw) => isSwitchPressed(state.grid, sw));
}

export interface MoveResult {
  state: GameState;
  moved: boolean;
  pushed: boolean;
}

/**
 * Attempt to move the player one step in `dir`. Pure: returns a new GameState
 * (with a freshly cloned grid) when a move occurs; otherwise returns the input
 * state unchanged with moved=false.
 *
 * Ice tiles cause the player to continue sliding. Doors are passable only when
 * at least one switch is pressed (player or box on it).
 */
export function tryMove(state: GameState, dir: Direction): MoveResult {
  return slide(state, dir, 0, false);
}

function slide(initial: GameState, dir: Direction, pushes: number, hasMoved: boolean): MoveResult {
  const { grid, player } = initial;
  const d = DELTAS[dir];
  const tx = player.x + d.x;
  const ty = player.y + d.y;

  if (!inBounds(grid, tx, ty)) {
    if (!hasMoved) return { state: initial, moved: false, pushed: false };
    return { state: finalize(initial), moved: true, pushed: pushes > 0 };
  }

  const doorOpen = doorsAreOpen(initial);
  const target = grid[ty][tx];

  if (target === Tile.Wall || (target === Tile.Door && !doorOpen)) {
    if (!hasMoved) return { state: initial, moved: false, pushed: false };
    return { state: finalize(initial), moved: true, pushed: pushes > 0 };
  }

  if (isBox(target)) {
    const bx = tx + d.x;
    const by = ty + d.y;
    if (!inBounds(grid, bx, by) || !isWalkable(grid[by][bx], doorOpen)) {
      if (!hasMoved) return { state: initial, moved: false, pushed: false };
      return { state: finalize(initial), moved: true, pushed: pushes > 0 };
    }
    const ng = cloneGrid(grid);
    ng[by][bx] = grid[by][bx] === Tile.Goal ? Tile.BoxOnGoal : Tile.Box;
    ng[ty][tx] = target === Tile.BoxOnGoal ? Tile.PlayerOnGoal : Tile.Player;
    ng[player.y][player.x] = vacated(grid[player.y][player.x]);
    const ns: GameState = {
      grid: ng, player: { x: tx, y: ty },
      goalCount: initial.goalCount, moves: initial.moves, pushes: initial.pushes + 1,
      switchPos: initial.switchPos,
    };
    if (target === Tile.Ice) {
      return slide(ns, dir, pushes + 1, true);
    }
    return { state: finalize(ns), moved: true, pushed: true };
  }

  // Walk
  const ng = cloneGrid(grid);
  ng[ty][tx] = target === Tile.Goal ? Tile.PlayerOnGoal : Tile.Player;
  ng[player.y][player.x] = vacated(grid[player.y][player.x]);
  const ns: GameState = {
    grid: ng, player: { x: tx, y: ty },
    goalCount: initial.goalCount, moves: initial.moves, pushes: initial.pushes,
    switchPos: initial.switchPos,
  };

  if (target === Tile.Ice) {
    return slide(ns, dir, pushes, true);
  }

  return { state: finalize(ns), moved: true, pushed: pushes > 0 };
}

function finalize(state: GameState): GameState {
  return { ...state, moves: state.moves + 1 };
}

/** Solved when every goal is covered by a box (no Goal/PlayerOnGoal cells remain). */
export function isSolved(state: GameState): boolean {
  if (state.goalCount === 0) return false;
  for (const row of state.grid) {
    for (const t of row) {
      if (t === Tile.Goal || t === Tile.PlayerOnGoal) return false;
    }
  }
  return true;
}
