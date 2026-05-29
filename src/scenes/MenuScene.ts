import Phaser from 'phaser';
import { GameController } from '../game/controller';

const BTN_W = 200;
const BTN_H = 44;
const BTN_GAP = 12;
const BTN_BG = 0x2c3047;
const BTN_HOVER = 0x4d8bf0;
const BTN_BORDER = 0x4d8bf0;

export class MenuScene extends Phaser.Scene {
  private controller: GameController;

  constructor(controller: GameController) {
    super('menu');
    this.controller = controller;
  }

  create(): void {
    const total = this.controller.levelCount();
    const canvasW = Number(this.game.config.width) || 0;
    const canvasH = Number(this.game.config.height) || 0;

    // Update sim API hooks for the menu context
    if (window.__sokoban) {
      window.__sokoban.isOnMenu = () => true;
    }

    // Title
    this.add
      .text(canvasW / 2, 40, 'Sokoban', {
        fontSize: '32px',
        color: '#ffd54a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    // Level buttons
    const listH = total * (BTN_H + BTN_GAP) - BTN_GAP;
    const startY = Math.max(100, (canvasH - listH - BTN_H - BTN_GAP - 12) / 2);

    for (let i = 0; i < total; i++) {
      const y = startY + i * (BTN_H + BTN_GAP);
      this.makeButton(canvasW / 2, y, `Level ${i + 1}`, () => {
        this.controller.loadLevelByIndex(i);
        this.scene.start('game');
      });
    }

    // Editor button
    const editorY = startY + total * (BTN_H + BTN_GAP) + 12;
    this.makeButton(canvasW / 2, editorY, '🛠 Level Editor', () => {
      this.scene.start('editor');
    });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const btn = this.add
      .rectangle(x, y + BTN_H / 2, BTN_W, BTN_H, BTN_BG)
      .setStrokeStyle(1, BTN_BORDER)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => btn.setFillStyle(BTN_HOVER))
      .on('pointerout', () => btn.setFillStyle(BTN_BG))
      .on('pointerdown', onClick);

    this.add
      .text(x, y + BTN_H / 2, label, {
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);
  }
}
