// Shipped puzzles, in play order. LEVELS[0] is the original 3-box puzzle;
// the rest ramp up mildly. All are hand-verified solvable.
export const LEVELS: string[] = [
  // 0 — push 3 boxes right onto 3 goals.
  [
    '#########',
    '#       #',
    '# $   . #',
    '#@$   . #',
    '# $   . #',
    '#       #',
    '#########',
  ].join('\n'),

  // 1 — one box, one step.
  ['#####', '#@$.#', '#####'].join('\n'),

  // 2 — one box, push it across the room.
  ['#######', '#@$ . #', '#######'].join('\n'),

  // 3 — two boxes, pushed right onto two goals on separate rows.
  ['#######', '#@$  .#', '#     #', '# $  .#', '#######'].join('\n'),
];
