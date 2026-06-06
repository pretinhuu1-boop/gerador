# Plano de orquestracao e execucao - Remotion review v8

Data: 2026-06-03
Escopo principal: `apps/crew-running-video`
Composicao: `EstamosChegando`
Output alvo: `apps/crew-running-video/out/estamos-chegando-review-v8.mp4`

## Objetivo da onda

Transformar a v7 em um corte com abertura de marca mais forte e uso mais inteligente dos assets de crew:

- logo `THE CREW RUNNING` grande nos primeiros 3.5s;
- assets de `intro/crew-pings` entrando um por vez entre 4.2s e 6.2s;
- pings vibrando no beat com slide lateral e cor da crew;
- remover/reduzir overlays do tenis laranja onde parecem colados por cima;
- manter tipografia cinetica, tinta, carimbo real e sound design da v7;
- limpar o final para o lockup nao disputar com portraits e overlays.

## Diagnostico da v7

O v7 resolveu pontos importantes:

- carimbo real aparece na cena de rota;
- tipografia deixou de ser estatica;
- frase `NINGUEM / FICA PRA TRAS` ficou mais humana;
- trilha e pulso ja estao corretos.

Mas ainda tem problemas visuais:

- `territory_pattern.png` e `brand/logo.png` como overlays geram um tenis laranja fantasma em algumas cenas;
- esse tenis funciona quando estamos falando de territorio/mapa, mas atrapalha em abertura e corrida;
- o comeco ainda entra direto como poster/copy, quando deveria abrir com marca;
- os assets de crew do boot do app ainda nao foram explorados no video;
- o final tem camadas de portrait/ping suficientes para criar mundo, mas pode competir com `THE CREW RUNNING`.

## Decisoes criativas

1. Abertura vira marca, nao chamada.
   - De 0s a 3.5s, a tela deve vender `THE CREW RUNNING`.
   - Copy de run club entra depois, nao no primeiro frame.

2. Pings de crew viram sistema de cidade.
   - Usar `public/intro/crew-pings/*.png`, um por vez.
   - Movimento: slide da esquerda para direita, vibracao curta no beat, splash nas cores de cada crew.
   - Nao usar como icone parado; eles devem parecer sinal urbano entrando no radar.

3. O tenis laranja deixa de ser textura geral.
   - `territory_pattern.png` fica restrito a cenas de mapa/territorio/carimbo.
   - Nao usar esse pattern em `coldBoot`, `signalOpen` ou `streetMovement`.
   - Se precisar de textura nessas cenas, usar `textures/board.png`, strokes e tinta procedural.

4. Final mais limpo.
   - Reduzir ou remover portraits pequenos no final.
   - Manter pings leves e textura, mas prioridade absoluta para o lockup.
   - O final precisa parecer assinatura, nao mural de assets.

## Mapa de timing v8

| Tempo | Frame | Tratamento | Observacao |
| --- | ---: | --- | --- |
| 0.0s - 0.6s | 0-18 | Logo surge de preto com tinta seca | sem copy |
| 0.6s - 2.8s | 18-84 | Logo grande no centro, respirando no pulso | `brand/logo.png` |
| 2.8s - 3.5s | 84-105 | Logo cresce e suja a tela com scratch/stroke | prepara corte |
| 3.5s - 4.2s | 105-126 | Wipe de tinta preto/laranja | entrada do sinal |
| 4.2s - 6.2s | 126-186 | Pings de crew entram um por vez | slide esquerda -> direita |
| 6.2s - 8.0s | 186-240 | Copy curta entra depois dos pings | `SO CHEGA` ou equivalente |
| 8.0s - 13.0s | 240-390 | Crew ritual + tipografia cinetica | sem tenis fantasma |
| 13.0s - 17.0s | 390-510 | Corrida com strokes/tinta, sem overlay de tenis | preservar imagem principal |
| 17.0s - 22.0s | 510-660 | `NINGUEM / FICA PRA TRAS` | manter v7 com ajuste fino |
| 22.0s - 26.0s | 660-780 | Carimbo real + mapa/territorio | aqui o pattern pode aparecer |
| 26.0s - 30.0s | 780-900 | Lockup final limpo | reduzir portraits/pings |

## Assets aprovados para a onda

Assets atuais:

