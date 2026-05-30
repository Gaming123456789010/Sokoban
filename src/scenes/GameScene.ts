import Phaser from 'phaser';
import { GameController } from '../game/controller';
import { Direction, StateSnapshot, Tile } from '../game/types';
import { isMuted, setMuted, sfxMove, sfxPush, sfxSolve } from '../game/sound';
import { computeStars } from '../game/stars';
import { recordSolve } from '../game/storage';
import { PARS } from '../game/levels';

export const TILE = 48;
export const HUD_H = 40;
export const BANNER_H = 48;

export const MODAL_W = 320;
export const MODAL_H = 160;

const TWEEN_MS = 100;

const COLOR_BG = 0x1d1f2b;
const COLOR_FLOOR = 0x2c3047;
const COLOR_FLOOR_LINE = 0x20233a;
const COLOR_WALL = 0x14161f;
const COLOR_GOAL = 0xffd54a;
const COLOR_BOX = 0xb5651d;
const COLOR_BOX_DONE = 0x3fae5a;
const COLOR_PLAYER = 0x4d8bf0;

const MODAL_BG = 0x14161f;
const MODAL_BORDER = 0xffd54a;
const BTN_BG = 0x4d8bf0;
const BTN_HOVER = 0x6aa5ff;
const BTN_TEXT = '#ffffff';

export class GameScene extends Phaser.Scene {
  private controller: GameController;

  private gfx!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;

  // Win modal
  private modalContainer!: Phaser.GameObjects.Container;
  private modalTitle!: Phaser.GameObjects.Text;
  private modalStats!: Phaser.GameObjects.Text;
  private modalNextBg!: Phaser.GameObjects.Rectangle;
  private modalNextText!: Phaser.GameObjects.Text;

  // Animated player
  private animated = true;
  private playerGfx!: Phaser.GameObjects.Arc;
  private animToggle!: Phaser.GameObjects.Text;

  // Previous state for sound diff
  private prevState: StateSnapshot | null = null;

  private unsubController: (() => void) | null = null;

  constructor(controller: GameController) {
    super('game');
    this.controller = controller;
  }

  create(): void {
    this.gfx = this.add.graphics();
    this.hud = this.add.text(8, 10, '', { fontSize: '18px', color: '#ffffff' });

    // Player sprite (on top of the grid)
    this.playerGfx = this.add
      .circle(0, 0, TILE / 2 - 6, COLOR_PLAYER)
      .setDepth(2);

    // Animation toggle indicator
    this.animToggle = this.add
      .text(8, 0, '', { fontSize: '12px', color: '#aaaaaa' })
      .setDepth(5);

    this.buildModal();
    this.buildTouchInputs();

    const kb = this.input.keyboard!;
    const bind = (key: string, dir: Direction) =>
      kb.on(`keydown-${key}`, (e: KeyboardEvent) => {
        if (!e.repeat) this.controller.move(dir);
      });
    bind('UP', 'up');
    bind('DOWN', 'down');
    bind('LEFT', 'left');
    bind('RIGHT', 'right');
    bind('W', 'up');
    bind('S', 'down');
    bind('A', 'left');
    bind('D', 'right');
    kb.on('keydown-Z', (e: KeyboardEvent) => {
      if (!e.repeat) this.controller.undo();
    });
    kb.on('keydown-Y', (e: KeyboardEvent) => {
      if (!e.repeat) this.controller.redo();
    });
    kb.on('keydown-R', (e: KeyboardEvent) => {
      if (!e.repeat) this.controller.restart();
    });
    kb.on('keydown-ESC', (e: KeyboardEvent) => {
      if (!e.repeat) this.scene.start('menu');
    });
    kb.on('keydown-T', (e: KeyboardEvent) => {
      if (!e.repeat) {
        this.animated = !this.animated;
        this.animToggle.setText(this.animated ? 'Anim: ON' : 'Anim: OFF');
      }
    });
    kb.on('keydown-M', (e: KeyboardEvent) => {
      if (!e.repeat) {
        const nowMuted = setMuted(!isMuted());
        this.animToggle.setText(
          (this.animated ? 'Anim: ON' : 'Anim: OFF') +
            (nowMuted ? '  Mute: ON' : '  Mute: OFF')
        );
      }
    });

    // Unsub previous listener to avoid duplicates on scene restart
    if (this.unsubController) this.unsubController();
    this.unsubController = this.controller.subscribe(() => this.render());
    this.render();

    if (window.__sokoban) {
      window.__sokoban.ready = true;
      window.__sokoban.isWinModalVisible = () => this.modalContainer.visible;
      window.__sokoban.gotoMenu = () => this.scene.start('menu');
      window.__sokoban.isOnMenu = () => false;
      window.__sokoban.startGame = () => {}; // already in game scene
    }
  }

