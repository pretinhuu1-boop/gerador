import OpenAI from 'openai';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

if (process.env.ALLOW_LEGACY_CREATOR_ASSET_GENERATOR !== 'true') {
  console.error([
    'This asset generator is legacy and does not match the current Runner Creator contract.',
    'Do not use it for the active creator: it still contains old hair/style asset jobs.',
    'Read vault/CREATOR_CONTRACT.md first.',
    'Set ALLOW_LEGACY_CREATOR_ASSET_GENERATOR=true only for historical asset recovery.',
  ].join('\n'));
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ROOT = path.resolve('public');

const EXPERT_STACK = `
EXPERT STACK:
Act as a senior mobile game art director, a street-running brand designer, a
graffiti lettering specialist, a comic character concept artist, and a UI
inventory icon artist. Prioritize product-ready game assets for a dark
runner-crew mobile app, not standalone poster art.
`.trim();

const STYLE_LOCK = `
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
`.trim();

const NEGATIVE_LOCK = `
NEGATIVE LOCK:
No cute kiddie mascot, no toy sticker pack, no bubbly proportions, no generic
cartoon, no photorealism, no 3D render, no glossy gradients, no neon cyberpunk,
no pastel palette, no oversized white sticker border, no clean corporate SaaS
UI, no random readable text except the exact requested brand words.
`.trim();

const jobs = [
  {
    name: 'logo',
    size: '1024x1024',
    outFiles: ['brand/logo.png'],
    slice: false,
    prompt: `Create a centered brand logo for "THE CREW RUNNING".

Composition:
- main words "THE CREW" in large distressed cream brush lettering, stacked,
  rough hand-painted edges, black drop shadow like a dark mobile game title
- smaller word "RUNNING" below in condensed athletic uppercase, safety orange,
  stamped/painted, slightly imperfect
- optional underline stroke under "CREW", rough chalk/paint texture
- very dark charcoal background with faint low-contrast graffiti marks and
  street-map lines, like a mobile game header texture
- no mascot, no crown, no cute icons, no extra slogans

Art direction:
This should feel like a premium dark sports-game logo painted on a gritty
runner-crew app screen. Strong readability at small UI sizes.`,
  },
  {
    name: 'splash',
    size: '1024x1536',
    outFiles: ['brand/splash.png'],
    slice: false,
    prompt: `Create a vertical mobile splash poster for "THE CREW RUNNING".

Subject:
- one full-body young adult urban runner, athletic build, confident but serious
- black/dark grey hoodie with rough cream "CREW" or "RUNNING" chest lettering
- backwards cap, dark sunglasses, orange bandana or hair accent, running shorts,
  black performance sneakers with worn white soles
- one hand holds a spray can down at the side; stance is grounded, not dancing,
  not cute
- proportions should match mature comic/mobile game character art, similar to a
  premium profile/customize game screen

Background:
- dark street-map grid covering the whole vertical frame
- faint graffiti scribbles and chalk scratches
- small orange flame marks near shoes, low-key
- optional map pin/running territory icon, very small
- large cream "THE CREW" at top and cream "MVP" near bottom, both distressed and
  readable

Do not make a toy-like mascot. Make it feel like a gritty game splash screen.`,
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
    prompt: `Create a 2x2 UI inventory icon sheet for hairstyle choices. Each
cell is a dark square customization tile like a gritty mobile game equipment
menu. Thin charcoal separators, no text labels.

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
serious confident face.`,
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
    prompt: `Create a 2x2 UI inventory icon sheet for upper-body wardrobe
choices. Each cell is a dark square customization tile like a gritty mobile
game equipment menu. Thin charcoal separators, no text labels.

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
the chest, athletic cut, dark side panels.`,
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
    prompt: `Create a 2x2 UI inventory icon sheet for lower-body wardrobe
choices. Each cell is a dark square customization tile. Thin charcoal
separators, no text labels.

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
minimal athletic design.`,
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
    prompt: `Create a 2x2 UI inventory icon sheet for running shoes. Each cell
is a dark square customization tile. Thin charcoal separators, no text labels.

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
dark tactical runner feel.`,
  },
  {
    name: 'accessory',
    size: '1024x1024',
    outFiles: [
      'wardrobe/accessory/acc_reflective_armband.png',
      'wardrobe/accessory/acc_hydration_belt.png',
      'wardrobe/accessory/acc_crossbody_pack.png',
      'wardrobe/accessory/acc_blank_bib.png',
    ],
    slice: true,
    prompt: `Create a 2x2 UI inventory icon sheet for running accessories. Each
cell is a dark square customization tile like a gritty mobile game equipment
menu. Thin charcoal separators, no text labels, no numbers, no readable
characters anywhere on any item.

Global tile treatment:
- single accessory item per cell, floating centered, ghost-mannequin style
- no head, no hands, no full body, no legs, no shoes
- dark tile background with faint scratches, graffiti scribbles and paper grain
- mature sports-comic rendering, bold black ink shadows, screen-print grain
- worn fabric and rubber textures, small cream highlights only where needed
- restrained safety orange and muted teal accents matching the crew palette

TOP-LEFT:
Single reflective runner armband. A curved cylindrical strap with a thin
horizontal reflective silver stripe across the middle, matte black fabric
body, slight curve as if wrapped around an invisible upper arm, small velcro
closure detail. No arm, no skin, no body.

TOP-RIGHT:
Compact runner hydration belt. A closed adjustable waistband loop with two
small soft-flask pockets at the front, muted teal trim accents, matte black
nylon body, thin buckle. Shown front-facing as if wrapped around an invisible
waist. No torso, no skin, no body.

BOTTOM-LEFT:
Slim crossbody sling pouch. A small low-profile rectangular runner pouch with
a single thin diagonal strap forming an empty loop above it, matte charcoal
fabric, safety orange zipper pull, subtle worn texture. No body, no shoulder,
no chest.

BOTTOM-RIGHT:
Blank race bib. A slightly creased rectangular off-white paper-fabric race bib
floating flat, four small safety pins in the corners, completely blank front
with NO numbers, NO letters, NO logos, NO sponsor text, NO signage, just a
worn empty surface with subtle paper grain.`,
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
    prompt: `Create a 2x2 style preview sheet. Each cell shows the SAME adult
street runner character as a 3/4 bust on a dark mobile game tile background.
Same pose and wardrobe in all four cells: warm brown skin, dark teal ponytail,
dark hoodie with orange runner accent. No text labels.

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
Thicker outlines, flatter colors, serious confident expression.`,
  },
  {
    name: 'texture',
    size: '1024x1024',
    outFiles: ['textures/board.png'],
    slice: false,
    prompt: `Create a seamless tileable 1024x1024 dark mobile game background
texture.

Texture:
- matte black/deep charcoal base
- subtle chalk dust, paper grain, scratched scuffs, grime
- faint low-opacity graffiti scribbles in darker grey, barely readable
- thin grey street-map linework, irregular city blocks, no focal point
- a few extremely subtle muted teal/orange marks, no bright decoration
- no words, no icons, no characters

It must work behind UI cards without stealing attention.`,
  },
];

async function ensureDir(p) {
  await fs.mkdir(path.dirname(p), { recursive: true });
}

async function generate(job) {
  console.log(`-> ${job.name}`);
  const res = await client.images.generate({
    model: 'gpt-image-1',
    prompt: `${EXPERT_STACK}\n\n${STYLE_LOCK}\n\n${NEGATIVE_LOCK}\n\n${job.prompt}`,
    size: job.size,
    n: 1,
  });
  const b64 = res.data[0].b64_json;
  const buf = Buffer.from(b64, 'base64');

  if (!job.slice) {
    const out = path.join(ROOT, job.outFiles[0]);
    await ensureDir(out);
    await fs.writeFile(out, buf);
    console.log(`   ok ${job.outFiles[0]}`);
    return;
  }

  const meta = await sharp(buf).metadata();
  const w = Math.floor(meta.width / 2);
  const h = Math.floor(meta.height / 2);
  const cells = [
    { left: 0, top: 0 },
    { left: w, top: 0 },
    { left: 0, top: h },
    { left: w, top: h },
  ];

  for (let i = 0; i < 4; i++) {
    const out = path.join(ROOT, job.outFiles[i]);
    await ensureDir(out);
    await sharp(buf)
      .extract({ width: w, height: h, ...cells[i] })
      .png()
      .toFile(out);
    console.log(`   ok ${job.outFiles[i]}`);
  }
}

let failures = 0;
for (const job of jobs) {
  try {
    await generate(job);
  } catch (e) {
    failures++;
    console.error(`   FAIL ${job.name}: ${e.message}`);
  }
}

if (failures > 0) {
  console.error(`done with ${failures} failure(s)`);
  process.exit(1);
}

console.log('done');
