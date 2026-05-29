/** 3 stars ≤ par, 2 stars ≤ 1.5×par, else 1 star. */
export function computeStars(moves: number, par: number): number {
  if (moves <= par) return 3;
  if (moves <= Math.ceil(par * 1.5)) return 2;
  return 1;
}
