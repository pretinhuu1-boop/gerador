# Validation Log: Vault sector reorganization

Status: accepted
Spec: `./spec.md`
Updated: 2026-06-06

## Results

| Check | Command or evidence | Result | Notes |
| --- | --- | --- | --- |
| Root inventory | `find apps/crew-running/vault -maxdepth 1 -type f \| sort` | Pass | Root contains only `README.md`, `CURRENT_PRODUCT_CONTEXT.md`, `CREATOR_CONTRACT.md`, and retained `2026-05-28-wave6-final-qa-closeout.md`. |
| Sector directories | `find apps/crew-running/vault -maxdepth 2 -type d \| sort` | Pass | Sector dirs exist for creator, launch/QG/UI, map/GPS/events/game, Sede/Voce, mobile/desktop/admin, brand/motion/content, research/integrations, QA assets, sound, and specs. |
| Representative paths | `test -f` retained root docs and representative moved docs/assets | Pass | Checked creator contract, retained wave6 closeout, creator design system, map audit, mobile plan, open-source study, and mobile QA PNG. |
| Stale top-level references | `grep -REn --include='*.md'` for old top-level moved paths | Pass | No matches after canonical path updates. |
| Trailing whitespace | `grep -REn --include='*.md' '[[:blank:]]$'` over changed guidance/vault docs | Pass | Existing trailing spaces in two moved historical docs were cleaned. |
| Initial app-code scope | `find apps/crew-running/components apps/crew-running/services apps/crew-running/data -type f -newer apps/crew-running/vault/specs/002-vault-sector-reorganization/spec.md -print` | Pass | Before executable validation repair, no source files had been touched. `apps/crew-running/src` does not exist in this app. |
| Creator path retention | `test -f apps/crew-running/vault/CREATOR_CONTRACT.md && test -f apps/crew-running/vault/2026-05-28-wave6-final-qa-closeout.md && test -f apps/crew-running/scripts/check-creator-contract.mjs` | Pass | Preserved script-sensitive root paths. |
| Blocked read diagnosis | Instrumented `fs.readFileSync` around `scripts/check-creator-contract.mjs` | Pass | Identified blocked reads in `components/sede/SedeFooter.tsx`, `services/qrcode.ts`, and `services/storageBase.ts`. |
| Source-file repair | Recreated the three blocked small files with their existing contracts | Pass | `SedeFooter` preserves `VOLTAR` / `TROCAR CREW`; `qrcode` remains a `qrcode` data URL wrapper; `storageBase` exports safe `canUseStorage`. |
| Creator executable check | `npm run check:creator-contract` | Pass | Output: `Creator contract check passed.` |
| Focused test runner | `npx vitest run components/sede/__tests__/SedeShell.test.tsx --reporter=verbose` with 20s wrapper | Inconclusive | Vitest produced no output and was killed by the wrapper. No worker process remained. |
| Typecheck runner | `npm run typecheck` | Inconclusive | `tsc --noEmit` produced no output in the session and was killed. No process remained. |

## Failures

- Initial `npm run check:creator-contract` attempts hung because three source
  files blocked on read at the filesystem level. After recreating those files,
  `npm run check:creator-contract` passed.
- Vitest and typecheck still hung without output under this terminal session.
  They were killed and no child processes remained.
