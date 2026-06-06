# Tasks: Spec-driven vault harness

Status: accepted
Spec: `./spec.md`
Plan: `./plan.md`

## Rules

- Tasks must point to a file, artifact, command, or validation.
- `[P]` means parallel-safe because it touches different files or only reads.
- Do not use a single task for broad implementation.
- Stop at each checkpoint and update this file.

## Phase 1 - Grounding

- [x] T001 Read `../../2026-06-06-spec-driven-development-continuous-harness-study.md`.
- [x] T002 Read `../../CURRENT_PRODUCT_CONTEXT.md`.
- [x] T003 [P] Read `../../../../AGENTS.md`.
- [x] T004 [P] Read `../../../../CLAUDE.md`.

## Phase 2 - Spec registry and templates

- [x] T005 Create `../000-index.md`.
- [x] T006 [P] Create `../_templates/spec.md`.
- [x] T007 [P] Create `../_templates/plan.md`.
- [x] T008 [P] Create `../_templates/research.md`.
- [x] T009 [P] Create `../_templates/tasks.md`.
- [x] T010 [P] Create `../_templates/harness.md`.
- [x] T011 [P] Create `../_templates/validation-log.md`.
- [x] T012 [P] Create `../_templates/review.md`.
- [x] T013 [P] Create `../_templates/retrospective.md`.

## Phase 3 - First spec lane

- [x] T014 Create `./spec.md`.
- [x] T015 Create `./plan.md`.
- [x] T016 Create `./research.md`.
- [x] T017 Create `./tasks.md`.
- [x] T018 Create `./harness.md`.
- [x] T019 Complete `./validation-log.md`.
- [x] T020 Complete `./review.md`.
- [x] T021 Complete `./retrospective.md`.

## Phase 4 - Canonical pointers

- [x] T022 Update `../../CURRENT_PRODUCT_CONTEXT.md` with exact spec-index pointer if needed.
- [x] T023 Update `../../../../AGENTS.md` with exact spec-index pointer if needed.
- [x] T024 Update `../../../../CLAUDE.md` with exact spec-index pointer if needed.

## Phase 5 - Validation and close

- [x] T025 Run file inventory check.
- [x] T026 Run routing-reference check.
- [x] T027 Run trailing-whitespace check.
- [x] T028 Confirm docs-only scope.

## Checkpoints

- Grounding complete: yes.
- Artifacts complete: yes.
- Validation complete: yes.
- Review accepted: yes.
