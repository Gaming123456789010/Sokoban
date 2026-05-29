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

function isWalkable(t: Tile): boolean {
  return t === Tile.Floor || t === Tile.Goal || t === Tile.Ice;
}

function vacated(t: Tile): Tile {
  return t === Tile.PlayerOnGoal || t === Tile.BoxOnGoal ? Tile.Goal : Tile.Floor;
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
 * Ice tiles cause the player to continue sliding in the same direction. The
 * entire slide resolves immediately and counts as ONE move. Pushes are counted
 * once per box moved during the slide.
 */
export function tryMove(state: GameState, dir: Direction): MoveResult {
  return slide(state, dir, 0, false);
}

function slide(initial: GameState, dir: Direction, pushes: number, hasMoved: boolean): MoveResult {
  const { grid, player } = initial;
  const d = DELTAS[dir];
  const tx = player.x + d.x;
  const ty = player.y + d.y;

  if (!inBounds(grid, tx, ty) || grid[ty][tx] === Tile.Wall) {
    if (!hasMoved) return { state: initial, moved: false, pushed: false };
    return { state: finalize(initial), moved: true, pushed: pushes > 0 };
  }

  const target = grid[ty][tx];
  const { moved, state: ns, pushed: stepPushed } = atomicStep(initial, dir);
  if (!moved) {
    if (!hasMoved) return { state: initial, moved: false, pushed: false };
    return { state: finalize(initial), moved: true, pushed: pushes > 0 };
  }

  const totalPushes = pushes + (stepPushed ? 1 : 0);

  if (target === Tile.Ice) {
    return slide(ns, dir, totalPushes, true);
  }

  return {
    state: { ...ns, moves: ns.moves + 1, pushes: ns.pushes },
    moved: true,
    pushed: totalPushes > 0,
  };
}

function atomicStep(state: GameState, dir: Direction): MoveResult {
  const d = DELTAS[dir];
  const { player, grid } = state;
  const tx = player.x + d.x;
  const ty = player.y + d.y;

  if (!inBounds(grid, tx, ty)) return { state, moved: false, pushed: false };
  const target = grid[ty][tx];
  if (target === Tile.Wall) return { state, moved: false, pushed: false };

  if (isBox(target)) {
    const bx = tx + d.x;
    const by = ty + d.y;
    if (!inBounds(grid, bx, by) || !isWalkable(grid[by][bx])) {
      return { state, moved: false, pushed: false };
    }
    const ng = cloneGrid(grid);
    ng[by][bx] = grid[by][bx] === Tile.Goal ? Tile.BoxOnGoal : Tile.Box;
    ng[ty][tx] = target === Tile.BoxOnGoal ? Tile.PlayerOnGoal : Tile.Player;
    ng[player.y][player.x] = vacated(grid[player.y][player.x]);
    return {
      state: { grid: ng, player: { x: tx, y: ty }, goalCount: state.goalCount, moves: state.moves, pushes: state.pushes + 1 },
      moved: true,
      pushed: true,
    };
  }

  // Walk
  const ng = cloneGrid(grid);
  ng[ty][tx] = target === Tile.Goal ? Tile.PlayerOnGoal : Tile.Player;
  ng[player.y][player.x] = vacated(grid[player.y][player.x]);
  return {
    state: { grid: ng, player: { x: tx, y: ty }, goalCount: state.goalCount, moves: state.moves, pushes: state.pushes },
    moved: true,
    pushed: false,
  };
}

/** Bump moves by 1 after all sliding is done. */
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
