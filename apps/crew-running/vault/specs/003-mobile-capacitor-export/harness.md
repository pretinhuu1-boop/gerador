# Continuous Harness: Mobile Capacitor Export

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## ETCLOVG Map

| Layer | Contract for this spec | Evidence to capture |
| --- | --- | --- |
| Execution | macOS local repo, npm, Vite, Android SDK/Gradle, Xcode/iOS tooling when available, phone on LAN for W1 | command outputs, tool versions, device/browser notes, artifact paths |
| Tooling | npm scripts, Vite LAN server, Capacitor CLI, Gradle, adb, Xcode | command output, errors, generated paths |
| Context | current product context, vault README, specs index, mobile research, mobile execution plan, package/vite config | files read, decisions cited, spec updates |
| Lifecycle | W0 baseline, W1 mobile web, W2 scaffold, W3 native review, W4 sync, W5 artifacts, W6 QA, W7 readiness | task status, validation log, review decision |
| Observability | terminal output, LAN URL, screenshots when possible, APK path, native logs when available | validation-log entries and QA artifacts |
| Verification | `npm run validate`, LAN mobile QA, `npx cap sync`, Gradle build, Xcode/device checks | pass/fail with expected vs actual |
| Governance | no secrets, no service role, no admin in player bundle, creator contract preserved, package id provisional | static review, contract check, approval notes |

## Readiness Checks

- [x] Canonical docs read.
- [x] Active spec has no unresolved blocker for W0.
- [x] Existing app has `npm run validate`.
- [x] Existing app has LAN dev-server support through `VITE_DEV_HOST=lan`.
- [ ] W0 validation passed.
- [ ] W1 mobile-web QA passed or blocker recorded.
- [ ] Android tooling confirmed before W5.
- [ ] Xcode tooling confirmed before iOS device QA.
- [ ] Final package id/bundle id confirmed before release-oriented work.

## Controlled Execution

Commands to record as they run:

```bash
npm run validate
ipconfig getifaddr en0 || ipconfig getifaddr en1
VITE_DEV_HOST=lan npm run dev
npm i @capacitor/core @capacitor/android @capacitor/ios
npm i -D @capacitor/cli
npx cap init "The Crew Running" "com.thecrewrunning.app" --web-dir=dist
npm run build
npx cap add android
npx cap add ios
npx cap sync
cd android && ./gradlew assembleDebug
```

Browser/device QA:

- W1 requires phone/LAN validation or an explicit documented substitute.
- W6 requires native Android/iOS device or simulator status before accepted
  release-readiness claims.

Trace/screenshot paths:

- Use `validation-log.md` for terminal command summaries.
- Store screenshots under `../../90-assets/qa/` only if useful evidence exists.
- Record generated APK path and iOS project path in `validation-log.md`.

## Failure Attribution

For each failure, record:

```text
Failure:
Layer:
Evidence:
Fix or follow-up:
Regression/checklist added:
```

## Regression Feedback

- If mobile-web layout fails, add a browser/mobile QA checklist or test before
  native packaging.
- If creator contract fails after native work, update creator tests or contract
  checks before continuing.
- If GPS works in browser but fails in WebView, create a native geolocation spec
  or task for Capacitor permissions/plugin.
- If generated native files expose secrets or broad permissions, add a static
  governance check before acceptance.
