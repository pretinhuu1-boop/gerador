# Implementation Plan: Spec-driven vault harness

Status: accepted
Spec: `./spec.md`
Updated: 2026-06-06

## Summary

Create a native SDD lane under `apps/crew-running/vault/specs/` with a registry,
templates, and this completed first example spec. Keep the change docs-only and
promote only the routing rule into `CURRENT_PRODUCT_CONTEXT.md`, `AGENTS.md`,
and `CLAUDE.md`.

## Grounding

Docs read:

- `../../CURRENT_PRODUCT_CONTEXT.md`
- `../../2026-06-06-spec-driven-development-continuous-harness-study.md`
- `../../2026-06-06-open-source-mobile-architecture-study.md`
- `../../../../AGENTS.md`
- `../../../../CLAUDE.md`

Code paths read:

- None required. This spec is vault/governance only.

External/local research read:

- `.codex-research/spec-driven/github-spec-kit`
- `.codex-research/spec-driven/priivacy-spec-kitty`
- `/Users/belissima/Downloads/Cipher/research-papers/continual-harness`

## Current-state evidence

- The vault already has many dated top-level plans and closeouts.
- `CURRENT_PRODUCT_CONTEXT.md` now warns that old docs can be stale.
- The SDD/harness study recommends `vault/specs/000-index.md`, templates, and
  `001-spec-driven-vault-harness/`.
- No `apps/crew-running/vault/specs/` directory existed before this spec.

## Decision

Use a vault-native workflow instead of installing external CLIs. The initial
shape is:

```text
vault/specs/
  000-index.md
  _templates/
  001-spec-driven-vault-harness/
```

This keeps the repo agent-agnostic, avoids new dependencies, and gives future
agents a concrete lane before product implementation starts.

## Files and artifacts to change

- `../000-index.md` - canonical registry and status model.
- `../_templates/*.md` - reusable templates for future specs.
- `./*.md` - complete first spec lane.
- `../../CURRENT_PRODUCT_CONTEXT.md` - route new feature/architecture work
  through specs.
- `../../../../AGENTS.md` - agent-facing spec rule.
- `../../../../CLAUDE.md` - Claude-facing spec rule.

## Risks

- Execution: docs-only; no build/runtime risk.
- Tooling: no external CLI installed, so no dependency risk.
- Context: future agents may skip the index unless AGENTS/CLAUDE point to it.
- Lifecycle: if review/retrospective are left blank, the example becomes weak.
- Observability: validation must record exactly what was checked.
- Verification: no app tests needed, but doc file checks are required.
- Governance: retrospectives must not mutate canonical rules automatically.

## Validation plan

- List created spec files.
- Search for references to the active spec workflow in agent/context docs.
- Check trailing whitespace in created/updated docs.
- Confirm no app code files are touched for this spec.

## Rollback

Remove only:

```text
apps/crew-running/vault/specs/
```

Then remove spec-workflow references from:

```text
apps/crew-running/vault/CURRENT_PRODUCT_CONTEXT.md
AGENTS.md
CLAUDE.md
```

Do not touch product code or unrelated vault docs.
