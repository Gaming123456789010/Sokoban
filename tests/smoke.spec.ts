import { test, expect } from '@playwright/test';

test('page loads, Phaser canvas mounts, sim API is ready', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.__sokoban?.ready === true);
  await expect(page.locator('#app canvas')).toBeVisible();
});
