# The Crew Running - Plano Remotion Do Video De Apresentacao

Data: 2026-06-03
Escopo: plano e direcao artistica para um video curto de apresentacao do projeto usando Remotion e os assets ja existentes.
Status: Onda 1 em andamento. Pacote Remotion isolado criado em `apps/crew-running-video`; composicao publica `EstamosChegando`; render final bloqueado ate aprovacao de story, plates, stills e audio.

## 1. Tese

O video nao deve vender "um app de corrida". Ele deve mostrar um cartucho de jogo street-running ligando em Sao Paulo:

> A cidade liga. A crew escolhe o sinal. O jogador monta a identidade. O mapa fica pronto.

Objetivo do primeiro corte: apresentar o produto para investidor/parceiro/time sem prometer feature que ainda nao esta no runtime. O video para em identidade salva e cidade pronta, alinhado ao `DESIGN.md`.

## 2. Regras locais que mandam no video

Fontes internas:

- `DESIGN.md`: fluxo aprovado `Cold Boot -> Title -> City Signal -> Guided Setup -> Runner Creator -> Runner Saved`.
- `vault/2026-05-28-main-menu-hq-action-plan.md`: menu como QG de Missao, nao dashboard.
- `vault/2026-05-28-character-sheet-asset-production-map.md`: street-v2, comic adulto, sombras ink, cel shading, screen-print, sem SaaS, sem 3D glossy.
- `vault/sound/00_SONIC_IDENTITY.md`: "O app nao toca. A cidade liga"; som tactile, curto, rua a noite, Snap/Pulse/Wash.
- `vault/2026-05-28-voce-tab-f1-visual-contract.md`: identidade e pertencimento, sem like/follow/share/views, sem promessa social falsa.

Hard locks:

- Nao usar linguagem fitness-clean, Apple Fitness, SaaS, dashboard corporativo ou trailer epico generico.
- Nao mostrar start run real, GPS permission, ranking, streak punitivo ou rota publica.
- Nao usar assets `public/styles/*` como identidade do video.
- Texto em tela curto, command-like, com Anton/Bowlby/JetBrains/Permanent Marker.
- 75% asphalt/charcoal, 15% dirty cream, 7% crew accent, 3% reward/status.

## 3. Referencias externas e o que roubar de cada uma

Nao copiar visual, layout ou marca. Usar so como lente de direcao.

1. Nike After Dark Tour - Mouthwash Studio
   - Link: https://mouthwash.studio/project/nike-after-dark/
   - Aprendizado: running noturno pode ser grit, forca e celebracao sem virar neon/cyberpunk. Boa referencia para tipografia forte, alto contraste e sistema modular por cidade.

2. Nike Flatiron Running - Studio Butch
   - Link: https://www.studiobutch.com/work-collection/nike-flatiron-running
   - Aprendizado: mapas, wheat paste, reflective street material, subway grates e hazard lines conectam corrida com materialidade urbana. Isso casa direto com mission ticket, mapas, fita refletiva e crew routes.

3. Strava Year in Sport - Manual / Its Nice That
   - Link: https://d3buuag9gcp8bb.cloudfront.net/articles/manual-strava-year-in-sport-graphic-design-150321
   - Aprendizado: storyboard por capitulos e dados como narrativa. Para nos, trocar "dados pessoais" por "sinal da cidade, crew, identidade, equipamento".

4. Remotion docs - Sequence, transitions, audio e image
   - Links:
     - https://www.remotion.dev/docs/sequence
     - https://www.remotion.dev/docs/transitions
     - https://www.remotion.dev/docs/html5-audio
     - https://www.remotion.dev/docs/img
   - Aprendizado: montar cenas deterministicas com `Sequence`, transicoes controladas, audio com `staticFile()` e imagens resilientes. Evitar efeitos aleatorios que quebrem render frame-safe.

5. Dan Harmon Story Circle - StudioBinder
   - Link: https://www.studiobinder.com/blog/dan-harmon-story-circle/
   - Aprendizado: mesmo em 45s o video precisa de transformacao. O protagonista sai de um estado conhecido, atravessa um sinal novo, faz uma escolha, paga com compromisso de identidade e volta mudado.

6. Pixar storytelling rules - Creative Bloq recap
   - Link: https://www.creativebloq.com/art/animation/why-the-pixar-rules-of-storytelling-are-as-relevant-in-2026-as-they-were-15-years-ago
   - Aprendizado: comecar pelo fim e pelo "por que contar isso". Para nos, o fim e "a cidade reconhece teu runner"; o por que e provar que o app cria pertencimento antes de cobrar performance.

7. Cinematography basics - Adobe
   - Link: https://www.adobe.com/creativecloud/video/production/cinematography.html
   - Aprendizado: planos, angulos, movimento, luz, composicao e lente guiam resposta emocional. Em Remotion isso vira escala, enquadramento, parallax, contraste, recorte e ritmo.

