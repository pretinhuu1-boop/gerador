# Crew Running Vault

Status: canonical sector index
Updated: 2026-06-06
Scope: `apps/crew-running/vault`

Use this file to route documents. Use `CURRENT_PRODUCT_CONTEXT.md` to understand
current product truth, and use `specs/000-index.md` before new feature,
architecture, mobile, admin, site, game, or harness work.

## Root files

The vault root is intentionally small:

- `README.md` - this sector index.
- `CURRENT_PRODUCT_CONTEXT.md` - active product orientation.
- `CREATOR_CONTRACT.md` - creator/generation contract. Kept at root because
  `scripts/check-creator-contract.mjs` reads this exact path.
- `2026-05-28-wave6-final-qa-closeout.md` - retained at root because
  `scripts/check-creator-contract.mjs` reads this exact path.

Do not add new dated plans to the root. Put them in a sector or create a spec
under `specs/`.

## Specialized sectors

- `specs/` - spec-driven development lanes. Start at `specs/000-index.md`.
- `sound/` - sonic identity, SFX, ambient, music, voice and audio integration
  runbooks.

## Product sectors

### `10-creator/`

Runner creator, generation, character sheets, wardrobe and creator QA.

- `CREATOR_DESIGN_SYSTEM.md`
- `2026-05-28-character-sheet-asset-production-map.md`
- `2026-05-28-creator-subtabs-plan.md`
- `2026-05-28-drift-guard-plan.md`
- `2026-05-28-generator-architecture-research.md`
- `2026-05-28-no-photo-character-brief.md`
- `2026-05-28-no-photo-context-prompt.md`
- `2026-05-28-photo-upload-buttons-fix.md`
- `2026-05-28-photo-upload-findings-fix.md`
- `2026-05-28-wave5-gemini-qa-closeout.md`

### `20-launch-qg-ui/`

Launch flow, QG/main menu, intro, UI regression and early visual backdrops.

- `2026-05-27-street-backdrops-2d.md`
- `2026-05-28-main-menu-hq-action-plan.md`
- `2026-05-28-main-menu-resolution-execution.md`
- `2026-05-28-main-menu-resolution-plan.md`
- `2026-05-28-runner-passport-street-intro.md`
- `2026-05-28-ui-regression-audit-and-correction-plan.md`
- `2026-05-28-ui-regression-execution-closeout.md`
- `2026-05-28-ui-regression-multi-agent-execution-prompt.md`

### `30-map-gps-events-game/`

Map, GPS, runs, territory, gamification, event layers and map/event QA.

- `2026-05-28-gamification-ui-implementation-plan.md`
- `2026-05-28-gps-tracker-and-polish-design.md`
- `2026-05-28-mapa-cidade-gamificado-blueprint.md`
- `2026-05-28-phase-6-territory-decay-plan.md`
- `2026-05-28-qa-test-plan-gamification-2d.md`
- `2026-05-28-restore-gamification-map-plan.md`
- `2026-06-03-gamificacao-mapa-2d-map.md`
- `2026-06-03-mapa-2d-assets-prompts.md`
- `2026-06-04-map-centric-events-architecture.md`
- `2026-06-04-map-events-action-orchestration-execution-plan.md`
- `2026-06-04-map-events-agent-investigation-consolidated.md`
- `2026-06-04-map-events-code-audit.md`
- `2026-06-04-map-events-end-to-end-orchestration-plan.md`
- `2026-06-04-map-events-open-questions-agent-prompts.md`

### `40-sede-social-voce/`

Sede da Crew, Voce tab, social/profile and related feature-family docs.

- `2026-05-28-sede-da-crew-phase-1-plan.md`
- `2026-05-28-sede-da-crew-spec.md`
- `2026-05-28-voce-tab-f1-design-brainstorm.md`
- `2026-05-28-voce-tab-f1-implementation-audit.md`
- `2026-05-28-voce-tab-f1-objective-critique.md`
- `2026-05-28-voce-tab-f1-refactor-blueprint.md`
- `2026-05-28-voce-tab-f1-visual-contract.md`

### `50-mobile-desktop-admin/`

Android/iOS export, admin, desktop/network, commerce and multi-tenant planning.

- `2026-05-28-sprint-close-multi-tenant-plan.md`
- `2026-06-03-admin-dashboard-architecture-plan.md`
- `2026-06-03-admin-dashboard-specialists-prompt.md`
- `2026-06-03-desktop-wellness-network-decision-matrix.md`
- `2026-06-03-map-centric-commerce-interaction-model.md`
- `2026-06-03-mobile-apk-orchestration-execution-plan.md`

### `60-brand-motion-content/`

Brand language, typography, Remotion, motion, teaser content and run-club sound
research.

- `2026-06-03-hyperframes-gsap-motion-study.md`
- `2026-06-03-nike-communication-copy-research.md`
- `2026-06-03-remotion-audio-beatmap-plan.md`
- `2026-06-03-remotion-motion-typography-transition-plan.md`
- `2026-06-03-remotion-presentation-video-plan.md`
- `2026-06-03-remotion-v2-agent-prompts.md`
- `2026-06-03-remotion-v2-orchestration-execution-plan.md`
- `2026-06-03-remotion-v8-logo-crew-pings-orchestration-plan.md`
- `2026-06-03-remotion-v9-visual-polish-action-orchestration-plan.md`
- `2026-06-03-run-club-language-sound-research.md`
- `2026-06-03-typography-visual-communication-research.md`

### `70-research-integrations/`

Cross-cutting external research, open-source references, drive asset scans and
vault/spec/harness process studies.

- `2026-06-06-open-source-mobile-architecture-study.md`
- `2026-06-06-spec-driven-development-continuous-harness-study.md`
- `DRIVE_ASSET_SCAN_2026-06-03.md`

### `90-assets/qa/`

Vault QA screenshots and visual artifacts. These are evidence files, not
product source.

- `crew-axial-cronometro-deploy-2026-06-03.png`
- `qa-map-events-desktop-2026-06-04.png`
- `qa-map-events-mobile-2026-06-04.png`
- `qa-zone-events-flow-2026-06-04.png`

## Rules

- Dated sector docs are historical or planning evidence unless
  `CURRENT_PRODUCT_CONTEXT.md` or an active spec says otherwise.
- Do not copy AGPL/GPL reference code from research docs into the app.
- Do not move `CREATOR_CONTRACT.md` or
  `2026-05-28-wave6-final-qa-closeout.md` until
  `scripts/check-creator-contract.mjs` is updated and validated.
- New implementation work should enter through `specs/000-index.md`, not by
  directly executing an old dated plan.
