# The Crew Running - Pesquisa De Fontes E Comunicacao Visual

Data: 2026-06-03
Escopo: definir fontes candidatas e regras de comunicacao visual para fortalecer app/teaser sem perder o estilo gritty dark mobile game.

## Fontes e referencias consultadas

- Google Fonts - Bowlby One: https://fonts.google.com/specimen/Bowlby+One
- Google Fonts - Anton: https://fonts.google.com/specimen/Anton
- Google Fonts - Bebas Neue: https://fonts.google.com/specimen/Bebas+Neue
- Google Fonts - Archivo Black: https://fonts.google.com/specimen/Archivo+Black
- Google Fonts - Oswald: https://fonts.google.com/specimen/Oswald
- Google Fonts - Saira Stencil One: https://fonts.google.com/specimen/Saira+Stencil+One
- Google Fonts - JetBrains Mono: https://fonts.google.com/specimen/JetBrains+Mono
- Google Fonts - Permanent Marker: https://fonts.google.com/specimen/Permanent+Marker
- Fontsource - Saira Stencil One: https://fontsource.org/fonts/saira-stencil-one
- Adobe Fonts - Archivo Black: https://fonts.adobe.com/fonts/archivo-black
- Apple HIG - Typography: https://developer.apple.com/design/human-interface-guidelines/typography
- Adobe Typography Guide: https://www.adobe.com/uk/creativecloud/design/discover/typography.html

## Estado atual do projeto

O `DESIGN.md` ja define:

| Fonte | Papel atual |
| --- | --- |
| Bowlby One | title impact |
| Anton | command UI |
| JetBrains Mono | system readout |
| Permanent Marker | street tag |
| Inter | utility copy |
| Bungee | rare accent |

O app carrega essas fontes em `apps/crew-running/index.html`. O pacote Remotion atual carrega `Anton`, `JetBrains Mono` e `Inter` em `apps/crew-running-video/src/style/tokens.ts`.

Diagnostico:

- O app tem uma hierarquia tipografica boa no papel, mas o uso espalhado no CSS pode diluir os papeis.
- O Remotion esta usando `Anton` como display principal, mas pelo contrato visual local `Anton` deveria ser comando, nao headline hero.
- A copy nova precisa de fonte com mais peso de cartaz/jogo para frases como `VEM O SINAL` e `VIRA PRESENCA`.
- Bungee e Permanent Marker precisam continuar raros; em excesso, deixam o produto mais brincadeira/cartoon.

## Recomendacao de sistema tipografico

### Sistema A - recomendado para agora

Usar o que ja existe, mas corrigir papeis:

| Papel | Fonte | Uso |
| --- | --- | --- |
| Headline de impacto | Bowlby One | 1 frase grande por tela, final lockup, stamp de conquista |
| Comando / menu / CTA | Anton | comandos, labels de aba, crew names, action text |
| Sistema / status | JetBrains Mono | kicker, chips, tempo, zona, leitura tecnica curta |
| Corpo / acessibilidade | Inter | textos pequenos, configuracao, notas longas |
| Rua / tag | Permanent Marker | tags de 1-3 palavras, carimbo, anotacao manual |
| Acento raro | Bungee | badge/unlock especifico, nunca copy principal |

Por que:

- Menor risco de bagunca.
- Continua alinhado ao `DESIGN.md`.
- Funciona no app e no Remotion via `@remotion/google-fonts`.
- Da para melhorar o teaser so trocando `display: Anton` para `display: Bowlby One` e mantendo `Anton` como comando.

### Sistema B - se quisermos mais poster esportivo

Adicionar `Archivo Black` como headline alternativa.

| Papel | Fonte |
| --- | --- |
| Headline poster | Archivo Black |
| Comando | Anton |
| Sistema | JetBrains Mono |
| Corpo | Inter |
| Tag | Permanent Marker |

Por que considerar:

- Mais grotesque/print, menos "condensed fitness".
- Aguenta palavras em portugues melhor que Bowlby em algumas linhas.
- Bom para cartazes, pitch deck e key visuals.

Risco:

- Pode ficar mais editorial/poster e menos game cartridge se usado em tudo.

### Sistema C - se quisermos mais sinal/territorio

Adicionar `Saira Stencil One` somente para micro-labels de territorio.