8. CineTechBench cinematography dimensions
   - Link: https://arxiv.org/abs/2505.15145
   - Aprendizado: usar uma matriz tecnica de sete aspectos para QA de cada cena: shot scale, shot angle, composition, camera movement, lighting, color e focal length.

## 4. Direcao artistica proposta

Nome publico do corte: `Estamos Chegando`.

Nome interno de direcao: `A Cidade Liga`. A frase continua sendo a biblia sensorial, mas nao precisa aparecer como headline publica do teaser.

Formato principal:

- 30s, 1080x1920, 30fps, mobile-first para teaser publico.
- Derivacoes depois: 16:9 horizontal para pitch e 1:1 social.

Look:

- Fundo de asfalto preto, board texture e city-signal-map em camadas.
- Poster/ticket colado, hard black sticker shadow, borda riscada.
- Rota como risco de giz/spray, nunca mapa limpo.
- Crew badges como carimbos, nao logos brilhantes.
- Leader e members como posters/patches, nao personagens 3D.
- Wardrobe e runner sheet entram como itens de inventario e identidade, nao ecommerce.

Movimento:

- Camera 2D com parallax leve, snap cuts, tape-slide, stamp impact.
- Sem giro 3D, sem zoom cinematico exagerado, sem glitch hacker.
- Transicoes principais: wipe seco de ticket, slide de chapa, hard cut no beat, flash cream curto.
- Grao/screen-print sempre sutil e renderizado como overlay.

Audio:

- Ambient base: `amb-boot-cold -> amb-title-pulse -> amb-city-signal -> amb-hq-room -> amb-locker-room -> amb-saved-stamp-wash`.
- UI SFX: `ui-lock-on`, `ui-nav-slab`, `ui-equip-snap`, `ui-stamp-save`.
- Musica: usar loops/motifs locais se existirem; senao criar bed temporario so com ambient + SFX.
- Voz opcional para V1: curta, humana, baixa, SP. Nao narrador trailer.

## 5. Storytelling e dramaturgia

### Logline

Quando a cidade liga, um corredor anonimo deixa de ser usuario de app e vira runner de uma crew: escolhe um sinal, monta uma identidade e volta ao mapa reconhecido pelo territorio.

### Protagonista

O protagonista nao e uma pessoa real nem uma feature. E a identidade do jogador ainda sem forma: um runner latente, antes de ser medido por km, pace ou ranking.

### Antagonismo

O conflito nao e "nao correr". O conflito e entrar em um app de corrida como dado frio, avatar generico ou perfil de performance. A tensao emocional e:

- sair do anonimato sem expor identidade real;
- pertencer a uma crew sem virar rede social falsa;
- sentir o mapa vivo antes da primeira corrida real.

### Promessa emocional

O video precisa fazer o espectador sentir:

1. Tem um mundo.
2. Esse mundo me chama.
3. Eu escolho uma crew.
4. Eu monto uma identidade.
5. A cidade responde.

### Story Circle aplicado

| Beat | Funcao dramatica | Aplicacao em `A Cidade Liga` |
| --- | --- | --- |
| You | estado inicial | Tela escura, cidade fria, runner ainda sem corpo |
| Need | desejo | O sinal aparece: existe uma crew esperando escolha |
| Go | travessia | Pings de crews abrem o mapa; o jogador entra no ritual |
| Search | adaptacao | QG/mission ticket organiza a escolha: primeiro identidade |
| Find | conquista | Runner sheet/wardrobe emerge como forma jogavel |
| Take | preco | Escolher gear e salvar identidade e um compromisso visual |
| Return | volta | A camera volta ao mapa, agora com badge/stamp |
| Change | transformacao | A cidade reconhece o runner: `TUA CIDADE OUVIU` |

### Story spine

Era uma vez uma cidade que corria escondida no asfalto.
Todos os dias, apps de corrida comecavam pela metrica.
Um dia, a cidade ligou o sinal.
Por causa disso, o jogador escolheu uma crew.
Por causa disso, montou um runner antes de abrir qualquer rota.
Por causa disso, o mapa deixou de ser tela e virou territorio.
Ate que finalmente, a cidade ouviu: o runner estava pronto.

### Regra de roteiro

Cada cena precisa responder uma pergunta, nao listar uma feature:

- Boot: o que acordou?
- Sinal: quem chamou?
- Crews: a qual territorio eu pertenco?
- QG: qual e o primeiro compromisso?
- Creator: quem eu viro aqui?
- Equipamento: que marca eu carrego?
- Cidade pronta: o que mudou no mundo?

## 6. Pilares de cinematografia aplicados

Esses pilares viram checks de direcao para cada cena. Como o video e Remotion/2D, "camera" significa enquadramento, escala, parallax, recorte, ritmo e luz simulada.

