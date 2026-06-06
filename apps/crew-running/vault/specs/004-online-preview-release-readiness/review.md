# Review: Online preview and release readiness

Status: pending
Spec: `./spec.md`
Updated: 2026-06-06

## Findings

- Production is not approved by this spec creation pass.
- Vercel is the correct first online path because `vercel.json` already exists.
- The release lane must stay blocked at local validation until typecheck and
  tests stop hanging or are repaired.
- Preview deploy can be considered only after build/local preview gates pass.

## Open questions

- Final production domain.
- Vercel project/team.
- Whether preview should be public or access-controlled.

## Decision

- Pending execution of release gates.
