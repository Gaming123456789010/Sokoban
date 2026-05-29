import { test, expect } from '@playwright/test';
import { load, move, ready, state } from './helpers';

test.beforeEach(async ({ page }) => {
  await ready(page);
});

test('shipped level starts unsolved', async ({ page }) => {
  expect((await state(page)).solved).toBe(false);
});

test('covering every goal flips solved=true', async ({ page }) => {
  await load(page, ['#######', '#.$@$.#', '#######'].join('\n'));
  expect((await state(page)).solved).toBe(false);

  await move(page, 'left'); // push left box onto left goal
  expect((await state(page)).solved).toBe(false); // right goal still open

  await move(page, 'right'); // step onto floor
  await move(page, 'right'); // push right box onto right goal
  expect((await state(page)).solved).toBe(true);
});