| Pilar | Intencao cinematografica | Como aplicar no Remotion |
| --- | --- | --- |
| Shot scale | Alternar mundo, escolha e detalhe | Wide para mapa/sinal; medium para QG/crew dossier; close-up para badge, zipper, stamp, runner tile |
| Shot angle | Dar poder ao mundo e agencia ao jogador | Top-down para mapa/cidade; table-top obliquo para QG; front-on para inventario/runner sheet |
| Composition | Guiar olho sem explicar demais | Leading lines com rotas; rule-of-thirds para copy; centro pesado so em stamps finais; diagonais para energia de rua |
| Camera movement | Criar ritual e pulso, nao trailer generico | Slow push no boot; pan/track no mapa; snap-slide nos tickets; micro-jitter controlado em impactos |
| Lighting | Fazer a cidade parecer ligada por materia | Low-key charcoal; rim cream em bordas; flashes curtos de spray/cyan/orange; nada de glow limpo |
| Color | Codificar progressao emocional | Comeca quase monocromatico; crew accent entra aos poucos; saved usa cream + accent como carimbo final |
| Focal length/depth | Simular lente sem 3D falso | Ortografico/poster-camera; parallax 2.5D leve; foreground texture; sem bokeh premium/glossy |
| Editing rhythm | Transformar ritual em compromisso | 0-9s lento/pulsado; 9-24s cortes de descoberta; 24-39s snap/equip beat; 39-45s respiro final |
| Sound perspective | Fazer o quadro ter materia | Sub distante no wide; SFX seco no close-up; ambient duck sob voz; stamp com tail curto |

### Linguagem de planos por cena

| Tempo | Cena | Plano principal | Movimento | Luz/cor | Funcao emocional |
| --- | --- | --- | --- | --- | --- |
| 0-4s | Cold Boot | Extreme close-up de asfalto/textura + logo surgindo | Push muito lento, quase imperceptivel | Preto, bone baixo, cyan minimo | Ritual: algo acordou |
| 4-9s | Sinal | Wide top-down do mapa/sinal | Pan curto seguindo pings | Charcoal + acentos das crews | Convite: existe territorio |
| 9-16s | Crews | Medium collage de banner/leader/badge | Slide lateral como poster sendo puxado | Cada crew acende 7% do quadro | Pertencimento: escolha tem rosto e patch |
| 16-24s | QG | Table-top mission ticket | Camera assenta e trava | Cream em ticket, sombra dura | Clareza: primeiro vem identidade |
| 24-33s | Creator | Front-on de runner sheet/tile | Cortes internos por snap | Locker-room low-key + safety orange | Transformacao: forma jogavel nasce |
| 33-39s | Equipamento | Close-ups de itens | Match cuts por geometria/slot | Teal/orange contidos | Compromisso: gear vira assinatura |
| 39-45s | Cidade pronta | Wide volta ao mapa + stamp central | Pull-back curto e respiro | Cream + crew accent final | Mudanca: a cidade reconheceu |

### Regras Remotion para preservar cinematografia

- Usar `Series` para cenas principais e `Sequence` para camadas internas.
- Toda cena deve ter `premountFor` nos assets pesados.
- Toda animacao nasce de `useCurrentFrame()` + `useVideoConfig().fps`; sem CSS animation/transition.
- Curvas de camera ficam em `style/motion.ts`, nao hard-coded por cena.
- Cada cena exporta um `shotIntent` em comentario ou data para QA: `scale`, `angle`, `movement`, `lighting`, `color`, `emotion`.
- Render still obrigatorio nos frames que representam cada plano principal antes do render final.

## 7. Storyboard conciso

| Tempo | Cena | Visual | Copy maxima |
| --- | --- | --- | --- |
| 0-4s | Cold Boot | Asfalto preto, logo aparece como tinta seca, pulse no sub | ESTAMOS CHEGANDO |
| 4-8s | Sinal | Mission ticket/app plate com mapa riscado | CHAMADO DA RUA / SINAL ABERTO |
| 8-13s | Ritual | Crew poster sob viaduto, aquecimento e foco | NINGUEM CORRE SOZINHO |
| 13-17s | Rua | Close de tenis/asfalto molhado | PRIMEIRO PASSO / A RUA ACENDE |
| 17-22s | Formacao | Runners em formacao por avenida grafitada | EM FORMACAO / PASSO COLETIVO |
| 22-26s | Territorio | Mapa top-down com area marcada e stamp insert | TERRITORIO / ZONA MARCADA |
| 26-30s | Coming soon | Fundo escuro/cidade pronta | THE CREW RUNNING / COMING SOON |

## 7.1. Render gate

Nao renderizar MP4 final antes da aprovacao humana dos stills. Durante storyboard, copy, plate QA e motion rough, os comandos permitidos sao:

