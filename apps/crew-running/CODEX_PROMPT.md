# Codex hand-off prompt — Crew Running asset generation

> Legacy note, 2026-05-28: this hand-off targets the older asset generation pass. The current Runner Creator contract is `vault/CREATOR_CONTRACT.md`; do not copy old hair/style slots, StylePicker assets or `public/styles/*` inputs into runtime UI or generation.

Cole o bloco abaixo no Codex / outro agente. Ele é **autocontido**:
contém o contexto do app, o URL do repo, a branch, e o script pronto
pra gerar todas as sheets via OpenAI `gpt-image-1`, fatiar e commitar.

Requisitos no ambiente:
- `git`, `node>=20`, `npm`
- Variável de ambiente `OPENAI_API_KEY` setada
- Acesso outbound a `api.openai.com` e `github.com`

---

```
You are working on a Vite + React + TypeScript mini-app called
"The Crew Running — Customize". It lives at:

  Repo:    https://github.com/pretinhuu1-boop/gerador
  Branch:  claude/repository-switch-dsmxg
  App dir: apps/crew-running

# What the app does

The user uploads a selfie, picks an art style and (optionally) locks
wardrobe items (hair, top, bottom, shoes). Clicking GERAR sends the
photo + a composed prompt to Gemini 2.5 Flash Image, which returns a
2x2 character sheet of 4 outfit variations. The user clicks a cell to
save that variant to localStorage.

The visual identity is street/graffiti/comic — dark canvas, brush
typography (Bowlby One, Anton, Permanent Marker), spray-orange accents,
hand-drawn marker borders via inline SVG feTurbulence filters.

# What is missing

The wardrobe slot tiles, style chips, brand logo, splash mascot and
board texture are all illustrated assets that DO NOT YET EXIST in
public/. The data files reference them via iconUrl paths but the
components fall back to a hatched placeholder when the file is absent.

Your job is to **generate all those assets via OpenAI gpt-image-1**,
slice the 2x2 sheets into individual PNGs, save them to the expected
paths, build the app to confirm it compiles, then commit and push.

# Step-by-step

1. Clone and checkout:

   git clone https://github.com/pretinhuu1-boop/gerador.git
   cd gerador
   git checkout claude/repository-switch-dsmxg
   cd apps/crew-running
   npm install

2. Read the asset spec:

   cat PROMPTS.md

   It defines:
   - A shared STYLE LOCK block to prepend to every prompt
   - 8 separate prompts (logo, splash, 4 wardrobe sheets, style chips, texture)
   - The exact filenames and folder structure under public/
   - Slicing instructions for the 2x2 grids

3. Install image-generation deps:

   npm install --no-save openai sharp

4. Create scripts/generate-assets.mjs with the script below. It reads
   PROMPTS.md, calls gpt-image-1 for each section, slices 2x2 sheets
   into 4 PNGs using sharp, and writes everything to public/.

   ```js
   import OpenAI from 'openai';
   import sharp from 'sharp';
   import fs from 'node:fs/promises';
   import path from 'node:path';

   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   const ROOT = path.resolve('public');

   // STYLE LOCK — keep IDENTICAL across every call
   const STYLE_LOCK = `
   STYLE LOCK — "The Crew Running":
   Hand-drawn comic-book illustration with bold black ink outlines (2-3 px),
   gritty paper-textured fills, slight sticker-cut white border around each
   isolated item. Palette strictly limited to: dark charcoal #14110f
   (background), warm cream #f5ecd6 (text/outlines), orange #ff7a1a (primary
   accent), teal #18b6b6 (secondary accent), deep rust red #8c2b3a (third
   accent). No photorealism, no 3D render, no anime. Aesthetic = street /
   graffiti / running crew. Confident urban tone.
   `.trim();

   // Each job: prompt body + output spec + filename(s)
   const jobs = [
     {
       name: 'logo',
       size: '1024x1024',
       outFiles: ['brand/logo.png'],
       slice: false,
       prompt: `Centered logo composition: large brushy hand-painted lettering
   reading "THE CREW" in cream off-white, with "RUNNING" stamped below in
   bright orange #ff7a1a, slightly rotated 3 degrees counter-clockwise.
   Style: bold spray-paint marker, uneven edges, drop-shadow offset 3px
   dark charcoal. Around the lettering, faint graffiti tag flicks and a
   small crown icon. Transparent-feel dark background.`,
     },
     {
       name: 'splash',
       size: '1024x1536',
       outFiles: ['brand/splash.png'],
       slice: false,
       prompt: `Full-body mascot illustration of a young street runner:
   backwards black crew cap with "CREW" tag, dark sunglasses, oversized
   black hoodie with graffiti tag, maroon shorts, sneakers leaving small
   flame trails. Holding a spray can. Confident swagger pose facing viewer.
   Background: dark charcoal with a faint isometric street-grid pattern in
   teal lines, scattered map-pin icons, a small orange crown with "MVP"
   graffiti tag, lit matches floating like sparks. Vertical mobile poster.`,
     },
     {
       name: 'hair',
       size: '1024x1024',
       outFiles: [
         'wardrobe/hair/hair_pony_teal.png',
         'wardrobe/hair/hair_dreads.png',
         'wardrobe/hair/hair_cap_curls.png',
         'wardrobe/hair/hair_buzz_blonde.png',
       ],
       slice: true,
       prompt: `2x2 character-portrait sheet (1024x1024, thin cream divider
   between cells). Each cell is a 3/4 view of a different head-and-shoulders
   bust on dark charcoal. Same illustrated style across all four cells.
   No text labels.
   TOP-LEFT  — long teal-blue ponytail with side-shaved fade, brown skin.
   TOP-RIGHT — medium-length dark dreadlocks tied back, warm brown skin.
   BOTTOM-LEFT — red snapback cap worn backwards over short curly black
                 hair, light tan skin, slight smirk.
   BOTTOM-RIGHT — short buzz-cut with bleached blonde top, olive skin.`,
     },
     {
       name: 'top',
       size: '1024x1024',
       outFiles: [
         'wardrobe/top/top_hoodie_graf.png',
         'wardrobe/top/top_tank_black.png',
         'wardrobe/top/top_hoodie_red.png',
         'wardrobe/top/top_jersey_teal.png',
       ],
       slice: true,
       prompt: `2x2 wardrobe sheet (1024x1024, thin cream divider). Each
   cell shows ONLY the clothing item floating centered on dark charcoal,
   ghost-mannequin style (no body, no head, no limbs). No text.
   TOP-LEFT  — cropped hoodie, dark navy fabric, orange graffiti tag print
                across chest, drawstrings, slight crumple.
   TOP-RIGHT — fitted black athletic tank top with white trim.
   BOTTOM-LEFT — oversized red running hoodie with thick white drawstrings,
                 kangaroo pocket.
   BOTTOM-RIGHT — sleeveless teal running jersey with bold cream "CREW"
                  logo across the chest.`,
     },
     {
       name: 'bottom',
       size: '1024x1024',
       outFiles: [
         'wardrobe/bottom/bot_shorts_maroon.png',
         'wardrobe/bottom/bot_leggings_blk.png',
         'wardrobe/bottom/bot_jogger_grey.png',
         'wardrobe/bottom/bot_shorts_teal.png',
       ],
       slice: true,
       prompt: `2x2 wardrobe sheet (1024x1024, thin cream divider). Each
   cell shows ONLY the bottom clothing item, ghost-mannequin style on dark
   charcoal. No body, no shoes. No text.
   TOP-LEFT  — short maroon running shorts with white side stripe.
   TOP-RIGHT — black athletic full-length leggings with subtle teal accent.
   BOTTOM-LEFT — loose grey joggers with white side stripes, cuffed ankles.
   BOTTOM-RIGHT — teal running shorts with white piping.`,
     },
     {
       name: 'shoes',
       size: '1024x1024',
       outFiles: [
         'wardrobe/shoes/sho_runners_teal.png',
         'wardrobe/shoes/sho_sneak_red.png',
         'wardrobe/shoes/sho_sneak_white.png',
         'wardrobe/shoes/sho_runners_blk.png',
       ],
       slice: true,
       prompt: `2x2 wardrobe sheet (1024x1024, thin cream divider). Each
   cell shows ONE pair of sneakers in 3/4 side view, floating centered on
   dark charcoal. No feet, no legs. No text.
   TOP-LEFT  — chunky teal running sneakers, thick white sole, orange accents.
   TOP-RIGHT — red low-top sneakers, white laces and sole.
   BOTTOM-LEFT — clean white low-tops with orange swoosh-like accent.
   BOTTOM-RIGHT — all-black trail runners with reflective grey details.`,
     },
     {
       name: 'styles',
       size: '1024x1024',
       outFiles: [
         'styles/street_comic.png',
         'styles/graffiti_poster.png',
         'styles/anime_runner.png',
         'styles/mascot_bold.png',
       ],
       slice: true,
       prompt: `2x2 reference sheet (1024x1024, thin cream divider). Each
   cell is a 3/4 bust portrait of the SAME generic young street runner
   (warm brown skin, dark teal ponytail, orange hoodie), re-rendered in
   FOUR DISTINCTLY DIFFERENT art styles. No text labels.
   TOP-LEFT — "Street Comic": hand-drawn comic book, bold ink outlines,
              cross-hatching, gritty paper background.
   TOP-RIGHT — "Graffiti Poster": screen-printed urban poster, halftone
               dots, distressed warm beige background.
   BOTTOM-LEFT — "Anime Runner": modern anime sports illustration, clean
                 linework, cel-shaded.
   BOTTOM-RIGHT — "Bold Mascot": chibi proportions with oversized head,
                  thick outlines, flat saturated colors.`,
     },
     {
       name: 'texture',
       size: '1024x1024',
       outFiles: ['textures/board.png'],
       slice: false,
       prompt: `Seamless tileable 1024x1024 texture: dark charcoal chalkboard
   with subtle horizontal scuff marks, faint chalk-dust noise, occasional
   soft cream graffiti scribbles in corners (very low opacity ~10%). Edges
   tile seamlessly. No text, no obvious focal point.`,
     },
   ];

   async function ensureDir(p) {
     await fs.mkdir(path.dirname(p), { recursive: true });
   }

   async function generate(job) {
     console.log(`→ ${job.name}`);
     const res = await client.images.generate({
       model: 'gpt-image-1',
       prompt: `${STYLE_LOCK}\n\n${job.prompt}`,
       size: job.size,
       n: 1,
     });
     const b64 = res.data[0].b64_json;
     const buf = Buffer.from(b64, 'base64');

     if (!job.slice) {
       const out = path.join(ROOT, job.outFiles[0]);
       await ensureDir(out);
       await fs.writeFile(out, buf);
       console.log(`  ✓ ${job.outFiles[0]}`);
       return;
     }

     // Slice 2x2 (assumes square 1024x1024)
     const meta = await sharp(buf).metadata();
     const w = Math.floor(meta.width / 2);
     const h = Math.floor(meta.height / 2);
     const cells = [
       { left: 0, top: 0 },         // TL → outFiles[0]
       { left: w, top: 0 },         // TR → outFiles[1]
       { left: 0, top: h },         // BL → outFiles[2]
       { left: w, top: h },         // BR → outFiles[3]
     ];
     for (let i = 0; i < 4; i++) {
       const out = path.join(ROOT, job.outFiles[i]);
       await ensureDir(out);
       await sharp(buf)
         .extract({ width: w, height: h, ...cells[i] })
         .png()
         .toFile(out);
       console.log(`  ✓ ${job.outFiles[i]}`);
     }
   }

   for (const job of jobs) {
     try {
       await generate(job);
     } catch (e) {
       console.error(`  ✗ ${job.name}: ${e.message}`);
     }
   }
   console.log('done');
   ```

5. Run it:

   node scripts/generate-assets.mjs

6. Verify everything was written:

   find public -name '*.png' | sort

   Expected count: 22 PNGs (logo + splash + 4×4 wardrobe + 4 styles + texture).

7. Build to confirm the app picks up the assets without errors:

   npm run build

8. Commit and push to the same branch:

   cd ../..
   git add apps/crew-running/public apps/crew-running/scripts
   git commit -m "feat(crew-running): generate MVP asset sheets via gpt-image-1"
   git push origin claude/repository-switch-dsmxg

# Constraints / things to NOT change

- Do NOT modify components/, services/, data/, App.tsx, index.css,
  index.html — the surrounding app is already done.
- Do NOT rename the expected file paths; data/wardrobe.ts and
  data/styles.ts already reference these exact names.
- If a single image fails its safety filter or comes back odd, regenerate
  just that one job (the script is idempotent — overwrites in place).
- Keep the STYLE LOCK block IDENTICAL across all calls so every asset
  reads as the same universe.

# Definition of done

- All 22 PNGs exist in public/ at the expected paths.
- npm run build succeeds.
- Opening localhost:3100 (npm run dev) shows illustrated icons in the
  wardrobe slots instead of the hatched "Rabo Teal" / "Dreads" text
  placeholders.
- Branch claude/repository-switch-dsmxg has the new commit pushed.
```

---

## Variações

- **Se o modelo gpt-image-1 não estiver liberado** na conta da Codex,
  trocar `model: 'gpt-image-1'` por `model: 'dall-e-3'` no script (e
  notar que a qualidade fica inferior).
- **Se quiser regenerar só um item**, editar o array `jobs` pra
  comentar todos os outros antes de rodar.
- **Se quiser usar Gemini** no lugar do OpenAI (já que o app usa Gemini
  em runtime de qualquer jeito): trocar o client por
  `@google/genai` com `gemini-2.5-flash-image`. O `PROMPTS.md` já está
  escrito assumindo Gemini, então fica natural.
