export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Pos {
  x: number;
  y: number;
}

export enum Tile {
  Floor = 0,
  Wall = 1,
  Goal = 2,
  Box = 3,
  BoxOnGoal = 4,
  Player = 5,
  PlayerOnGoal = 6,
  Ice = 7,
  Switch = 8,
  Door = 9,
}

export type Grid = Tile[][]; // indexed [y][x], origin top-left, y increases downward

export interface GameState {
  grid: Grid;
  player: Pos;
  goalCount: number;
  moves: number;
  pushes: number;
  switchPos: Pos[];
}

export interface StateSnapshot {
  grid: Tile[][];
  player: Pos;
  width: number;
  height: number;
  moves: number;
  pushes: number;
  solved: boolean;
  levelIndex: number;
  levelCount: number;
  deadlocked: boolean;
}
