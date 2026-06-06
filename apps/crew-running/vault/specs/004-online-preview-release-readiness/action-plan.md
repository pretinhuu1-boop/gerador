# Action Plan: Online preview and release readiness

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## Release stance

The app is not production-ready until validation, local preview QA and online
preview QA pass. The correct next public step is a Vercel preview, not direct
production.

## Gates

| Gate | Name | Required evidence | Pass condition |
| --- | --- | --- | --- |
| G0 | Filesystem and repo health | No blocked reads or stuck validation processes | Required app files can be read and no stale process remains |
| G1 | Local app validation | `npm run validate` output | Creator contract, typecheck, tests, build and smoke pass |
| G2 | Production build | `npm run build` output and `dist/` inventory | Build succeeds and expected assets exist |
| G3 | Local preview QA | Local preview URL and QA notes | Boot, routing, creator, map, Sede, Voce and PWA assets pass |
| G4 | Vercel preview | Preview URL, branch/commit and env scope | Preview deploy succeeds |
| G5 | Online QA | Desktop/mobile preview QA notes | Core player flow passes on preview URL |
| G6 | Production approval | Explicit user approval | Product owner says to promote |
| G7 | Production deploy | Production URL and deploy id | Production deploy succeeds |
| G8 | Rollback readiness | Previous deploy id or Vercel rollback path | Rollback is actionable before sharing |

## Work waves

### R0 - Baseline repair

- Confirm no blocked file reads remain.
- Confirm no `vitest`, `tsc`, Vite or deploy processes are still running.
- If `typecheck` or Vitest hangs, isolate the next blocked path or stale cache
  before any preview deploy.

### R1 - Validation

- Run `npm run check:creator-contract`.
- Run `npm run typecheck`.
- Run `npm run test`.
- Run `npm run build`.
- Run `npm run smoke:creator`.
- Prefer `npm run validate` once individual gates are healthy.

### R2 - Local production preview

- Serve `dist` through `npm run preview`.
- Validate desktop and mobile-size browser flows.
- Confirm refresh/deep-link works through SPA fallback.

### R3 - Vercel preflight

- Confirm Vercel auth and project link.
- Pull preview env without printing secret values.
- Validate env variable names and scopes.
- Run Vercel local build if available.

### R4 - Preview deploy

- Deploy to Vercel preview.
- Record URL, branch, commit and deploy id.
- Do not promote to production in this wave.

### R5 - Preview QA

- Test desktop and mobile browser.
- Test PWA manifest/icons/service worker behavior enough to catch white screen
  or missing asset regressions.
- Test map tiles, GPS permission path, creator, Sede and Voce.

### R6 - Production promotion

- Require explicit approval.
- Promote/deploy production.
- Record production URL, deploy id and release notes.

### R7 - Post-release monitoring and rollback

- Run smoke checks against production URL.
- Confirm rollback path.
- If critical flow fails, rollback immediately and record failure attribution.

## Stop conditions

- `npm run validate` fails or hangs.
- Production build fails.
- Preview URL has white screen, broken routing or missing critical assets.
- Creator contract fails.
- Secret/admin env appears in client-visible variables.
- Product owner has not approved production promotion.
