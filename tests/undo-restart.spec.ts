import { test, expect } from '@playwright/test';
import { load, move, ready, restart, state, undo } from './helpers';

const ROOM = ['#####', '#@  #', '#####'].join('\n');

test.beforeEach(async ({ page }) => {
  await ready(page);
});

test('undo reverts position and move count', async ({ page }) => {
  await load(page, ROOM);
  await move(page, 'right');
  await move(page, 'right');

  let s = await state(page);
  expect(s.player).toEqual({ x: 3, y: 1 });
  expect(s.moves).toBe(2);

  expect(await undo(page)).toBe(true);
  s = await state(page);
  expect(s.player).toEqual({ x: 2, y: 1 });
  expect(s.moves).toBe(1);
});

test('undo past the start does nothing', async ({ page }) => {
  await load(page, ROOM);
  await move(page, 'right');
  expect(await undo(page)).toBe(true);
  expect(await undo(page)).toBe(false);
  expect((await state(page)).moves).toBe(0);
});

test('restart resets to the initial state', async ({ page }) => {
  await load(page, ROOM);
  await move(page, 'right');
  await move(page, 'right');
  await restart(page);

  const s = await state(page);
  expect(s.player).toEqual({ x: 1, y: 1 });
  expect(s.moves).toBe(0);
});

test('push counter reverts on undo', async ({ page }) => {
  await load(page, ['#####', '#@$ #', '#####'].join('\n'));
  await move(page, 'right');
  expect((await state(page)).pushes).toBe(1);

  await undo(page);
  expect((await state(page)).pushes).toBe(0);
});