```text
public/brand/logo.png
public/textures/board.png
public/video/storyboard/07_badge_stamp_insert.png
```

Assets de crew para adicionar ao sync:

```text
public/intro/crew-pings/downtown-rush.png
public/intro/crew-pings/north-breakers.png
public/intro/crew-pings/east-burners.png
public/intro/crew-pings/south-striders.png
public/intro/crew-pings/west-flow.png
```

Assets a usar com restricao:

```text
public/crews/east-burners/territory_pattern.png
public/crews/east-burners/leader.png
public/crews/east-burners/members/member_1.png
public/crews/east-burners/members/member_2.png
public/crews/east-burners/members/member_3.png
```

Regra: assets sem alpha devem entrar como poster, crop, mask, ghost texture ou painel, nunca como sticker bruto.

## Arquitetura de implementacao

### Novo componente: `OpeningLogo`

Arquivo sugerido:

```text
apps/crew-running-video/src/scenes/OpeningLogo.tsx
```

Responsabilidade:

- renderizar `brand/logo.png` de 0s a 3.5s;
- aplicar zoom, pulso, scratch, tinta e leve camera shake nos hits;
- esconder a copy da cena `coldBoot` enquanto o logo estiver ativo.

Regras:

- sem CSS animation;
- usar `frame`, `tween`, `timed`, `curves`;
- manter logo legivel, sem fragmentar demais.

### Novo componente: `CrewPingCascade`

Arquivo sugerido:

```text
apps/crew-running-video/src/scenes/CrewPingCascade.tsx
```

Responsabilidade:

- renderizar os 5 crew pings entre 4.2s e 6.2s;
- cada ping entra com delay curto;
- movimento de slide da esquerda para direita;
- vibracao de 2 a 4 frames no beat;
- splash/acento com cor da crew.

Sequencia:

| Ping | Cor | Entrada sugerida |
| --- | --- | ---: |
| Downtown Rush | `#C9302C` | 4.20s |
| North Breakers | `#2EC4B6` | 4.55s |
| East Burners | `#E85D2C` | 4.90s |
| South Striders | `#4DA3B5` | 5.25s |
| West Flow | `#2EC4B6` | 5.60s |

Observacao: East Burners pode segurar maior ou com punch extra porque a apresentacao atual usa essa crew como eixo visual.

### Ajuste em `CampaignAssets`

Alteracoes:

- `TerritoryTexture`: renderizar apenas em `territoryMarked` e, se necessario, `cityReady` com opacidade baixa.
- `BrandGhost`: reduzir ou remover do final; se ficar, usar `opacity <= 0.10`.
- `CrewPortraits`: manter em `crewRitual` e `crewFormation`; no `cityReady`, reduzir bastante ou desligar.
- `AchievementPings`: manter no mapa/carimbo; no final, reduzir ou desligar.

### Ajuste em `StoryboardScene`

Alteracoes:

- condicionar `CopyBlock`:
  - em `coldBoot`, esconder ate frame 105 ou remover completamente;
  - em `signalOpen`, atrasar copy para depois do `CrewPingCascade`;
- manter `StampInsertPlate` da v7;
- manter `KineticWord`, mas revisar se o excesso de tinta compete com o logo/pings.

### Ajuste em `sync-assets.mjs`

Adicionar:

```text
intro/crew-pings/downtown-rush.png
intro/crew-pings/north-breakers.png
intro/crew-pings/east-burners.png
intro/crew-pings/south-striders.png
intro/crew-pings/west-flow.png
```

Remover apenas se ficar comprovado que nao e usado:

```text
crews/east-burners/territory_pattern.png
crews/east-burners/members/member_*.png
```

Por enquanto, nao remover antes do QA porque ainda podem ser usados nas cenas do meio.

## Plano de orquestracao

### W0 - Baseline v7

Objetivo: congelar a referencia atual.

Checar:

```bash
cd "apps/crew-running-video"
npm run sync-assets
npm run typecheck
test -f out/estamos-chegando-review-v7.mp4
```

Criterio:

- v7 continua existindo;
- nao sobrescrever output v7.

### W1 - Logo opening

Objetivo: substituir a abertura de 0s-3.5s por marca.

Implementar:

- `OpeningLogo.tsx`;
- renderizar em `EstamosChegando` ou `StoryboardScene`;
- suprimir `CopyBlock` em `coldBoot` ate o fim da abertura;
- usar `brand/logo.png` central, grande, com pulse no beat.

