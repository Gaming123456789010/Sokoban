import Phaser from 'phaser';
import { GameController } from './game/controller';
import { LEVELS } from './game/levels';
import { parseLevel } from './game/level';
import { BANNER_H, GameScene, HUD_H, SCENE_BG, TILE } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { attachSimApi } from './sim/api';

const controller = new GameController(LEVELS);
attachSimApi(controller);

// The Phaser canvas is fixed at creation, so size it to the largest level
// across the whole list — every puzzle then fits without resizing.
let maxW = 0;
let maxH = 0;
for (const lvl of LEVELS) {
  const s = parseLevel(lvl);
  maxW = Math.max(maxW, s.grid[0]?.length ?? 0);
  maxH = Math.max(maxH, s.grid.length);
}

const gameScene = new GameScene(controller);
const menuScene = new MenuScene(controller);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: maxW * TILE,
  height: HUD_H + maxH * TILE + BANNER_H,
  backgroundColor: SCENE_BG,
  scene: [gameScene, menuScene],
});
