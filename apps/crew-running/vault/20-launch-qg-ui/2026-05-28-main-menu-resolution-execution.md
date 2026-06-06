# The Crew Running - Execucao Do Menu HQ

Data: 2026-05-28
Base: `vault/2026-05-28-main-menu-resolution-plan.md`
Status: executado e validado.

## Escopo executado

Arquivos alterados:

- `components/launch/MainMenu.tsx`
- `index.css`

Arquivos de evidencia criados:

- `output/playwright/menu-hq/desktop-runner-pendente.png`
- `output/playwright/menu-hq/desktop-guia-feito.png`
- `output/playwright/menu-hq/mobile-runner-pendente.png`

Nao alterado nesta onda:

- `CrewLaunchExperience.tsx`
- `launchStorage.ts`
- assets em `public/**`
- runner creator
- fluxo `City Signal -> MainMenu`

## Mudancas aplicadas

### MainMenu

- O menu agora se comporta como **QG Gate**:
  - antes do guia: CTA `COMEÇAR`;
  - guia feito sem runner: CTA `MONTAR RUNNER`;
  - runner salvo: CTA `AJUSTAR RUNNER`.
- Home deixou de duplicar o CTA primario dentro do ticket.
- Home agora mostra status de `SINAL`, `GUIA` e `RUNNER`.
- `CREWS PILOTO` usa `ABRIR GUIA`, `MONTAR RUNNER` ou `AJUSTAR RUNNER`, sem copy tecnica.
- `RUNNER` separa os estados `Runner pendente`, `Montar runner` e `Runner salvo`.
- `CONFIG` removeu linguagem de pressao/termo tecnico e manteve ritmo seguro.
- Variaveis de tema da crew ativa foram aplicadas na raiz do menu para cursor/nav/poster.

### CSS

- Leader reforcado como poster/patch do QG.
- Texto longo do ticket passou para fonte de leitura (`Inter`) em vez de brush.
- Status strip recebeu largura fixa de label para leitura mais rapida.
- Cursor ativo do menu passou a usar a cor da crew ativa.
- Botoes secundarios da home foram ajustados para nao cortar texto no desktop.
- Mobile manteve CTA acima do ticket e sem overflow horizontal observado.

## Guardrails verificados

Busca executada:

```bash
rg -n "COMEÇAR SETUP|creator|setup|streak|START RUN|GPS|ranking|rota publica|rota pública|PNG LIMPO|RUNNER READY|MVP|API KEY|GERAR|PREVIEW" apps/crew-running/components/launch/MainMenu.tsx
```

Resultado: sem ocorrencias.

## Validacao tecnica

```bash
cd "/Users/belissima/Desktop/running crew/apps/crew-running"
./node_modules/.bin/tsc --noEmit --pretty false
```

Resultado: passou.

```bash
npm run build -- --outDir /tmp/crew-running-menu-build --emptyOutDir
```

Resultado: passou.

Build gerado em `/tmp/crew-running-menu-build`, sem tocar `dist/`.

## Validacao visual

Servidor usado:

- `http://127.0.0.1:3100/`
- processo existente na porta 3100 preservado.

Estados capturados:

- runner pendente desktop: `output/playwright/menu-hq/desktop-runner-pendente.png`
- guia feito desktop: `output/playwright/menu-hq/desktop-guia-feito.png`
- runner pendente mobile 390x844: `output/playwright/menu-hq/mobile-runner-pendente.png`
- runner salvo aba runner desktop: `output/playwright/menu-hq/desktop-runner-salvo-tab.png`

Revisao visual posterior do print:

- runner pendente desktop revisado: `output/playwright/menu-hq/desktop-runner-pendente-reviewed.png`
- runner salvo aba runner desktop revisado: `output/playwright/menu-hq/desktop-runner-salvo-tab-reviewed.png`
- runner pendente mobile revisado: `output/playwright/menu-hq/mobile-runner-pendente-reviewed.png`

Gaps corrigidos nessa revisao:

- Ticket estava deixando texto embutido do asset competir com live text.
- Leader estava invadindo o painel e parecia recorte acidental, nao poster.
- Home pendente tinha botao secundario redundante para runner antes do runner existir.
- Estado `runnerCustomized=true` sem personagem salvo podia exibir `Runner salvo`; agora `runnerSaved` depende de personagem salvo real.

Console browser:

- Errors: 0
- Warnings: 0

## Observacoes

- O fluxo atual continua `City Signal -> MainMenu`.
- A divergencia com os docs antigos ainda deve ser tratada em uma onda futura se decidirmos aderir estritamente a `City Signal -> GuidedOnboarding`.
- A proxima prioridade tecnica e performance de assets: logo, leaders e membros ainda sao pesados para mobile.