| Papel | Fonte |
| --- | --- |
| Headline | Bowlby One ou Archivo Black |
| Comando | Anton |
| Stencil/ticket | Saira Stencil One |
| Sistema | JetBrains Mono |
| Corpo | Inter |

Por que considerar:

- Traz sensacao de equipamento, faixa, stencil de rua, mark de territorio.

Risco:

- Facil virar militar, airsoft ou operador tatico. Usar so em detalhes: `ZONA`, `SETOR`, `SINAL`, nao headline.

## Fontes candidatas avaliadas

| Fonte | Veredito | Motivo |
| --- | --- | --- |
| Bowlby One | Manter / subir no Remotion | Melhor match para title impact e game poster. Forte, pesado, pouco SaaS. |
| Anton | Manter, mas rebaixar para comando | Otimo para CTA e menu. Como headline grande fica limpo demais. |
| Archivo Black | Testar como alternativa hero | Forte, grotesque, print/digital, menos generico que Bebas. |
| Bebas Neue | Usar com cuidado | Tem energia esportiva, mas e muito comum e pode ficar fitness/ad limpo. Melhor como exploracao, nao base. |
| Oswald | Bom para UI secundaria | Util se precisarmos de familia condensada com pesos, mas tem menos identidade. |
| Saira Stencil One | Acento de territorio | Bom para ticket/stencil, perigoso como fonte principal. |
| Teko | Futuro para placar/numeros | Pode funcionar para dados de corrida, mas agora pode puxar para esportes de TV/esports. |
| Staatliches | Opcional para poster limpo | Bom all-caps, mas menos gritty que Bowlby/Archivo. |
| Black Ops One | Rejeitar por enquanto | Militar demais. |
| Bangers | Rejeitar | Puxa para comic/cute/cartoon. |
| Rubik Glitch/Storm | Rejeitar | Puxa cyberpunk/glitch, fora do lock. |

## Direcao de comunicacao visual

### 1. Uma frase precisa virar objeto

Nao renderizar copy como legenda flutuante generica. Cada bloco de texto deve parecer:

- sticker colado;
- carimbo batido;
- faixa refletiva;
- mission ticket;
- tinta seca sobre asfalto;
- label de inventario.

No Remotion:

- headline com sombra preta dura;
- uma regua/acento curta;
- textura por cima do texto com `mixBlendMode`;
- entrada por snap/slide/stamp, sem glow limpo.

### 2. Hierarquia por funcao, nao por decoracao

Por tela:

1. Headline: uma mensagem de decisao.
2. Kicker: contexto curto.
3. Sistema: somente se houver estado real.

Nao usar 4 fontes numa unica tela. Limite recomendado:

- Teaser: maximo 2 fontes por cena.
- App UI densa: maximo 3 fontes por painel.
- Landing/key visual: maximo 3 fontes por viewport.

### 3. Copy curta porque a textura ja grita

O visual e escuro, granulado, com plate detalhada. A copy precisa ser mais seca.

Boa forma:

- `ANTES DO PACE / VEM O SINAL`
- `SEM PERFIL FRIO / VIRA PRESENCA`
- `O MAPA RESPONDE / TERRITORIO ACESO`

Forma fraca:

- `RITUAL DA CREW / NINGUEM CORRE SOZINHO`
- `EM FORMACAO / PASSO COLETIVO`

Nao sao ruins, mas descrevem a cena. A nova linguagem cria conflito e consequencia.

### 4. Portugues no corpo, ingles como assinatura

O mundo visual e Sao Paulo/rua local. O corpo do teaser em portugues aumenta identidade. Ingles deve ficar em:

- assinatura de marca: `THE CREW RUNNING`;
- fechamento comercial: `COMING SOON`, se for para pitch externo;
- materiais internacionais futuros.

Para o teaser local, preferir:

- `EM BREVE / THE CREW RUNNING`

### 5. Regras para legibilidade mobile

- Headline: 2 linhas no maximo quando possivel.
- Evitar palavras longas em Bowlby se ficarem apertadas; nesses casos usar Archivo Black ou quebrar a linha.
- Kicker em mono com 18-24px no Remotion vertical.
- Headline em 92-118px no Remotion vertical, ajustando por palavra.
- Line-height entre 0.86 e 0.94 para impacto.
- Letter spacing 0.
- Texto sempre com sombra preta dura, nao glow.
- Nunca posicionar copy sobre area de maior detalhe do plate sem uma faixa/sombra de separacao.