QA:

```bash
npx remotion still src/index.ts EstamosChegando out/stills-v8/015.png --frame=15 --scale=0.35
npx remotion still src/index.ts EstamosChegando out/stills-v8/060.png --frame=60 --scale=0.35
npx remotion still src/index.ts EstamosChegando out/stills-v8/105.png --frame=105 --scale=0.35
```

Aceite:

- logo domina o centro;
- nao aparece tenis/territory overlay brigando;
- abertura parece intencional, nao poster perdido.

### W2 - Crew ping cascade

Objetivo: criar a passagem de sinal de crew entre 4.2s e 6.2s.

Implementar:

- `CrewPingCascade.tsx`;
- adicionar `intro/crew-pings/*` no sync;
- slides com vibracao no beat;
- strokes nas cores das crews.

QA:

```bash
npx remotion still src/index.ts EstamosChegando out/stills-v8/132.png --frame=132 --scale=0.35
npx remotion still src/index.ts EstamosChegando out/stills-v8/150.png --frame=150 --scale=0.35
npx remotion still src/index.ts EstamosChegando out/stills-v8/168.png --frame=168 --scale=0.35
npx remotion still src/index.ts EstamosChegando out/stills-v8/186.png --frame=186 --scale=0.35
```

Aceite:

- cada crew aparece uma vez;
- slide parece sincronizado com a musica;
- East Burners pode ganhar enfase, mas sem parecer propaganda isolada de uma unica crew.

### W3 - Limpeza de overlays

Objetivo: tirar o tenis laranja das cenas onde ele estraga a composicao.

Implementar:

- `TerritoryTexture` apenas em `territoryMarked` e talvez `cityReady`;
- `BrandGhost` muito mais sutil ou removido no final;
- `CrewPortraits` desligado no `cityReady` ou opacidade muito baixa.

QA:

```bash
npx remotion still src/index.ts EstamosChegando out/stills-v8/430.png --frame=430 --scale=0.35
npx remotion still src/index.ts EstamosChegando out/stills-v8/560.png --frame=560 --scale=0.35
npx remotion still src/index.ts EstamosChegando out/stills-v8/830.png --frame=830 --scale=0.35
```

Aceite:

- corrida volta a ser imagem principal;
- overlays nao parecem colados;
- final prioriza `THE CREW RUNNING`.

### W4 - Copy timing depois dos pings

Objetivo: evitar que a copy e os pings briguem no inicio.

Implementar:

- atrasar `signalOpen` copy para depois do cascade;
- revisar `CopyBlock` por cena para nao entrar em cima do logo;
- manter cinetica da v7 apenas quando houver respiro.

QA:

```bash
npx remotion still src/index.ts EstamosChegando out/stills-v8/195.png --frame=195 --scale=0.35
npx remotion still src/index.ts EstamosChegando out/stills-v8/225.png --frame=225 --scale=0.35
```

Aceite:

- `SO CHEGA` entra como payoff apos o sinal das crews;
- nao ha excesso de texto simultaneo.

### W5 - Render review v8

Comandos:

```bash
cd "apps/crew-running-video"
npm run sync-assets
npm run typecheck
npx remotion render src/index.ts EstamosChegando out/estamos-chegando-review-v8.mp4 --codec=h264 --pixel-format=yuv420p
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 out/estamos-chegando-review-v8.mp4
ffprobe -v error -show_entries stream=index,codec_type,codec_name -of compact=p=0:nk=1 out/estamos-chegando-review-v8.mp4
ffmpeg -hide_banner -i out/estamos-chegando-review-v8.mp4 -map 0:a:0 -af volumedetect -f null - 2>&1 | rg "mean_volume|max_volume"
```

Aceite tecnico:

- duracao perto de `30.058667`;
- video H.264;
- audio AAC;
- pico de audio abaixo de `0 dB`, idealmente perto do v7 (`-5.6 dB`);
- v7 preservada.

## Opiniao de direcao incorporada

Minha recomendacao e nao tentar resolver riqueza visual com mais assets simultaneos. O caminho mais forte e hierarquia:

1. marca grande no inicio;
2. pings como sistema urbano;
3. texto cinetico como impacto;
4. mapa/carimbo quando falamos de territorio;
5. final limpo como assinatura.

