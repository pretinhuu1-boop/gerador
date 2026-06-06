# Research: Mobile Capacitor Export

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## Sources Used

- `../../70-research-integrations/2026-06-06-open-source-mobile-architecture-study.md`
- `../../50-mobile-desktop-admin/2026-06-03-mobile-apk-orchestration-execution-plan.md`
- `../../../vite.config.ts`
- `../../../package.json`

No new external code was imported for this spec. The local open-source study is
used as product and architecture research, not as copied implementation.

## Decisions Carried Forward

- Keep Vite/React/PWA as the source of truth for the player-facing app.
- Use Capacitor for the near-term Android and iOS native export.
- Do not rewrite to React Native/Expo in this wave.
- Validate mobile web on a real phone before native wrapping.
- Treat Android debug APK as internal QA only.
- Include iOS project creation in the export lane; Android-only is incomplete.
- Keep background tracking as a future native bridge/plugin problem unless a
  later spec implements it.

## Domain References

- MapLibre Directions can inform future route/event preview work, but it is not
  required for the baseline native wrapper.
- OpenTracks informs Android foreground/background tracking behavior, especially
  future foreground service needs.
- OutRun informs iOS CoreLocation background behavior, but its GPL code must not
  be copied.
- Endurain informs future run/activity stream schema and privacy handling.
- Sublay, Bluesky and Pixelfed inform future social/feed/moderation behavior,
  not this native wrapper baseline.

## Open Research Items

- Confirm installed Android Studio, SDK and Gradle state before W5.
- Confirm Xcode availability before treating iOS as device-ready.
- Confirm whether WebView foreground geolocation is good enough for first QA.
- Confirm first physical Android and iOS test devices.
- Confirm final package id and bundle id before release-oriented work.
