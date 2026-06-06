# Crew Running - Prompts de Assets para Mapa 2D

Data: 2026-06-03
Escopo: camada visual interativa do mapa 2D, missões e história local.

## Assets que já podemos reaproveitar

- `public/crews/{crewSlug}/badge_128.png`: marcador/âncora de crew.
- `public/crews/{crewSlug}/mission_card.png`: vinheta do painel de missões.
- `public/crews/{crewSlug}/territory_pattern.png`: textura de território.
- `public/crews/{crewSlug}/stickers/sticker_*.png`: selos de status e conquistas.
- `public/ui/map/mission_sticker_base.svg`: base para marcador de missão.
- `public/ui/map/map_outline_brush.svg`: textura de recorte do mapa.
- `public/ui/map/xp_bar_frame.svg`: moldura para XP/recorde.
- `public/video/storyboard/*`: referência de atmosfera, luz e ritmo.
- `vault/DRIVE_ASSET_SCAN_2026-06-03.md`: lista de candidatos do Drive para curadoria manual.

Regra de segurança: não importar assets do Drive direto para geração do runner. Para creator, usar somente `public/crews/{selectedCrewSlug}/` via `CrewRenderContext`; não usar `public/styles/*`; não copiar rosto, cabelo, roupa, marcas ou identidade real reconhecível.

## Prompt 1 - Atlas de marcadores de missão

Uso: `public/ui/map/mission_marker_atlas.png`

Prompt:
```text
Create a transparent PNG atlas for a street-running game map UI. Six circular sticker markers, each isolated on transparent background: available mission, active mission, completed mission, invasion mission, night run mission, heritage spot mission. Visual language: rough screenprint sticker, black ink outline, asphalt grit, athletic street-crew energy, small high-contrast icon in center, no readable text, no logos, no real people. Palette must support recoloring with red, teal, orange, yellow, green, and bone white. Crisp at 48x48 and 96x96.
```

## Prompt 2 - Painel de missões por crew

Uso: alternativa/rework de `public/crews/{crewSlug}/mission_card.png`

Prompt:
```text
Design a compact mission-card header image for a mobile street-running crew app. Use the selected crew badge and territory pattern as reference only. Output one rectangular transparent PNG with rough paper edge, spray ink texture, subtle route lines, and a blank safe area for UI text overlay. No readable words, no real people, no brand logos. Mood: local running crew challenge board, practical, energetic, urban.
```

## Prompt 3 - História local / melhores tempos

Uso: `public/ui/map/local_records_badges.png`

Prompt:
```text
Create a transparent PNG set of local record badges for a 2D running map. Include best pace, shortest time, longest route, and top local run. Visual style: stopwatch stamp, worn race-bib paper, small route slash, asphalt dust, high contrast. No readable text. Must feel like a collectible running achievement, not a marketing badge. Keep shapes simple enough for small mobile UI.
```

## Prompt 4 - Fantasma de melhor rota

Uso futuro: overlay quando houver rota anterior salva.

Prompt:
```text
Generate a transparent overlay asset for a "personal best ghost route" in a 2D map UI. A loose neon brush trail with dotted timing ticks, subtle glow, imperfect hand-drawn line, designed to sit above a dark map without hiding streets. No text, no characters, no logos. Provide variants in red, teal, yellow, orange, and bone white.
```

## Prompt 5 - Território interativo

Uso: enriquecer `territory_pattern.png` por crew.

Prompt:
```text
Create five seamless transparent texture tiles for street-running crew territories on a dark 2D city map. Each tile should feel like spray paint plus worn asphalt plus route scratches. No words, no logos, no people. Make each crew visually distinct: downtown red/yellow rush, north teal/green climb, south blue/green long-run, east orange heat, west yellow flow. Output square 1024x1024 PNG tiles.
```

## Prompt 6 - Reaproveitamento dos assets antigos do Drive

Uso: curadoria antes de importar para `public/`.

Prompt de triagem:
```text
Classify this existing generated image for reuse in Crew Running. Choose one bucket: crew_identity, ui_texture, map_marker, mission_card, history_badge, prompt_reference, reject. Reject if it contains a recognizable real person, exact clothing identity, third-party logo, low-resolution text, unrelated product material, or style incompatible with the current 2D street-running map. Provide a one-line reason and recommended destination path if accepted.
```

## Próxima triagem recomendada

1. Criar um manifesto CSV/JSON dos candidatos do Drive.
2. Classificar cada arquivo com o prompt de triagem.
3. Mover só assets aprovados para `public/ui/map/` ou `public/crews/{crewSlug}/`.
4. Rodar `npm run validate` antes de mexer no creator.
