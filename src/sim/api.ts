import { GameController } from '../game/controller';
import { Direction } from '../game/types';

/**
 * Attach the player-simulation API to window. Calls the controller directly
 * (the single source of truth) so Playwright can drive the game and read state
 * deterministically. `ready` is flipped to true by the scene once its input
 * handlers are wired (see GameScene.create).
 */
export function attachSimApi(controller: GameController): void {
  window.__sokoban = {
    ready: false,
    move: (dir: Direction) => controller.move(dir),
    undo: () => controller.undo(),
    redo: () => controller.redo(),
    restart: () => controller.restart(),
    loadLevel: (text: string) => controller.loadLevel(text),
    loadLevelByIndex: (i: number) => controller.loadLevelByIndex(i),
    nextLevel: () => controller.nextLevel(),
    isSolved: () => controller.isSolved(),
    getState: () => controller.getState(),
    isWinModalVisible: () => false,
    gotoMenu: () => {},
    isOnMenu: () => false,
    startGame: () => {},
  };
}
