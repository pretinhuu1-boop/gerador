# Crew Running - Asset Prompts

> Legacy note, 2026-05-28: this file is historical asset-generation context for the original customize pack. The current Runner Creator contract is `vault/CREATOR_CONTRACT.md`; do not copy old MVP/prototype wording, hair slots, style picker assets or `public/styles/*` inputs into runtime UI or generation.

Prompts for generating the MVP asset pack for **The Crew Running - Customize**.
The direction is based on the provided mobile UI references: dark runner-crew
game screens, rough chalk/graffiti typography, gritty map overlays, inventory
tiles, and adult athletic comic characters.

Use these with `gpt-image-1` or `gemini-2.5-flash-image`. Keep the **EXPERT
STACK**, **STYLE LOCK**, and **NEGATIVE LOCK** identical in every call so the
pack stays visually coherent.

---

## 0. Direction Diagnosis

The visual target is **not** cute mascot, glossy 3D, playful chibi, or generic
cartoon. The correct look is:

- dark mobile game UI / sports crew app
- black and charcoal canvas with faint graffiti and street-map linework
- cream distressed uppercase type, tall condensed headings, brush tags only as
  accents
- limited orange/red/teal/lime accents used like game UI badges and selection
  states
- adult/semi-realistic athletic character proportions, bold ink shadows, gritty
  paper/screen-print texture
- wardrobe icons should look like inventory tiles from the customization screen,
  not toy stickers

---

## 1. Shared Blocks

Paste these three blocks at the top of every image-generation prompt.

```text
EXPERT STACK:
Act as a senior mobile game art director, a street-running brand designer, a
graffiti lettering specialist, a comic character concept artist, and a UI
inventory icon artist. Prioritize product-ready game assets for a dark
runner-crew mobile app, not standalone poster art.

STYLE LOCK - "The Crew Running":
Gritty dark mobile game UI aesthetic inspired by urban running crews, territory
maps, challenge screens, and streetwear customization menus. Matte black and
deep charcoal backgrounds (#050606, #101111, #171818) with subtle chalk dust,
scratched paper grain, faint graffiti scribbles, and thin street-map linework.
Illustration style: mature hand-drawn sports comic, bold black ink shadows,
screen-print texture, slightly rough edges, flat cel shading, no glossy finish.
Typography when present: tall condensed uppercase athletic lettering plus
distressed cream brush lettering, legible, worn, chalky. Palette: dirty cream
#e8e2d2, off-white #f5f0df, safety orange #e86f1c, deep red #c8282f, muted
teal #1d8f98, lime green #86d66b, steel blue #315d86, charcoal black. Use color
sparingly against the dark canvas.

NEGATIVE LOCK:
No cute kiddie mascot, no toy sticker pack, no bubbly proportions, no generic
cartoon, no photorealism, no 3D render, no glossy gradients, no neon cyberpunk,
no pastel palette, no oversized white sticker border, no clean corporate SaaS
UI, no random readable text except the exact requested brand words.
```

---

## 2. Logo - `brand/logo.png`

**Use:** splash, gate, header.
**Output:** PNG 1024x1024.

```text
[EXPERT STACK]
[STYLE LOCK]
[NEGATIVE LOCK]

Create a centered brand logo for "THE CREW RUNNING".

Composition:
- main words "THE CREW" in large distressed cream brush lettering, stacked,
  rough hand-painted edges, black drop shadow like the reference title screens
- smaller word "RUNNING" below in condensed athletic uppercase, safety orange,
  stamped/painted, slightly imperfect
- optional underline stroke under "CREW", rough chalk/paint texture
- very dark charcoal background with faint low-contrast graffiti marks and
  street-map lines, like a mobile game header texture
- no mascot, no crown, no cute icons, no extra slogans

Art direction:
This should feel like a premium dark sports-game logo painted on a gritty
runner-crew app screen. Strong readability at small UI sizes.
```

Save as `/public/brand/logo.png`.

---

## 3. Splash Mascot - `brand/splash.png`

**Use:** app splash / gate illustration.
**Output:** PNG 1024x1536 vertical mobile poster.

```text
[EXPERT STACK]
[STYLE LOCK]
[NEGATIVE LOCK]

Create a vertical mobile splash poster for "THE CREW RUNNING".

Subject:
- one full-body young adult urban runner, athletic build, confident but serious
- black/dark grey hoodie with rough cream "CREW" or "RUNNING" chest lettering
- backwards cap, dark sunglasses, orange bandana or hair accent, running shorts,
  black performance sneakers with worn white soles
- one hand holds a spray can down at the side; stance is grounded, not dancing,
  not cute
- proportions should match mature comic/mobile game character art, similar to
  the provided profile/customize references

Background:
- dark street-map grid covering the whole vertical frame
- faint graffiti scribbles and chalk scratches
- small orange flame marks near shoes, low-key
- optional map pin/running territory icon, very small
- large cream "THE CREW" at top and cream "MVP" near bottom, both distressed and
  readable

Do not make a toy-like mascot. Make it feel like a gritty game splash screen.
```

