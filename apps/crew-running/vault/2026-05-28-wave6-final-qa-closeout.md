# Wave 6 Final QA Closeout

Date: 2026-05-28.

## Corrections Made

- Restored the collective runner type contract to `Crew Pace` with id `crew-pace`.
- Updated the creator contract check, README, implementation plan, button asset map and closeout notes to match `Crew Pace`.
- Updated the returning QG saved-runner pass to show `RUNNER SALVO` and identity state without exposing PNG implementation details.

## Static Validation

Commands run from `apps/crew-running`:

```bash
npm run check:creator-contract
npm run smoke:creator
npx tsc --noEmit
npm run build
```

Additional repo checks:

```bash
git diff --check
rg "API KEY|GERAR|RANDOM|PREVIEW|MVP|MAPA 2D|GPS|START RUN|TRACKING|LEADERBOARD|PACE|ROTA P[ÚU]BLICA|POST-RUN|POST RUN|INICIAR CORRIDA|COMEÇAR CORRIDA|PUBLICAR ROTA" App.tsx components data services index.css index.html public
```

Results:

- Creator contract check passed.
- Creator smoke passed.
- TypeScript passed.
- Vite production build passed.
- Whitespace diff check passed.
- Runtime forbidden-copy scan passed for active app source and runtime public files.

## Browser QA

Validated on `http://127.0.0.1:3104`.

Passed scenarios:

- Fresh visit starts at cold boot with `PULAR`.
- `PULAR` skips only the boot and lands on Title/Open.
- `PULAR INTRO` lands in the QG, not directly in Runner Creator.
- `PULAR TUTORIAL` marks guided onboarding complete and opens Runner Creator.
- Legacy `crewBootSeen=true` still skips only the console boot.
- Returning intro-complete visit opens the QG.
- Returning saved-runner visit shows `RUNNER SALVO`, identity state and the saved runner name.
- Desktop saved QG has no horizontal overflow.
- Mobile 390x844 reduced-motion saved QG has no horizontal overflow.
- Reduced motion produced `activeAnimations: 0`.
- Keyboard focus reached the main menu nav.

Screenshots were captured under ignored `apps/crew-running/output/playwright/`:

- `wave6-creator.png`
- `wave6-saved-desktop.png`
- `wave6-saved-mobile-reduced.png`

## Remaining Findings

- No blocking Wave 6 findings remain.
- Before commit, review the broad dirty worktree and stage only intended source/docs/runtime assets.
- Optional next work is a final visual-system polish pass; the flow and creator contract are now stable enough for that.
