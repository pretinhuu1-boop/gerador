# Retrospective: Vault sector reorganization

Status: accepted
Spec: `./spec.md`
Updated: 2026-06-06

## What changed

- Added `vault/README.md` as the sector index.
- Moved top-level dated plans/research/QA assets into domain sectors.
- Kept `CREATOR_CONTRACT.md` and
  `2026-05-28-wave6-final-qa-closeout.md` at root for validator
  compatibility.
- Updated canonical guidance and spec registry paths.
- Recreated three small source files whose reads were blocked by filesystem
  state and prevented the creator validator from finishing.

## What worked

- Numeric sector prefixes make file-browser routing clear.
- Root inventory is now small enough to distinguish canonical entrypoints from
  historical evidence.
- The spec lane made the governance change auditable instead of ad hoc.
- Instrumenting `fs.readFileSync` gave exact blocked paths instead of guessing.

## What should change next

- If the creator validator path dependencies are intentionally moved later,
  update `scripts/check-creator-contract.mjs` in the same spec and run the full
  app validation.
- Retry typecheck and focused Vitest in a clean terminal before the next
  broader app-code implementation.

## Follow-up candidates

- `003-mobile-capacitor-export`
- `004-admin-operational-panel`
- `005-public-site-surface`