- `npm run studio`
- `npm run typecheck`
- `npm run stills:qa`
- `npm run validate`

Render final so com aprovacao explicita:

- `npm run render:approved`

## 8. Arquitetura Remotion recomendada

Criar pacote isolado:

```text
apps/crew-running-video/
  package.json
  remotion.config.ts
  public/
    audio/        # copia ou symlink controlado dos audios finais
    assets.json   # manifest gerado dos assets do app
  src/
    Root.tsx
    compositions/CidadeLiga.tsx
    scenes/
      ColdBoot.tsx
      CitySignal.tsx
      CrewCollage.tsx
      MissionHQ.tsx
      RunnerCreator.tsx
      WardrobeSnap.tsx
      CityReady.tsx
    style/
      tokens.ts
      textures.ts
      motion.ts
    data/
      timeline.ts
      assetManifest.ts
```

Por que isolado:

- Nao contamina o app Vite atual.
- Permite Remotion Studio sem mexer no runtime mobile.
- Consome os assets do app por manifest versionado.
- Facil de apagar/refazer se a direcao mudar.

## 9. Uso dos assets existentes

Assets principais:

- `public/brand/logo.png`
- `public/brand/splash.png`
- `public/textures/board.png`
- `public/backgrounds/boot-underpass-2d.jpg`
- `public/backgrounds/city-signal-map-2d.jpg`
- `public/backgrounds/hq-collage-2d.jpg`
- `public/crews/{slug}/badge_128.png`
- `public/crews/{slug}/banner.png`
- `public/crews/{slug}/leader.png`
- `public/crews/{slug}/members/member_*.png`
- `public/crews/{slug}/mission_card.png`
- `public/crews/{slug}/marker.png`
- `public/crews/{slug}/stickers/sticker_*.png`
- `public/wardrobe/{top,bottom,shoes,accessory}/*.png`
- `public/audio/{ambient,ui}/*.mp3`

Nao usar:

- `public/styles/*` como referencia de identidade.
- Fotos reais de usuario.
- Assets com texto gerado/aleatorio.

## 10. Pipeline

Onda 0 - preflight

- Gerar manifest dos assets existentes.
- Conferir dimensoes e assets quebrados.
- Definir composicao 1080x1920/30fps/45s.
- Criar mood still de 3 frames: boot, city signal, saved.
- Criar shot matrix com `scale`, `angle`, `composition`, `movement`, `lighting`, `color`, `focalDepth`, `emotion`.

Onda 1 - animatic

- Remotion com cenas em `Sequence`.
- Sem render final caro: stills + preview local.
- Validar ritmo, copy e leitura mobile.
- Validar Story Circle: cada cena precisa carregar um beat dramatico.

Onda 2 - motion polish

- Parallax, stamp, snap, wipe, overlay de grao.
- Audio com ambient/SFX usando `Html5Audio` e `staticFile()`.
- Checar que copy nao estoura container.
- Afinar movimento de camera por intencao: ritual, convite, escolha, compromisso, retorno.

Onda 3 - render V1

- Render 1080x1920.
- Gerar PNGs de QA nos frames-chave.
- Revisar black/freeze/text overflow/audio.
- Revisar cinematografia em grid: wide/medium/close-up, contraste, composicao, ritmo.

Onda 4 - variantes

- 16:9 para apresentacao.
- 1:1 ou 9:16 curto de 15s.
- Versao sem voz, so som e texto.

## 11. Gates de aceite

- O video parece The Crew Running, nao campanha fitness limpa.
- O video tem transformacao clara: anonimo -> sinal -> crew -> identidade -> cidade pronta.
- Cada cena tem uma funcao dramatica e uma funcao cinematografica.
- Nenhuma cena promete corrida real, GPS aberto, ranking publico ou social falso.
- Nenhum texto proibido: `API`, `MVP`, `PREVIEW`, `GERAR`, `SHEET`, `DASHBOARD`, `LIKE`, `FOLLOW`, `SHARE`, `VIEWS`.
- Todas as imagens carregam via manifest; erro de imagem nao deixa render travar.
- Remotion preview abre local.
- Render still em pelo menos 7 frames-chave passa: 0, 120, 270, 510, 720, 990, 1290.
- Audio nao passa do espirito Snap/Pulse/Wash.

## 12. Proximo passo recomendado

Executar Onda 0:

1. Criar `apps/crew-running-video` com Remotion blank.
2. Criar `assetManifest.ts` apontando para os assets existentes do app.
3. Montar `CidadeLiga` com timeline de 45s e sete cenas placeholder.
4. Criar `shotMatrix.ts` com storytelling beat + cinematografia por cena.
5. Renderizar stills em frames 0, 120, 270, 510, 720, 990 e 1290.
6. Revisar esses stills antes de mexer em motion fino.
