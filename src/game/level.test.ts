import { describe, it, expect } from 'vitest';
import { parseLevel } from './level';
import { Tile } from './types';

describe('parseLevel — character mapping', () => {
  it('maps every legal non-player char to the right tile', () => {
    // one line, one player (the trailing '+'); covers space, '-', '#', '.', '$', '*', '+'
    const s = parseLevel(' -#.$*+');
    expect(s.grid[0]).toEqual([
      Tile.Floor,
      Tile.Floor,
      Tile.Wall,
      Tile.Goal,
      Tile.Box,
      Tile.BoxOnGoal,
      Tile.PlayerOnGoal,
    ]);
  });

  it('maps @ to Player and space/dash to Floor', () => {
    const s = parseLevel('@ -');
    expect(s.grid[0]).toEqual([Tile.Player, Tile.Floor, Tile.Floor]);
  });

  it('initializes moves and pushes to zero', () => {
    const s = parseLevel('@.');
    expect(s.moves).toBe(0);
    expect(s.pushes).toBe(0);
  });
});

describe('parseLevel — goal counting', () => {
  it('counts goals from ".", "*", and "+"', () => {
    const s = parseLevel(' -#.$*+');
    expect(s.goalCount).toBe(3);
  });

  it('is zero when there are no goal-like tiles', () => {
    expect(parseLevel('@$ ').goalCount).toBe(0);
  });
});

describe('parseLevel — player location', () => {
  it('locates the player for @', () => {
    const s = parseLevel('###\n# @');
    expect(s.player).toEqual({ x: 2, y: 1 });
    expect(s.grid[1][2]).toBe(Tile.Player);
  });

  it('locates the player for + and counts that goal', () => {
    const s = parseLevel('###\n#+#');
    expect(s.player).toEqual({ x: 1, y: 1 });
    expect(s.grid[1][1]).toBe(Tile.PlayerOnGoal);
    expect(s.goalCount).toBe(1);
  });
});

describe('parseLevel — errors', () => {
  it('throws on an unknown character', () => {
    expect(() => parseLevel('@x')).toThrow(/Unknown level character/);
  });

  it('throws when there is more than one player', () => {
    expect(() => parseLevel('@@')).toThrow(/more than one player/);
    expect(() => parseLevel('@+')).toThrow(/more than one player/);
  });

  it('throws when there is no player', () => {
    expect(() => parseLevel('#.')).toThrow(/no player/);
  });

  it('throws on an empty level', () => {
    expect(() => parseLevel('\n\n')).toThrow(/Empty level/);
  });
});

describe('parseLevel — ragged input', () => {
  it('pads short lines with Floor to the width of the widest line', () => {
    const s = parseLevel('@#\n#');
    expect(s.grid[1]).toHaveLength(2);
    expect(s.grid[1][0]).toBe(Tile.Wall);
    expect(s.grid[1][1]).toBe(Tile.Floor);
  });
});
