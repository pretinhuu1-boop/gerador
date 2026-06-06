# Tasks: Mobile Capacitor Export

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## W0 - Baseline validation

- [ ] T001 Run `npm run validate` from `apps/crew-running`.
- [ ] T002 Record command output summary in `validation-log.md`.
- [ ] T003 If validation fails, classify blocker before any Capacitor scaffold.

Checkpoint: W0 passes or has an explicit blocker.

## W1 - Mobile web LAN QA

- [ ] T004 Resolve current LAN IP with `ipconfig getifaddr en0 || ipconfig getifaddr en1`.
- [ ] T005 Start dev server with `VITE_DEV_HOST=lan npm run dev`.
- [ ] T006 Test mobile/player flow on a phone or documented browser/device substitute.
- [ ] T007 Record device, URL, pass/fail notes and screenshots if available.

Checkpoint: mobile web is approved for native wrapping or blockers are filed.

## W2 - Capacitor scaffold

- [ ] T008 Install `@capacitor/core`, `@capacitor/android` and `@capacitor/ios`.
- [ ] T009 Install `@capacitor/cli` as a dev dependency.
- [ ] T010 Initialize Capacitor with provisional app id and `dist` web dir.
- [ ] T011 Run `npm run build`.
- [ ] T012 Add Android project.
- [ ] T013 Add iOS project.
- [ ] T014 Run `npx cap sync`.

Checkpoint: `capacitor.config.ts`, `android/` and `ios/` exist and sync passes.

## W3 - Native config review

- [ ] T015 Review Android manifest permissions.
- [ ] T016 Review iOS Info.plist permissions.
- [ ] T017 Confirm no secrets, keystores, service-role keys or privileged tokens
  entered native files.
- [ ] T018 Confirm app name and provisional package/bundle id.

Checkpoint: native config has no blocker before build.

## W4 - Build and sync

- [ ] T019 Run `npm run validate`.
- [ ] T020 Run `npm run build`.
- [ ] T021 Run `npx cap sync android`.
- [ ] T022 Run `npx cap sync ios`.

Checkpoint: current web build is synced into native projects.

## W5 - APK debug and iOS project

- [ ] T023 Run `./gradlew assembleDebug` from `android/`.
- [ ] T024 Record APK path and file size.
- [ ] T025 Confirm `ios/App` project exists and record Xcode status.

Checkpoint: internal native QA artifacts exist or blocker is recorded.

## W6 - Native device QA

- [ ] T026 Install/open Android debug APK on a physical device when available.
- [ ] T027 Open/run iOS project through Xcode when available.
- [ ] T028 Test cold boot, onboarding, crew selection, creator, `TESTAR LOCAL`,
  map, GPS foreground and background return.
- [ ] T029 Record logs, screenshots and failures with ETCLOVG layer.

Checkpoint: no blocker in main mobile/player flow.

## W7 - Release readiness

- [ ] T030 Document signing, store, privacy and package/bundle id gaps.
- [ ] T031 Document background tracking follow-up if needed.
- [ ] T032 Complete `review.md`.
- [ ] T033 Complete `retrospective.md`.
- [ ] T034 Update `000-index.md` and canonical docs only if the spec is accepted.

Checkpoint: spec is accepted, blocked or explicitly left active with next steps.
