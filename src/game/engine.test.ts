import { describe, it, expect } from 'vitest';
import { tryMove, isSolved } from './engine';
import { parseLevel } from './level';
import { Tile } from './types';

describe('tryMove — plain moves', () => {
  it('walks onto floor: updates player, vacates origin, bumps moves only', () => {
    const s = parseLevel('@  ');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.pushed).toBe(false);
    expect(r.state.player).toEqual({ x: 1, y: 0 });
    expect(r.state.grid[0][0]).toBe(Tile.Floor);
    expect(r.state.grid[0][1]).toBe(Tile.Player);
    expect(r.state.moves).toBe(1);
    expect(r.state.pushes).toBe(0);
  });

  it('walks onto a goal: player becomes PlayerOnGoal', () => {
    const s = parseLevel('@.');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.state.grid[0][1]).toBe(Tile.PlayerOnGoal);
    expect(r.state.grid[0][0]).toBe(Tile.Floor);
  });

  it('leaving a goal restores it to Goal', () => {
    const s = parseLevel('+  '); // player starts on a goal
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.state.grid[0][0]).toBe(Tile.Goal);
    expect(r.state.grid[0][1]).toBe(Tile.Player);
  });

  it('wall blocks the move and returns the same state unchanged', () => {
    const s = parseLevel('@#');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(false);
    expect(r.pushed).toBe(false);
    expect(r.state).toBe(s);
    expect(r.state.moves).toBe(0);
  });

  it('grid edge blocks the move (out of bounds)', () => {
    const s = parseLevel('@');
    const r = tryMove(s, 'left');
    expect(r.moved).toBe(false);
    expect(r.state).toBe(s);
  });
});

describe('tryMove — pushing boxes', () => {
  it('pushes a box onto floor: box and player advance, pushes bumps', () => {
    const s = parseLevel('@$ ');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.pushed).toBe(true);
    expect(r.state.grid[0][0]).toBe(Tile.Floor);
    expect(r.state.grid[0][1]).toBe(Tile.Player);
    expect(r.state.grid[0][2]).toBe(Tile.Box);
    expect(r.state.player).toEqual({ x: 1, y: 0 });
    expect(r.state.moves).toBe(1);
    expect(r.state.pushes).toBe(1);
  });

  it('pushes a box onto a goal: box becomes BoxOnGoal', () => {
    const s = parseLevel('@$.');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.pushed).toBe(true);
    expect(r.state.grid[0][2]).toBe(Tile.BoxOnGoal);
    expect(r.state.grid[0][1]).toBe(Tile.Player);
  });

  it('pushing a box off a goal leaves the player on that goal', () => {
    const s = parseLevel('@*.'); // box-on-goal, then a goal to receive it
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.pushed).toBe(true);
    expect(r.state.grid[0][1]).toBe(Tile.PlayerOnGoal);
    expect(r.state.grid[0][2]).toBe(Tile.BoxOnGoal);
  });

  it('box blocked by a wall: no move', () => {
    const s = parseLevel('@$#');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(false);
    expect(r.pushed).toBe(false);
    expect(r.state).toBe(s);
  });

  it('box blocked by another box: no move', () => {
    const s = parseLevel('@$$');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(false);
    expect(r.state).toBe(s);
  });

  it('box blocked by the grid edge: no move', () => {
    const s = parseLevel('@$');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(false);
    expect(r.state).toBe(s);
  });
});

describe('tryMove — immutability', () => {
  it('does not mutate the input state on a successful move', () => {
    const s = parseLevel('@$ ');
    const before = JSON.stringify(s);
    const r = tryMove(s, 'right');
    expect(JSON.stringify(s)).toBe(before);
    expect(r.state.grid).not.toBe(s.grid);
    expect(r.state).not.toBe(s);
  });
});

describe('isSolved', () => {
  it('false while an uncovered goal remains', () => {
    const s = parseLevel('@$.');
    expect(isSolved(s)).toBe(false);
  });

  it('true once every goal is covered by a box', () => {
    const s = parseLevel('@$.');
    const r = tryMove(s, 'right');
    expect(isSolved(r.state)).toBe(true);
  });

  it('true for a level that starts fully solved (box-on-goal)', () => {
    expect(isSolved(parseLevel('@*'))).toBe(true);
  });

  it('false when the player stands on a goal (PlayerOnGoal is not covered)', () => {
    expect(isSolved(parseLevel('+'))).toBe(false);
  });

  it('false when the level has no goals (goalCount === 0 guard)', () => {
    expect(isSolved(parseLevel('@  '))).toBe(false);
  });
});

describe('ice sliding', () => {
  it('slides the player across ice and stops on floor', () => {
    const s = parseLevel('@~~~ ');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.pushed).toBe(false);
    expect(r.state.player).toEqual({ x: 4, y: 0 });
    expect(r.state.moves).toBe(1);
  });

  it('stops at a wall on ice', () => {
    const s = parseLevel('@~~#');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.state.player).toEqual({ x: 2, y: 0 });
    expect(r.state.moves).toBe(1);
  });

  it('slides across single ice tile onto floor', () => {
    const s = parseLevel('@~ ');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.state.player).toEqual({ x: 2, y: 0 });
    expect(r.state.moves).toBe(1);
  });

  it('does not slide when moving onto floor directly', () => {
    const s = parseLevel('@  ');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.state.player).toEqual({ x: 1, y: 0 });
    expect(r.state.moves).toBe(1);
  });

  it('stops at a box on ice (box not pushed)', () => {
    const s = parseLevel('@~$ ');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(true);
    expect(r.pushed).toBe(true);
    expect(r.state.player).toEqual({ x: 2, y: 0 });
    expect(r.state.grid[0][3]).toBe(Tile.Box);
    expect(r.state.moves).toBe(1);
  });

  it('no move into wall from ice start', () => {
    const s = parseLevel('@#');
    const r = tryMove(s, 'right');
    expect(r.moved).toBe(false);
  });
});
