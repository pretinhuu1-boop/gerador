# Feature Specification: Spec-driven vault harness

Status: accepted
Spec ID: `001-spec-driven-vault-harness`
Surface: vault/governance
Created: 2026-06-06
Input: User requested execution of the recommended SDD/continuous harness wave.

## Canonical reads

- `../../CURRENT_PRODUCT_CONTEXT.md`
- `../../README.md`
- `../../70-research-integrations/2026-06-06-spec-driven-development-continuous-harness-study.md`
- `../../70-research-integrations/2026-06-06-open-source-mobile-architecture-study.md`
- `../../../README.md`
- `../../../../AGENTS.md`
- `../../../../CLAUDE.md`

## Intent

Install a vault-native spec-driven development lane so future feature,
architecture, mobile, admin, site, game, and harness work starts from a clear
spec, plan, tasks, continuous harness, validation log, review, and
retrospective.

This spec does not change product code. It changes the operating system of the
vault.

## Non-goals

- Do not install `specify-cli`.
- Do not install `spec-kitty`.
- Do not create automatic worktrees.
- Do not edit app code.
- Do not convert every historical vault document into a spec.
- Do not weaken the creator contract.

## User stories

### US1 - Agent finds the active spec lane (P1)

As an agent entering the repo, I want a canonical specs index, so that I can
identify whether a request should use an existing spec or create a new one.

Independent test:
Read `../000-index.md` and confirm this spec is registered with status and
entry path.

Acceptance scenarios:

1. Given a new agent starts feature work, when it reads `../000-index.md`, then
   it can identify active, accepted, candidate, and historical spec lanes.
2. Given an old dated vault doc exists, when the agent reads the index rules,
   then it does not treat that doc as implementation truth without converting
   active work into a spec.

### US2 - Agent has reusable spec artifacts (P1)

As an agent planning a new feature, I want reusable templates, so that every
spec lane has the same minimum artifacts and review gates.

Independent test:
Inspect `../_templates/` and confirm templates exist for spec, plan, research,
tasks, harness, validation log, review, and retrospective.

Acceptance scenarios:

1. Given a new feature request, when an agent copies the templates, then it can
   produce all required artifacts without inventing a new format.
2. Given the feature requires research, when the agent checks templates, then
   it has a `research.md` template for source-backed findings.

### US3 - This first spec proves the lane (P2)

As the product owner, I want the first spec lane to be complete, so that future
agents have a working example instead of only abstract instructions.

Independent test:
Inspect this directory and confirm it includes `spec.md`, `plan.md`,
`research.md`, `tasks.md`, `harness.md`, `validation-log.md`, `review.md`, and
`retrospective.md`.

Acceptance scenarios:

1. Given this spec is completed, when another agent opens it, then they can see
   how grounding, validation, review, and retrospective fit together.
2. Given this spec found no code changes were needed, when validation is read,
   then the docs-only decision is explicit.

## Functional requirements

- FR-001: The vault MUST contain `specs/000-index.md`.
- FR-002: The vault MUST contain reusable templates under `specs/_templates/`.
- FR-003: This spec MUST contain all required lane artifacts.
- FR-004: The index MUST define the status model and active/candidate specs.
- FR-005: The templates MUST include continuous harness fields based on
  ETCLOVG.
- FR-006: The agent instructions MUST point future feature/architecture/harness
  work through active vault specs.

## Acceptance criteria

- AC-001: `find apps/crew-running/vault/specs -maxdepth 2 -type f` lists the
  index, templates, and all `001` artifacts.
- AC-002: `rg` confirms `CURRENT_PRODUCT_CONTEXT.md`, `AGENTS.md`, and
  `CLAUDE.md` point to the SDD/harness study or active spec workflow.
- AC-003: `rg -n "[ \t]$"` over created/updated docs returns no trailing
  whitespace.
- AC-004: No app code files are changed by this spec.

## Boundaries and safety

- Data/secrets: no secrets or runtime data involved.
- Creator contract: no creator code or contract changes.
- GPS/location: no GPS data involved.
- Admin/service role: no service-role or admin code involved.
- Licensing: external repos remain references only; no imported code.
- Human approval: future governance changes from retrospectives are proposals
  until accepted by the user.

## Open questions

- None for this docs-only skeleton.