Se tudo aparece o tempo todo, vira colagem. O video precisa alternar entre excesso controlado e respiro. A dopamina vem da alternancia: grande/silencioso, rapido/sujo, texto forte, carimbo, assinatura.

## Riscos e mitigacoes

| Risco | Mitigacao |
| --- | --- |
| Logo inicial parecer splash screen longo | limitar a 3.5s e animar no beat |
| Pings parecerem icones soltos | usar slide, tinta, cor de crew e motion blur seco via smear/strokes |
| Copy atrasada perder mensagem | manter payoff forte apos pings |
| Remover pattern deixar cenas simples | substituir por strokes/tinta procedural, nao por outros assets |
| Final ficar vazio demais | manter textura, grano e pequeno eco de pings, mas sem competir com lockup |

## Nao escopo

- Nao mexer no runner creator.
- Nao mexer em Gemini/API.
- Nao usar `public/styles/*` como input.
- Nao restaurar slot `hair`, `StylePicker` ou selecao publica de estilo.
- Nao trocar o video para outro framework.
- Nao renderizar master final sem aprovacao; v8 e review.

## Fechamento executado - v8 review

Status: entregue e validado em 2026-06-03.

Arquivos implementados:

```text
apps/crew-running-video/src/scenes/OpeningLogo.tsx
apps/crew-running-video/src/scenes/CrewPingCascade.tsx
apps/crew-running-video/src/compositions/EstamosChegando.tsx
apps/crew-running-video/src/scenes/StoryboardScene.tsx
apps/crew-running-video/src/scenes/CampaignAssets.tsx
apps/crew-running-video/scripts/sync-assets.mjs
```

Output entregue:

```text
apps/crew-running-video/out/estamos-chegando-review-v8.mp4
```

Stills de QA gerados:

```text
apps/crew-running-video/out/stills-v8/015.png
apps/crew-running-video/out/stills-v8/060.png
apps/crew-running-video/out/stills-v8/105.png
apps/crew-running-video/out/stills-v8/132.png
apps/crew-running-video/out/stills-v8/150.png
apps/crew-running-video/out/stills-v8/168.png
apps/crew-running-video/out/stills-v8/186.png
apps/crew-running-video/out/stills-v8/225.png
apps/crew-running-video/out/stills-v8/430.png
apps/crew-running-video/out/stills-v8/690.png
apps/crew-running-video/out/stills-v8/705.png
apps/crew-running-video/out/stills-v8/830.png
```

Validacoes executadas:

```bash
npm run sync-assets
npm run typecheck
npx remotion render src/index.ts EstamosChegando out/estamos-chegando-review-v8.mp4 --codec=h264 --pixel-format=yuv420p
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 out/estamos-chegando-review-v8.mp4
ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate -of compact=p=0:nk=1 out/estamos-chegando-review-v8.mp4
ffmpeg -hide_banner -i out/estamos-chegando-review-v8.mp4 -map 0:a:0 -af volumedetect -f null - 2>&1 | rg "mean_volume|max_volume"
rg -n "[ \t]+$" src scripts ../crew-running/vault/2026-06-03-remotion-v8-logo-crew-pings-orchestration-plan.md
```

Resultados tecnicos:

```text
sync-assets: 35 assets sincronizados
typecheck: passou
duracao: 30.058667s
tamanho: 54714006 bytes
video: h264, 1080x1920, 30fps
audio: aac
mean_volume: -25.3 dB
max_volume: -5.6 dB
trailing whitespace: sem ocorrencias
```

Decisoes finais aplicadas:

- `coldBoot` nao renderiza copy por cima da marca.
- `OpeningLogo` segura a marca grande de 0s a 3.5s com pulso e textura.
- `CrewPingCascade` entra de 4.2s a 7.1s com pings do onboarding e enfase no East Burners.
- `signalOpen` atrasa a copy para depois do cascade.
- `territory_pattern.png` fica restrito a `territoryMarked`.
- `cityReady` nao usa portraits, pings extras nem ghost de logo; fica mais limpo para o lockup final.

Observacao: `git status` falhou localmente com `fatal: .git/index: unable to map index file: Operation timed out`; por isso a checagem de worktree nao foi usada como criterio de fechamento.
