# Repo Agent Instructions

## apps/crew-running product context

Before planning or changing mobile, game, site, desktop, admin or product docs
for `apps/crew-running`, read:

- `apps/crew-running/vault/CURRENT_PRODUCT_CONTEXT.md`
- `apps/crew-running/vault/README.md`
- `apps/crew-running/vault/specs/000-index.md`
- `apps/crew-running/vault/70-research-integrations/2026-06-06-open-source-mobile-architecture-study.md`
- `apps/crew-running/vault/70-research-integrations/2026-06-06-spec-driven-development-continuous-harness-study.md`

Current product split:

- `apps/crew-running` is the player-facing mobile/game app and the source for
  future PWA/Capacitor Android and iOS exports.
- The public site, desktop user/network area and operational admin panel are
  separate product surfaces.
- The recommended operational admin surface is a separate app such as
  `apps/crew-admin`, not a privileged panel inside the player bundle.
- Do not treat older vault docs as current if
  `apps/crew-running/vault/CURRENT_PRODUCT_CONTEXT.md` marks them as historical
  or stale.
- For new feature, architecture or harness work, create or locate the active
  vault spec in `apps/crew-running/vault/specs/000-index.md` before
  implementation. A valid spec lane should include spec, plan, tasks, harness,
  validation log, review and retrospective artifacts.

## apps/crew-running creator contract

Before changing the runner creator, read:

- `apps/crew-running/vault/CREATOR_CONTRACT.md`
- `apps/crew-running/scripts/check-creator-contract.mjs`

Hard rules:

- Runner visual generation is locked by the crew selected during onboarding.
- `CustomizeScreen` receives `selectedCrewSlug` from `CrewLaunchExperience`.
- Generation may use only `public/crews/{selectedCrewSlug}/` through `CrewRenderContext`.
- The identity source can be a photo or a written physical brief, but generation must never copy an exact real face, hair, clothing, marks, or recognizable identity.
- Do not use `public/styles/*` as generation input.
- Do not restore `StylePicker`, `data/styles.ts`, public style selection, or slot `hair`.
- Valid wardrobe slots are `top`, `bottom`, `shoes`, and `accessory`.
- Runner types are exactly `sprint`, `long-run`, `night-run`, `crew-pace`, `urban-trail`.
- The collective runner type is `Crew Pace` / `crew-pace`; never use `Crew Flow` / `crew-flow`.
- Keep `TESTAR LOCAL` available.
- Before finishing creator work, run from `apps/crew-running`: `npm run validate`.
