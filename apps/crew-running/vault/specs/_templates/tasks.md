# Tasks: [Feature Name]

Status: draft
Spec: `./spec.md`
Plan: `./plan.md`

## Rules

- Tasks must point to a file, artifact, command, or validation.
- `[P]` means parallel-safe because it touches different files or only reads.
- Do not use a single task for broad implementation.
- Stop at each checkpoint and update this file.

## Phase 1 - Grounding

- [ ] T001 Read canonical docs and active spec.
- [ ] T002 Read real code/docs affected by this spec.

## Phase 2 - Artifacts

- [ ] T003 Create or update [artifact path].
- [ ] T004 [P] Create or update [artifact path].

## Phase 3 - Validation

- [ ] T005 Run [command/check].
- [ ] T006 Record result in `validation-log.md`.

## Phase 4 - Review and close

- [ ] T007 Complete `review.md`.
- [ ] T008 Complete `retrospective.md`.

## Checkpoints

- Grounding complete:
- Artifacts complete:
- Validation complete:
- Review accepted:
