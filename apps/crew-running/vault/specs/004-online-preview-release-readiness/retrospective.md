# Retrospective: Online preview and release readiness

Status: pending
Spec: `./spec.md`
Updated: 2026-06-06

## What changed

- Created a Vercel-first online release lane.
- Split preview and production gates.
- Added action, orchestration and command-level execution docs.

## What worked

- Existing `vercel.json` gives the app a concrete deploy target.
- Existing npm scripts provide a clear validation ladder.

## What should change next

- Resolve local typecheck/Vitest hangs before online preview.
- Confirm Vercel project/team and production domain.
- Run local preview QA before any public URL is shared.

## Follow-up candidates

- Production domain and environment setup.
- Browser/mobile QA automation for release smoke.
- Admin operational panel remains separate from this player-app deploy lane.
