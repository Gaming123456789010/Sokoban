import { test, expect } from '@playwright/test';
import { load, move, ready, state } from './helpers';
import { Tile } from '../src/game/types';

test.beforeEach(async ({ page }) => {
  await ready(page);
});

test('pushing a box moves it and counts a push', async ({ page }) => {
  await load(page, ['#####', '#@$ #', '#####'].join('\n'));
  expect(await move(page, 'right')).toBe(true);

  const s = await state(page);
  expect(s.player).toEqual({ x: 2, y: 1 });
  expect(s.grid[1][3]).toBe(Tile.Box);
  expect(s.moves).toBe(1);
  expect(s.pushes).toBe(1);
});

test('a box cannot be pushed into a wall', async ({ page }) => {
  await load(page, ['####', '#@$#', '####'].join('\n'));
  expect(await move(page, 'right')).toBe(false);

  const s = await state(page);
  expect(s.player).toEqual({ x: 1, y: 1 });
  expect(s.pushes).toBe(0);
});

test('a box cannot be pushed into another box', async ({ page }) => {
  await load(page, ['######', '#@$$ #', '######'].join('\n'));
  expect(await move(page, 'right')).toBe(false);

  expect((await state(page)).player).toEqual({ x: 1, y: 1 });
});
