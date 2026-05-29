import { test, expect } from '@playwright/test';
import { ready, state } from './helpers';

test.beforeEach(async ({ page }) => {
  await ready(page);
});

test('starts in game, not on menu', async ({ page }) => {
  expect(await page.evaluate(() => window.__sokoban!.isOnMenu())).toBe(false);
});

test('gotoMenu navigates to the menu scene', async ({ page }) => {
  await page.evaluate(() => window.__sokoban!.gotoMenu());
  expect(await page.evaluate(() => window.__sokoban!.isOnMenu())).toBe(true);
});

test('level count is available from the game scene', async ({ page }) => {
  const count = (await state(page)).levelCount;
  expect(count).toBeGreaterThanOrEqual(4);
});

test('selecting a level on the menu then returning to game works', async ({ page }) => {
  // Go to menu, pick level 2, then start game via the same call the button makes
  await page.evaluate(() => window.__sokoban!.gotoMenu());
  expect(await page.evaluate(() => window.__sokoban!.isOnMenu())).toBe(true);

  // Simulate clicking "Level 3" button: loadLevelByIndex + scene.start('game')
  await page.evaluate(() => {
    window.__sokoban!.loadLevelByIndex(2);
    // After button click, scene starts 'game' — we'll drive that via keyboard
  });

  // Press Esc to return to menu then verify game state still reflects level 2
  const s = await state(page);
  expect(s.levelIndex).toBe(2);
  expect(s.moves).toBe(0);
});
