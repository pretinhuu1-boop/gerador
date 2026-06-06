# Character Sheet Asset Production Map

Data: 2026-05-28
Escopo: `apps/crew-running` / layered runner generator

## Objetivo

Montar um pipeline de jogo real: a IA gera packs padronizados de pecas, e o
app monta o runner localmente por camadas. O runtime nao deve chamar API para
cada troca de roupa.

O fluxo correto:

```text
foto/referencia visual externa
-> observacao editorial
-> ReferenceSignal JSON autoral
-> CrewAssetSpec JSON
-> sheet gerada em street-v2
-> slicing local
-> PNG layers transparentes
-> compositor canvas/runtime
```

Nao copiar imagem, marca, logo, costura proprietaria ou desenho exato. A foto
serve para entender funcao, silhueta, material, pontos de ajuste e energia.

## Fontes de referencia pesquisadas

Estas fontes devem ser usadas como mapas de linguagem visual e categorias, nao
como assets finais.

| Fonte | Uso no mapa |
|---|---|
| REI running gear checklist - https://www.rei.com/learn/expert-advice/essential-running-gear-checklist.html | confirma shorts, jaquetas, bonés/headbands, handheld bottle, hydration vest e hydration belt como categorias reais de corrida |
| Verywell Fit running gear - https://www.verywellfit.com/gear-for-runners-what-you-need-to-get-started-6560987 | reforca belts, armbands, reflective gear, blinking lights e headlamp |
| Running Warehouse accessories - https://www.runningwarehouse.com/mens-running-accessories.html | taxonomia comercial: nutrition, lights/headlamps/reflective gear, belts, packs, safety gear |
| Pexels running vest search - https://www.pexels.com/search/running%20vest/ | pool visual para silhuetas de hydration vest e runner vest |
| Pexels race bib search - https://www.pexels.com/search/race%20bib/ | pool visual para bibs, pins, posicionamento e textura de papel/fabric |
| Unsplash night run reference - https://unsplash.com/photos/group-of-people-running-at-night-with-blurred-lights-vuPFXOnciD4 | mood urbano noturno/motion, usar apenas como clima; Unsplash+ exige cuidado de licenca |
| Outside night visibility - https://www.outsideonline.com/running/gear/accessories/the-science-of-being-seen-at-night/ | referencia de headlamp + reflective gear e uso de vermelho/amarelo para visibilidade |

## Anchors internos ja existentes

Usar estes assets para manter padrao visual durante producao de novos icones e
layers. Eles podem servir como referencia de estilo no estúdio de assets, mas
nao devem virar input extra do gerador runtime se o contrato nao permitir.

```text
public/wardrobe/top/*.png
public/wardrobe/bottom/*.png
public/wardrobe/shoes/*.png
public/wardrobe/accessory/*.png
public/wardrobe/hair/*.png
public/crews/{crewSlug}/badge.png
public/crews/{crewSlug}/banner.png
public/crews/{crewSlug}/territory_pattern.png
```

Regra: `public/styles/*` continua proibido para runtime e nao deve voltar como
seletor publico.

## ReferenceSignal JSON

Cada imagem/fonte externa vira um JSON de observacao. Este JSON e o que
"copiamos" da referencia: nao o visual em si, mas sinais funcionais.

```json
{
  "sourceId": "rei-hydration-belt-soft-flasks",
  "sourceUrl": "https://www.rei.com/learn/expert-advice/essential-running-gear-checklist.html",
  "licenseStatus": "reference_only",
  "observedItem": "hydration waist belt with front soft-flask storage",
  "doNotCopy": [
    "brand logo",
    "exact product silhouette",
    "exact stitching layout",
    "exact colorway",
    "photographic lighting"
  ],
  "functionalSignals": [
    "closed adjustable waistband loop",
    "front storage pockets",
    "soft flask volume bulges",
    "low-bounce compression fit"
  ],
  "silhouetteSignals": [
    "flat belt arc",
    "two bottle pockets near front hips",
    "thin center buckle"
  ],
  "materialSignals": [
    "matte nylon",
    "elastic mesh",
    "rubberized trim",
    "soft translucent bottle caps"
  ],
  "hardwareSignals": [
    "small buckle",
    "zip pull",
    "elastic keeper loops"
  ],
  "crewRunningTransform": {
    "targetId": "acc_hydration_belt",
    "slot": "accessory",
    "layerKind": "waist_over_top_bottom",
    "style": "street-v2 gritty dark sports comic",
    "palette": ["charcoal black", "muted teal", "dirty cream"],
    "promptAtoms": [
      "matte black nylon body",
      "muted teal trim",
      "two soft-flask pockets",
      "bold black ink shadows",
      "screen-print grain"
    ],
    "negativeAtoms": [
      "logo",
      "readable text",
      "photorealism",
      "gloss",
      "3D render"
    ]
  }
}
```

