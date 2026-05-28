# Implementation & Orchestration Plan: Crew Running Game Intro

**App:** `apps/crew-running`
**Branch:** `codex/crew-boot-intro-onboarding`
**Source of truth:** `vault/CREATOR_CONTRACT.md`, `DESIGN.md` and `GAME_UI_TEMPLATE.md`

## 1. Objective

Transform the current launch/customization flow into a game-first opening that stops at runner character creation.

Approved product line:

> O app nao abre. A cidade liga.

Approved flow:

```text
Cold Boot
  -> Opening / Title
  -> City Signal Entry
  -> Character-Guided Setup
  -> Runner Creator
  -> Runner Saved / City Ready teaser
```

This phase must not ask the player to start a real run. It must not request GPS, show live tracking, publish routes, rank runners or push pace/streak pressure.

## 2. Current Implementation State

Status after the latest execution pass on 2026-05-28:

- `App.tsx` stays small and renders `CrewLaunchExperience` plus lazy `CustomizeScreen`.
- `CrewLaunchExperience.tsx` uses the explicit state model: `consoleBoot`, `title`, `citySignal`, `mainMenu`, `guidedSetup`, `runnerCreator`, `runnerSaved`.
- `ConsoleBoot.tsx`, `TitleScreen.tsx`, `CitySignalEntry.tsx`, `MainMenu.tsx`, `GuidedOnboarding.tsx`, `RunnerSavedTeaser.tsx`, `StreetBackdrop.tsx` and supporting launch components are implemented.
- `launchStorage.ts` persists boot/title/city/menu/guide/runner flags and keeps legacy `crewBootSeen`.
- `MainMenu.tsx` now acts as QG: `COMEÇAR`, `MONTAR RUNNER`, `AJUSTAR RUNNER`, saved runner pass and secondary `REVER INTRO`.
- `CustomizeScreen.tsx` is the Runner Creator surface. It uses photo, profile, runner type, selected crew context and wardrobe slots.
- `crewService.ts` calls Gemini for a 2x2 sheet and uses the uploaded photo only as broad physical-characteristics reference. It does not ask the model to copy exact face, hair, clothing or identity.
- Saving a look crops the selected cell, removes the neutral background, stores a PNG in `crew.saved_character`, marks `crewRunnerCustomized` and shows `RUNNER READY / CIDADE PRONTA`.
- Runtime assets under `public/backgrounds/` and `public/ui/` are now staged for commit; QA artifacts under `output/` are ignored.

Resolved mismatches:

- Title/opening and city signal are separate screens.
- `PULAR`, `PULAR INTRO` and `PULAR TUTORIAL` have distinct behavior.
- `PULAR INTRO` does not send first-time users directly to customization without QG context.
- The main surface no longer exposes `API KEY`, `GERAR`, `RANDOM`, `PREVIEW`, `MVP` or `MAPA 2D`.
- The collective runner type is `Crew Flow` with id `crew-flow`.
- The saved runner state is visible both in the teaser and when returning to the QG.

Remaining closeout work:

- Review the full worktree before commit because this branch contains broad modified/untracked app files.
- Keep generated QA screenshots in ignored `output/`; commit only runtime assets and source/docs.
- Wave 6 final QA has no blocking findings. Optional final visual polish can happen if the product needs another art-direction pass.

## 3. Implementation Waves

### Wave 0 - Baseline & Guardrails

Goal: lock the target and avoid accidental scope creep.

Tasks:

- Keep `DESIGN.md`, `GAME_UI_TEMPLATE.md` and this plan as the implementation contract.
- Confirm all required assets exist:
  - `public/brand/logo.png`
  - `public/brand/splash.png`
  - `public/textures/board.png`
  - `public/intro/crew-pings/*.png`
  - `public/crews/{slug}/badge_128.png`
  - `public/crews/{slug}/banner.png`
  - `public/crews/{slug}/leader.png`
  - `public/crews/{slug}/marker.png`
  - `public/crews/{slug}/mission_card.png`
  - `public/crews/{slug}/territory_pattern.png`
  - `public/crews/{slug}/stickers/*.png`
  - `public/crews/{slug}/achievements/*.png`
  - `public/wardrobe/**`
  - no `public/styles/*` asset is allowed as creator generation input
- Define the final route/state names before editing UI.
- Keep all run activation concepts out of this phase.

Exit gate:

- `npm run build` passes before and after the first code wave.
- No player-facing copy contains `MVP`, `API KEY`, `GERAR`, `PREVIEW`, `dashboard`, `GPS obrigatorio`, `ranking cedo` or `rota publica`.

### Wave 1 - Flow State Machine

Goal: make the app flow match the product contract before visual polish.

Target state model:

```ts
type LaunchScreen =
  | 'consoleBoot'
  | 'title'
  | 'citySignal'
  | 'mainMenu'
  | 'guidedSetup'
  | 'runnerCreator'
  | 'runnerSaved';
```

Implementation scope:

- Refactor `CrewLaunchExperience.tsx` around explicit screen transitions.
- Decide and implement skip semantics:
  - `PULAR` on boot: skips boot sequence only.
  - `PULAR INTRO` on title/city signal: goes to `mainMenu` or `guidedSetup`, not straight to runner creation for first-time users.
  - `PULAR TUTORIAL` on guided setup: goes to runner creation and marks onboarding complete.
- Update `launchStorage.ts` if more explicit keys are needed:
  - `crewConsoleBootSeen`
  - `crewTitleSeen`
  - `crewCitySignalSeen`
  - `crewMainMenuSeen`
  - `crewGuidedSetupComplete`
  - `crewRunnerCustomized`
  - keep legacy `crewBootSeen`
- Keep `App.tsx` small. It should own only the top-level switch between launch shell and runner creator if needed.

Exit gate:

- A first-time player reaches runner creation only through boot/title/city/guide or a clearly labeled skip path.
- A returning player with runner saved can enter the menu without replaying the full intro.
- `localStorage` failures do not crash the app.

### Wave 2 - Screen Split & Game Shell

Goal: make each screen have one job.

New or refactored components:

- `TitleScreen.tsx`
  - Uses `brand/splash.png`, logo and the line `O app nao abre. A cidade liga.`
  - Primary CTA: `ENTRAR`
  - Secondary: `PULAR INTRO`
- `CitySignalEntry.tsx`
  - Full-screen city map, five crew pings, active mission ticket, route strokes.
  - Primary CTA: `COMEÇAR`
  - Shows aggregate/symbolic signal only.
- `MainMenu.tsx`
  - Becomes the game HQ after the intro, not the whole onboarding.
  - Nav: `INICIO`, `CREWS PILOTO`, `RUNNER`, `CONFIG`, `REVER INTRO`.
  - Main CTA before setup: `COMEÇAR`.
  - Main CTA after setup: `MONTAR RUNNER`.
- `GuidedOnboarding.tsx`
  - Rename later to `GuidedSetup` or keep filename but change copy/structure.
  - Character-led first mission with one action per step.
- `CustomizeScreen.tsx`
  - Becomes visually and verbally `RunnerCreator`.

Exit gate:

- Each screen can be explained with one sentence from `GAME_UI_TEMPLATE.md`.
- There are no nested cards inside cards.
- Main CTA is visible on mobile without hunting.

### Wave 3 - Visual System Pass

Goal: make the app read as a street-running game, not a styled prototype.

Implementation scope:

- `index.css`
  - Consolidate game tokens, surfaces, rough borders and command buttons.
  - Use `public/textures/board.png` as real material, not subtle decoration only.
  - Add reusable classes for:
    - `.game-screen`
    - `.game-command`
    - `.mission-ticket`
    - `.crew-patch`
    - `.signal-chip`
    - `.sticker-stamp`
    - `.runner-creator`
- `SvgDefs.tsx`
  - Keep `rough-soft`, `rough-mid`, `rough-strong`.
  - Use them consistently and sparingly.
- Launch screens:
  - Use crew badge/marker/ping assets before generic dots.
  - Use mission cards and stickers as state surfaces.
  - Treat leader portraits as sticker/poster art until transparent cutouts exist.