Save as `/public/brand/splash.png`.

---

## 4. Hair Sheet - 4 Icons

**Use:** Hairstyle slot icons.
**Output:** one 1024x1024 2x2 sheet, then slice to 512x512 cells.

```text
[EXPERT STACK]
[STYLE LOCK]
[NEGATIVE LOCK]

Create a 2x2 UI inventory icon sheet for hairstyle choices. Each cell is a dark
square customization tile like the reference Customize screens. Thin charcoal
separators, no text labels.

Global tile treatment:
- each cell has matte black/charcoal tile background, subtle scratches and faint
  graffiti texture
- head-and-shoulders bust only, 3/4 view, mature sports-comic style
- strong black shadow shapes and restrained cream highlights
- no oversized sticker border, no white outline halo

TOP-LEFT:
Adult woman runner, brown skin, long teal-blue ponytail, side-shaved fade,
focused expression.

TOP-RIGHT:
Adult runner, warm brown skin, medium dark dreadlocks tied back, calm serious
expression.

BOTTOM-LEFT:
Adult runner, light tan skin, red/orange snapback cap worn backwards over short
curly black hair, streetwear attitude.

BOTTOM-RIGHT:
Adult runner, olive/brown skin, short buzz cut with bleached blonde top,
serious confident face.
```

Slice and save:

- `/public/wardrobe/hair/hair_pony_teal.png`
- `/public/wardrobe/hair/hair_dreads.png`
- `/public/wardrobe/hair/hair_cap_curls.png`
- `/public/wardrobe/hair/hair_buzz_blonde.png`

---

## 5. Tops Sheet - 4 Icons

**Use:** Tops slot icons.
**Output:** one 1024x1024 2x2 sheet, then slice to 512x512 cells.

```text
[EXPERT STACK]
[STYLE LOCK]
[NEGATIVE LOCK]

Create a 2x2 UI inventory icon sheet for upper-body wardrobe choices. Each cell
is a dark square customization tile like a gritty mobile game equipment menu.
Thin charcoal separators, no text labels.

Global tile treatment:
- clothing-only inventory icons, centered, ghost-mannequin presentation
- no head, no hands, no full body
- dark tile background with faint scratches/graffiti
- bold black ink shadows, screen-print grain, worn fabric texture
- cream edge highlights only where needed, not a sticker border

TOP-LEFT:
Cropped dark charcoal/navy hoodie with orange graffiti tag print across chest,
thick hood, white/cream drawstrings, cropped athletic streetwear silhouette.

TOP-RIGHT:
Fitted black athletic tank top with off-white trim around neck and armholes,
minimal runner training gear, worn fabric texture.

BOTTOM-LEFT:
Oversized deep red running hoodie, cream drawstrings, kangaroo pocket, heavy
folds, gritty screen-print shading.

BOTTOM-RIGHT:
Sleeveless muted teal running jersey with bold cream "CREW" lettering across
the chest, athletic cut, dark side panels.
```

Slice and save:

- `/public/wardrobe/top/top_hoodie_graf.png`
- `/public/wardrobe/top/top_tank_black.png`
- `/public/wardrobe/top/top_hoodie_red.png`
- `/public/wardrobe/top/top_jersey_teal.png`

---

## 6. Bottoms Sheet - 4 Icons

**Use:** Legs slot icons.
**Output:** one 1024x1024 2x2 sheet, then slice to 512x512 cells.

```text
[EXPERT STACK]
[STYLE LOCK]
[NEGATIVE LOCK]

Create a 2x2 UI inventory icon sheet for lower-body wardrobe choices. Each cell
is a dark square customization tile. Thin charcoal separators, no text labels.

Global tile treatment:
- clothing-only inventory icons, centered, ghost-mannequin style
- no torso, no feet, no shoes
- black/charcoal tile background, scratched and worn
- mature sports-comic rendering with bold black shadows, screen-print grain

TOP-LEFT:
Short deep maroon running shorts with off-white side stripe, athletic cut,
slightly worn fabric.

TOP-RIGHT:
Black full-length athletic leggings with subtle muted teal accent line down the
side, matte compression fabric.

BOTTOM-LEFT:
Loose dark grey joggers with cream side stripes and cuffed ankles, streetwear
running look, heavy folds.

BOTTOM-RIGHT:
Muted teal running shorts with off-white piping along hem and side seams,
minimal athletic design.
```

Slice and save:

