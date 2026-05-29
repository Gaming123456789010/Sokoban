import Phaser from 'phaser';
import { GameController } from '../game/controller';
import { serializeLevel } from '../game/level';
import { Tile } from '../game/types';
import { HUD_H, TILE } from './GameScene';

const COLOR_FLOOR = 0x2c3047;
const COLOR_FLOOR_LINE = 0x20233a;
const COLOR_WALL = 0x14161f;
const COLOR_GOAL = 0xffd54a;
const COLOR_BOX = 0xb5651d;
const COLOR_PLAYER = 0x4d8bf0;

const PALETTE_X = 12 * TILE + 24;
const PALETTE_W = 140;
const BTN_H = 34;

interface PaletteEntry {
  label: string;
  tile: Tile;
  color: number;
}

const PALETTE: PaletteEntry[] = [
  { label: 'Wall', tile: Tile.Wall, color: COLOR_WALL },
  { label: 'Floor', tile: Tile.Floor, color: COLOR_FLOOR },
  { label: 'Goal', tile: Tile.Goal, color: COLOR_GOAL },
  { label: 'Box', tile: Tile.Box, color: COLOR_BOX },
  { label: 'Player', tile: Tile.Player, color: COLOR_PLAYER },
  { label: 'Ice', tile: Tile.Ice, color: 0x5ccef0 },
  { label: 'Switch', tile: Tile.Switch, color: 0x8844ff },
  { label: 'Door', tile: Tile.Door, color: 0x8844ff },
  { label: 'Eraser', tile: Tile.Floor, color: 0x666666 },
];

export class EditorScene extends Phaser.Scene {
  private controller: GameController;
  private gfx!: Phaser.GameObjects.Graphics;
  private grid: Tile[][] = [];
  private cols = 10;
  private rows = 8;
  private selectedTile = Tile.Wall;
  private statusText!: Phaser.GameObjects.Text;
  private playerX = 0;
  private playerY = 0;

  constructor(controller: GameController) {
    super('editor');
    this.controller = controller;
  }

  create(): void {
    this.gfx = this.add.graphics();
    this.initGrid();

    if (window.__sokoban) {
      window.__sokoban.ready = true;
      window.__sokoban.isOnMenu = () => false;
    }

    // Title
    this.add
      .text(8, 8, 'Level Editor', { fontSize: '18px', color: '#ffd54a', fontStyle: 'bold' });

    // Status / validation message
    this.statusText = this.add
      .text(8, HUD_H, '', { fontSize: '13px', color: '#ff6666' });

    this.buildPalette();
    this.buildButtons();
    this.bindGridClick();
    this.renderGrid();
  }