  private buildTouchInputs(): void {
    const SWIPE_MIN = 20;
    let downX = 0;
    let downY = 0;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      downX = pointer.x;
      downY = pointer.y;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dx = pointer.x - downX;
      const dy = pointer.y - downY;
      if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) return;

      let dir: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? 'right' : 'left';
      } else {
        dir = dy > 0 ? 'down' : 'up';
      }
      this.controller.move(dir);
    });

    // On-screen buttons (positioned in the banner area below the board)
    const y = this.game.config.height as number - 24;
    const hudW = this.game.config.width as number;

    this.makeScreenButton(hudW / 2 - 80, y, 'Undo', () => this.controller.undo());
    this.makeScreenButton(hudW / 2 + 80, y, 'Restart', () => this.controller.restart());
  }

  private makeScreenButton(x: number, y: number, label: string, action: () => void): void {
    this.add
      .rectangle(x, y, 120, 32, BTN_BG)
      .setStrokeStyle(1, BTN_BG)
      .setDepth(5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', action);
    this.add
      .text(x, y, label, { fontSize: '14px', color: '#ffffff' })
      .setOrigin(0.5, 0.5)
      .setDepth(6);
  }

  private buildModal(): void {
    const modal = this.add.container(0, 0).setVisible(false).setDepth(10).setName('winModal');
    this.modalContainer = modal;

    const bg = this.add
      .rectangle(MODAL_W / 2, MODAL_H / 2, MODAL_W, MODAL_H, MODAL_BG, 0.95)
      .setStrokeStyle(2, MODAL_BORDER);
    bg.setInteractive();
    modal.add(bg);

    this.modalTitle = this.add.text(MODAL_W / 2, 24, '', {
      fontSize: '24px',
      color: '#ffd54a',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    modal.add(this.modalTitle);

    this.modalStats = this.add.text(MODAL_W / 2, 58, '', {
      fontSize: '16px',
      color: '#cccccc',
    }).setOrigin(0.5, 0);
    modal.add(this.modalStats);

    const btnW = 160;
    const btnH = 36;
    const btnY = 110;
    this.modalNextBg = this.add
      .rectangle(MODAL_W / 2, btnY, btnW, btnH, BTN_BG)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.modalNextBg.setFillStyle(BTN_HOVER))
      .on('pointerout', () => this.modalNextBg.setFillStyle(BTN_BG))
      .on('pointerdown', () => {
        this.controller.nextLevel();
      });
    modal.add(this.modalNextBg);

    this.modalNextText = this.add
      .text(MODAL_W / 2, btnY, '', { fontSize: '18px', color: BTN_TEXT })
      .setOrigin(0.5, 0.5);
    modal.add(this.modalNextText);
  }

  private render(): void {
    const s = this.controller.getState();

    // Static layer — floor, walls, goals, boxes
    const g = this.gfx;
    g.clear();

    for (let y = 0; y < s.height; y++) {
      for (let x = 0; x < s.width; x++) {
        this.drawTileStatic(s.grid[y][x], x * TILE, HUD_H + y * TILE);
      }
    }

    // Sound effects + persistence + stars: diff current vs previous
    if (this.prevState) {
      const prev = this.prevState;
      if (s.solved !== prev.solved && s.solved) {
        sfxSolve();
        const stars = computeStars(s.moves, PARS[s.levelIndex] ?? 999);
        try { recordSolve(s.levelIndex, s.moves, s.pushes, stars); } catch { /* don't crash render */ }
      } else if (s.pushes > prev.pushes) {
        sfxPush();
      } else if (s.moves > prev.moves) {
        sfxMove();
      }
    }
    this.prevState = s;

    // Player sprite (tweened)
    const playerPx = s.player.x * TILE + TILE / 2;
    const playerPy = HUD_H + s.player.y * TILE + TILE / 2;
    this.moveAnimated(this.playerGfx, playerPx, playerPy);

    this.hud.setText(
      `Moves: ${s.moves}    Pushes: ${s.pushes}` +
        (s.deadlocked ? '    ⚠ Stuck! Undo (Z) or Restart (R)' : '')
    );

    // Animation toggle indicator
    this.animToggle.setPosition(8, HUD_H - 20);

    const canvasW = Number(this.sys.game.config.width) || 0;
    const canvasH = Number(this.sys.game.config.height) || 0;

    if (s.solved) {
      const isLast = s.levelIndex >= s.levelCount - 1;
      const par = PARS[s.levelIndex] ?? 999;
      const stars = computeStars(s.moves, par);
      const starText = '★'.repeat(stars) + '☆'.repeat(3 - stars);

      this.modalTitle.setText(isLast ? 'All Complete!' : 'Level Solved!');
      this.modalStats.setText(
        `Moves: ${s.moves}    Pushes: ${s.pushes}\nPar: ${par}    ${starText}`
      );

      if (isLast) {
        this.modalNextBg.setVisible(false);
        this.modalNextText.setText('You solved all levels!').setColor('#ffd54a');
      } else {
        this.modalNextBg.setVisible(true);
        this.modalNextText.setText('Next Level').setColor(BTN_TEXT);
      }

      const mx = (canvasW - MODAL_W) / 2;
      const my = Math.max(0, Math.min(canvasH - MODAL_H, (canvasH - MODAL_H) / 2));
      this.modalContainer.setPosition(mx, my).setVisible(true);
    } else {
      this.modalContainer.setVisible(false);
    }
  }

  /** Draw static tile (floor, wall, goal marker, boxes). Player is rendered as a tweened sprite. */
  private drawTileStatic(t: Tile, px: number, py: number): void {
    const g = this.gfx;

    if (t === Tile.Wall) {
      g.fillStyle(COLOR_WALL, 1);
      g.fillRect(px, py, TILE, TILE);
      return;
    }

    g.fillStyle(COLOR_FLOOR, 1);
    g.fillRect(px, py, TILE, TILE);
    g.lineStyle(1, COLOR_FLOOR_LINE, 1);
    g.strokeRect(px, py, TILE, TILE);

    if (t === Tile.Goal || t === Tile.BoxOnGoal || t === Tile.PlayerOnGoal) {
      g.fillStyle(COLOR_GOAL, 1);
      g.fillCircle(px + TILE / 2, py + TILE / 2, 6);
    }

    if (t === Tile.Box || t === Tile.BoxOnGoal) {
      g.fillStyle(t === Tile.BoxOnGoal ? COLOR_BOX_DONE : COLOR_BOX, 1);
      g.fillRect(px + 6, py + 6, TILE - 12, TILE - 12);
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

  /** Move a game object to (x, y), tweening if animation is enabled. */
  private moveAnimated(obj: Phaser.GameObjects.GameObject & { x: number; y: number }, x: number, y: number): void {
    if (!this.animated) {
      obj.x = x;
      obj.y = y;
      return;
    }

    // Kill existing tweens on this object to prevent visual stranding on rapid input
    this.tweens.killTweensOf(obj);

    if (obj.x === 0 && obj.y === 0) {
      // First placement — snap to avoid teleport tween on initial render
      obj.x = x;
      obj.y = y;
      return;
    }

    this.tweens.add({
      targets: obj,
      x,
      y,
      duration: TWEEN_MS,
      ease: 'Quad.easeOut',
    });
  }
}

export const SCENE_BG = COLOR_BG;
