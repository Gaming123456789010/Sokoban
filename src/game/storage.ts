const KEY = 'sokoban_progress';

interface Progress {
  bestMoves: Record<number, number>;
  bestPushes: Record<number, number>;
  bestStars: Record<number, number>;
  lastLevel: number;
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        bestMoves: parsed.bestMoves ?? {},
        bestPushes: parsed.bestPushes ?? {},
        bestStars: parsed.bestStars ?? {},
        lastLevel: parsed.lastLevel ?? 0,
      };
    }
  } catch { /* ignore */ }
  return { bestMoves: {}, bestPushes: {}, bestStars: {}, lastLevel: 0 };
}

function save(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch { /* ignore */ }
}

export function recordSolve(levelIndex: number, moves: number, pushes: number, stars?: number): void {
  const p = load();
  if (!p.bestMoves[levelIndex] || moves < p.bestMoves[levelIndex]) {
    p.bestMoves[levelIndex] = moves;
  }
  if (!p.bestPushes[levelIndex] || pushes < p.bestPushes[levelIndex]) {
    p.bestPushes[levelIndex] = pushes;
  }
  if (stars !== undefined && (!p.bestStars[levelIndex] || stars > p.bestStars[levelIndex])) {
    p.bestStars[levelIndex] = stars;
  }
  p.lastLevel = levelIndex;
  save(p);
}

export function getProgress(levelIndex: number): { bestMoves?: number; bestPushes?: number; bestStars?: number } {
  const p = load();
  return {
    bestMoves: p.bestMoves[levelIndex],
    bestPushes: p.bestPushes[levelIndex],
    bestStars: p.bestStars[levelIndex],
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
