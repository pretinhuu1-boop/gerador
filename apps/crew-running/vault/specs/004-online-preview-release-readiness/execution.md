# Execution Runbook: Online preview and release readiness

Status: active
Spec: `./spec.md`
Updated: 2026-06-06

## Preconditions

- Work from `apps/crew-running`.
- Do not print `.env` values.
- Do not run production deploy without explicit approval.
- Keep `validation-log.md` open as the release ledger.

## R0 - Process and filesystem preflight

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
pgrep -fl "vite|vitest|vite-node|tsc --noEmit|vercel|node scripts/check-creator-contract" || true
npm run check:creator-contract
```

If file reads hang, diagnose before deploy:

```bash
node --input-type=module -e "import fs from 'node:fs'; import { syncBuiltinESMExports } from 'node:module'; const r=fs.readFileSync; fs.readFileSync=function(p,...a){ console.error('READ', p); return r.call(this,p,...a); }; syncBuiltinESMExports(); await import('./scripts/check-creator-contract.mjs');"
```

## R1 - Local validation

Preferred all-in-one:

```bash
npm run validate
```

If it hangs or fails, split:

```bash
npm run check:creator-contract
npm run typecheck
npm run test
npm run build
npm run smoke:creator
```

Stop before online preview unless the failure is understood and explicitly
accepted as non-blocking. Typecheck/test/build failures are production blockers.

## R2 - Local production build and preview

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open:

```text
http://127.0.0.1:4173
```

QA:

- cold boot;
- QG;
- `GUARDA ROUPA`;
- creator and `TESTAR LOCAL`;
- `SEDE`;
- `VOCÊ`;
- map and layer chips;
- refresh on nested/SPA route if applicable;
- mobile viewport.

## R3 - Vercel preflight

Check auth/project without exposing secrets:

```bash
npx vercel whoami
npx vercel project ls
npx vercel link
npx vercel env ls
```

If the project is not linked, choose/create the intended Vercel project before
deploy. Do not infer the team if multiple teams are available.

Optional local Vercel build:

```bash
npx vercel pull --environment=preview
npx vercel build
```

## R4 - Preview deploy

```bash
npx vercel deploy
```

Record:

- preview URL;
- deploy id;
- branch/commit;
- Vercel project/team;
- environment scope;
- command output summary.

## R5 - Preview QA

Against the preview URL:

- desktop Chrome/Safari if available;
- mobile viewport or physical phone;
- cold boot and no white screen;
- QG buttons;
- creator and `TESTAR LOCAL`;
- map tiles and GPS permission path;
- Sede and Voce;
- PWA manifest/icons basic fetch;
- hard refresh.

Stop if any core flow fails.

## R6 - Production promotion

Only after explicit approval:

```bash
npx vercel deploy --prod
```

Record:

- production URL;
- deploy id;
- approval note;
- previous production deploy id if known.

## R7 - Post-production smoke

Run the same preview QA smoke on production. If a critical issue appears:

1. stop sharing the URL;
2. rollback/promote the previous Vercel deployment through CLI or dashboard;
3. record failure attribution in `validation-log.md`;
4. open a follow-up spec for the fix.

## Rollback paths

Preferred:

- Vercel dashboard: Project -> Deployments -> previous green deployment ->
  Promote to Production.

CLI fallback:

```bash
npx vercel rollback
```

If CLI rollback is unavailable or ambiguous, use the dashboard and record the
deployment id restored.
