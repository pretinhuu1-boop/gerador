# Plano de acao, orquestracao e execucao - Remotion v9 visual polish

Data: 2026-06-03
Escopo principal: `apps/crew-running-video`
Base validada: `out/estamos-chegando-review-v8.mp4`
Output alvo: `out/estamos-chegando-review-v9.mp4`

## Objetivo

Polir as areas novas da v8 para que parecam parte fisica do filme e do app, nao camadas coladas por cima.

Problemas a resolver:

- o logo inicial ainda denuncia o quadrado sem alpha;
- os pings de crew ainda parecem menu horizontal / sticker limpo;
- a cascata visual chega atrasada em relacao ao beat do audio;
- a copy de `signalOpen` entra tarde demais;
- o `StampPress` deixa ghost visual tarde no carimbo;
- as novas camadas ficam limpas demais porque escapam do grit global.

## Decisao de direcao

Nao vamos resolver a falta de polimento adicionando mais elementos. A v9 deve fazer menos coisas, mas com mais acabamento:

1. logo como poster serigrafado / placa colada na rua;
2. pings como sinais urbanos ancorados no mapa/celular;
3. motion travado em grade de 120 BPM;
4. copy entrando como payoff durante o evento, nao depois;
5. carimbo com impacto rapido e sem ghost parado;
6. textura global aplicada tambem nas camadas novas.

## Orquestracao por agentes

### Agente 1 - Art direction / hierarchy

Responsavel por revisar:

- `src/scenes/OpeningLogo.tsx`
- `src/scenes/CrewPingCascade.tsx`
- stills `015`, `060`, `105`, `120`, `150`, `180`, `225`

Checklist:

- logo nao pode parecer PNG quadrado;
- cascata nao pode parecer carrossel de UI;
- East Burners deve ter foco sem apagar as outras crews;
- a area creme do celular em `signalOpen` deve parecer intencional;
- nao limpar a estetica gritty.

Entrega esperada:

- aprovar ou reprovar stills por frame;
- apontar qualquer leitura de asset colado;
- validar se a cena continua madura, urbana e esportiva.

### Agente 2 - Motion / timing

Responsavel por revisar:

- `src/scenes/OpeningLogo.tsx`
- `src/scenes/CrewPingCascade.tsx`
- `src/scenes/TransitionOverlay.tsx`
- `src/data/beatMap.ts`
- `src/scenes/AudioTracks.tsx`

Checklist:

- hits visuais em grade de 15 frames, coerente com 120 BPM;
- `CrewPingCascade` comecando no frame `120`, junto do lock-on;
- primeiro ping legivel ate `126`;
- `SO CHEGA` batendo entre frames `146` e `160`;
- `StampPress` sem ghost parado no frame `690`.

Entrega esperada:

- aprovar handoff `105 -> 120 -> 132`;
- aprovar pings `150`, `165`, `180`;
- aprovar carimbo `675`, `687`, `690`, `705`.

### Agente 3 - Asset compositing / UI game polish

Responsavel por revisar:

- `public/brand/logo.png`
- `public/intro/crew-pings/*.png`
- `src/scenes/OpeningLogo.tsx`
- `src/scenes/CrewPingCascade.tsx`

Checklist:

- assets sem alpha devem receber mask, vinheta e textura;
- pings nao podem ficar com ring limpa de sticker;
- sombras devem parecer contato/pressao, nao drop shadow SaaS;
- badges devem respeitar a perspectiva do celular/mapa;
- `west-flow.png` pode aparecer como nome de crew, mas nao deve virar mensagem principal.

Entrega esperada:

- aprovar tratamento dos PNGs sem alpha;
- apontar se algum badge ainda parece botao flutuante;
- validar densidade e legibilidade.

## Ondas de execucao

### W0 - Baseline e seguranca

Objetivo: congelar a v8 como referencia e garantir que o trabalho v9 nao mexa em escopo errado.

Arquivos permitidos:

```text
apps/crew-running-video/src/scenes/OpeningLogo.tsx
apps/crew-running-video/src/scenes/CrewPingCascade.tsx
apps/crew-running-video/src/scenes/StoryboardScene.tsx
apps/crew-running-video/src/scenes/TransitionOverlay.tsx
apps/crew-running-video/src/compositions/EstamosChegando.tsx
apps/crew-running/vault/2026-06-03-remotion-v9-visual-polish-action-orchestration-plan.md
```

Nao tocar:

```text
apps/crew-running/src/**
apps/crew-running/public/styles/**
apps/crew-running/data/styles.ts
runner creator
Gemini/API
StylePicker
slot hair
```

Comandos:

```bash
cd "apps/crew-running-video"
npm run typecheck
ls -lh out/estamos-chegando-review-v8.mp4
```

Aceite:

- v8 continua existindo;
- TypeScript passa antes de mexer;
- nenhum arquivo do creator entra no escopo.

### W1 - Logo fisico, nao PNG colado

Objetivo: transformar o `brand/logo.png` em um poster/print integrado.

Arquivo:

```text
apps/crew-running-video/src/scenes/OpeningLogo.tsx
```

Patch:

- manter a marca grande, mas mascarar o quadrado;
- adicionar `clipPath` irregular no wrapper;
- mover `boxShadow` para o wrapper, nao para o `Img`;
- adicionar `overflow: hidden`;
- adicionar `textures/board.png` sobre o logo com `mixBlendMode: screen`;
- adicionar edge-burn com `linear-gradient`/`radial-gradient` em `multiply`;
- reduzir bordas retas percebidas nos frames `015`, `060`, `105`;
- ajustar pulso para grade de 15 frames:

```text
hits: [15, 30, 45, 60, 75, 90, 105]
width: 4
scale pulse: +0.035
rotate pulse: -0.4
exit: [108, 120]
```

Aceite visual:

- frame `015`: logo entra como material impresso, nao card quadrado;
- frame `060`: borda do asset nao pode gritar;
- frame `105`: saida prepara o lock-on sem hold morto.

### W2 - Handoff no beat e lock-on no frame 120

Objetivo: casar imagem e som no primeiro evento de cidade.

Arquivo:

```text
apps/crew-running-video/src/scenes/CrewPingCascade.tsx
```

Patch:

- `start = 120`;
- `end = 210`;
- `fadeIn` de `0..6`;
- `fadeOut` de `[68, 90]`;
- primeiro ping visivel ate `126`;
- pings a cada `8` frames, nao `11`;
- `selectedPulse` em `[30, 45, 60, 75]`;
- pings devem vibrar no beat, nao em ritmo arbitrario.

Aceite visual:

- frame `120`: evento ja comeca;
- frame `126`: primeiro ping legivel;
- frame `132`: cena ja tem direcao;
- frame `150`: East Burners comecando a dominar;
- frame `180`: cascata ainda viva, mas sem virar menu.

### W3 - Pings como sinais no mapa, nao carrossel

Objetivo: quebrar a linha horizontal regular e integrar os badges ao celular.

Arquivo:

```text
apps/crew-running-video/src/scenes/CrewPingCascade.tsx
```

Patch:

- substituir `64 + index * 172` por posicoes manuais;
- variar `top`, `scale`, `rotate`, `opacity` por item;
- reduzir sizes:

```text
selected: 168
default: 136-144
```

- reduzir rings:

```text
selected: 8
default: 5
```

- adicionar textura dentro do circulo:

```text
textures/board.png
mixBlendMode: screen
opacity: 0.12-0.20
```

- adicionar vinheta interna:

```text
radial-gradient(circle, transparent 42%, rgba(0,0,0,0.62) 100%)
mixBlendMode: multiply
```

- trocar drop shadow limpa por sombra de contato irregular;
- strokes decorativos devem apontar para o ping selecionado ou sumir.

Aceite visual:

- frame `150`: nao pode parecer inventory rail;
- frame `168`: badges integrados ao mapa;
- frame `186`: leitura de lock-on, nao sticker sheet.

### W4 - Copy como payoff durante o evento

Objetivo: a copy nao pode aparecer depois que a cascata ja perdeu energia.

Arquivo:

```text
apps/crew-running-video/src/scenes/StoryboardScene.tsx
```

Patch:

- nao manter `signalOpen` preso a `copyDelay = 64`;
- nova janela sugerida:

```text
kicker SEM PRESSAO: frame absoluto 126-136
headline SO CHEGA: frame absoluto 146-160
```

Implementacao possivel:

- trocar `copyDelay` de `64` para `18` ou `22`;
- se necessario, criar delay diferente para kicker/headline depois;
- manter `coldBoot` sem copy para preservar o logo.

Aceite visual:

- frame `150`: copy e pings conversam;
- frame `180`: nao ha excesso de elementos;
- frame `225`: payoff claro e integrado ao painel do celular.

### W5 - StampPress sem ghost

Objetivo: o carimbo bate, aparece e sai. Nada de quadrado/ring parado no frame `690`.

Arquivo:

```text
apps/crew-running-video/src/scenes/TransitionOverlay.tsx
```

Patch:

- reduzir `stampPress.after` de `16` para `12`;
- opcionalmente reduzir `paperTear.after` para `12`;
- trocar fade do `press` de `[8, 24]` para `[8, 20]`;
- manter impacto, remover rastro.

