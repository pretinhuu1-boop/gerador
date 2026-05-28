# The Crew Running

Game-first launch and runner identity creator for The Crew Running.

This app currently stops at runner creation. It does not start a real run, ask for location permission, track movement, publish routes, rank runners, or create a post-run recap.

Core line:

> O app nao abre. A cidade liga.

## Current Flow

```text
Cold Boot
  -> Title / Open
  -> City Signal Entry
  -> Main Menu / QG
  -> Guided Setup
  -> Runner Creator
  -> Runner Saved / City Ready teaser
```

Returning players with a saved runner go back to the QG with `RUNNER: SALVO`.

## How To Run

```bash
cd apps/crew-running
npm install
npm run dev
```

The dev server usually runs on Vite's available port. In this session it was validated on `http://127.0.0.1:3104`.

For real runner generation, set:

```bash
VITE_GEMINI_API_KEY=...
```

The fallback studio modal stores a local credential in browser `localStorage`; it is not the primary player surface.

## Runner Creator

The creator uses:

- a required face photo used only as broad physical-characteristics reference;
- runner profile: name, sex, height, weight and personality;
- runner type: Sprint, Long Run, Night Run, Crew Pace or Urban Trail;
- selected crew render context, locked to that crew's assets and palette;
- wardrobe slots: top, bottom, shoes and accessory.

Generation returns a 2x2 character sheet. Choosing a look crops the selected cell, removes the neutral background and saves a PNG in `localStorage` as `crew.saved_character`.

## Key Files

- `App.tsx` - top-level shell and lazy runner creator.
- `components/launch/*` - boot, title, city signal, QG, guide and saved teaser.
- `components/CustomizeScreen.tsx` - Runner Creator.
- `components/RunnerTypePicker.tsx` - runner type selection.
- `data/crews.ts` - crew metadata and asset paths.
- `data/crewRenderContext.ts` - crew asset/palette lock for generation.
- `data/runnerProfile.ts` - name, sex, height, weight and personality model.
- `data/runnerTypes.ts` - runner type metadata.
- `data/wardrobe.ts` - wardrobe slots and prompts.
- `services/crewService.ts` - Gemini sheet generation and local fallback.
- `services/launchStorage.ts` - onboarding and legacy `crewBootSeen` compatibility.
- `services/storage.ts` - studio credential and saved runner persistence.

## Validation

```bash
npm run check:creator-contract
npm run smoke:creator
npx tsc --noEmit
npm run build
```

Latest QA also covered:

- real Gemini generation from an uploaded QA image;
- `Equipar look` save path;
- `crewRunnerCustomized=true`;
- `RUNNER READY / CIDADE PRONTA` teaser;
- returning QG with saved runner;
- mobile reduced motion with zero active animations.

## Public Assets

Runtime assets under `public/backgrounds/` and `public/ui/` must be committed with the UI. QA artifacts under `output/` are ignored.

## Browser support

This app targets evergreen browsers released in 2023 or later:

- Safari 16.4+ (March 2023)
- Chrome / Edge 111+ (March 2023)
- Firefox 113+ (May 2023)

CSS features in use that require these versions: `color-mix(in srgb, ...)`,
modern `@media (prefers-reduced-motion: reduce)` semantics, `aspect-ratio`,
and `mix-blend-mode`. Older browsers will render with degraded accents
(elements that mix into crew colors fall back to plain black).