- `/public/wardrobe/bottom/bot_shorts_maroon.png`
- `/public/wardrobe/bottom/bot_leggings_blk.png`
- `/public/wardrobe/bottom/bot_jogger_grey.png`
- `/public/wardrobe/bottom/bot_shorts_teal.png`

---

## 7. Shoes Sheet - 4 Icons

**Use:** Shoes slot icons.
**Output:** one 1024x1024 2x2 sheet, then slice to 512x512 cells.

```text
[EXPERT STACK]
[STYLE LOCK]
[NEGATIVE LOCK]

Create a 2x2 UI inventory icon sheet for running shoes. Each cell is a dark
square customization tile. Thin charcoal separators, no text labels.

Global tile treatment:
- one pair of sneakers per cell, 3/4 side view, floating centered
- no feet, no legs
- gritty game inventory icon style, not catalog photography
- bold black ink shadows, worn soles, small cream highlights, screen-print grain

TOP-LEFT:
Chunky muted teal running sneakers, thick worn off-white sole, small safety
orange accent details.

TOP-RIGHT:
Deep red low-top sneakers, off-white laces and worn off-white sole, streetwear
runner style.

BOTTOM-LEFT:
Dirty off-white low-top sneakers with safety orange swoosh-like accent, worn
sole, hand-inked edges.

BOTTOM-RIGHT:
All-black trail running shoes with reflective grey details, aggressive tread,
dark tactical runner feel.
```

Slice and save:

- `/public/wardrobe/shoes/sho_runners_teal.png`
- `/public/wardrobe/shoes/sho_sneak_red.png`
- `/public/wardrobe/shoes/sho_sneak_white.png`
- `/public/wardrobe/shoes/sho_runners_blk.png`

---

## 8. Style Chips Sheet - 4 Thumbnails

**Use:** StylePicker preview thumbnails.
**Output:** one 1024x1024 2x2 sheet, then slice to 512x512 cells.

```text
[EXPERT STACK]
[STYLE LOCK]
[NEGATIVE LOCK]

Create a 2x2 style preview sheet. Each cell shows the SAME adult street runner
character as a 3/4 bust on a dark mobile game tile background. Same pose and
wardrobe in all four cells: warm brown skin, dark teal ponytail, dark hoodie
with orange runner accent. No text labels.

The differences should be style-treatment differences only, not different
characters.

TOP-LEFT - Street Comic:
Closest to the main app direction. Heavy black ink shadows, gritty paper grain,
cream highlights, restrained orange/teal accents.

TOP-RIGHT - Graffiti Poster:
Screen-printed urban poster treatment, halftone distress, rough paint texture,
more orange/red spray marks, still dark and product-ready.

BOTTOM-LEFT - Anime Runner:
Cleaner sports cel-shaded treatment while staying inside the dark mobile game
brand. Avoid cute anime eyes; keep mature athletic proportions and gritty UI
background.

BOTTOM-RIGHT - Bold Mascot:
Slightly simplified bold avatar treatment for a profile badge, not chibi.
Thicker outlines, flatter colors, serious confident expression.
```

Slice and save:

- `/public/styles/street_comic.png`
- `/public/styles/graffiti_poster.png`
- `/public/styles/anime_runner.png`
- `/public/styles/mascot_bold.png`

---

## 9. Board Texture - `textures/board.png`

**Use:** board/panel background.
**Output:** PNG 1024x1024, seamless if possible.

```text
[EXPERT STACK]
[STYLE LOCK]
[NEGATIVE LOCK]

Create a seamless tileable 1024x1024 dark mobile game background texture.

Texture:
- matte black/deep charcoal base
- subtle chalk dust, paper grain, scratched scuffs, grime
- faint low-opacity graffiti scribbles in darker grey, barely readable
- thin grey street-map linework, irregular city blocks, no focal point
- a few extremely subtle muted teal/orange marks, no bright decoration
- no words, no icons, no characters

It must work behind UI cards without stealing attention.
```

Save as `/public/textures/board.png`.

---

## 10. Slicing

The generator script slices 2x2 sheets automatically. If slicing manually:

```bash
magick sheet.png -crop 2x2@ +repage +adjoin slice_%d.png
```

Order:

- `slice_0.png` = top-left
- `slice_1.png` = top-right
- `slice_2.png` = bottom-left
- `slice_3.png` = bottom-right

---

## 11. MVP Checklist

- [ ] `brand/logo.png`
- [ ] `brand/splash.png`
- [ ] 4 hair icons
- [ ] 4 top icons
- [ ] 4 bottom icons
- [ ] 4 shoes icons
- [ ] 4 style thumbnails
- [ ] `textures/board.png`

Total expected output: **23 PNGs**.

Breakdown: 2 brand + 16 wardrobe + 4 styles + 1 texture.