  private initGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.rows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.grid[y][x] = Tile.Floor;
      }
    }
    this.playerX = 0;
    this.playerY = 0;
    this.grid[0][0] = Tile.Player;
  }

  private buildPalette(): void {
    PALETTE.forEach((entry, i) => {
      const py = HUD_H + i * (BTN_H + 4);
      this.add
        .rectangle(PALETTE_X + PALETTE_W / 2, py + BTN_H / 2, PALETTE_W, BTN_H, entry.color, 0.6)
        .setStrokeStyle(1, 0x888888)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          this.selectedTile = entry.tile;
          this.renderGrid();
        });
      this.add
        .text(PALETTE_X + PALETTE_W / 2, py + BTN_H / 2, entry.label, {
          fontSize: '14px', color: '#ffffff',
        })
        .setOrigin(0.5, 0.5);
    });
  }

  private buildButtons(): void {
    const btnY = HUD_H + PALETTE.length * (BTN_H + 4) + 12;

    // Play button
    this.add
      .rectangle(PALETTE_X + PALETTE_W / 2, btnY + BTN_H / 2, PALETTE_W, BTN_H, 0x3fae5a)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.playLevel());
    this.add
      .text(PALETTE_X + PALETTE_W / 2, btnY + BTN_H / 2, '▶ Play', {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    // Export button
    this.add
      .rectangle(PALETTE_X + PALETTE_W / 2, btnY + BTN_H + BTN_H + 8, PALETTE_W, BTN_H, 0x4d8bf0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.exportLevel());
    this.add
      .text(PALETTE_X + PALETTE_W / 2, btnY + BTN_H + BTN_H + 8, '📋 Copy', {
        fontSize: '16px', color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    // Resize: +cols / -cols
    let ry = btnY + BTN_H + BTN_H + BTN_H + 20;
    this.smallBtn(PALETTE_X + 45, ry, '+ Col', () => this.resize(this.cols + 1, this.rows));
    this.smallBtn(PALETTE_X + PALETTE_W - 45, ry, '- Col', () => this.resize(Math.max(3, this.cols - 1), this.rows));
    ry += 28;
    this.smallBtn(PALETTE_X + 45, ry, '+ Row', () => this.resize(this.cols, this.rows + 1));
    this.smallBtn(PALETTE_X + PALETTE_W - 45, ry, '- Row', () => this.resize(this.cols, Math.max(3, this.rows - 1)));

    // Clear button
    ry += 28;
    this.add
      .rectangle(PALETTE_X + PALETTE_W / 2, ry + 12, PALETTE_W, 28, 0x882222)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { this.initGrid(); this.renderGrid(); });
    this.add
      .text(PALETTE_X + PALETTE_W / 2, ry + 12, 'Clear', {
        fontSize: '14px', color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    // Back to menu
    ry += 40;
    this.add
      .text(PALETTE_X + PALETTE_W / 2, ry, 'ESC — Menu', {
        fontSize: '12px', color: '#888888',
      })
      .setOrigin(0.5, 0);

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('menu');
    });
  }

  private smallBtn(x: number, y: number, label: string, action: () => void): void {
    this.add
      .rectangle(x, y, 64, 24, 0x444444)
      .setStrokeStyle(1, 0x666666)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', action);
    this.add
      .text(x, y, label, { fontSize: '12px', color: '#cccccc' })
      .setOrigin(0.5, 0.5);
  }

  private bindGridClick(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const x = Math.floor(pointer.x / TILE);
      const y = Math.floor((pointer.y - HUD_H) / TILE);
      if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return;
      this.paint(x, y);
      this.renderGrid();
    });
  }

  private paint(x: number, y: number): void {
    const existing = this.grid[y][x];

    // If placing a player, remove existing player from grid
    if (this.selectedTile === Tile.Player) {
      for (let gy = 0; gy < this.rows; gy++) {
        for (let gx = 0; gx < this.cols; gx++) {
          if (this.grid[gy][gx] === Tile.Player) {
            this.grid[gy][gx] = Tile.Floor;
          }
        }
      }
      this.playerX = x;
      this.playerY = y;
      this.grid[y][x] = Tile.Player;
      return;
    }

    // Don't overwrite player with other tiles; clear player ref if we do
    if (existing === Tile.Player) {
      this.grid[y][x] = this.selectedTile;
      // Player is lost — next play validation will catch it
      return;
    }

    this.grid[y][x] = this.selectedTile;
  }

  private resize(newCols: number, newRows: number): void {
    const ng: Tile[][] = [];
    for (let y = 0; y < newRows; y++) {
      ng[y] = [];
      for (let x = 0; x < newCols; x++) {
        ng[y][x] = (y < this.rows && x < this.cols) ? this.grid[y][x] : Tile.Floor;
      }
    }
    if (this.playerX >= newCols || this.playerY >= newRows) {
      ng[0][0] = Tile.Player;
      this.playerX = 0;
      this.playerY = 0;
    }
    this.grid = ng;
    this.cols = newCols;
    this.rows = newRows;
    this.renderGrid();
  }

  private playLevel(): void {
    const err = this.validate();
    if (err) { this.statusText.setText(err); return; }
    const text = this.exportText();
    this.controller.loadLevel(text);
    this.scene.start('game');
  }

  private exportLevel(): void {
    const err = this.validate();
    if (err) { this.statusText.setText(err); return; }
    const text = this.exportText();
    navigator.clipboard?.writeText(text).catch(() => {});
    this.statusText.setColor('#66ff66');
    this.statusText.setText('Copied to clipboard!');
  }

  private validate(): string | null {
    const player = this.findPlayer();
    if (!player) return 'Place a player (@) on the grid.';
    const boxes = this.count(Tile.Box);
    const goals = this.count(Tile.Goal) + this.count(Tile.BoxOnGoal) + this.count(Tile.PlayerOnGoal);
    if (boxes === 0) return 'Place at least one box.';
    if (goals === 0) return 'Place at least one goal.';
    return null;
  }

  private findPlayer(): { x: number; y: number } | null {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.grid[y][x] === Tile.Player) return { x, y };
      }
    }
    return null;
  }

  private count(tile: Tile): number {
    let n = 0;
    for (const row of this.grid) for (const t of row) if (t === tile) n++;
    return n;
  }

  private exportText(): string {
    return serializeLevel(this.grid);
  }

  private renderGrid(): void {
    const g = this.gfx;
    g.clear();

    // Draw grid
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.grid[y][x];
        const px = x * TILE;
        const py = HUD_H + y * TILE;

        if (t === Tile.Wall) {
          g.fillStyle(COLOR_WALL, 1);
          g.fillRect(px, py, TILE, TILE);
          continue;
        }

        g.fillStyle(COLOR_FLOOR, 1);
        g.fillRect(px, py, TILE, TILE);
        g.lineStyle(1, COLOR_FLOOR_LINE, 1);
        g.strokeRect(px, py, TILE, TILE);

        if (t === Tile.Goal) {
          g.fillStyle(COLOR_GOAL, 1);
          g.fillCircle(px + TILE / 2, py + TILE / 2, 6);
        }
        if (t === Tile.Box) {
          g.fillStyle(COLOR_BOX, 1);
          g.fillRect(px + 6, py + 6, TILE - 12, TILE - 12);
        }
        if (t === Tile.Player) {
          g.fillStyle(COLOR_PLAYER, 1);
          g.fillCircle(px + TILE / 2, py + TILE / 2, TILE / 2 - 6);
        }
        if (t === Tile.Ice) {
          g.fillStyle(0x5ccef0, 0.4);
          g.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
        }
        if (t === Tile.Switch) {
          g.fillStyle(0x8844ff, 1);
          g.fillCircle(px + TILE / 2, py + TILE / 2, 8);
        }
        if (t === Tile.Door) {
          g.fillStyle(0x8844ff, 1);
          g.fillRect(px + 4, py + 4, TILE - 8, TILE - 8);
        }
      }
    }

    // Highlight selected tile
    const selIndex = PALETTE.findIndex((e) => e.tile === this.selectedTile);
    if (selIndex >= 0) {
      const spy = HUD_H + selIndex * (BTN_H + 4);
      g.lineStyle(2, 0xffffff, 1);
      g.strokeRect(PALETTE_X, spy, PALETTE_W, BTN_H);
    }

    this.statusText.setColor('#ff6666');
    this.statusText.setText(`Grid: ${this.cols}×${this.rows}    Select a tile, then click the grid.`);
  }
}