Aceite visual:

- frame `675`: impacto presente;
- frame `687`: rastro quase fora;
- frame `690`: sem ghost parado;
- frame `705`: selo limpo e legivel.

### W6 - Stills v9 e revisao por gates

Objetivo: validar o polish antes do render completo.

Comandos:

```bash
cd "apps/crew-running-video"
rm -rf out/stills-v9-polish
mkdir -p out/stills-v9-polish
for f in 015 030 060 090 105 120 126 132 150 165 180 195 210 225 240 252 390 403 675 687 690 705 780 790 830; do
  npx remotion still src/index.ts EstamosChegando out/stills-v9-polish/$f.png --frame=$((10#$f)) --scale=0.35
done
```

Gate 1 - abertura:

```text
015, 030, 060, 090, 105
```

Passa se:

- logo nao parece quadrado;
- textura esta integrada;
- pulso esta visivel no beat.

Gate 2 - pings:

```text
120, 126, 132, 150, 165, 180, 195, 210
```

Passa se:

- evento visual comeca no hit;
- pings nao parecem carrossel;
- East Burners tem foco claro;
- assets parecem impressos/sujos.

Gate 3 - copy:

```text
150, 180, 225
```

Passa se:

- `SO CHEGA` nao entra tarde;
- copy nao briga com badges;
- payoff fica legivel.

Gate 4 - carimbo:

```text
675, 687, 690, 705
```

Passa se:

- impacto nao deixa ghost parado;
- selo segue limpo.

### W7 - Render v9

Objetivo: renderizar apenas depois dos stills aprovados.

Comandos:

```bash
cd "apps/crew-running-video"
npm run sync-assets
npm run typecheck
npx remotion render src/index.ts EstamosChegando out/estamos-chegando-review-v9.mp4 --codec=h264 --pixel-format=yuv420p
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 out/estamos-chegando-review-v9.mp4
ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate -of compact=p=0:nk=1 out/estamos-chegando-review-v9.mp4
ffmpeg -hide_banner -i out/estamos-chegando-review-v9.mp4 -map 0:a:0 -af volumedetect -f null - 2>&1 | rg "mean_volume|max_volume"
```

Aceite tecnico:

- duracao perto de `30.058667`;
- video `h264`;
- resolucao `1080x1920`;
- `30fps`;
- audio `aac`;
- `max_volume` abaixo de `0 dB`, idealmente perto de `-5.6 dB`;
- v8 preservada.

### W8 - Fechamento e doc

Objetivo: registrar o que foi realmente feito, nao apenas planejado.

Atualizar este arquivo com:

- arquivos editados;
- stills gerados;
- criterios aprovados/reprovados;
- output final;
- resultados de `ffprobe` e `volumedetect`;
- observacoes de risco.

Tambem gerar resumo curto para o usuario:

```text
Entregue v9 em:
apps/crew-running-video/out/estamos-chegando-review-v9.mp4

Principais mudancas:
- logo virou poster/print integrado;
- pings ancorados no mapa e no beat;
- copy entrou no timing certo;
- stamp ghost corrigido.
```

## Ordem de execucao recomendada

1. W0 baseline;
2. W1 logo fisico;
3. W2 timing lock-on;
4. W3 compositing dos pings;
5. W4 copy payoff;
6. W5 stamp ghost;
7. W6 stills/gates;
8. ajustes finos se algum gate reprovar;
9. W7 render;
10. W8 fechamento.

## Prompts para agentes na execucao

### Prompt - agente de art direction

```text
Revise os stills v9 em out/stills-v9-polish. Foque em abertura, pings e copy.
Responda com PASS/FAIL por gate: abertura, pings, copy, carimbo.
Nao edite arquivos. Aponte frames especificos e correcao minima.
```

### Prompt - agente de motion

```text
Revise o timing dos frames 105, 120, 126, 132, 150, 165, 180, 687, 690 e 705.
Confirme se o lock-on comeca no beat, se os pings vibram na grade de 15 frames e se o stamp ghost saiu.
Nao edite arquivos. Aponte parametros exatos se reprovar.
```

### Prompt - agente de compositing

```text
Revise se brand/logo.png e intro/crew-pings/*.png ainda parecem assets sem alpha colados.
Foque em borda, textura, vinheta, sombra e integracao com o mapa.
Nao edite arquivos. Aponte o menor patch se reprovar.
```

## Regra de parada

Nao renderizar `out/estamos-chegando-review-v9.mp4` se qualquer gate visual reprovar nos stills.

Se apenas um gate reprovar, corrigir somente o arquivo daquele gate e gerar os stills daquele gate novamente.

## Nao escopo

