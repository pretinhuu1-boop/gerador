# Implementation Plan: Mobile Capacitor Export

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## Technical Context Read

- `apps/crew-running` is the active player-facing mobile/game app.
- Current stack is Vite/React/PWA with `vite-plugin-pwa`.
- `vite.config.ts` exposes LAN mode with `VITE_DEV_HOST=lan` and default port
  `3100`.
- `package.json` has `validate`, `build`, `test`, `typecheck`,
  `check:creator-contract` and `smoke:creator`.
- No `android/`, `ios/` or `capacitor.config.*` path was present in the app root
  at planning time.
- `package-lock.json` is present, so dependency installation should preserve npm
  lockfile workflow.

## Proposed App Identity

Use these only as provisional debug defaults until the product owner confirms
final identifiers:

- App name: `The Crew Running`
- Android package id / iOS bundle id: `com.thecrewrunning.app`
- Web directory: `dist`

## Affected Files

Expected docs/spec files:

- `apps/crew-running/vault/specs/000-index.md`
- `apps/crew-running/vault/specs/003-mobile-capacitor-export/*`

Expected implementation files after W2:

- `apps/crew-running/package.json`
- `apps/crew-running/package-lock.json`
- `apps/crew-running/capacitor.config.ts`
- `apps/crew-running/android/**`
- `apps/crew-running/ios/**`

Expected generated QA artifact after W5:

- `apps/crew-running/android/app/build/outputs/apk/debug/app-debug.apk`

## Execution Waves

### W0 - Baseline validation

Run from `apps/crew-running`:

```bash
npm run validate
```

Gate:

- Pass: continue to W1.
- Fail: fix or record blockers before native scaffold.

### W1 - Mobile web LAN QA

Run from `apps/crew-running`:

```bash
ipconfig getifaddr en0 || ipconfig getifaddr en1
VITE_DEV_HOST=lan npm run dev
```

Open on a phone on the same Wi-Fi:

```text
http://<IP_DA_MAQUINA>:3100
```

Gate:

- App boots without white screen.
- QG/onboarding/crew selection are usable.
- Creator opens and keeps `TESTAR LOCAL`.
- Map loads and GPS permission path is observable.
- Background/return behavior does not lose critical state.

### W2 - Capacitor scaffold

Only after W0/W1 are accepted:

```bash
npm i @capacitor/core @capacitor/android @capacitor/ios
npm i -D @capacitor/cli
npx cap init "The Crew Running" "com.thecrewrunning.app" --web-dir=dist
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Gate:

- `capacitor.config.ts` exists and points to `dist`.
- `android/` exists.
- `ios/` exists.
- Sync completes without secrets or unnecessary permissions.

### W3 - Native config review

Review:

- `android/app/src/main/AndroidManifest.xml`
- `ios/App/App/Info.plist`
- App name and package/bundle id.
- Location, camera/upload, storage and notification permissions.

Gate:

- Permissions are explicit, minimal and justified.
- No secret or privileged key exists in native files.

### W4 - Build and sync

Run:

```bash
npm run validate
npm run build
npx cap sync android
npx cap sync ios
```

Gate:

- Full validation passes.
- Native projects receive current web build.

### W5 - Android debug APK and iOS project

Run:

```bash
cd android
./gradlew assembleDebug
```

Gate:

- APK exists at `android/app/build/outputs/apk/debug/app-debug.apk`.
- iOS project exists at `ios/App`.
- Xcode/device status is recorded.

### W6 - Native device QA

Check:

- Cold boot.
- Local assets.
- Internal routing.
- Onboarding and crew selection.
- Creator and `TESTAR LOCAL`.
- Map and GPS foreground behavior.
- Login/sync when environment exists.
- App return after background.

Gate:

- No blocker in core mobile/player flow.
- Non-blockers have reproduction notes and native/web ownership.

### W7 - Release readiness report

Do not ship from this wave. Record:

- final package/bundle id decision;
- signing and store gaps;
- privacy-policy needs for GPS/login/sync;
- background tracking bridge/plugin needs;
- exact APK path, iOS project path and commands.

## Risks

- Native toolchains may be missing or mismatched.
- Mobile web may fail before Capacitor, especially map gestures, overflow, GPS
  permissions, audio or upload.
- WebView foreground GPS may behave differently from browser GPS.
- Long background runs require native work outside this baseline wrapper.
- Native projects can introduce large generated diffs; changes must stay
  explicitly scoped.

## Validation Plan

- W0: `npm run validate`.
- W1: LAN mobile QA log with device/browser.
- W2/W4: Capacitor sync output.
- W5: APK path and iOS project path.
- W6: native device QA notes and logs.
- Final: `review.md` and `retrospective.md` before accepted status.
