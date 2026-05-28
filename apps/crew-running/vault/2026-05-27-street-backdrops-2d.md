# 2026-05-27 - Street Backdrops 2D

## Decisao

Remover a dependencia visual do falso mapa 3D no fluxo de entrada. A direcao agora e uma cidade viva em 2D impresso: asfalto, mapa stencil, lambe-lambe, rota pintada, graffiti baixo contraste e pings como tinta/adesivo.

Runtime atualizado:

- `ConsoleBoot` usa `StreetBackdrop variant="boot"`.
- `CitySignalEntry` usa `StreetBackdrop variant="city"`.
- `MainMenu` usa `StreetBackdrop variant="hq"`.
- `RunnerSavedTeaser` usa `StreetBackdrop variant="saved"`.
- O chip de estado mudou de `SINAL 3D` para `MAPA 2D`.

## Tese Visual

O app nao deve parecer fitness SaaS nem radar cyber. Deve parecer um cartucho street-running ligando a cidade: mapa impresso sobre asfalto, posters rasgados, tinta de rota, patches de crew e textura de corrida urbana.

Regras:

- Background carrega mundo e material, nao UI.
- Texto, badges, botoes e tickets continuam vivos em React/CSS.
- Evitar texto embutido em imagens para nao brigar com labels reais.
- Manter a direita mais calma quando houver ticket/missao sobreposto.
- Sem render 3D, sem glossy, sem neon cyberpunk, sem scanner como linguagem principal.

## Concepts Gerados

1. Mapa stencil serigrafado  
   Asset: `public/backgrounds/city-signal-map-2d.jpg`  
   Uso: `CitySignalEntry`, `RunnerSavedTeaser`.  
   Papel: mapa de SP simbolico, rota em tinta, energia de crews no lado esquerdo, area direita mais escura para ticket.

2. Mural underpass noturno  
   Asset: `public/backgrounds/boot-underpass-2d.jpg`  
   Uso: `ConsoleBoot`.  
   Papel: atmosfera de ligamento da cidade, concreto/asfalto, graffiti e rota sem parecer painel tecnico.

3. HQ collage / mission material  
   Asset: `public/backgrounds/hq-collage-2d.jpg`  
   Uso: `MainMenu`.  
   Papel: lambe-lambe, ticket, asfalto, tape e scuffs como base do HQ.

4. Street grit texture  
   Asset: `public/backgrounds/street-grit-texture-2d.jpg`  
   Uso: overlay de material em `StreetBackdrop`.  
   Papel: grunge baixo contraste para unificar os backdrops.

Originais gerados continuam em:

- `/Users/belissima/.codex/generated_images/019e6c41-26ee-78d3-8f0f-2109925772ef/`

## Prompt Base Usado

```text
Dark 2D street-running mobile game background, Sao Paulo energy interpreted as flat screen-print art on wet asphalt, chalk dust, worn poster grain, subtle graffiti tags, route strokes and runner checkpoint pings. Matte black/deep charcoal, dirty cream map lines, restrained safety orange, spray cyan, deep red, rough ink, tactile asphalt. No readable words, no logos, no characters, no UI cards, no 3D render, no cyberpunk HUD, no glossy gradients.
```

## Pesquisa de Fontes

Fonte atual no app:

- `Bowlby One` para impacto de titulo.
- `Anton` para comandos e nomes de crew.
- `JetBrains Mono` para readouts.
- `Permanent Marker` para tags curtas.
- `Inter` para corpo.
- `Bungee` como acento raro.

Recomendacao: manter o sistema atual e testar fontes novas apenas em acentos, nao substituir tudo.

Candidatas para fase 2:

- `Rubik Spray Paint`: tags/stamps pontuais. `@fontsource/rubik-spray-paint` version `5.2.7`, license `OFL-1.1`.
- `Sedgwick Ave Display`: grafite legivel para micro marcas. `@fontsource/sedgwick-ave-display` version `5.2.8`, license `OFL-1.1`.
- `Bangers`: alternativa comic para chamadas curtas, nao body. `@fontsource/bangers` version `5.2.8`, license `OFL-1.1`.
- `Road Rage`: acento de corrida/rota, usar com cuidado.

Self-host sugerido:

```bash
npm install @fontsource/anton @fontsource/bowlby-one @fontsource/permanent-marker @fontsource/jetbrains-mono @fontsource/inter @fontsource/rubik-spray-paint @fontsource/sedgwick-ave-display
```

Motivo: reduzir dependencia de CDN no runtime e travar melhor o pacote tipografico.

## Pesquisa de Materiais

Fontes externas recomendadas para textura:

- ambientCG: materiais CC0, bom para asphalt, concrete, plaster, grunge, roughness maps. Fonte: https://ambientcg.com/license
- Poly Haven: assets CC0 e uso comercial sem atribuicao obrigatoria, bom para texturas/concreto/asfalto. Fonte: https://polyhaven.com/license
- Fontsource: pacotes npm para self-host de fontes open-source. Fonte: https://fontsource.org/docs/getting-started/introduction
- Google Fonts: fonte atual via CDN e catalogo de familias. Fonte: https://developers.google.com/fonts/faq

Uso recomendado: baixar textura base CC0, tratar para baixo contraste, converter para JPEG/WebP e nunca colocar texto legivel no material.

## Validacao

- `npm run build` passou em 2026-05-27.
- Assets servidos pelo Vite em `/backgrounds/*.jpg` retornam `200 OK`.
- Playwright CLI validou screenshots:
  - `apps/crew-running/.playwright-cli/page-2026-05-28T02-12-58-643Z.png` - boot com background 2D.
  - `apps/crew-running/.playwright-cli/page-2026-05-28T02-08-48-400Z.png` - city entry com `MAPA 2D`.
  - `apps/crew-running/.playwright-cli/page-2026-05-28T02-10-44-374Z.png` - title mobile ainda legivel.

## Proximos Passos

- Decidir se removemos os arquivos legados `Sp3DMapBackground.tsx` e `spLiveMap.ts` depois de uma passada de compatibilidade, pois ja nao estao no runtime do fluxo.
- Considerar self-host das fontes via Fontsource em uma onda separada.
- Gerar versoes WebP dos backdrops se o alvo de deploy exigir payload menor.
