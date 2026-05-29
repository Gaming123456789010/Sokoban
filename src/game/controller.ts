import { isSolved, tryMove } from './engine';
import { parseLevel } from './level';
import { deadlockedBoxes } from './deadlock';
import { Direction, GameState, StateSnapshot } from './types';

type Listener = () => void;

/**
 * Single source of truth for game state. Both the keyboard handler and the
 * simulation API call into this; the scene subscribes to redraw on change.
 */
export class GameController {
  private levels: string[];
  private levelIndex = 0;
  private state: GameState;
  private initial: GameState;
  private history: GameState[] = [];
  private future: GameState[] = [];
  private listeners: Listener[] = [];

  constructor(levels: string[]) {
    this.levels = levels;
    this.initial = parseLevel(levels[this.levelIndex]);
    this.state = this.initial;
  }

  move(dir: Direction): boolean {
    const result = tryMove(this.state, dir);
    if (!result.moved) return false;
    this.history.push(this.state);
    this.future = [];
    this.state = result.state;
    this.emit();
    return true;
  }

  undo(): boolean {
    const prev = this.history.pop();
    if (!prev) return false;
    this.future.push(this.state);
    this.state = prev;
    this.emit();
    return true;
  }

  redo(): boolean {
    const next = this.future.pop();
    if (!next) return false;
    this.history.push(this.state);
    this.state = next;
    this.emit();
    return true;
  }

  restart(): void {
    this.history = [];
    this.future = [];
    this.state = this.initial;
    this.emit();
  }

  loadLevel(levelText: string): void {
    this.initial = parseLevel(levelText);
    this.history = [];
    this.future = [];
    this.state = this.initial;
    this.emit();
  }

  /** Load a level from the shipped list. No-op (returns false) if out of range. */
  loadLevelByIndex(i: number): boolean {
    if (i < 0 || i >= this.levels.length) return false;
    this.levelIndex = i;
    this.initial = parseLevel(this.levels[i]);
    this.history = [];
    this.future = [];
    this.state = this.initial;
    this.emit();
    return true;
  }

  /** Advance to the next shipped level. Returns false (and stays put) on the last. */
  nextLevel(): boolean {
    return this.loadLevelByIndex(this.levelIndex + 1);
  }

  levelCount(): number {
    return this.levels.length;
  }

  isSolved(): boolean {
    return isSolved(this.state);
  }

  getState(): StateSnapshot {
    const grid = this.state.grid.map((row) => row.slice());
    return {
      grid,
      player: { ...this.state.player },
      width: grid[0]?.length ?? 0,
      height: grid.length,
      moves: this.state.moves,
      pushes: this.state.pushes,
      solved: isSolved(this.state),
      levelIndex: this.levelIndex,
      levelCount: this.levels.length,
      deadlocked: deadlockedBoxes(this.state).length > 0,
    };
  }

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }
}
