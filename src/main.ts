import Phaser from 'phaser';
import { GameController } from './game/controller';
import { LEVELS } from './game/levels';
import { parseLevel } from './game/level';
import { BANNER_H, GameScene, HUD_H, SCENE_BG, TILE } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { EditorScene } from './scenes/EditorScene';
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

// Editor uses a wider canvas (12 columns + palette) and 8 rows minimum
const editorW = 12 * TILE + 160 + 24;
const editorH = HUD_H + 12 * TILE + BANNER_H;
const canvasW = Math.max(maxW * TILE, editorW);
const canvasH = Math.max(HUD_H + maxH * TILE + BANNER_H, editorH);

const gameScene = new GameScene(controller);
const menuScene = new MenuScene(controller);
const editorScene = new EditorScene(controller);

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: canvasW,
  height: canvasH,
  backgroundColor: SCENE_BG,
  scene: [gameScene, menuScene, editorScene],
});
