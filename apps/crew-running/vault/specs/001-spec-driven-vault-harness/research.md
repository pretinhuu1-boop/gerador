# Research: Spec-driven vault harness

Status: accepted
Spec: `./spec.md`
Updated: 2026-06-06

## Question

Which spec-driven development model should guide the Running Crew vault without
adding premature tooling or confusing agents?

## Sources

| Source | Type | Why it matters | Decision |
| --- | --- | --- | --- |
| `github/spec-kit` | repo | Official-style SDD workflow and templates | Use methodology |
| `Priivacy-ai/spec-kitty` | repo | Operational lanes, work packages, review/accept, retrospectives, drift gates | Use practices |
| `specdd.ai` | docs | Agent-agnostic framing, specs in Git | Secondary reference |
| Cipher/Cypher continual harness papers | local papers | ETCLOVG, failure attribution, continuous regression feedback | Use harness model |

## Findings

- Spec Kit is strongest for the core sequence: constitution, specify, plan,
  tasks, implement.
- Spec Kitty is strongest for multi-agent operation: lanes, work packages,
  worktrees, review, acceptance, retrospective, and drift gates.
- For this repo, importing either full tool would add process weight before the
  vault proves the workflow.
- The continual harness papers make observability, verification, and governance
  first-class. That maps well to this repo because agents already cross product,
  mobile, admin, creator, and vault boundaries.

## Errors to avoid

- Treating specs as full current-state docs. Here, specs are deltas.
- Allowing old dated docs to compete with active specs.
- Skipping validation logs because the change is documentation-only.
- Letting retrospectives auto-edit canonical rules without user acceptance.

## Recommendation

Create a native `vault/specs` structure now. Delay any CLI/tool install until at
least one product feature uses the skeleton successfully.
