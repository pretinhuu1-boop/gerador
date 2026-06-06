# Running Crew Workspace

Primary product lane: `apps/crew-running`.

This repository still contains legacy root-level Vite files, but the current
The Crew Running app lives under `apps/crew-running`. Do not use the root README
as product truth for mobile, game, site, desktop or admin planning.

## Agent orientation

Read these before product work:

- `AGENTS.md`
- `CLAUDE.md` when working in Claude-led sessions
- `apps/crew-running/vault/CURRENT_PRODUCT_CONTEXT.md`
- `apps/crew-running/vault/README.md`
- `apps/crew-running/vault/CREATOR_CONTRACT.md` before creator/generation work

Current split:

- `apps/crew-running`: player-facing mobile/game app and future
  PWA/Capacitor Android+iOS source.
- Public site: separate marketing/community surface.
- Desktop user/network: separate runner/community surface for non-running use.
- Operational admin: separate internal surface, recommended as `apps/crew-admin`
  when implemented.

## Run the active app

```bash
cd apps/crew-running
npm install
npm run dev
```

Validation for code or creator-sensitive changes:

```bash
cd apps/crew-running
npm run validate
```
