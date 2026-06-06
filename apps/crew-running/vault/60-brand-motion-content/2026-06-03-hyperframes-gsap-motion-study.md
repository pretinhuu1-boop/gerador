# The Crew Running - HyperFrames + GSAP Motion Study

Data: 2026-06-03
Escopo: investigar HyperFrames e GSAP para melhorar o motion do teaser `EstamosChegando` sem quebrar o pipeline Remotion.

## Fontes consultadas

- HyperFrames: https://hyperframes.video/
- HyperFrames docs: https://hyperframes.video/docs/
- HyperFrames npm: https://www.npmjs.com/package/hyperframes
- GSAP docs: https://gsap.com/docs/v3/
- GSAP installation: https://gsap.com/docs/v3/Installation/
- GSAP eases: https://gsap.com/docs/v3/Eases/
- GSAP timelines: https://gsap.com/docs/v3/GSAP/Timeline/
- GSAP npm package: https://www.npmjs.com/package/gsap
- Remotion animation rules locais: `remotion/rules/animations.md` e `remotion/rules/timing.md`

## Leitura tecnica

HyperFrames e Remotion resolvem problemas parecidos por caminhos diferentes:

| Topico | HyperFrames | Remotion atual |
| --- | --- | --- |
| Renderer | HTML/video compositions via CLI | React video compositions |
| Motion | CSS/JS/GSAP sincronizado por frame | `useCurrentFrame()` + `interpolate()` |
| Boa utilidade aqui | Laboratorio separado para motion em HTML/GSAP | Corte principal e gate de QA |
| Risco | Segundo renderer, duplicacao de pipeline | Menos familiar para animadores GSAP |

Conclusao: HyperFrames vale como referencia e laboratorio, mas nao deve substituir o pacote Remotion agora. O teaser ja tem gates, assets, audio e stills no Remotion. Trocar o renderer nesta fase adiciona risco sem melhorar a narrativa imediatamente.

## Como usar GSAP com seguranca no Remotion

Nao usar:

- `gsap.to()` animando DOM direto;
- ticker real-time;
- CSS animation/transition;
- timelines que dependem de `requestAnimationFrame`.

Usar:

- `gsap.parseEase()` para eases consistentes;
- modelo mental de timeline/stagger;
- valores derivados de `frame`, `fps` e helpers deterministas.

Implementado no rough:

- `apps/crew-running-video/src/style/motion.ts`
  - adiciona `gsap.parseEase()` para curvas `power4.out`, `back.out`, `power2.inOut`, `power3.in` e `elastic.out`.
  - adiciona helper `timed(frame, start, duration)` para montar microtimelines.

- `apps/crew-running-video/src/style/tokens.ts`
  - carrega `Bowlby One` como display.
  - mantem `Anton` como `command`.
  - adiciona `Permanent Marker` como tag futura.

- `apps/crew-running-video/src/data/timeline.ts`
  - aplica a copy `Antes do pace`.

- `apps/crew-running-video/src/scenes/StoryboardScene.tsx`
  - adiciona entrada de texto por linha com stagger.
  - adiciona backing plate escuro para a copy virar objeto/sticker.
  - adiciona impact slabs curtos no inicio de cada cena.

## Melhorias esperadas

1. Copy deixa de parecer legenda e vira objeto de UI/game.
2. Entradas passam a ter ritmo de timeline, nao fade simples.
3. Bowlby aumenta peso de cartaz e reduz o tom fitness-clean do Anton como headline.
4. Stagger cria leitura mais intencional nos stills.
5. Impact slabs reforcam troca de cena sem precisar renderizar assets novos.

## Criterios de QA

Passar:

- `npm run typecheck`
- `npm run stills:qa`
- `git diff --check -- apps/crew-running-video apps/crew-running/vault`

Revisar visualmente:

- frame 045: `VEM O SINAL` legivel em 1s;
- frame 165: pergunta nao parece UI de quiz;
- frame 285: copy nao tampa rostos/corpos;
- frame 560: `IDENTIDADE SALVA` nao estoura largura;
- frame 830: final respira e nao parece poster de evento generico.

## Decisao sobre HyperFrames

Nao instalar HyperFrames no pacote principal agora.

Uso futuro recomendado: criar um laboratorio separado somente se quisermos testar motion em HTML/GSAP antes de portar para Remotion. Exemplo de pasta futura:

```text
apps/crew-running-motion-lab/
  hyperframes/
    typography-stagger.html
    city-signal-slab.html
    stamp-impact.html
```

Regra: nada do laboratorio vira deliverable final sem ser portado para o pipeline Remotion e validado por stills.

## Dependencia e licenca

`gsap` fica pinado em `3.15.0`, sem range, pelo mesmo motivo que Remotion esta pinado:
render de video precisa ser reprodutivel. O pacote usa apenas `gsap.parseEase()`; nao usa
plugins, ticker, DOM tween ou runtime timeline.

Gate de licenca:

- A documentacao oficial de instalacao da GSAP informa que o antigo NPM privado nao
  e mais mantido, que GSAP e plugins estao disponiveis no npm, e recomenda 3.13+.
- O pacote npm declara a licenca `Standard 'no charge' license`.
- Antes de publicar/distribuir um build comercial, revisar esse uso com a licenca
  atual da GSAP. Se houver qualquer duvida juridica, trocar as eases por curvas
  `Easing.bezier(...)` equivalentes e remover a dependencia.
