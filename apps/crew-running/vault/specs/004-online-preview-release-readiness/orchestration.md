# Orchestration: Online preview and release readiness

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## Command structure

One conductor owns gate decisions. Workers can run in parallel only when they
touch independent surfaces and report evidence back to `validation-log.md`.

## Roles

### Release conductor

Owns the release board, wave status and final go/no-go.

Responsibilities:

- enforce G0-G8 order;
- prevent production deploy before preview QA and approval;
- update `tasks.md` and `validation-log.md`;
- decide whether failures block or become follow-up specs.

### Validation worker

Owns local checks.

Responsibilities:

- run `npm run check:creator-contract`;
- run `npm run typecheck`;
- run `npm run test`;
- run `npm run build`;
- run `npm run smoke:creator`;
- capture exact failures without truncating the important lines.

### Browser/mobile QA worker

Owns visible app checks.

Responsibilities:

- run local preview;
- inspect desktop and mobile viewport flows;
- cover QG, creator, `TESTAR LOCAL`, map, GPS permission path, Sede, Voce,
  refresh routing and PWA asset basics;
- save screenshots under `../../90-assets/qa/` only when useful.

### Deploy worker

Owns Vercel commands.

Responsibilities:

- verify auth/project link;
- pull env metadata without printing secrets;
- run preview deploy;
- record preview URL and deploy id;
- run production deploy only after explicit approval.

### Security/env guardian

Owns release safety.

Responsibilities:

- verify no service-role/admin secrets enter `VITE_*`;
- verify Vercel env scopes are preview/production appropriate;
- check `vercel.json` headers and SPA rewrites;
- verify no keystores, tokens or local `.env` values are committed.

### Rollback owner

Owns recovery.

Responsibilities:

- identify previous working deployment before production;
- record rollback command/path;
- trigger rollback if post-production smoke fails;
- write failure attribution.

## Parallelization rules

Parallel-safe:

- docs review and env-name inventory;
- browser checklist drafting while validation runs;
- Vercel auth/project inspection after local build passes.

Not parallel-safe:

- production deploy and preview QA;
- env changes and deploy;
- source fixes and validation unless ownership is explicit;
- rollback and new production deploy.

## Handoff packet

Each worker reports:

- commands run;
- pass/fail;
- exact URL/path/deploy id;
- screenshots/log paths if any;
- blocker owner;
- next recommended action.

## Escalation

- Local validation blocker: return to R0/R1.
- Build blocker: stop before Vercel.
- Preview blocker: fix locally, redeploy preview, retest.
- Production blocker: rollback, then open a follow-up spec.
- Ambiguous secret/env issue: stop until product owner confirms scope.