- Runner creator:
  - Reframe the layout as locker room/equipment UI.
  - Replace tool labels:
    - `RANDOM` -> `MISTURAR LOOK`
    - `GERAR` -> `CRIAR RUNNER`
    - `GERANDO...` -> `CREW STUDIO`
    - `SEU RUNNER` -> `RUNNER SALVO`
  - Hide dev/API key controls behind a small settings/dev control.

Exit gate:

- First viewport looks like a game title/HQ, not a dashboard.
- Street and running details communicate state: route, checkpoint, crew badge, sticker, equipment, saved stamp.
- Text stays legible over texture on desktop and mobile.

### Wave 4 - Motion & Reduced Motion

Goal: make movement feel intentional and removable.

Use:

- Framer Motion for screen entries, command selection, stamp/save states and panel transitions.
- GSAP only for the map layer and pointer/reactive route movement.
- Native CSS for small pulse/stamp details when simpler.

Required reduced-motion equivalents:

- No parallax.
- No blur/zoom wipe.
- No infinite scanner loop.
- Route/crew changes become instant color, border and stamp changes.
- Loading/generation uses text/state changes instead of motion dependency.

Exit gate:

- `prefers-reduced-motion: reduce` still lets the full flow complete.
- Animated screens do not auto-skip before the player can read the CTA.
- Buttons remain keyboard usable.

### Wave 5 - Runner Saved / City Ready Teaser

Goal: end the phase after identity creation without pretending the run product is ready.

Implementation scope:

- After saving runner, show a small `RUNNER READY` / `CIDADE PRONTA` state.
- Return target: main menu or `runnerSaved` teaser.
- Do not show `START RUN`, GPS, pace pressure, leaderboard or route publishing.
- Use crew sticker/achievement as a teaser reward, not a competitive ranking.

Exit gate:

- Saving runner marks `crewRunnerCustomized`.
- Returning to menu shows `RUNNER: SALVO`.
- The next implied product phase is city exploration, not immediate run activation.

### Wave 6 - QA, Review & Closeout

Goal: catch regressions before calling the branch ready.

Commands:

```bash
cd /Users/belissima/Desktop/running\ crew/apps/crew-running
npx tsc --noEmit
npm run build
npm run dev
```

Browser QA:

- Fresh first visit with empty `localStorage`.
- Returning visit after `crewBootSeen=true`.
- Returning visit after `crewRunnerCustomized=true`.
- Desktop width around 1440px.
- Tablet width around 834px.
- Mobile width around 390px.
- `prefers-reduced-motion: reduce`.
- Keyboard-only navigation through boot skip, title, menu, guide and creator.

Visual QA checklist:

- No horizontal overflow.
- No text overlap.
- No CTA hidden below the fold on first action screens.
- Crew pings and assets load without broken images.
- Map is visible and not blank.
- Runner creator controls do not resize the layout unexpectedly.
- API key/dev state is not the primary surface.

## 4. Orchestration Model

The main agent/integrator owns sequencing, final merge and validation. Subagents should only be used for bounded review or disjoint file ownership.

### Roles

**Integrator**

- Owns `App.tsx`, `CrewLaunchExperience.tsx`, `launchStorage.ts`.
- Integrates worker outputs.
- Runs `tsc`, build and browser QA.
- Protects scope: no GPS/run activation.

**Visual Game UI Reviewer**

- Read-only unless assigned CSS ownership.
- Reviews `index.css`, launch screens and `CustomizeScreen.tsx`.
- Checks whether the app feels like street-running game UI.
- Flags SaaS cards, weak hierarchy, generic terminal/cyber language and missing running cues.

**UX Flow QA**

- Read-only unless assigned tests/docs.
- Reviews state transitions, skip paths, keyboard flow, reduced motion and first-time/returning behavior.
- Flags ambiguous exits and localStorage regressions.

**Component Worker: Launch Screens**

- Owns only `components/launch/*` when assigned.
- Does not edit `CustomizeScreen.tsx` or storage unless explicitly assigned.

