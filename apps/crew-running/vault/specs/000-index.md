# Vault Specs Index

Status: canonical spec registry
Updated: 2026-06-06
Scope: `apps/crew-running/vault/specs`

Specs in this directory are change requests. They describe the delta from the
current app state to a desired future state. The current state remains governed
by `../CURRENT_PRODUCT_CONTEXT.md`, the real code, and any executable contracts
such as `../CREATOR_CONTRACT.md`.

## Required read order

1. `../CURRENT_PRODUCT_CONTEXT.md`
2. `../README.md`
3. `../70-research-integrations/2026-06-06-spec-driven-development-continuous-harness-study.md`
4. Active spec folder from the registry below
5. `../CREATOR_CONTRACT.md` when the work touches creator, runner generation,
   wardrobe, runner type, `TESTAR LOCAL`, or crew render assets
6. Real code and tests before implementation

## Status model

- `draft`: intent captured, not ready for implementation.
- `active`: approved for planning or implementation.
- `for_review`: implementation or documentation artifacts are ready for review.
- `accepted`: reviewed and accepted; no required work remains for this spec.
- `blocked`: cannot proceed without external decision or state change.
- `superseded`: replaced by another spec or canonical doc.
- `cancelled`: intentionally abandoned.

## Specs

| ID | Slug | Status | Surface | Purpose | Entry |
| --- | --- | --- | --- | --- | --- |
| 001 | `spec-driven-vault-harness` | `accepted` | vault/governance | Install the native SDD and continuous harness skeleton for future work | `001-spec-driven-vault-harness/spec.md` |
| 002 | `vault-sector-reorganization` | `accepted` | vault/governance | Route vault documents into sectors and preserve canonical/root contract paths | `002-vault-sector-reorganization/spec.md` |
| 003 | `mobile-capacitor-export` | `active` | mobile/player | Turn the mobile APK/iOS plan into an executable Capacitor export lane with validation gates | `003-mobile-capacitor-export/spec.md` |
| 004 | `online-preview-release-readiness` | `active` | mobile/player online delivery | Define preview, production, QA, deploy and rollback gates for taking the app online | `004-online-preview-release-readiness/spec.md` |

## Candidate next specs

These are candidates, not active work:

- `005-admin-operational-panel`: turn the admin architecture plan into a spec
  lane before any `apps/crew-admin` code exists.
- `006-public-site-surface`: define the public site without mixing it into the
  player bundle.

## Rules

- Do not implement a new feature from a dated top-level vault plan alone.
- Do not backfill every old vault doc into specs. Convert only active work.
- Do not treat `spec.md` as current-state documentation. It is a requested
  change.
- Every active spec needs `spec.md`, `plan.md`, `tasks.md`, `harness.md`,
  `validation-log.md`, `review.md`, and `retrospective.md`.
- `research.md` is required when the spec depends on external repos, papers,
  architecture options, provider behavior, mobile/native behavior, security, or
  legal/licensing constraints.
- Accepted decisions that affect all future work must be promoted back to
  `../CURRENT_PRODUCT_CONTEXT.md`, `../../../../AGENTS.md`, `../../../../CLAUDE.md`,
  or an executable contract.
