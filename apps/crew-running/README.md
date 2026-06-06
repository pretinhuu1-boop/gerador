# The Crew Running

Player-facing mobile/game app for The Crew Running.

Core line:

> O app nao abre. A cidade liga.

This app is beyond the creator stage. It currently includes launch/QG, runner
creator, map, local GPS run flow, run HUD/summary, missions/history/events
layers, Sede, Voce/social, auth/sync status and local persistence.

## Agent context

Before planning product, mobile, game, site, desktop or admin work, read:

- `vault/CURRENT_PRODUCT_CONTEXT.md`
- `vault/README.md`
- `vault/specs/000-index.md`
- `vault/70-research-integrations/2026-06-06-open-source-mobile-architecture-study.md`

Before changing creator/generation behavior, read:

- `vault/CREATOR_CONTRACT.md`
- `scripts/check-creator-contract.mjs`

## Product surfaces

- `apps/crew-running`: player-facing mobile/game app and future
  PWA/Capacitor Android+iOS source.
- Game layer: territory, live run, missions, badges, events, history, Sede and
  recap mechanics inside the player app.
- Public site: separate brand/community surface.
- Desktop user/network: separate runner/community surface for non-running use.
- Operational admin: separate internal surface, recommended as `apps/crew-admin`
  when implemented.

Do not expose privileged admin behavior, raw GPS inspection or service-role
access inside the player bundle.

## Current flow

```text
Cold Boot
  -> Title / Open
  -> City Signal Entry
  -> Main Menu / QG
  -> Guided Setup
  -> Runner Creator
  -> Runner Saved / City Ready teaser
  -> QG tabs: Guarda Roupa / Crews Piloto / Sede / Voce / Config
  -> MapStage: territory, live run, missions, events and history
  -> Run HUD / Summary / Diary
```

Returning players with a saved runner go back to the QG with `RUNNER SALVO`.

## How to run

```bash
cd apps/crew-running
npm install
npm run dev
```

The dev server runs on Vite's available port. For LAN/mobile QA, recheck the
machine IP each session.

For real runner generation, set:

```bash
VITE_GEMINI_API_KEY=...
```

The fallback studio modal stores a local credential in browser `localStorage`;
it is not the primary player surface and must not become a production secret
path.

## Runner creator

The creator uses:

- a face photo or written physical brief as broad physical-characteristics
  reference only;
- runner profile: name, sex, height, weight and personality;
- runner type: Sprint, Long Run, Night Run, Crew Pace or Urban Trail;
- selected crew render context, locked to that crew's assets and palette;
- wardrobe slots: top, bottom, shoes and accessory.

Generation returns a 2x2 character sheet. Choosing a look crops the selected
cell, removes the neutral background and saves a PNG in `localStorage` as
`crew.saved_character`.

## Existing front-end entry points

- QG/main menu: `ABRIR MAPA` / `COMEÇAR`, `GUARDA ROUPA`, `CREWS PILOTO`,
  `SEDE`, `VOCÊ`, `CONFIG`, `REVER INTRO`.
- Creator: upload or written brief, runner profile, runner type, wardrobe
  slots and `TESTAR LOCAL`.
- Map/run: `INICIAR CORRIDA`, `QG`, territory/live/missions/events/history
  layers, run controls, GPS retry/close, interrupted-run resume/discard and
  post-run summary/diary.
- Events: event CTA, saved signal and report action.
- Sede: sponsor wall, medals, ranks, rankings, trophies, feed and roster rooms.
- Voce/social: runner identity, achievements, friends/notes and map/profile
  links.
- Sync/auth: player-facing login/sync status.

## Key files

- `App.tsx` - top-level shell, launch flow, creator, map, auth/sync surfaces.
- `components/launch/*` - boot, title, city signal, QG, guide and saved teaser.
- `components/CustomizeScreen.tsx` - Runner Creator.
- `components/map/*` - map stage, layer rail, events, missions, history, run UI.
- `components/sede/*` - Sede da Crew rooms and shell.
- `components/voce/*` - Voce/social/profile surfaces.
- `hooks/useRunController.ts` and `hooks/useRunTracker.ts` - local run state
  and GPS tracking flow.
- `data/crews.ts` - crew metadata and asset paths.
- `data/crewRenderContext.ts` - crew asset/palette lock for generation.
- `data/runnerProfile.ts` - name, sex, height, weight and personality model.
- `data/runnerTypes.ts` - runner type metadata.
- `data/wardrobe.ts` - wardrobe slots and prompts.
- `data/sedeRooms.ts` - Sede room metadata.
- `services/crewService.ts` - Gemini sheet generation and local fallback.
- `services/launchStorage.ts` - onboarding and legacy `crewBootSeen`
  compatibility.
- `services/storage.ts` - studio credential and saved runner persistence.
- `services/activeRunStorage.ts` and `services/runLogStorage.ts` - active and
  finalized local run persistence.

## Validation

For code or creator-sensitive changes, run:

```bash
cd apps/crew-running
npm run validate
```

The validation script includes:

```bash
npm run check:creator-contract
npm run smoke:creator
```

Docs-only updates do not require the full validation gate unless they change
creator contract expectations or generated code.

## Public assets

Runtime assets under `public/backgrounds/`, `public/ui/` and
`public/crews/{selectedCrewSlug}/` must be committed with the UI. QA artifacts
under `output/` are ignored.

Do not use `public/styles/*` as creator generation input.

## Browser support

This app targets evergreen browsers released in 2023 or later:

- Safari 16.4+ (March 2023)
- Chrome / Edge 111+ (March 2023)
- Firefox 113+ (May 2023)

CSS features in use that require these versions: `color-mix(in srgb, ...)`,
modern `@media (prefers-reduced-motion: reduce)` semantics, `aspect-ratio`,
and `mix-blend-mode`. Older browsers will render with degraded accents
(elements that mix into crew colors fall back to plain black).
