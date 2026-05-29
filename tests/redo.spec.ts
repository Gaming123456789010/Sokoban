import { test, expect } from '@playwright/test';
import { load, move, ready, state, undo, redo } from './helpers';

const ROOM = ['######', '#@   #', '#    #', '######'].join('\n');

test.beforeEach(async ({ page }) => {
  await ready(page);
});

test('redo re-applies an undone move', async ({ page }) => {
  await load(page, ROOM);

  await move(page, 'right');
  await move(page, 'right');
  let s = await state(page);
  expect(s.player).toEqual({ x: 3, y: 1 });
  expect(s.moves).toBe(2);

  await undo(page);
  s = await state(page);
  expect(s.player).toEqual({ x: 2, y: 1 });
  expect(s.moves).toBe(1);

  expect(await redo(page)).toBe(true);
  s = await state(page);
  expect(s.player).toEqual({ x: 3, y: 1 });
  expect(s.moves).toBe(2);
});

test('redo returns false when nothing to redo', async ({ page }) => {
  await load(page, ROOM);
  expect(await redo(page)).toBe(false);
});

test('redo returns false after undo then move (future cleared)', async ({ page }) => {
  await load(page, ROOM);

  await move(page, 'right');
  await move(page, 'right');
  await undo(page);
  expect(await redo(page)).toBe(true); // redo works before fresh move

  // Now undo again and make a fresh move
  await undo(page);
  await move(page, 'down');

  // Future should be cleared by the fresh move
  expect(await redo(page)).toBe(false);
  const s = await state(page);
  expect(s.player).toEqual({ x: 2, y: 2 });
});

test('multiple undo then multiple redo restores exactly', async ({ page }) => {
  await load(page, ROOM);

  await move(page, 'right');
  await move(page, 'right');
  await move(page, 'right');

  await undo(page);
  await undo(page);
  await undo(page);
  expect((await state(page)).moves).toBe(0);

  await redo(page);
  let s = await state(page);
  expect(s.moves).toBe(1);
  expect(s.player).toEqual({ x: 2, y: 1 });

  await redo(page);
  s = await state(page);
  expect(s.moves).toBe(2);
  expect(s.player).toEqual({ x: 3, y: 1 });

  await redo(page);
  s = await state(page);
  expect(s.moves).toBe(3);
  expect(s.player).toEqual({ x: 4, y: 1 });

  expect(await redo(page)).toBe(false);
});

test('push counter restored on redo', async ({ page }) => {
  await load(page, ['#####', '#@$ #', '#####'].join('\n'));

  await move(page, 'right');
  expect((await state(page)).pushes).toBe(1);

  await undo(page);
  expect((await state(page)).pushes).toBe(0);

  await redo(page);
  expect((await state(page)).pushes).toBe(1);
});

test('restart clears redo stack', async ({ page }) => {
  await load(page, ROOM);

  await move(page, 'right');
  await undo(page);
  expect(await redo(page)).toBe(true); // redo is available

  // Restart should clear everything including future
  await move(page, 'right');
  await undo(page);
  await page.evaluate(() => window.__sokoban!.restart());
  expect(await redo(page)).toBe(false);
});

test('loadLevel clears redo stack', async ({ page }) => {
  await load(page, ROOM);

  await move(page, 'right');
  await undo(page);
  // redo would be available, but loading a new level clears it
  await load(page, ROOM);
  expect(await redo(page)).toBe(false);
});
