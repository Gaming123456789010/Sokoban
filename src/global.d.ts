import type { Direction, StateSnapshot } from './game/types';

declare global {
  interface Window {
    __sokoban?: {
      ready: boolean;
      move(dir: Direction): boolean;
      undo(): boolean;
      redo(): boolean;
      restart(): void;
      loadLevel(text: string): void;
      loadLevelByIndex(i: number): boolean;
      nextLevel(): boolean;
      isSolved(): boolean;
      getState(): StateSnapshot;
      isWinModalVisible(): boolean;
      gotoMenu(): void;
      isOnMenu(): boolean;
      startGame(): void;
    };
    __ready?: boolean;
  }
}

export {};
