# Tasks: Online preview and release readiness

Status: active
Spec: `./spec.md`
Plan: `./plan.md`

## Phase 1 - Spec artifacts

- [x] T001 Read canonical product context, vault README and specs index.
- [x] T002 Inspect app scripts, Vite config and Vercel config.
- [x] T003 Create `spec.md`.
- [x] T004 Create `plan.md`.
- [x] T005 Create `action-plan.md`.
- [x] T006 Create `orchestration.md`.
- [x] T007 Create `execution.md`.
- [x] T008 Create `harness.md`.
- [x] T009 Create `validation-log.md`, `review.md` and `retrospective.md`.
- [x] T010 Update `../000-index.md`.

## Phase 2 - Preflight execution

- [ ] T011 Confirm no stale validation/build/deploy processes.
- [ ] T012 Run `npm run check:creator-contract`.
- [ ] T013 Run `npm run typecheck`.
- [ ] T014 Run `npm run test`.
- [ ] T015 Run `npm run build`.
- [ ] T016 Run `npm run smoke:creator`.
- [ ] T017 Prefer `npm run validate` after split gates are healthy.

## Phase 3 - Local preview QA

- [ ] T018 Run `npm run preview -- --host 127.0.0.1 --port 4173`.
- [ ] T019 Validate desktop flow.
- [ ] T020 Validate mobile viewport or phone flow.
- [ ] T021 Record screenshots/logs if useful.

## Phase 4 - Vercel preview

- [ ] T022 Confirm Vercel auth.
- [ ] T023 Confirm/link Vercel project.
- [ ] T024 Audit env var names/scopes without printing values.
- [ ] T025 Run Vercel preview deploy.
- [ ] T026 Record preview URL and deploy id.
- [ ] T027 Run preview URL QA.

## Phase 5 - Production decision

- [ ] T028 Request explicit production approval.
- [ ] T029 Confirm rollback target/path.
- [ ] T030 Run production deploy only after approval.
- [ ] T031 Run production smoke.
- [ ] T032 Roll back if critical smoke fails.

## Phase 6 - Closeout

- [ ] T033 Complete `validation-log.md`.
- [ ] T034 Complete `review.md`.
- [ ] T035 Complete `retrospective.md`.
- [ ] T036 Mark spec accepted, blocked or keep active with exact next gate.

## Checkpoints

- Spec artifacts complete: yes, including index entry.
- Local validation complete:
- Local preview QA complete:
- Vercel preview complete:
- Production approval:
- Production deploy:
- Closeout:
