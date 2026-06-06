# Feature Specification: Vault sector reorganization

Status: accepted
Spec ID: `002-vault-sector-reorganization`
Surface: vault/governance
Created: 2026-06-06
Input: User requested reviewing every vault document and placing them in the correct sectors.

## Canonical reads

- `../../CURRENT_PRODUCT_CONTEXT.md`
- `../../README.md`
- `../000-index.md`
- `../../70-research-integrations/2026-06-06-spec-driven-development-continuous-harness-study.md`
- `../../70-research-integrations/2026-06-06-open-source-mobile-architecture-study.md`
- `../../../README.md`
- `../../../../AGENTS.md`
- `../../../../CLAUDE.md`
- `../../CREATOR_CONTRACT.md` only as a path-preservation constraint.

## Intent

Reorganize the top-level vault documents into clear subject sectors so future
agents do not confuse historical wave plans, active product orientation,
research, implementation plans, QA artifacts, and contract-sensitive creator
docs.

The result should make the vault readable by entrypoint first, sector second,
spec lane third.

## Non-goals

- Do not change app code.
- Do not rewrite historical document contents beyond path/index corrections.
- Do not convert all old dated documents into active specs.
- Do not move `CREATOR_CONTRACT.md`.
- Do not move `2026-05-28-wave6-final-qa-closeout.md` while
  `scripts/check-creator-contract.mjs` still expects it at vault root.
- Do not move `CURRENT_PRODUCT_CONTEXT.md`, `specs/`, or `sound/`.
- Do not weaken creator, mobile, admin, GPS, or secret-handling rules.

## User stories

### US1 - Agent finds vault sectors (P1)

As an agent entering the repo, I want a vault README with sectors, so that I can
route old and new documents without guessing from dates.

Independent test:
Open `../../README.md` and confirm it explains the root files, sectors, and
which root files are intentionally retained.

Acceptance scenarios:

1. Given an agent needs mobile export context, when it reads the vault README,
   then it is routed to `50-mobile-desktop-admin/` and relevant research.
2. Given an agent needs map/events context, when it reads the vault README, then
   it is routed to `30-map-gps-events-game/`.

### US2 - Root stops mixing every document (P1)

As a maintainer, I want the vault root to contain only entrypoints and
backwards-compatible contract files, so that dated plans do not look equally
canonical.

Independent test:
Run `find apps/crew-running/vault -maxdepth 1 -type f | sort` and confirm no
dated markdown plans remain at root except the retained wave6 closeout.

Acceptance scenarios:

1. Given the root is listed, when a dated plan appears there, then it is either
   the retained creator validator closeout or a reorganization failure.
2. Given a PNG artifact is listed, when it is at root, then it is a failure; QA
   images belong under `90-assets/qa/`.

### US3 - Canonical references survive moves (P1)

As a future agent, I want AGENTS, CLAUDE, CURRENT_PRODUCT_CONTEXT, README, and
spec indices to point at the new sector paths, so that old links do not send me
to missing files.

Independent test:
Run targeted `rg` checks for old top-level moved paths and confirm canonical
docs now reference sector paths.

Acceptance scenarios:

1. Given the open-source study moved, when canonical docs mention it, then they
   use `vault/70-research-integrations/`.
2. Given feature-family docs moved, when current context mentions them, then it
   uses the sector path.

## Functional requirements

- FR-001: The vault MUST include a sector README at `vault/README.md`.
- FR-002: Root markdown MUST be limited to canonical entrypoints and explicit
  backwards-compatible contract artifacts.
- FR-003: Dated markdown plans MUST be moved into sector directories by
  product/domain intent.
- FR-004: QA PNG artifacts MUST move under `90-assets/qa/`.
- FR-005: Canonical repo guidance MUST point to the new sector paths.
- FR-006: The specs index MUST register this reorganization as spec 002 and
  renumber candidate next specs to avoid ID collision.

## Acceptance criteria

- AC-001: `vault/README.md` exists and documents all sectors.
- AC-002: `find apps/crew-running/vault -maxdepth 1 -type f | sort` shows only
  `CURRENT_PRODUCT_CONTEXT.md`, `CREATOR_CONTRACT.md`,
  `2026-05-28-wave6-final-qa-closeout.md`, and `README.md`.
- AC-003: `test -f` checks confirm moved docs exist in their sector paths.
- AC-004: Targeted `rg` checks find no canonical references to moved top-level
  paths.
- AC-005: `test -f apps/crew-running/vault/CREATOR_CONTRACT.md` and
  `test -f apps/crew-running/vault/2026-05-28-wave6-final-qa-closeout.md`
  pass.
- AC-006: No app behavior changes are required by this spec. If filesystem
  repair is required to complete validation, the exact source files and checks
  must be recorded.

## Boundaries and safety

- Data/secrets: no secrets or runtime data involved.
- Creator contract: preserve root contract and root wave6 closeout expected by
  `scripts/check-creator-contract.mjs`.
- GPS/location: docs only; no GPS data collection or runtime changes.
- Admin/service role: docs only; no service-role exposure.
- Licensing: external repo studies remain references only.
- Human approval: later changes to sectors should enter through the specs
  index when they affect canonical guidance.

## Open questions

- None for this docs-only reorganization.