- Nao mexer no runner creator.
- Nao mexer em Gemini/API.
- Nao usar `public/styles/*` como input.
- Nao restaurar `StylePicker`.
- Nao restaurar slot `hair`.
- Nao trocar a direcao para neon/glossy/futurista.
- Nao adicionar novos assets antes de esgotar compositing dos assets atuais.

## Fechamento executado - v9 review

Status: entregue e validado em 2026-06-03.

Output entregue:

```text
apps/crew-running-video/out/estamos-chegando-review-v9.mp4
```

Arquivos editados:

```text
apps/crew-running-video/src/scenes/OpeningLogo.tsx
apps/crew-running-video/src/scenes/CrewPingCascade.tsx
apps/crew-running-video/src/scenes/StoryboardScene.tsx
apps/crew-running-video/src/scenes/TransitionOverlay.tsx
apps/crew-running/vault/2026-06-03-remotion-v9-visual-polish-action-orchestration-plan.md
```

Stills de QA gerados:

```text
apps/crew-running-video/out/stills-v9-polish/015.png
apps/crew-running-video/out/stills-v9-polish/030.png
apps/crew-running-video/out/stills-v9-polish/060.png
apps/crew-running-video/out/stills-v9-polish/090.png
apps/crew-running-video/out/stills-v9-polish/105.png
apps/crew-running-video/out/stills-v9-polish/120.png
apps/crew-running-video/out/stills-v9-polish/126.png
apps/crew-running-video/out/stills-v9-polish/132.png
apps/crew-running-video/out/stills-v9-polish/150.png
apps/crew-running-video/out/stills-v9-polish/165.png
apps/crew-running-video/out/stills-v9-polish/180.png
apps/crew-running-video/out/stills-v9-polish/195.png
apps/crew-running-video/out/stills-v9-polish/210.png
apps/crew-running-video/out/stills-v9-polish/225.png
apps/crew-running-video/out/stills-v9-polish/240.png
apps/crew-running-video/out/stills-v9-polish/252.png
apps/crew-running-video/out/stills-v9-polish/390.png
apps/crew-running-video/out/stills-v9-polish/403.png
apps/crew-running-video/out/stills-v9-polish/675.png
apps/crew-running-video/out/stills-v9-polish/687.png
apps/crew-running-video/out/stills-v9-polish/690.png
apps/crew-running-video/out/stills-v9-polish/705.png
apps/crew-running-video/out/stills-v9-polish/780.png
apps/crew-running-video/out/stills-v9-polish/790.png
apps/crew-running-video/out/stills-v9-polish/830.png
```

Gates revisados:

```text
abertura: corrigida com blend/screen, mask radial e clip mais agressivo
pings: corrigidos com layout menos horizontal, opacidade menor nos secundarios e East Burners dominante
copy: corrigida com delay menor, headline menor e textura mais presente
carimbo: corrigido com TerritorySeal curto e StampPress reduzido
```

Rodada dos agentes:

```text
art direction: PASS abertura/carimbo, FAIL pings/copy antes do patch final
asset compositing: FAIL abertura antes do patch final, PASS pings
motion timing: PASS handoff/pings/carimbo, FAIL copy em 150 antes do patch final
```

Correcoes apos agentes:

```text
OpeningLogo: mixBlendMode screen no logo, mask radial, clip irregular mais forte
CrewPingCascade: pings secundarios menores/fantasmados e mais espalhados no mapa
StoryboardScene: signalOpen copyDelay 12, ticketPunch headlineSize 78 e textura mais alta
StoryboardScene: TerritorySeal encurtado para sair antes do frame 690
```

Validacoes executadas:

```bash
npm run typecheck
npm run sync-assets
npx remotion render src/index.ts EstamosChegando out/estamos-chegando-review-v9.mp4 --codec=h264 --pixel-format=yuv420p
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 out/estamos-chegando-review-v9.mp4
ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate -of compact=p=0:nk=1 out/estamos-chegando-review-v9.mp4
ffmpeg -hide_banner -i out/estamos-chegando-review-v9.mp4 -map 0:a:0 -af volumedetect -f null - 2>&1 | rg "mean_volume|max_volume"
rg -n "[ \t]+$" src scripts ../crew-running/vault/2026-06-03-remotion-v9-visual-polish-action-orchestration-plan.md
```

Resultados tecnicos:

```text
sync-assets: 35 assets sincronizados
typecheck: passou
stills: 25 arquivos em out/stills-v9-polish
duracao: 30.058667s
tamanho: 53661539 bytes
video: h264, 1080x1920, 30fps
audio: aac
mean_volume: -25.3 dB
max_volume: -5.6 dB
trailing whitespace: sem ocorrencias
```
