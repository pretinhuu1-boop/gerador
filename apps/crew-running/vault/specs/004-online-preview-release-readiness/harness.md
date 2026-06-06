# Continuous Harness: Online preview and release readiness

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## ETCLOVG map

| Layer | Contract for this spec | Evidence to capture |
| --- | --- | --- |
| Execution | macOS local repo, npm, Vite, Vercel CLI, browser/mobile QA | command output, URLs, deploy ids, screenshots |
| Tooling | `npm run validate`, `npm run build`, `npm run preview`, Playwright/browser, Vercel CLI | pass/fail logs and versions when relevant |
| Context | current product context, vault README, specs index, package scripts, Vite config, Vercel config | files read and decisions cited |
| Lifecycle | G0-G8 gates from local health through rollback | task status and validation-log rows |
| Observability | local logs, preview URL, production URL, deployment ids, QA screenshots | `validation-log.md` plus `90-assets/qa/` if used |
| Verification | creator contract, typecheck, tests, build, local preview, preview QA, production smoke | pass/fail with expected vs actual |
| Governance | no secrets printed, no admin in player bundle, production approval required, rollback ready | env audit notes and approval/rollback entries |

## Readiness checks

- [x] Canonical docs read.
- [x] Existing Vercel config found.
- [x] Existing npm validation scripts found.
- [x] Existing PWA/Vite config found.
- [ ] `npm run validate` passes.
- [ ] Local production preview passes.
- [ ] Vercel preview deploy passes.
- [ ] Preview URL QA passes.
- [ ] Production approval recorded.
- [ ] Rollback path recorded.

## Controlled execution

Commands to record as they run:

```bash
npm run check:creator-contract
npm run typecheck
npm run test
npm run build
npm run smoke:creator
npm run validate
npm run preview -- --host 127.0.0.1 --port 4173
npx vercel whoami
npx vercel link
npx vercel env ls
npx vercel deploy
npx vercel deploy --prod
```

Browser/device QA:

- local preview desktop;
- local preview mobile viewport or phone;
- Vercel preview desktop;
- Vercel preview mobile;
- production smoke only after approval.

Trace/screenshot paths:

- Use `../../90-assets/qa/` for screenshots worth preserving.
- Record deploy URLs and ids in `validation-log.md`.

## Failure attribution

Use this format:

```text
Failure:
Layer:
Evidence:
Fix or follow-up:
Regression/checklist added:
```

## Regression feedback

- If filesystem read blocks validation, add the blocked path and repair action
  to the log before rerunning gates.
- If Vitest/typecheck hangs, do not deploy until the hang is isolated or the
  product owner explicitly accepts a preview-only risk.
- If preview URL breaks routing, inspect `vercel.json` rewrites before changing
  app routes.
- If PWA asset caching causes stale UI, add cache-bust/reload QA to the release
  checklist.
