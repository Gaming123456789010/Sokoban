# Sokoban Task System

This folder holds one Markdown file per unit of work. Each task is written to be
**self-contained** so an isolated agent can pick it up with no prior conversation
context. Tasks are reviewed before they are marked done.

## Files

- `TEMPLATE.md` — the canonical task file. Copy it to create a new task.
- `INDEX.md` — registry of every task (id, title, status, deps, priority).
- `NNN-slug.md` — individual task files, numbered for ordering.

## Status flow

```
todo → in-progress → in-review → done
                         ↘ changes-requested ↗
```

- **todo** — not started; ready when its `depends_on` are all `done`.
- **in-progress** — claimed; an agent is actively working it.
- **in-review** — implementation complete, acceptance criteria met, awaiting review.
- **changes-requested** — reviewer found issues; back to the implementing agent.
- **done** — reviewed and signed off by the user.

## Roles & lifecycle

### Implementing agent
1. Choose the lowest-id `todo` task whose `depends_on` are **all** `done`.
2. Set `status: in-progress` and `owner` in the frontmatter; add a start entry to the **Action Log**.
3. Work through the **Plan**. Append a timestamped line to the **Action Log** at each
   meaningful step (file created, decision made, test added, blocker hit).
4. When every box in **Acceptance Criteria** is checked, set `status: in-review`,
   summarize the outcome in the log, and update `INDEX.md`.

### Reviewer agent
1. Pick up any `in-review` task.
2. Verify the diff against the **Acceptance Criteria** (behavior, tests, build).
3. Fill the **Review** section: reviewer name, verdict, and notes.
4. If issues: set `status: changes-requested` (implementing agent resumes).
   If clean: leave `status: in-review` with verdict `approve` and hand off to the user.

### User
- Reads the diff/log/review, then checks **User sign-off** and sets `status: done`.

## Rules

- One task = one file = one focused change. Keep scope tight; spin off follow-ups as new tasks.
- Never mark your own task `done` — that is the user's sign-off step.
- Keep the **Action Log** append-only (newest at the bottom). Don't rewrite history.
- Respect `depends_on`. Don't start a task whose dependencies aren't `done`.
- Always update `INDEX.md` when a task's status changes.
- Follow the project conventions in `../CLAUDE.md`.
