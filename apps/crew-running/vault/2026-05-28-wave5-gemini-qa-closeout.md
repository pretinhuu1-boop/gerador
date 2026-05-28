# The Crew Running - Wave 5 / Gemini QA Closeout

Data: 2026-05-28
Branch: `codex/crew-boot-intro-onboarding`
Escopo: fechamento de runner salvo, assets de runtime e QA real de criacao do personagem.

## Status

Wave 5 esta implementada e validada:

- Runner Creator gera uma sheet 2x2 via Gemini.
- `EQUIPAR` salva um PNG limpo do look escolhido.
- `crewRunnerCustomized=true` e `crew.saved_character` sao persistidos.
- O fluxo termina em `RUNNER READY / CIDADE PRONTA`.
- O QG de retorno mostra o passaporte do runner salvo.

## Mudancas documentadas

- O tipo coletivo esta travado como `Crew Flow` com id `crew-flow`.
- `public/backgrounds/*.jpg` e `public/ui/button-atlas-v1*.png` foram tratados como assets de runtime e staged para commit.
- `apps/crew-running/output/` ficou ignorado para screenshots e inputs temporarios de QA.
- `public/README.md`, `README.md`, `DESIGN.md`, `GAME_UI_TEMPLATE.md`, `BUTTON_ASSET_MAP.md` e `IMPLEMENTATION_ORCHESTRATION_PLAN.md` foram atualizados para refletir o estado atual.

## QA Real Gemini

Input temporario:

- Wikimedia Commons: `The Runner (Unsplash).jpg`
- Licenca na pagina: CC0/public domain
- Uso: somente QA local temporario; arquivo removido depois.

Resultado:

- Upload de imagem no Runner Creator: passou.
- Nome `Lia Teste`, altura `168`, peso `62`, personalidade preenchida: passou.
- `CRIAR RUNNER`: Gemini retornou sheet.
- Zonas `Equipar look`: 4.
- Save do primeiro look: passou.
- `crew.saved_character`:
  - `imageDataUrl`: `data:image/png...`
  - `backgroundRemoved`: `true`
  - `profile.name`: `Lia Teste`
  - `runnerTypeId`: `sprint`
- Teaser: `CIDADE PRONTA` e `RUNNER READY` visiveis.

## Reduced Motion

Mobile 390x844 com `prefers-reduced-motion: reduce`:

- `activeAnimations`: 0.
- Sem overflow horizontal.
- Runner salvo visivel no QG.
- Nenhum termo proibido na superficie runtime.

## Validacoes

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
npm run check:creator-contract
npx tsc --noEmit
npm run build
```

Resultados: todos passaram no fechamento original. Revalidar com `check:creator-contract` em qualquer mudanca do creator.

Scan de superficie runtime:

- sem `API KEY`
- sem `GERAR`
- sem `RANDOM`
- sem `PREVIEW`
- sem `MVP`
- sem `MAPA 2D`
- sem `GPS`
- sem `START RUN`
- sem `TRACKING`
- sem `LEADERBOARD`
- sem linguagem de ritmo pressionado
- sem `POST-RUN`

## Gaps Restantes

- Fazer review final do worktree antes do commit, porque ha muitos arquivos modificados/untracked da wave completa.
- Wave 6 deve ser uma passada final de review/QA, nao uma nova wave de feature.

## Itens Resolvidos Apos Closeout

- `CODEX_PROMPT.md` e `PROMPTS.md` foram mantidos como historico e receberam aviso de legado no topo.