## CrewAssetSpec JSON

Depois da observacao, cada item vira uma spec de jogo. Esta spec e o contrato
para gerar, fatiar e compor.

```json
{
  "id": "top_reflective_shell",
  "slot": "top",
  "displayName": "Reflective Shell",
  "status": "planned",
  "canvas": {
    "width": 1024,
    "height": 1024,
    "pose": "neutral_front",
    "background": "transparent"
  },
  "coverage": {
    "biotypes": [
      "compact-light",
      "lean-runner",
      "balanced-athletic",
      "strong-athletic",
      "broad-heavy"
    ],
    "sexPresentation": "unisex"
  },
  "layer": {
    "kind": "torso_over_body",
    "zIndex": 40,
    "anchors": ["neck", "shoulderLeft", "shoulderRight", "waist"],
    "occludes": ["torsoSkin", "upperArmInside"],
    "requiresMask": true
  },
  "paths": {
    "inventoryIcon": "/wardrobe/top/top_reflective_shell.png",
    "layerPattern": "/layers/top/{biotype}/top_reflective_shell.png",
    "maskPattern": "/layers/top/{biotype}/top_reflective_shell.mask.png"
  },
  "prompt": {
    "short": "thin black wind shell with broken reflective bands and safety orange zipper pull",
    "must": [
      "The Crew Running street-v2",
      "matte black fabric",
      "flat cel shading",
      "bold ink shadows",
      "transparent background",
      "no text"
    ],
    "negative": [
      "logo",
      "readable characters",
      "photorealism",
      "3D",
      "gloss"
    ]
  }
}
```

## Layer model

Runtime composition order:

```text
00 shadow/ground optional
10 base body
12 skin tint
14 body ink
20 bottom
30 shoes
40 top
50 waist accessory
55 torso strap accessory
60 arm accessory
70 head
75 hair under
80 face detail
85 hair over / cap
90 head accessory
95 FX/selection outline only in UI
```

Identity layers never vary inside one generated sheet session:

- biotype
- skin tone/tint
- head/face fiction
- hair
- posture scale

Wardrobe layers may vary:

- top
- bottom
- shoes
- accessory

## Biotypes

Biotypes are game forms, not medical labels.

```json
[
  {
    "id": "compact-light",
    "prompt": "shorter compact runner, light build, narrow shoulders, quick cadence energy",
    "scaleNotes": "shorter limbs, small torso, no childlike proportions"
  },
  {
    "id": "lean-runner",
    "prompt": "tall lean endurance runner, long limbs, slim athletic frame",
    "scaleNotes": "long legs, narrow hips, controlled shoulder width"
  },
  {
    "id": "balanced-athletic",
    "prompt": "balanced athletic runner, medium height, proportional shoulders and hips",
    "scaleNotes": "default base body"
  },
  {
    "id": "strong-athletic",
    "prompt": "powerful sprinter build, stronger shoulders and thighs, compact explosive stance",
    "scaleNotes": "wider shoulders, stronger legs, still realistic runner"
  },
  {
    "id": "broad-heavy",
    "prompt": "broad sturdy runner, heavier frame, solid torso and legs, confident posture",
    "scaleNotes": "broader torso, larger hips, avoid caricature"
  }
]
```

## Hair identity set

Hair is identity, not wardrobe.

```json
[
  { "id": "hair_pony_teal", "source": "existing", "layer": "hair_over" },
  { "id": "hair_dreads", "source": "existing", "layer": "hair_over" },
  { "id": "hair_cap_curls", "source": "existing", "layer": "hair_cap_combo" },
  { "id": "hair_buzz_blonde", "source": "existing", "layer": "hair_over" },
  { "id": "hair_short_ink", "source": "planned", "layer": "hair_over" },
  { "id": "hair_braids_low", "source": "planned", "layer": "hair_under_over" },
  { "id": "hair_curly_crop", "source": "planned", "layer": "hair_over" },
  { "id": "hair_headwrap_blk", "source": "planned", "layer": "head_accessory_identity" }
]
```

