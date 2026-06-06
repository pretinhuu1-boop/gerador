# Continuous Harness: Spec-driven vault harness

Status: accepted
Spec: `./spec.md`
Updated: 2026-06-06

## ETCLOVG map

| Layer | Contract for this spec | Evidence to capture |
| --- | --- | --- |
| Execution | Docs-only filesystem edits in `apps/crew-running/vault/specs` and root guidance docs | File inventory and paths |
| Tooling | Shell reads/searches plus `apply_patch`; no external SDD CLI | Commands and patch result |
| Context | Read current context, SDD study, AGENTS, CLAUDE, and active spec | Canonical reads listed in `spec.md` and `plan.md` |
| Lifecycle | specify -> plan -> tasks -> harness -> validation -> review -> retrospective | Completed files in this directory |
| Observability | Record commands/checks and any failures | `validation-log.md` |
| Verification | Inventory, routing references, whitespace, docs-only scope | Pass/fail rows in `validation-log.md` |
| Governance | No product code, no secrets, no creator changes, no automatic rule mutation from retro | Review decision and retrospective proposals |

## Readiness checks

- [x] Canonical docs read.
- [x] Active spec has no unresolved blocker.
- [x] Required environment/tooling exists.
- [x] Validation commands are known.
- [x] Secrets or privileged actions are not required.

## Controlled execution

Commands:

- `find apps/crew-running/vault -maxdepth 2 -type d`
- `find apps/crew-running/vault/specs -maxdepth 3 -type f`
- `rg` checks for routing references
- `rg -n "[ \t]$"` whitespace check

Browser/device QA:

- Not applicable. This spec is docs-only.

Trace/screenshot paths:

- Not applicable.

## Failure attribution

Use this format if validation fails:

```text
Failure:
Layer:
Evidence:
Fix or follow-up:
Regression/checklist added:
```

## Regression feedback

- Future specs should copy from `_templates/`, not from this completed spec.
- Any future failure caused by skipped spec entry should update `../000-index.md`
  and agent guidance, not just the local feature plan.
