const KEY = 'sokoban_progress';

interface Progress {
  bestMoves: Record<number, number>;
  bestPushes: Record<number, number>;
  lastLevel: number;
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { bestMoves: {}, bestPushes: {}, lastLevel: 0 };
}

function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

export function recordSolve(levelIndex: number, moves: number, pushes: number): void {
  const p = load();
  if (!p.bestMoves[levelIndex] || moves < p.bestMoves[levelIndex]) {
    p.bestMoves[levelIndex] = moves;
  }
  if (!p.bestPushes[levelIndex] || pushes < p.bestPushes[levelIndex]) {
    p.bestPushes[levelIndex] = pushes;
  }
  p.lastLevel = levelIndex;
  save(p);
}

export function getProgress(levelIndex: number): { bestMoves?: number; bestPushes?: number } {
  const p = load();
  return {
    bestMoves: p.bestMoves[levelIndex],
    bestPushes: p.bestPushes[levelIndex],
  };
}

export function getLastLevel(): number {
  return load().lastLevel;
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(KEY);
  } catch { /* ignore */ }
}