## Wardrobe item set

### Tops

Existing:

- `top_hoodie_graf`
- `top_tank_black`
- `top_hoodie_red`
- `top_jersey_teal`

Planned expansion:

- `top_reflective_shell`: black wind shell, broken reflective bands, orange zip.
- `top_compression_long`: black long-sleeve compression top, cream seam lines.
- `top_mesh_singlet`: dirty cream mesh race singlet, dark side panels.
- `top_cropped_rain`: cropped charcoal rain layer, teal taped seams.
- `top_thermal_halfzip`: deep red half-zip winter runner layer.
- `top_hydration_compatible_tee`: matte black tee cut to show vest straps.

### Bottoms

Existing:

- `bot_shorts_maroon`
- `bot_leggings_blk`
- `bot_jogger_grey`
- `bot_shorts_teal`

Planned expansion:

- `bot_half_tights_blk`: black half tights with cream seam.
- `bot_split_shorts_orange`: black split shorts with restrained orange side.
- `bot_trail_shorts_pockets`: charcoal trail shorts with utility pockets.
- `bot_wind_pants_blk`: tapered wind pants with reflective ankle marks.
- `bot_thermal_tights_red`: deep red winter tights under black panels.
- `bot_cargo_runshort`: low-profile cargo running short, not military bulky.

### Shoes

Existing:

- `sho_runners_teal`
- `sho_sneak_red`
- `sho_sneak_white`
- `sho_runners_blk`

Planned expansion:

- `sho_road_cream`: off-white road runner with orange heel tab.
- `sho_trail_lug_black`: black trail shoe with thick lug sole.
- `sho_race_flat_red`: low-profile deep red race flat.
- `sho_weather_gaiter`: black shoe with mini weather gaiter collar.

### Accessories

Existing:

- `acc_reflective_armband`
- `acc_hydration_belt`
- `acc_crossbody_pack`
- `acc_blank_bib`

Planned expansion:

- `acc_hydration_vest`: low-profile vest with two front flasks.
- `acc_reflective_vest`: minimal X-strap reflective vest.
- `acc_phone_armband`: matte phone sleeve on upper arm.
- `acc_gps_watch`: chunky black watch, small teal face glow.
- `acc_headlamp`: compact forehead light with elastic strap.
- `acc_clip_light`: small waist/chest clip light, muted orange lens.
- `acc_neck_gaiter`: dark tube scarf/buff, cream edge wear.
- `acc_sunglasses`: angular matte black sport sunglasses.
- `acc_running_cap`: black 5-panel cap, no logo.
- `acc_visor`: dirty cream visor with charcoal brim.
- `acc_arm_sleeves`: black compression sleeves with reflective bars.
- `acc_gloves`: thin black running gloves with cream knuckle marks.
- `acc_handheld_softflask`: handheld soft flask with strap.
- `acc_race_belt`: thin race belt with blank bib toggles.
- `acc_packable_shell`: tiny folded shell clipped at waist.
- `acc_safety_whistle`: tiny whistle on cord, rendered as small chest detail.

## Sheets to generate

### Calibration

| Sheet | Output | Purpose |
|---|---|---|
| `sheet_00_style_calibration_2x2` | 4 PNGs | match existing wardrobe/accessory gritty tile style before bulk production |
| `sheet_01_layer_anchor_template` | 1 PNG + JSON | neutral front pose, anchors, no wardrobe |

### Identity

| Sheet | Layout | Outputs |
|---|---:|---|
| `sheet_10_biotype_icons` | 2x3 | 5 biotype inventory icons + 1 reserved |
| `sheet_11_base_body_front` | 2x3 | 5 base bodies + 1 reserved |
| `sheet_12_base_body_masks` | 2x3 | 5 skin/ink masks + 1 reserved |
| `sheet_13_hair_icons_a` | 2x2 | first 4 hair inventory icons |
| `sheet_14_hair_icons_b` | 2x2 | next 4 hair inventory icons |
| `sheet_15_hair_layers_a` | 2x2 | first 4 transparent hair layers |
| `sheet_16_hair_layers_b` | 2x2 | next 4 transparent hair layers |

### Wardrobe layers by biotype

