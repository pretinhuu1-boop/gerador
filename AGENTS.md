# Repo Agent Instructions

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
