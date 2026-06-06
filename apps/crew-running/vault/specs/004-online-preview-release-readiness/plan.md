# Implementation Plan: Online preview and release readiness

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## Summary

Use the existing Vite/Vercel app configuration to define a safe online release
lane: local validation first, local production preview second, Vercel preview
third, production only after explicit approval and rollback readiness.

## Grounding

Docs read:

- `../../CURRENT_PRODUCT_CONTEXT.md`
- `../../README.md`
- `../000-index.md`
- `../003-mobile-capacitor-export/spec.md`
- `./spec.md`

Code/config paths read:

- `../../../package.json`
- `../../../vite.config.ts`
- `../../../vercel.json`
- `../../../tests/e2e/map-flow.spec.ts` path exists
- `../../../playwright.config.ts` path exists

External sources read:

- N/A. This pass creates local release governance only.

## Current-state evidence

- `package.json` defines `validate`, `build`, `preview`, `typecheck`, `test`,
  `check:creator-contract` and `smoke:creator`.
- `vercel.json` exists and is configured for Vite, `npm run build`, `dist`,
  SPA rewrites and security headers.
- `vite.config.ts` defines the PWA manifest, runtime caching and LAN dev mode.
- `tests/e2e/map-flow.spec.ts` exists as a browser-flow target.
- In the prior session, `npm run check:creator-contract` passed, but
  `typecheck` and Vitest hung without output in this local terminal. Production
  release must remain blocked until those gates pass or are repaired.

## Decision

Primary online path:

1. Local validation and filesystem health.
2. Local production build.
3. Local `vite preview` QA.
4. Vercel preview deployment.
5. Preview URL QA on desktop and mobile.
6. Production approval.
7. Vercel production deployment.
8. Post-deploy smoke and rollback readiness.

Vercel is the primary target because the app already contains a scoped
`vercel.json`. Netlify/Cloudflare can be future alternatives, but switching
platforms is not necessary to answer the current online-readiness request.

## Files and artifacts to change

- `./spec.md` - release requirements and boundaries.
- `./action-plan.md` - high-level action plan and gates.
- `./orchestration.md` - worker roles, sequencing and handoff contract.
- `./execution.md` - command-level runbook.
- `./tasks.md` - checkpointed implementation tasks.
- `./harness.md` - ETCLOVG validation harness.
- `./validation-log.md` - docs creation validation and current blockers.
- `./review.md` - release-readiness review state.
- `./retrospective.md` - learnings and follow-ups.
- `../000-index.md` - register this spec.

No app source, deploy config or environment file should be changed by this docs
creation pass.

## Risks

- Execution: deploy may be attempted before local gates pass.
- Tooling: local `typecheck`/Vitest hangs must be resolved before production.
- Context: mobile/Capacitor spec 003 is related but separate from web deploy.
- Lifecycle: preview can be mistaken for production unless statuses are explicit.
- Observability: preview URL, commit, environment and QA results must be logged.
- Verification: browser/mobile QA must cover real app flows, not only build.
- Governance: Vercel env vars must not expose server/admin secrets to the client.

## Validation plan

- Docs-only creation checks:
  - file existence for all spec artifacts;
  - `000-index.md` entry;
  - no trailing whitespace;
  - no deploy command executed.
- Future execution checks:
  - `npm run validate`;
  - `npm run build`;
  - local `npm run preview`;
  - browser/mobile smoke;
  - Vercel preview URL QA;
  - production approval and rollback readiness.

## Rollback

For docs-only creation, remove `004-online-preview-release-readiness/` and
restore `000-index.md` candidate IDs. For actual online deploy, use Vercel
rollback/promote previous deployment as described in `execution.md`.