**Component Worker: Runner Creator**

- Owns only `CustomizeScreen.tsx`, creator subcomponents and creator CSS when assigned.
- Does not edit launch flow or storage unless explicitly assigned.

**CSS/System Worker**

- Owns `index.css` and possibly `SvgDefs.tsx`.
- Does not change React behavior.

### Parallelization Rules

- Do not let two workers edit `index.css` at the same time.
- Do not let two workers edit `CrewLaunchExperience.tsx` at the same time.
- Workers must not revert unrelated diffs.
- Explorers/reviewers can run in parallel because they are read-only.
- Implementation workers can run in parallel only with disjoint write sets.

Recommended order:

1. Integrator implements Wave 1 state machine locally.
2. Launch worker implements Wave 2 launch screens.
3. Runner creator worker implements Wave 3 creator language/layout.
4. CSS/system worker applies the visual system pass after component structure stabilizes.
5. Visual reviewer and UX QA review the integrated result.
6. Integrator fixes findings and runs final validation.

## 5. Acceptance Criteria

The implementation is ready when:

- First-time flow follows the approved sequence through runner creation.
- Returning flow respects persisted progress.
- `PULAR`, `PULAR INTRO` and `PULAR TUTORIAL` have distinct, intentional behavior.
- The app never asks for a real run in this phase.
- The UI reads as a street-running game: title screen, city signal, crews, mission ticket, character guide and runner creator.
- Existing generated assets are used as primary UI material.
- Reduced motion is respected.
- Keyboard and mobile flows work.
- `npx tsc --noEmit` passes.
- `npm run build` passes.

## 6. Suggested Next Execution Prompt

```text
Implement Wave 1 and Wave 2 from apps/crew-running/IMPLEMENTATION_ORCHESTRATION_PLAN.md.

Scope:
- Refactor launch state transitions to match the approved flow.
- Split title/opening from city signal entry if needed.
- Keep the flow ending at RunnerCreator.
- Do not add GPS, run activation, leaderboard, live tracking, public route or post-run recap.
- Preserve reduced motion and skip behavior.
- Do not revert unrelated diffs.

Before coding, inspect:
- apps/crew-running/App.tsx
- apps/crew-running/components/launch/*
- apps/crew-running/services/launchStorage.ts
- apps/crew-running/index.css
- apps/crew-running/DESIGN.md
- apps/crew-running/GAME_UI_TEMPLATE.md

Validation:
- npx tsc --noEmit
- npm run build
- browser QA for fresh visit, returning visit and reduced motion
```

## 7. Latest Validation Snapshot

Date: 2026-05-28.

Commands:

```bash
cd /Users/belissima/Desktop/running\ crew/apps/crew-running
npm run check:creator-contract
npx tsc --noEmit
npm run build
git diff --check
```

Results:

- TypeScript passed.
- Vite production build passed.
- Creator contract check passed.
- Runtime forbidden-copy scan passed for app source/runtime public files.
- Browser QA passed for fresh visit, legacy returning visit, intro-complete returning visit, saved-runner returning visit, mobile reduced motion and keyboard focus.
- Fresh skip behavior remained distinct:
  - `PULAR` skipped only the boot.
  - `PULAR INTRO` landed in QG, not creator.
  - `PULAR TUTORIAL` opened Runner Creator and marked onboarding complete.
- Saved-runner QG showed `RUNNER READY`, `PNG limpo` and the saved runner name.
- Reduced-motion mobile QA passed at 390x844 with `activeAnimations: 0` and no horizontal overflow.
- Real Gemini QA passed using a temporary CC0 Wikimedia image:
  - uploaded image in Runner Creator;
  - filled runner name, sex/default, height, weight and personality;
  - generated a 2x2 sheet;
  - found 4 `Equipar look` zones;
  - saved one look;
  - `crew.saved_character` stored a `data:image/png` with `backgroundRemoved: true`;
  - `crewRunnerCustomized=true`;
  - `RUNNER READY / CIDADE PRONTA` teaser appeared.

Temporary QA input and Playwright artifacts were removed or ignored.
