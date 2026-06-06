# Feature Specification: Online preview and release readiness

Status: active
Spec ID: `004-online-preview-release-readiness`
Surface: mobile/player online delivery
Created: 2026-06-06
Input: User asked whether the app can go online, then requested specs, action
plan, orchestration and execution.

## Canonical reads

- `../../CURRENT_PRODUCT_CONTEXT.md`
- `../../README.md`
- `../000-index.md`
- `../../70-research-integrations/2026-06-06-spec-driven-development-continuous-harness-study.md`
- `../../../package.json`
- `../../../vite.config.ts`
- `../../../vercel.json`
- `../003-mobile-capacitor-export/spec.md`

## Intent

Create a release lane for taking `apps/crew-running` online in the correct
order:

1. repair or classify local validation blockers;
2. pass the existing app validation gates;
3. build and inspect the production bundle;
4. run local preview/browser QA;
5. deploy a Vercel preview;
6. validate the preview URL on desktop and mobile;
7. promote to production only with explicit approval and rollback path.

This spec does not deploy by itself. It defines the safe execution contract for
preview and production.

## Non-goals

- Do not publish production before `npm run validate`, build and browser/mobile
  QA pass.
- Do not expose Supabase service-role keys, keystores, tokens or admin secrets.
- Do not put operational admin controls in the player bundle.
- Do not treat a preview deployment as production release.
- Do not promise Android/iOS native release from this web deploy lane.
- Do not modify creator generation rules, runner types, wardrobe slots or
  `TESTAR LOCAL`.
- Do not deploy from stale local state when typecheck/test/build are blocked.

## User stories

### US1 - Preview deploy is gated before production (P1)

As the product owner, I want an online preview before production, so that we can
catch build, routing, PWA, map, GPS permission and asset issues without exposing
a broken release.

Independent test:
Read `execution.md` and confirm production is behind explicit approval after a
preview URL passes QA.

Acceptance scenarios:

1. Given validation is incomplete, when an agent considers deploy, then preview
   and production remain blocked.
2. Given preview passes QA, when the product owner approves production, then the
   execution runbook has the exact promotion and rollback steps.

### US2 - Existing app gates stay authoritative (P1)

As a release operator, I want release readiness tied to existing npm scripts, so
that online deploy does not bypass the local app contract.

Independent test:
Run or record the result of `npm run validate`, including creator contract,
typecheck, tests, build and creator smoke.

Acceptance scenarios:

1. Given `npm run validate` passes, when release proceeds, then the validation
   log records command output and timestamp.
2. Given `typecheck` or Vitest hangs or fails, when release is reviewed, then the
   blocker is assigned before preview deploy.

### US3 - Vercel preview is reproducible (P1)

As a deploy operator, I want Vercel commands and expected outputs documented, so
that another agent/session can reproduce the preview.

Independent test:
Follow `execution.md` from clean repo state through Vercel preview command
without guessing build/output settings.

Acceptance scenarios:

1. Given `vercel.json` exists, when Vercel builds, then framework is Vite,
   command is `npm run build`, output is `dist`, and SPA rewrites apply.
2. Given preview URL is created, when QA starts, then the URL, commit/branch,
   environment and validation results are recorded.

### US4 - Production has rollback and post-deploy checks (P2)

As a maintainer, I want production release to include rollback and smoke checks,
so that we can recover quickly if the public URL breaks.

Independent test:
Read `orchestration.md` and `execution.md`; confirm rollback owner, rollback
command/path and post-deploy checks are explicit.

Acceptance scenarios:

1. Given production deploy fails, when rollback starts, then the previous
   deployment is restored or production alias is moved back.
2. Given production deploy succeeds, when post-deploy QA runs, then boot, QG,
   creator, map, Sede, Voce and PWA asset paths are checked.

## Functional requirements

- FR-001: Preview and production MUST be separate states.
- FR-002: Production MUST require explicit human approval after preview QA.
- FR-003: The primary deploy target for this spec MUST be Vercel because
  `vercel.json` already exists for the app.
- FR-004: `npm run validate` MUST pass before production is considered ready.
- FR-005: If local typecheck or Vitest hangs, release MUST remain blocked or the
  blocker MUST be resolved in a separate repair wave.
- FR-006: Local production preview MUST be run after `npm run build` and before
  online preview is accepted.
- FR-007: Browser/mobile QA MUST cover QG, creator, `TESTAR LOCAL`, map, GPS
  permission path, Sede, Voce, routing refresh and PWA assets.
- FR-008: Environment variables MUST be audited without printing secret values.
- FR-009: No admin/service-role secret may be exposed through `VITE_*` or Vercel
  client-side variables.
- FR-010: Rollback instructions MUST be documented before production deploy.

## Acceptance criteria

- AC-001: `action-plan.md`, `orchestration.md` and `execution.md` exist.
- AC-002: `tasks.md` maps release work into checkpointed waves.
- AC-003: `harness.md` defines validation, browser QA, deploy and rollback
  evidence.
- AC-004: `validation-log.md` records that this is a docs/spec creation pass and
  lists the unresolved runtime gates from the current session.
- AC-005: `000-index.md` registers this spec and shifts candidate IDs without
  collision.
- AC-006: No deployment command is executed by this docs-only spec creation
  pass.

## Boundaries and safety

- Data/secrets: audit names and scopes only; never print `.env`, tokens or
  secret values.
- Creator contract: online deploy must preserve `CREATOR_CONTRACT.md` rules and
  pass `npm run check:creator-contract`.
- GPS/location: online preview can test permission flow; background tracking is
  outside this spec.
- Admin/service role: no privileged admin in player bundle.
- Licensing: no external repo code import.
- Human approval: required for production deploy and rollback decisions.

## Open questions

- NEEDS CLARIFICATION: final production domain for The Crew Running.
- NEEDS CLARIFICATION: Vercel project/team/account to use if multiple are
  available.
- NEEDS CLARIFICATION: whether preview may be public or must be protected by
  Vercel auth/password before wider sharing.
