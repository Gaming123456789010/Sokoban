import { test, expect } from '@playwright/test';
import { move, ready, state } from './helpers';

const nextLevel = (page: import('@playwright/test').Page) =>
  page.evaluate(() => window.__sokoban!.nextLevel());
const loadByIndex = (page: import('@playwright/test').Page, i: number) =>
  page.evaluate((n) => window.__sokoban!.loadLevelByIndex(n), i);

test.beforeEach(async ({ page }) => {
  await ready(page);
});

test('shipped game starts on level 0 and reports the level count', async ({ page }) => {
  const s = await state(page);
  expect(s.levelIndex).toBe(0);
  expect(s.levelCount).toBeGreaterThan(1);
});

test('nextLevel advances the index and swaps in a different grid', async ({ page }) => {
  const before = await state(page);
  const advanced = await nextLevel(page);
  const after = await state(page);

  expect(advanced).toBe(true);
  expect(after.levelIndex).toBe(before.levelIndex + 1);
  expect(after.grid).not.toEqual(before.grid);
  // a freshly loaded level resets progress
  expect(after.moves).toBe(0);
  expect(after.pushes).toBe(0);
});

test('nextLevel returns false and stays put on the last level', async ({ page }) => {
  const { levelCount } = await state(page);
  expect(await loadByIndex(page, levelCount - 1)).toBe(true);

  const advanced = await nextLevel(page);
  expect(advanced).toBe(false);
  expect((await state(page)).levelIndex).toBe(levelCount - 1);
});

test('loadLevelByIndex loads a chosen level and rejects out-of-range', async ({ page }) => {
  expect(await loadByIndex(page, 2)).toBe(true);
  expect((await state(page)).levelIndex).toBe(2);

  const { levelCount } = await state(page);
  expect(await loadByIndex(page, levelCount)).toBe(false);
  expect(await loadByIndex(page, -1)).toBe(false);
  expect((await state(page)).levelIndex).toBe(2); // unchanged by rejected loads
});

test('a shipped level is solvable through the sim API', async ({ page }) => {
  // level 1 is "#@$.#": a single push right wins.
  expect(await loadByIndex(page, 1)).toBe(true);
  expect((await state(page)).solved).toBe(false);
  await move(page, 'right');
  expect((await state(page)).solved).toBe(true);
});