Generate one sheet per biotype per slot. This gives far fewer API calls than
one call per item while keeping fit correct.

| Sheet pattern | Layout | Count | Outputs |
|---|---:|---:|---:|
| `sheet_20_top_{biotype}_a` | 2x4 | 5 sheets | 40 top layers |
| `sheet_21_top_{biotype}_masks_a` | 2x4 | 5 sheets | 40 top masks |
| `sheet_30_bottom_{biotype}_a` | 2x4 | 5 sheets | 40 bottom layers |
| `sheet_31_bottom_{biotype}_masks_a` | 2x4 | 5 sheets | 40 bottom masks |
| `sheet_40_shoes_universal_a` | 2x4 | 1 sheet | 8 shoe layers |
| `sheet_41_shoes_shadow_masks_a` | 2x4 | 1 sheet | 8 shoe masks |

### Accessories

Accessories split by anchor. Torso/waist/arm need biotype coverage; head and
small universal items can start universal.

| Sheet pattern | Layout | Count | Outputs |
|---|---:|---:|---:|
| `sheet_50_accessory_torso_{biotype}_a` | 2x4 | 5 sheets | hydration vest, reflective vest, sling, bib, race belt, packable shell, safety whistle, reserved |
| `sheet_51_accessory_waist_{biotype}_a` | 2x4 | 5 sheets | hydration belt, race belt, clip light, packable shell variants |
| `sheet_52_accessory_arm_{biotype}_a` | 2x4 | 5 sheets | reflective armband, phone armband, watch, arm sleeves, gloves, handheld flask hand anchor |
| `sheet_53_accessory_head_universal_a` | 2x4 | 1 sheet | headlamp, sunglasses, running cap, visor, neck gaiter, headwrap, reserved |
| `sheet_54_accessory_inventory_a` | 4x4 | 1 sheet | 16 accessory inventory icons |

### Composer QA sheets

| Sheet | Purpose |
|---|---|
| `sheet_80_composer_smoke_compact-light` | proves layer order on smallest frame |
| `sheet_81_composer_smoke_balanced-athletic` | default body QA |
| `sheet_82_composer_smoke_broad-heavy` | proves fit on broadest frame |
| `sheet_83_crew_palette_recolor_test` | proves accent color/mask recolor without new art |

## MVP generation budget

Recommended first batch:

```text
1 style calibration
1 anchor template
2 identity sheets
5 top sheets
5 bottom sheets
1 shoe sheet
5 torso accessory sheets
1 accessory inventory sheet
= 21 generation calls before slicing
```

This replaces dozens or hundreds of per-look calls. Once the compositor works,
new clothing is cheap: add one item to each biotype sheet, slice, update JSON.

## Prompt rules for every sheet

```text
STYLE LOCK:
The Crew Running street-v2. Mature hand-drawn sports comic, bold black ink
shadows, flat cel shading, screen-print texture, worn fabric/rubber, dirty
cream highlights, restrained safety orange/deep red/muted teal.

NEGATIVE:
No cute mascot, no toy sticker, no photorealism, no 3D render, no glossy
gradient, no neon cyberpunk, no pastel, no clean SaaS UI, no readable text, no
brand logos, no sponsor marks.

LAYER RULE:
Transparent PNG layer on a fixed 1024x1024 canvas. Same neutral front pose and
anchors as `sheet_01_layer_anchor_template`. Do not shift the item between
cells. No cast shadows except separate shadow mask sheets.
```

## Production order

1. Generate `sheet_00_style_calibration_2x2`.
2. Generate `sheet_01_layer_anchor_template` and freeze anchors.
3. Implement or document slicer validation: dimensions, alpha, empty corners,
   anchor grid overlay.
4. Generate biotype base bodies.
5. Generate current wardrobe set as layers for all biotypes.
6. Build local compositor with existing inventory data.
7. Add accessory expansion.
8. Only then add larger sheet sessions and randomized looks.

## Acceptance gates

- Every generated layer is transparent PNG, 1024x1024.
- Every layer aligns to the anchor template.
- No logos or readable text.
- No exact copying of external product design.
- Hair and biotype are `identity`, never `slots.hair`.
- Wardrobe slots remain `top`, `bottom`, `shoes`, `accessory`.
- Runtime generation still respects `CrewRenderContext` and selected crew lock.
- `TESTAR LOCAL` remains available and should be updated to use composer layers.
