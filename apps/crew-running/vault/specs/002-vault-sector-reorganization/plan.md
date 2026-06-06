# Implementation Plan: Vault sector reorganization

Status: accepted
Spec: `./spec.md`
Updated: 2026-06-06

## Summary

Create a sector map for `apps/crew-running/vault`, move dated documents and QA
images out of the root, keep contract-sensitive root files stable, and update
canonical pointers so future agents enter through the correct documents.

## Grounding

Docs read:

- `../../CURRENT_PRODUCT_CONTEXT.md`
- `../../README.md`
- `../000-index.md`
- `../../70-research-integrations/2026-06-06-spec-driven-development-continuous-harness-study.md`
- `../../70-research-integrations/2026-06-06-open-source-mobile-architecture-study.md`
- `../../CREATOR_CONTRACT.md` as a root path constraint
- `../../../README.md`
- `../../../../AGENTS.md`
- `../../../../CLAUDE.md`
- `./spec.md`

Code paths read:

- `../../../scripts/check-creator-contract.mjs`

External sources read:

- N/A. This spec is local vault governance only.

## Current-state evidence

- The vault root contains many dated markdown plans, research notes, closeouts,
  and PNG QA artifacts.
- `CURRENT_PRODUCT_CONTEXT.md`, `AGENTS.md`, `CLAUDE.md`, and the specs index
  point at dated vault files currently at root.
- `scripts/check-creator-contract.mjs` expects `vault/CREATOR_CONTRACT.md` and
  `vault/2026-05-28-wave6-final-qa-closeout.md` at their current root paths.
- `specs/` and `sound/` are already sector-like directories and should remain
  stable.

## Decision

Use numeric sector prefixes so file browsers sort sectors consistently:

- `10-creator/`
- `20-launch-qg-ui/`
- `30-map-gps-events-game/`
- `40-sede-social-voce/`
- `50-mobile-desktop-admin/`
- `60-brand-motion-content/`
- `70-research-integrations/`
- `90-assets/qa/`

Keep root limited to:

- `README.md`
- `CURRENT_PRODUCT_CONTEXT.md`
- `CREATOR_CONTRACT.md`
- `2026-05-28-wave6-final-qa-closeout.md`

Keep `sound/` and `specs/` as their existing specialized sectors.

## Files and artifacts to change

- `../../README.md` - new sector index.
- `../../CURRENT_PRODUCT_CONTEXT.md` - update moved document references.
- `../000-index.md` - register spec 002 and update read order/candidates.
- `../../../README.md` - update canonical read paths.
- `../../../../AGENTS.md` - update canonical read paths.
- `../../../../CLAUDE.md` - update canonical read paths.
- `./*.md` - document this spec lane.
- Sector directories under `../../` - receive moved docs and QA images.

## Risks

- Execution: moving many files can break links if canonical references are not
  updated.
- Tooling: broad searches can be slow; use targeted `rg` checks after moves.
- Context: historical docs may overlap domains; use the primary intent from
  titles and current context.
- Lifecycle: this is governance work, so complete spec artifacts before closing.
- Observability: record movement and validation in `validation-log.md`.
- Verification: root inventory and targeted stale-reference checks are required.
- Governance: do not move contract files that existing scripts expect at root.

## Validation plan

- `find apps/crew-running/vault -maxdepth 1 -type f | sort`
- `find apps/crew-running/vault -maxdepth 2 -type d | sort`
- `test -f` checks for representative moved docs and retained root contract docs.
- Targeted `rg` stale-reference checks for moved top-level paths.
- `rg -n "[ \t]$"` over changed markdown docs.
- `git diff --name-only -- apps/crew-running/src apps/crew-running/components apps/crew-running/services apps/crew-running/data` should return no app-code changes.

## Rollback

Move sector files back to `apps/crew-running/vault/`, remove the sector README
and spec 002 entry, and restore the previous canonical paths. Do not touch
unrelated worktree changes.
