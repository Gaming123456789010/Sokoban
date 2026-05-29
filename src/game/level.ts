import { GameState, Grid, Pos, Tile } from './types';

const CHAR_TO_TILE: Record<string, Tile> = {
  ' ': Tile.Floor,
  '-': Tile.Floor,
  '#': Tile.Wall,
  '.': Tile.Goal,
  $: Tile.Box,
  '*': Tile.BoxOnGoal,
  '@': Tile.Player,
  '+': Tile.PlayerOnGoal,
  '~': Tile.Ice,
  's': Tile.Switch,
  'd': Tile.Door,
};

const TILE_TO_CHAR: Record<number, string> = {
  [Tile.Floor]: ' ',
  [Tile.Wall]: '#',
  [Tile.Goal]: '.',
  [Tile.Box]: '$',
  [Tile.BoxOnGoal]: '*',
  [Tile.Player]: '@',
  [Tile.PlayerOnGoal]: '+',
  [Tile.Ice]: '~',
  [Tile.Switch]: 's',
  [Tile.Door]: 'd',
};

function isGoalLike(t: Tile): boolean {
  return t === Tile.Goal || t === Tile.BoxOnGoal || t === Tile.PlayerOnGoal;
}

/** Parse a text-map level (classic Sokoban chars) into an initial GameState. */
export function parseLevel(text: string): GameState {
  const lines = text.replace(/\r/g, '').split('\n');
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  while (lines.length && lines[0].trim() === '') lines.shift();
  if (lines.length === 0) throw new Error('Empty level');

  const width = Math.max(...lines.map((l) => l.length));
  const grid: Grid = [];
  let player: Pos | null = null;
  let goalCount = 0;
  const switchPos: Pos[] = [];

  for (let y = 0; y < lines.length; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const ch = lines[y][x] ?? ' ';
      const tile = CHAR_TO_TILE[ch];
      if (tile === undefined) throw new Error(`Unknown level character '${ch}' at (${x}, ${y})`);
      if (isGoalLike(tile)) goalCount++;
      if (tile === Tile.Player || tile === Tile.PlayerOnGoal) {
        if (player) throw new Error('Level has more than one player');
        player = { x, y };
      }
      if (tile === Tile.Switch) switchPos.push({ x, y });
      row.push(tile);
    }
    grid.push(row);
  }

  if (!player) throw new Error('Level has no player');
  return { grid, player, goalCount, moves: 0, pushes: 0, switchPos };
}

/** Convert a grid back to a text-map string (lossless with parseLevel). */
export function serializeLevel(grid: Grid): string {
  return grid
    .map((row) => row.map((t) => TILE_TO_CHAR[t] ?? ' ').join(''))
    .join('\n');
}
