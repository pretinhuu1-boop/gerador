# Feature Specification: Mobile Capacitor Export

Status: active
Spec ID: `003-mobile-capacitor-export`
Surface: mobile/player
Created: 2026-06-06
Input: User approved continuing after the cold-session vault effectiveness check.

## Canonical reads

- `../../CURRENT_PRODUCT_CONTEXT.md`
- `../../README.md`
- `../000-index.md`
- `../../70-research-integrations/2026-06-06-spec-driven-development-continuous-harness-study.md`
- `../../70-research-integrations/2026-06-06-open-source-mobile-architecture-study.md`
- `../../50-mobile-desktop-admin/2026-06-03-mobile-apk-orchestration-execution-plan.md`
- `../../../package.json`
- `../../../vite.config.ts`

## Intent

Turn the existing Android APK and iOS export plan into an executable spec lane.
The app remains Vite/React/PWA as the single player-facing mobile/game source,
then gains Capacitor Android and iOS wrappers only after the current web app
passes baseline validation and mobile-web readiness checks.

This spec should produce a repeatable path from current repo state to:

- mobile web validated on LAN;
- Capacitor configured with `dist` as web output;
- Android wrapper generated;
- iOS wrapper generated;
- Android debug APK generated for internal QA;
- iOS Xcode project created for device/Xcode validation;
- native QA and release-readiness gaps documented.

## Non-goals

- Do not rewrite to React Native or Expo.
- Do not move admin behavior into the player bundle.
- Do not publish to Play Store or App Store.
- Do not create release keystores, provisioning profiles, certificates or App
  Store Connect/TestFlight state in this wave.
- Do not treat Android debug APK as a client release.
- Do not treat the initial iOS project as an App Store-ready build.
- Do not claim long background run tracking is solved by Capacitor alone.
- Do not change the runner creator contract, restore public style selection,
  restore wardrobe `hair`, or use `Crew Flow` / `crew-flow`.
- Do not put secrets, Supabase service-role keys, keystores, tokens or privileged
  admin credentials in `VITE_*`, repo files, localStorage, Android, iOS or the
  bundled web app.

## User Stories

### US1 - Mobile web baseline is proven first (P1)

As the product owner, I want the current app validated before native wrapping,
so that native work does not hide broken web/mobile behavior.

Independent test:
Run `npm run validate` from `apps/crew-running`, then perform mobile-web LAN QA
on a real phone or documented browser/device substitute.

Acceptance scenarios:

1. Given no native wrapper exists, when W0 runs, then creator contract,
   typecheck, tests, build and creator smoke pass.
2. Given a phone is on the same network, when W1 runs, then the app opens by LAN
   URL and the main mobile/player flow is usable enough to continue.

### US2 - Capacitor wrappers are generated from the Vite build (P1)

As a native packager, I want Android and iOS wrappers generated from `dist`, so
that Vite/PWA remains the source of truth.

Independent test:
After approved W0/W1 gates, install Capacitor dependencies, run `npx cap init`,
`npm run build`, `npx cap add android`, `npx cap add ios`, and `npx cap sync`.

Acceptance scenarios:

1. Given W0/W1 passed, when Capacitor is initialized, then
   `capacitor.config.ts` points to `dist`.
2. Given Capacitor sync runs, then both `android/` and `ios/` exist and receive
   the current web build.

### US3 - Internal native QA artifacts are reproducible (P1)

As a QA operator, I want exact native artifact paths and commands, so that
Android and iOS validation can be repeated outside the agent session.

Independent test:
Run Android debug build and open or validate the iOS project path.

Acceptance scenarios:

1. Given Android dependencies are available, when `./gradlew assembleDebug`
   runs, then the APK exists at
   `android/app/build/outputs/apk/debug/app-debug.apk`.
2. Given Xcode tooling is available, when the iOS project is opened, then the
   project exists at `ios/App` and native gaps are documented.

### US4 - Native limitations are not overpromised (P2)

As a future maintainer, I want GPS, camera/upload, background tracking and
release signing gaps separated, so that the debug wrapper is not mistaken for a
complete production mobile stack.

Independent test:
Read `validation-log.md`, `review.md` and `retrospective.md` after execution and
confirm remaining native gaps are classified.

Acceptance scenarios:

1. Given GPS foreground fails in WebView, when the failure is logged, then it is
   assigned to a native permission/plugin follow-up instead of hidden.
2. Given long background tracking is requested, when release readiness is
   reviewed, then Android foreground service and iOS CoreLocation background are
   explicit future work.

## Functional Requirements

- FR-001: The app MUST remain `apps/crew-running` Vite/React/PWA as the source
  of truth for mobile/player.
- FR-002: W0 MUST run before Capacitor scaffold is treated as approved.
- FR-003: W1 mobile-web LAN QA MUST be recorded before native QA is treated as
  approved.
- FR-004: Capacitor MUST target Android and iOS from the same Vite `dist` build.
- FR-005: The package/bundle id MUST be treated as provisional until a product
  owner confirms the final app identity.
- FR-006: Native permissions MUST be explicit and minimal.
- FR-007: Secrets and privileged admin credentials MUST NOT enter the player
  bundle or native projects.
- FR-008: Creator contract invariants MUST remain intact after native wrapping.
- FR-009: Debug APK, release APK/AAB, iOS project and iOS release archive MUST be
  documented as separate artifacts.
- FR-010: Background tracking MUST remain a future native bridge/plugin decision
  unless it is implemented and tested in a later spec.

## Acceptance Criteria

- AC-001: `npm run validate` passes from `apps/crew-running`.
- AC-002: Mobile-web LAN QA result is recorded with URL/IP, device/browser and
  pass/fail notes.
- AC-003: `capacitor.config.ts`, `android/` and `ios/` exist only after W0/W1
  gates are accepted.
- AC-004: `npx cap sync` passes for Android and iOS.
- AC-005: Android debug APK path is recorded when generated.
- AC-006: iOS project path is recorded and Xcode/device status is documented.
- AC-007: `review.md` lists no blocker before the spec is accepted.
- AC-008: Any accepted cross-spec rule is promoted to
  `../../CURRENT_PRODUCT_CONTEXT.md`, `../../../../AGENTS.md`,
  `../../../../CLAUDE.md` or an executable contract.

## Boundaries and Safety

- Data/secrets: no service role, keystore, provisioning profile, token or private
  credential may be committed or exposed through `VITE_*`.
- Creator contract: native export must preserve `TESTAR LOCAL`, crew-locked
  generation, valid wardrobe slots and canonical runner types.
- GPS/location: foreground GPS can be tested; background tracking requires a
  later native bridge decision.
- Admin/service role: admin remains out of the player bundle.
- Licensing: open-source studies are references; do not copy AGPL/GPL code.
- Human approval: final app id, package id, signing, store publication and
  background-tracking scope require explicit future approval.

## Open Questions

- NEEDS CLARIFICATION: What is the final Android package id and iOS bundle id?
  Use `com.thecrewrunning.app` only as a provisional debug value if needed.
- NEEDS CLARIFICATION: Which physical Android and iOS devices will be the first
  QA targets?
- NEEDS CLARIFICATION: Is foreground GPS enough for the first internal QA build,
  or should native geolocation plugin work be a separate immediate spec?
