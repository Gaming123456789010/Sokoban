# Task Index

Registry of all tasks. Keep `status` in sync with each task file's frontmatter.
Pick the lowest-id `todo` whose dependencies are all `done`. See `README.md`.

| # | Task | Status | Priority | Depends on |
|---|------|--------|----------|-----------|
| [001](001-engine-unit-tests.md) | Engine unit tests (Vitest) | done | high | — |
| [002](002-multiple-levels-progression.md) | Multiple levels + progression | done | high | — |
| [003](003-win-modal-next-level.md) | Win modal + next-level flow | done | medium | 002 |
| [004](004-level-select-screen.md) | Level-select screen | done | medium | 002 |
| [005](005-redo.md) | Redo (forward stack) | done | medium | — |
| [006](006-move-animation-toggle.md) | Move-animation toggle (tween) | done | low | — |
| [007](007-sound-effects.md) | Sound effects (move/push/win) | done | low | — |
| [008](008-sprite-art.md) | Sprite art / tilesheet | skipped | low | — |
| [009](009-touch-controls.md) | Touch/swipe + on-screen buttons | done | low | — |
| [010](010-tile-hook-ice.md) | Tile-behavior hook + ice floor | done | medium | 001 |
| [011](011-switches-doors.md) | Switches & doors | done | low | 010 |
| [012](012-deadlock-hints.md) | Deadlock detection hints | done | low | — |
| [013](013-localstorage-persistence.md) | localStorage persistence | done | medium | 002 |
| [014](014-par-star-rating.md) | Par / star rating | done | low | 002, 013 |
| [015](015-level-editor.md) | Level editor | done | low | 002 |
| [016](016-ci-workflow.md) | CI workflow | done | medium | 001 |
| [017](017-bundle-codesplit.md) | Bundle code-split / optimization | done | low | — |
