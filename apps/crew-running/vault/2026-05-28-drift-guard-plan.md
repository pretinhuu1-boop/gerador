# Drift Guard Plan

Date: 2026-05-28.

## Finding

During Wave 6 closeout, some source files briefly reverted between checks:

- `data/runnerTypes.ts` returned to stale collective values.
- `components/launch/MainMenu.tsx` returned to `RUNNER SALVO`.

The active dev servers found on ports 3100 and 3104 are Vite/esbuild and should not write source files. The likely cause is another open agent/editor session touching the same worktree.

## Resolution

The repo now has an explicit creator contract guard:

```bash
npm run check:creator-contract
```

That guard fails if:

- collective runner type is not exactly `Crew Pace` / `crew-pace`;
- old collective values such as `Crew Flow`, `crew-flow`, `group-pace` or `collective crew energy` return to active source;
- text-only identity paths return to the public creator;
- the returning QG saved-runner pass does not include `RUNNER READY`;
- the returning QG saved-runner pass does not include the clean PNG copy;
- `RUNNER SALVO` returns as the saved-pass badge text;
- removed style/hair contracts return to active creator source;
- the creator smoke script or workflow hook disappears.

## Validation Loop

Run this after any future patch touching runner creation or QG return state:

```bash
cd apps/crew-running
npm run validate
```

This runs:

- creator contract check;
- TypeScript;
- Vite build;
- browser smoke for creator upload -> local sheet -> save.

## Operating Rule

If a future check fails after a previously passing patch, do not keep repatching blindly. First run:

```bash
git diff -- apps/crew-running/components/launch/MainMenu.tsx apps/crew-running/data/runnerTypes.ts apps/crew-running/scripts/check-creator-contract.mjs
stat -f '%Sm %N' apps/crew-running/components/launch/MainMenu.tsx apps/crew-running/data/runnerTypes.ts
ps -axo pid,ppid,stat,lstart,command | rg -i "running crew|crew-running|claude-flow|codex|claude"
```

Then restore the contract and rerun `npm run validate`.
