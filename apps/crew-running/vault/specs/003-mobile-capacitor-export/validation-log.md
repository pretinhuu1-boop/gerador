# Validation Log: Mobile Capacitor Export

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## Results

| Check | Command or evidence | Result | Notes |
| --- | --- | --- | --- |
| Spec lane created | `test -f` checks for spec artifacts | Pending | Run after file creation. |
| W0 baseline validation | `npm run validate` | Pending | Required before W1/W2 approval. |
| W1 LAN IP | `ipconfig getifaddr en0 || ipconfig getifaddr en1` | Pending | Required before phone QA. |
| W1 mobile web QA | Phone/LAN test | Pending | Device/browser and URL must be recorded. |
| W2 Capacitor scaffold | `npx cap init`, `npx cap add android`, `npx cap add ios`, `npx cap sync` | Pending | Do not run before W0/W1 gates. |
| W5 Android debug APK | `cd android && ./gradlew assembleDebug` | Pending | Record APK path and size. |
| W5 iOS project | `test -d ios/App` plus Xcode status | Pending | Record Xcode/device status. |

## Failures

| Failure | ETCLOVG layer | Evidence | Follow-up |
| --- | --- | --- | --- |
| None yet | N/A | N/A | N/A |

## Notes

- This spec starts as a controlled execution lane. Native scaffold is not yet
  created.
- `com.thecrewrunning.app` is provisional unless the product owner confirms it.
