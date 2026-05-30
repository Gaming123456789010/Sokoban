import { test, expect } from '@playwright/test';
import { load, move, ready, startGame, state } from './helpers';

const ROOM = ['#####', '#   #', '# @ #', '#   #', '#####'].join('\n');

test.beforeEach(async ({ page }) => {
  await ready(page);
});

test('player moves one tile per sim move into floor', async ({ page }) => {
  await load(page, ROOM);
  expect((await state(page)).player).toEqual({ x: 2, y: 2 });

  expect(await move(page, 'up')).toBe(true);
  const s = await state(page);
  expect(s.player).toEqual({ x: 2, y: 1 });
  expect(s.moves).toBe(1);
});

test('walls block movement', async ({ page }) => {
  await load(page, ROOM);
  await move(page, 'up'); // (2,2) -> (2,1)
  expect(await move(page, 'up')).toBe(false); // (2,1) -> wall at (2,0)

  const s = await state(page);
  expect(s.player).toEqual({ x: 2, y: 1 });
  expect(s.moves).toBe(1);
});

test('real keyboard input drives a move', async ({ page }) => {
  await startGame(page);
  await load(page, ROOM);
  await page.locator('#app canvas').click();
  await page.keyboard.press('ArrowRight');

  const s = await state(page);
  expect(s.player).toEqual({ x: 3, y: 2 });
  expect(s.moves).toBe(1);
});
