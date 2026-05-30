import type { Page } from '@playwright/test';
import type { Direction, StateSnapshot } from '../src/game/types';

export async function ready(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(() => window.__sokoban?.ready === true);
}

export async function startGame(page: Page): Promise<void> {
  await page.evaluate(() => window.__sokoban!.startGame());
  await page.waitForFunction(() => window.__sokoban?.ready === true);
}

export function state(page: Page): Promise<StateSnapshot> {
  return page.evaluate(() => window.__sokoban!.getState());
}

export function load(page: Page, level: string): Promise<void> {
  return page.evaluate((lvl) => window.__sokoban!.loadLevel(lvl), level);
}

export function move(page: Page, dir: Direction): Promise<boolean> {
  return page.evaluate((d) => window.__sokoban!.move(d), dir);
}

export function undo(page: Page): Promise<boolean> {
  return page.evaluate(() => window.__sokoban!.undo());
}

export function redo(page: Page): Promise<boolean> {
  return page.evaluate(() => window.__sokoban!.redo());
}

export function restart(page: Page): Promise<void> {
  return page.evaluate(() => window.__sokoban!.restart());
}
