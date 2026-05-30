# Sokoban Task System

This folder holds one Markdown file per unit of work. Each task is written to be
**self-contained** so an isolated agent can pick it up with no prior conversation
context.

## Files

- `TEMPLATE.md` — the canonical task file. Copy it to create a new task.
- `INDEX.md` — registry of every task (id, title, status, deps, priority).
- `NNN-slug.md` — individual task files, numbered for ordering.

## Status flow

```
todo → in-progress → done
```

- **todo** — not started; ready when its `depends_on` are all `done`.
- **in-progress** — claimed; an agent is actively working it.
- **done** — acceptance criteria met, code merged, builds clean.

## Lifecycle

1. Choose the lowest-id `todo` task whose `depends_on` are **all** `done`.
2. Set `status: in-progress` and `owner` in the frontmatter; add a start entry to the **Action Log**.
3. Work through the **Plan**. Append a timestamped line to the **Action Log** at each
   meaningful step (file created, decision made, test added, blocker hit).
4. When every box in **Acceptance Criteria** is checked and `npm run build` + `npm test` pass,
   set `status: done`, summarize the outcome in the log, and update `INDEX.md`.

## Rules

- One task = one file = one focused change. Keep scope tight; spin off follow-ups as new tasks.
- Keep the **Action Log** append-only (newest at the bottom). Don't rewrite history.
- Respect `depends_on`. Don't start a task whose dependencies aren't `done`.
- Always update `INDEX.md` when a task's status changes.
- Follow the project conventions in `../CLAUDE.md`.
