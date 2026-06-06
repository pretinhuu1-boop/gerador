# Continuous Harness: Vault sector reorganization

Status: accepted
Spec: `./spec.md`
Updated: 2026-06-06

## ETCLOVG map

| Layer | Contract for this spec | Evidence to capture |
| --- | --- | --- |
| Execution | Docs-only filesystem reorganization under `apps/crew-running/vault` | File inventory before and after moves |
| Tooling | Shell reads/searches, `mkdir`, `mv`, and `apply_patch` for markdown edits | Commands, moved paths, patch results |
| Context | Current context, specs index, SDD study, open-source study, AGENTS, CLAUDE, README, creator validator expectations | Files read and path decisions |
| Lifecycle | spec -> plan -> tasks -> harness -> move/update -> validation -> review -> retrospective | Completed files in this directory |
| Observability | Validation log records inventories and stale-reference checks | `validation-log.md` rows |
| Verification | Root inventory, sector directory listing, `test -f`, targeted `rg`, whitespace check, app-code no-change check | Pass/fail results |
| Governance | Preserve root contract files and do not mutate product code | Retained root paths and diff scope |

## Readiness checks

- [x] Canonical docs read.
- [x] Active spec has no unresolved blocker.
- [x] Required environment/tooling exists.
- [x] Validation commands are known.
- [x] Secrets or privileged actions are not required.

## Controlled execution

Commands:

- `find apps/crew-running/vault -maxdepth 1 -type f | sort`
- `find apps/crew-running/vault -maxdepth 2 -type d | sort`
- `test -f` checks for retained and moved paths
- targeted `rg` checks for stale top-level moved references
- `rg -n "[ \t]$"` over changed markdown docs
- `git diff --name-only -- apps/crew-running/src apps/crew-running/components apps/crew-running/services apps/crew-running/data`

Browser/device QA:

- Not applicable. This spec is docs-only.

Trace/screenshot paths:

- Not applicable.

## Failure attribution

For each failure, record:

```text
Failure:
Layer:
Evidence:
Fix or follow-up:
Regression/checklist added:
```

## Regression feedback

- Future vault-sector moves should update `vault/README.md` and
  `specs/000-index.md` in the same change.
- Contract-sensitive root files must be checked against scripts before moving.