## Aplicacao recomendada no teaser `EstamosChegando`

### Troca de fontes

Atual:

- `display`: Anton
- `mono`: JetBrains Mono
- `body`: Inter

Recomendado para o proximo rough:

- `display`: Bowlby One
- `command`: Anton
- `mono`: JetBrains Mono
- `body`: Inter
- `tag`: Permanent Marker opcional para stamp final

### Copy + funcao visual

| Cena | Kicker | Headline | Tratamento visual |
| --- | --- | --- | --- |
| Cold Boot | ANTES DO PACE | VEM O SINAL | texto como tinta seca no asfalto |
| Sinal | A RUA CHAMOU | QUEM RESPONDE? | faixa/ticket com acento teal |
| Ritual | ESCOLHE A CREW | ENTRA NO RITUAL | cartaz/sticker lateral |
| Movimento | SEM PERFIL FRIO | VIRA PRESENCA | close com sombra dura |
| Formacao | LOOK TRAVADO | IDENTIDADE SALVA | badge/inventory language |
| Territorio | O MAPA RESPONDE | TERRITORIO ACESO | stamp + mapa |
| Final | EM BREVE | THE CREW RUNNING | lockup central, respiro |

## Como refinar visualmente sem gerar assets novos

1. **Textura sobre texto:** aplicar leve grain/board texture tambem no texto para ele parecer impresso.
2. **Shadow offset consistente:** 6-8px em headline, 3-4px em kicker; nada de blur.
3. **Acento unico por cena:** uma barra, uma borda ou um stamp. Nao usar acento em tudo.
4. **Copy lane fixa:** top-left/top-right/bottom-left por cena, sem mudar arbitrariamente.
5. **Respirar mais:** deixar areas vazias escuras como parte da composicao, especialmente final.
6. **Stamp controlado:** usar Permanent Marker so para 1 palavra/tag, nunca frase longa.
7. **Quebra editorial:** quebrar headline por impacto, nao por largura automatica.
8. **QA por still:** revisar 045, 165, 285, 430, 560, 705, 830 no mobile e cortar qualquer frase que nao leia em 1 segundo.

## Proximo teste recomendado

Criar uma rodada de Remotion com:

- `Bowlby One` como headline;
- `Anton` como kicker/command opcional;
- copy `Antes do pace`;
- 7 stills de QA.

Depois comparar contra uma segunda rodada usando `Archivo Black` como headline. A melhor decisao deve ser tomada por stills, nao por gosto abstrato.

## Rodada A/B implementada

Implementado em `apps/crew-running-video`:

- `EstamosChegando`: corte principal com `Bowlby One`.
- `EstamosChegandoArchivo`: composicao paralela com `Archivo Black`.
- `npm run stills:qa`: gera os stills Bowlby em `out/stills/`.
- `npm run stills:qa:archivo`: gera os stills Archivo em `out/stills-archivo/`.
- `npm run validate:ab`: sincroniza assets, roda typecheck e gera os dois sets.

Regra: `EstamosChegando` continua sendo o corte publico ate decisao visual. A variante
Archivo e apenas comparacao de stills; nao renderizar MP4 final dela.

## Resultado da primeira comparacao visual

Frames revisados:

- `out/stills/045.png` vs `out/stills-archivo/045.png`
- `out/stills/165.png` vs `out/stills-archivo/165.png`
- `out/stills/285.png` vs `out/stills-archivo/285.png`
- `out/stills/560.png` vs `out/stills-archivo/560.png`
- `out/stills/830.png` vs `out/stills-archivo/830.png`

Leitura:

- Bowlby One ficou mais proprio do mundo The Crew: mais cartucho, game-poster e stamp.
- Archivo Black ficou mais limpo e editorial, melhor para palavras longas, mas menos singular.
- Nos frames com `RESPONDE?`, `IDENTIDADE SALVA` e `THE CREW RUNNING`, Archivo melhora
  um pouco a leitura, mas tambem deixa a peca mais proxima de poster esportivo generico.

Decisao:

- Manter `Bowlby One` como headline do corte publico `EstamosChegando`.
- Preservar `EstamosChegandoArchivo` como composicao de comparacao/fallback.
- Usar `Archivo Black` apenas se uma headline futura ficar ilegivel ou estourar largura
  mesmo depois de quebra editorial.
