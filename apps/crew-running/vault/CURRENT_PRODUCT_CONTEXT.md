# Current Product Context

Status: canonical agent orientation
Updated: 2026-06-06
Scope: `apps/crew-running` and adjacent future product surfaces

Use this before planning or changing product docs, mobile export, game features,
site, desktop or admin work. This file does not replace
`vault/CREATOR_CONTRACT.md`; creator/generation work must still follow that
contract first.

## First reads

- `vault/CREATOR_CONTRACT.md` and `scripts/check-creator-contract.mjs` before
  creator, generation, wardrobe, runner type or creator-doc changes.
- `vault/README.md` for the sector map and root-file rules.
- `vault/specs/000-index.md` before new feature, architecture, mobile, admin,
  site, game or harness work.
- `vault/70-research-integrations/2026-06-06-open-source-mobile-architecture-study.md` for the
  open-source research, mobile strategy and front-end surface split.
- `vault/70-research-integrations/2026-06-06-spec-driven-development-continuous-harness-study.md` for
  the spec-driven development workflow, vault structure and continuous harness
  rules.
- `vault/50-mobile-desktop-admin/2026-06-03-mobile-apk-orchestration-execution-plan.md` for the
  Android/iOS export path.
- `vault/50-mobile-desktop-admin/2026-06-03-admin-dashboard-architecture-plan.md` for admin risks,
  Supabase/schema drift and the operational-panel recommendation.
- `vault/30-map-gps-events-game/2026-06-04-map-events-code-audit.md` and
  `vault/30-map-gps-events-game/2026-06-04-map-centric-events-architecture.md`
  for map/events state.
- `vault/40-sede-social-voce/2026-05-28-sede-da-crew-spec.md`,
  `vault/30-map-gps-events-game/2026-05-28-gps-tracker-and-polish-design.md`
  and `vault/40-sede-social-voce/2026-05-28-voce-tab-f1-refactor-blueprint.md`
  for current feature families that still matter.

## Current app truth

- `apps/crew-running` is not only a runner creator.
- It is the current player-facing mobile/game app: launch/QG, runner creator,
  map, local GPS run flow, run HUD/summary, missions/history/events layers,
  Sede, Voce/social, auth/sync badge and local persistence.
- It remains Vite/React/PWA today. The near-term native export path is
  Capacitor for Android and iOS.
- React Native/Expo is research context only, not the current migration
  direction.
- The collective runner type remains `Crew Pace` / `crew-pace`.

## Surface boundaries

1. **Mobile app / player game**: runner in the street, map, tracking, missions,
   creator, Sede, Voce/social and personal feed. Current source:
   `apps/crew-running`.
2. **Game layer**: territory, live run state, missions, badges, events, history,
   crew rooms and recap mechanics inside the player app.
3. **Public site**: brand presence, crews, public events, edited public ranking,
   sponsors and app conversion. Do not expose raw GPS or admin controls here.
4. **Desktop user / network**: runner profile, history, community, partners and
   wellness network for non-running desktop use. It is not the operational
   admin.
5. **Operational panel**: internal moderation, QA, users, orgs, events, creator
   health, data repair, partners and deploy checks. Recommended as a separate
   app such as `apps/crew-admin`.

Do not merge these into one bundle by default. If a future decision intentionally
combines surfaces, record the decision in the vault first.

## Existing front-end entry points

- QG/main menu: `ABRIR MAPA` / `COMEÇAR`, `GUARDA ROUPA`, `CREWS PILOTO`,
  `SEDE`, `VOCÊ`, `CONFIG`, `REVER INTRO`.
- Creator: upload or written physical brief, runner profile, runner type,
  wardrobe slots `top`, `bottom`, `shoes`, `accessory`, and `TESTAR LOCAL`.
- Map/run: `INICIAR CORRIDA`, `QG`, layer chips for territory/live/missions/
  events/history, run controls, GPS retry/close, interrupted-run resume/discard
  and post-run summary/diary.
- Events: event sheet CTA, saved signal and report action.
- Sede: room grid for sponsor wall, medals, ranks, rankings, trophies, feed and
  roster.
- Voce/social: runner identity, achievements, friends/notes and map/profile
  links.
- Sync/auth: player-facing login/sync status, not service-role admin access.

## Docs to treat carefully

- The root README and `apps/crew-running/README.md` were corrected on
  2026-06-06. Any older text saying the app stops at creator is stale.
- `vault/30-map-gps-events-game/2026-06-03-gamificacao-mapa-2d-map.md` is
  partially stale according to
  `vault/50-mobile-desktop-admin/2026-06-03-admin-dashboard-architecture-plan.md`;
  verify against code before using it as implementation truth.
- Most 2026-05-28 files are historical wave plans or closeouts. Reuse them for
  feature intent only when the current code/audit confirms the state.
- `dist/`, `output/` and generated QA images are artifacts, not product source.
- `public/styles/*`, `StylePicker`, public style selection and wardrobe `hair`
  are not valid creator inputs.
- AGPL/GPL repos in the open-source study are product/architecture references
  only. Do not copy implementation from them.

## Validation and execution rules

- Docs-only updates do not require `npm run validate` unless they alter creator
  contract expectations or generated code.
- Any app code, creator or contract-sensitive change must finish from
  `apps/crew-running` with:

```bash
npm run validate
```

- Mobile export work must validate the mobile web app before Android/iOS
  packaging.
- Android APK debug is a QA artifact, not a client release.
- iOS export is required for the product plan even if Android debug is the first
  local build artifact.
- Admin work must start with read-only Supabase/schema/RLS audit before UI.
- New feature/architecture work should enter through a vault spec with spec,
  plan, tasks, harness, validation log, review and retrospective artifacts.
  Start from `vault/specs/000-index.md`.
- Never place Supabase service-role keys, keystores, tokens or privileged admin
  secrets in `VITE_*`, localStorage or the player bundle.
