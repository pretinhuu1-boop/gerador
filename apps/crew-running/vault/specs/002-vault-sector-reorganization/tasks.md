# Tasks: Vault sector reorganization

Status: accepted
Spec: `./spec.md`
Plan: `./plan.md`

## Rules

- Tasks must point to a file, artifact, command, or validation.
- `[P]` means parallel-safe because it touches different files or only reads.
- Do not use a single task for broad implementation.
- Stop at each checkpoint and update this file.

## Phase 1 - Grounding

- [x] T001 Read canonical docs and active specs index.
- [x] T002 Inventory vault files and identify contract-sensitive root files.
- [x] T003 Read creator validator path expectations.

## Phase 2 - Artifacts

- [x] T004 Create `vault/README.md` sector map.
- [x] T005 Create sector directories.
- [x] T006 Move dated markdown docs into sector directories.
- [x] T007 Move root PNG QA artifacts into `90-assets/qa/`.
- [x] T008 Update canonical references in repo guidance and current context.
- [x] T009 Update `specs/000-index.md`.

## Phase 3 - Validation

- [x] T010 Run root inventory validation.
- [x] T011 Run representative `test -f` path validation.
- [x] T012 Run stale-reference checks.
- [x] T013 Run trailing-whitespace check.
- [x] T014 Confirm app behavior was not intentionally changed; record
  filesystem source-file repairs needed to complete validation.
- [x] T015 Record result in `validation-log.md`.

## Phase 4 - Review and close

- [x] T016 Complete `review.md`.
- [x] T017 Complete `retrospective.md`.

## Checkpoints

- Grounding complete: yes, root inventory and canonical references read.
- Artifacts complete: yes, root files and sector paths updated.
- Validation complete: yes. Creator executable check passed after repairing
  blocked file reads in three small source files.
- Review accepted: yes.
