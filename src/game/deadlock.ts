import { GameState, Pos, Tile } from './types';

/**
 * Detect corner deadlocks: a box not on a goal with two perpendicular walls.
 * Returns positions of deadlocked boxes. Advisory only — does not change rules.
 */
export function deadlockedBoxes(state: GameState): Pos[] {
  const { grid } = state;
  const result: Pos[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] !== Tile.Box) continue;
      const wallH =
        (tileAt(grid, x - 1, y) === Tile.Wall || tileAt(grid, x + 1, y) === Tile.Wall);
      const wallV =
        (tileAt(grid, x, y - 1) === Tile.Wall || tileAt(grid, x, y + 1) === Tile.Wall);
      if (wallH && wallV) result.push({ x, y });
    }
  }
  return result;
}

function tileAt(grid: Tile[][], x: number, y: number): Tile | null {
  if (y < 0 || y >= grid.length || x < 0 || x >= (grid[y]?.length ?? 0)) return null;
  return grid[y][x];
}
