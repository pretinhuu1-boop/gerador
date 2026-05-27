# Crew Running — Asset Prompts (Gemini 2.5 Flash Image)

Prompts ready-to-paste pra você gerar todas as sheets do MVP no
[Google AI Studio](https://aistudio.google.com) ou pela própria API.
**Use sempre `gemini-2.5-flash-image` (nano-banana)**.

---

## 0. Style anchor (cole no TOPO de cada prompt)

Esse bloco é o "DNA visual" — copie ele integralmente em cada chamada
pra que todas as sheets fiquem no mesmo universo gráfico.

```
STYLE LOCK — "The Crew Running":
Hand-drawn comic-book illustration with bold black ink outlines (2–3 px),
gritty paper-textured fills, slight sticker-cut white border around each
isolated item. Palette strictly limited to: dark charcoal #14110f
(background), warm cream #f5ecd6 (text/outlines), orange #ff7a1a (primary
accent), teal #18b6b6 (secondary accent), deep rust red #8c2b3a (third
accent). No photorealism, no 3D render, no anime. Aesthetic = street /
graffiti / running crew. Confident urban tone.
```

---

## 1. Logo "THE CREW RUNNING"

**Use:** splash, gate, header.
**Output:** PNG transparente 1024×1024, no centro.

```
[STYLE LOCK]

Generate a centered logo composition: large brushy hand-painted lettering
reading "THE CREW" in cream off-white, with "RUNNING" stamped below in
bright orange #ff7a1a, slightly rotated 3 degrees counter-clockwise.
Style: bold spray-paint marker, uneven edges, drop-shadow offset 3px
dark charcoal. Around the lettering, faint graffiti tag flicks and a
small crown icon. Transparent background. No other elements.
```

Recorta e salva como `/public/brand/logo.png`.

---

## 2. Mascote splash

**Use:** tela inicial do app (estilo da mock 5).
**Output:** PNG 1024×1536 (vertical mobile).

```
[STYLE LOCK]

Full-body mascot illustration of a young street runner: backwards black
crew cap with "CREW" tag, dark sunglasses, oversized black hoodie with
graffiti tag, maroon shorts, sneakers leaving small flame trails. Holding
a spray can in one hand. Confident swagger pose facing the viewer.
Background: dark charcoal with a faint isometric street-grid pattern in
teal lines, scattered map-pin icons, a small orange crown with "MVP"
graffiti tag, lit matches floating like sparks. Vertical mobile poster
composition.
```

Salva como `/public/brand/splash.png`.

---

## 3. Sheet: HAIR (4 cortes)

**Use:** ícones do slot Hairstyle.
**Output:** PNG 1024×1024, 2×2 grid, fundo escuro consistente, **cada
célula contém apenas uma cabeça de 3/4 (sem corpo), centralizada**.

```
[STYLE LOCK]

Generate a 2x2 character-portrait sheet (1024x1024, thin cream divider
between cells). Each cell is a 3/4 view of a different head-and-shoulders
bust on a dark charcoal background. Same illustrated style across all
four cells. No text labels.

TOP-LEFT  — long teal-blue ponytail with side-shaved fade, brown skin,
             confident expression.
TOP-RIGHT — medium-length dark dreadlocks tied back, warm brown skin,
             neutral expression.
BOTTOM-LEFT — red snapback cap worn backwards over short curly black
              hair, light tan skin, slight smirk.
BOTTOM-RIGHT — short buzz-cut with bleached blonde top, olive skin,
               serious face.
```

Depois de gerar, fatie em 4 PNGs 512×512 e salve como:
- `/public/wardrobe/hair/hair_pony_teal.png`
- `/public/wardrobe/hair/hair_dreads.png`
- `/public/wardrobe/hair/hair_cap_curls.png`
- `/public/wardrobe/hair/hair_buzz_blonde.png`

---

## 4. Sheet: TOPS (4 peças, sem corpo)

**Use:** ícones do slot Tops.
**Output:** PNG 1024×1024, 2×2 grid, **só a peça flutuando centrada**
(estilo "ghost mannequin"), fundo charcoal.

```
[STYLE LOCK]

Generate a 2x2 wardrobe sheet (1024x1024, thin cream divider between
cells). Each cell shows ONLY the clothing item floating centered on a
dark charcoal background, ghost-mannequin style (no body, no head, no
limbs). Slight cast shadow under each item. No text labels.

TOP-LEFT  — cropped hoodie, dark navy fabric, orange graffiti tag print
             across the chest, drawstrings, slight crumple.
TOP-RIGHT — fitted black athletic tank top with white trim around neck
             and armholes.
BOTTOM-LEFT — oversized red running hoodie with thick white drawstrings,
              kangaroo pocket, soft fabric folds.
BOTTOM-RIGHT — sleeveless teal running jersey with a bold cream "CREW"
               logo across the chest.
```

Slice e salva como:
- `/public/wardrobe/top/top_hoodie_graf.png`
- `/public/wardrobe/top/top_tank_black.png`
- `/public/wardrobe/top/top_hoodie_red.png`
- `/public/wardrobe/top/top_jersey_teal.png`

---

## 5. Sheet: LEGS/BOTTOMS (4 peças)

**Output:** PNG 1024×1024, 2×2 grid.

```
[STYLE LOCK]

Generate a 2x2 wardrobe sheet (1024x1024, thin cream divider between
cells). Each cell shows ONLY the bottom clothing item floating centered,
ghost-mannequin style on dark charcoal. No body, no shoes. No text.

TOP-LEFT  — short maroon running shorts with a white side stripe.
TOP-RIGHT — black athletic full-length leggings with subtle teal accent
             line down the side.
BOTTOM-LEFT — loose grey joggers with white side stripes and cuffed
              ankles, slight drape.
BOTTOM-RIGHT — teal running shorts with white piping along the hem.
```

Slice:
- `/public/wardrobe/bottom/bot_shorts_maroon.png`
- `/public/wardrobe/bottom/bot_leggings_blk.png`
- `/public/wardrobe/bottom/bot_jogger_grey.png`
- `/public/wardrobe/bottom/bot_shorts_teal.png`

---

## 6. Sheet: SHOES (4 pares)

**Output:** PNG 1024×1024, 2×2 grid, **vista lateral 3/4**.

```
[STYLE LOCK]

Generate a 2x2 wardrobe sheet (1024x1024, thin cream divider between
cells). Each cell shows ONE pair of sneakers in 3/4 side view, floating
centered on dark charcoal background. No feet, no legs, no laces flying.
No text labels.

TOP-LEFT  — chunky teal running sneakers with thick white sole and
             orange accent details.
TOP-RIGHT — red low-top sneakers with white laces and white sole.
BOTTOM-LEFT — clean white low-top sneakers with orange swoosh-like
              accent and matching laces.
BOTTOM-RIGHT — all-black trail running shoes with reflective grey
               details and aggressive tread.
```

Slice:
- `/public/wardrobe/shoes/sho_runners_teal.png`
- `/public/wardrobe/shoes/sho_sneak_red.png`
- `/public/wardrobe/shoes/sho_sneak_white.png`
- `/public/wardrobe/shoes/sho_runners_blk.png`

---

## 7. Sheet: ESTILOS (4 chips de estilo)

**Use:** thumbnail nos cards de StylePicker — mostra "como vai ficar".
**Output:** PNG 1024×1024, 2×2 grid, bust 3/4 da MESMA personagem
genérica em cada cell, pra evidenciar a diferença de estilo, não de
personagem.

```
[STYLE LOCK]

Generate a 2x2 reference sheet (1024x1024, thin cream divider between
cells). Each cell is a 3/4 bust portrait of the same generic young
street runner (warm brown skin, dark teal ponytail, orange hoodie),
re-rendered in FOUR distinctly different art styles:

TOP-LEFT — "Street Comic": hand-drawn comic book, bold ink outlines,
            cross-hatching, gritty paper background.
TOP-RIGHT — "Graffiti Poster": screen-printed urban poster, halftone
             dots, distressed warm beige background.
BOTTOM-LEFT — "Anime Runner": modern anime sports illustration, clean
              linework, cel-shaded coloring.
BOTTOM-RIGHT — "Bold Mascot": chibi proportions with oversized head,
               thick outlines, flat saturated colors.

Each cell must read clearly as a DIFFERENT art style. No text labels.
```

Slice e salva como:
- `/public/styles/street_comic.png`
- `/public/styles/graffiti_poster.png`
- `/public/styles/anime_runner.png`
- `/public/styles/mascot_bold.png`

> Se quiser usar no `StylePicker`, adicione um campo `previewUrl` em
> `data/styles.ts` e mostre como thumbnail dentro do card.

---

## 8. Background texturas (opcional)

**Use:** fundo do board e painéis paper. Hoje uso SVG noise via CSS, mas
texturas raster melhoram o feel.

```
[STYLE LOCK]

Generate a seamless tileable 1024x1024 texture: dark charcoal chalkboard
with subtle horizontal scuff marks, faint chalk-dust noise, occasional
soft cream graffiti scribbles in corners (very low opacity ~10%). Edges
must tile seamlessly. No text, no obvious focal point.
```

Salva como `/public/textures/board.png` e referencia via
`background-image` no `.bg-board` do `index.css`.

---

## 9. Como fatiar uma sheet 2×2 em 4 PNGs

Mais rápido pela linha de comando (ImageMagick):

```bash
# Assumindo sheet.png 1024x1024
magick sheet.png -crop 2x2@ +repage +adjoin slice_%d.png
# Gera slice_0.png (TL), slice_1.png (TR), slice_2.png (BL), slice_3.png (BR)
```

Ou via web: https://imagesplitter.net

---

## 10. Checklist de geração pro MVP

- [ ] `logo.png` (1)
- [ ] `splash.png` (1)
- [ ] hair sheet → 4 ícones
- [ ] top sheet → 4 ícones
- [ ] bottom sheet → 4 ícones
- [ ] shoes sheet → 4 ícones
- [ ] styles sheet → 4 thumbnails
- [ ] board texture (opcional)

**Total: 8 chamadas à API pra ter o MVP visual completo** (vs. 24
chamadas se gerasse cada item separado).
