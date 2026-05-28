# Runner Passport + Street Intro

Data: 2026-05-28

## Contexto

Revisao feita a partir dos prints do menu e da intro. A area central do menu ainda parecia um poster estatico do lider da crew, enquanto o painel lateral ja carregava a informacao da crew. A intro ainda comunicava mais terminal tecnico do que rua, mesmo com fundo urbano.

## Especialistas Consultados

- Pascal: recomendou transformar o centro do menu em um "Runner Passport Board", com runner salvo ou slot pendente.
- Godel: reforcou o uso de assets reais de crew no palco central, evitando carregar 3D pesado ou imagem puramente decorativa.
- Pasteur: indicou o escopo seguro: `MainMenu`, intro/launch e CSS, sem alterar storage, fluxo global ou schema do personagem.

## Direcao Visual

- O menu passa a tratar a area central como ficha individual do corredor.
- A crew continua visivel no painel lateral e nos assets de apoio, mas nao monopoliza o palco central.
- A intro passa a parecer radio de rua: cinco crews entrando no sinal, com falas competitivas, amistosas e curtas.
- Nada sugere GPS, ranking, rota publica ou corrida real. O foco continua sendo identidade, QG e sinal narrativo da cidade.

## Execucao

- `components/launch/MainMenu.tsx`
  - adiciona `savedCrew`, `runnerType`, estado de passaporte e data salva.
  - troca o bloco central de leader estatico por passaporte do runner.
  - mostra imagem salva do runner quando existe.
  - quando nao ha runner salvo, mostra slot pendente ligado a crew ativa.
  - inclui mini mentor da crew, membros e CTA contextual.

- `components/launch/ConsoleBoot.tsx`
  - remove as linhas genericas de terminal como experiencia principal.
  - adiciona chat curto entre lideres usando `CREWS`, badges, leaders, patterns e pings.
  - mantem botao de pular e conclusao automatica.

- `index.css`
  - cria layout de radio/street intro.
  - cria estilos de passaporte central responsivo.
  - ajusta media queries para desktop e mobile.

## Criterios De Aceite

- Menu mostra runner individual em destaque quando salvo.
- Sem runner salvo, o centro comunica `IDENTIDADE PENDENTE` ou `IDENTIDADE ABERTA`.
- Intro usa assets reais das crews antes do QG.
- Chat tem falas curtas entre lideres e pode ser pulado.
- Mobile preserva estado do runner e CTA sem overflow.
- Typecheck precisa passar antes da validacao visual.

## Validacao Atual

- `npm exec tsc -- --noEmit --pretty false`: passou.
- `npm run build -- --outDir /tmp/crew-running-passport-street-build --emptyOutDir`: passou.
- Screenshot intro desktop: `output/playwright/menu-hq/boot-street-chat-desktop-reviewed.png`.
- Screenshot menu runner salvo desktop: `output/playwright/menu-hq/desktop-runner-passport-salvo-production.png`.
- Screenshot menu runner pendente desktop: `output/playwright/menu-hq/desktop-runner-passport-pendente-reviewed.png`.
- Screenshot menu runner salvo mobile: `output/playwright/menu-hq/mobile-runner-passport-salvo-reviewed.png`.

Observacao: o `runnerTypeId` canonico atual no codigo e `crew-pace` (ver `data/runnerTypes.ts:4-6` e `CREATOR_CONTRACT.md`). Nota anterior tinha `crew-flow` invertido, corrigido em 2026-05-28 no closeout da Fase 1 da aba VOCE.
