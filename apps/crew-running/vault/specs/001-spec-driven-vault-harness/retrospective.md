# Retrospective: Spec-driven vault harness

Status: accepted
Spec: `./spec.md`
Updated: 2026-06-06

## What worked

- Keeping the first SDD wave docs-only avoided mixing process setup with product
  implementation.
- Creating templates and a completed first spec gives future agents both a
  reusable blank form and a concrete example.
- Adding exact `vault/specs/000-index.md` pointers to agent docs reduces the
  chance that agents stop at the conceptual study.

## What failed or slowed down

- No material blocker. The main risk is future agents treating this accepted
  spec as a template instead of copying from `_templates/`.

## Vault/docs drift found

- Existing top-level vault docs remain historical unless converted into active
  specs. The index now records this rule.

## Proposed governance changes

- No additional governance change proposed beyond the accepted pointer updates
  in `CURRENT_PRODUCT_CONTEXT.md`, `AGENTS.md`, and `CLAUDE.md`.

## Regression/checklist updates

- Future feature/architecture/harness work should start by checking
  `vault/specs/000-index.md`.
- Future specs should include ETCLOVG failure attribution in `harness.md` and
  `validation-log.md`.

## Final note

The SDD skeleton is installed. The next product-facing wave should create a new
spec instead of editing a dated plan directly.
