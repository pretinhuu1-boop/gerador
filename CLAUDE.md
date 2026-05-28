# The Crew Running — Repo Guide

## Concurrent-edit workflow

Multiple agents (parallel cavecrew, gemini, codex sessions) regularly work on this repo simultaneously. Treat the filesystem and git as **shared mutable state**, not your private workspace.

### Before each edit

- Re-read the file with the `Read` tool right before editing. State you cached three messages ago is already stale.
- If a `system-reminder` mentions a file was modified by the user or linter, re-read it before your next edit on that file.

### Staging commits

- **Stage by explicit path** — `git add apps/crew-running/components/voce/FeedPost.tsx`, never `git add -A` or `git add .`. The wide forms swallow another agent's WIP into your commit.
- Run `git status --short` before committing. If you see modifications you didn't make, isolate them with `git add <only-your-paths>` and let the rest stay unstaged.

### When another agent is mid-flight on a file you need

- If the file shows uncommitted modifications from a parallel session, **defer touching it** unless the change is tiny and orthogonal. Otherwise you'll create a merge conflict when their work lands.
- Prefer a small, isolated commit on a file the other agent isn't touching, and leave the contested file for them to finish.

### Validation gates

- `npm run validate` (in `apps/crew-running/`) runs contract + typecheck + tests + build + smoke.
- The vitest cache (`node_modules/.vite`, `node_modules/.vitest`) occasionally returns stale failures across agent sessions. If a test fails with a stack trace pointing to line numbers that don't match the current file, wipe the cache and re-run.

### Test environments

- Default vitest env is `happy-dom`. `data/**` and `services/**` tests run in `node` via `environmentMatchGlobs`.
- `happy-dom`'s `localStorage` silently no-ops in this version — `test/setup.ts` swaps in a real in-memory `Storage` impl on every test. Don't reach for `window.localStorage` directly in tests; use the storage helpers (`appendIdentityEvent`, `getIdentityEvents`, etc.).
