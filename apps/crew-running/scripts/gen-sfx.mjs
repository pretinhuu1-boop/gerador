// Phase A — generate 12 UI SFX via ElevenLabs sound-generation API.
// Reads ELEVENLABS_API_KEY from .env. Skips files already present (idempotent re-run).
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const envText = readFileSync(resolve(ROOT, '.env'), 'utf8');
const KEY = envText.match(/^ELEVENLABS_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) {
  console.error('ELEVENLABS_API_KEY missing from .env');
  process.exit(1);
}

const OUT = resolve(ROOT, 'public/audio/ui');
mkdirSync(OUT, { recursive: true });

// ElevenLabs SFX API min duration = 0.5s. All assets requested at 0.5s; ffmpeg trims to target later.
const SFX = [
  ['ui-tap.mp3', 0.5,
    'A single short, dry tap on textured cardboard at the very start, like a finger pressing a sticker against rough paper, then immediate silence. Tactile, NOT clean. Hint of paper grain. No musical pitch. No reverb. No tail.'],
  ['ui-tap-alt.mp3', 0.5,
    'A single finger flick against thick masking tape stuck to asphalt at the very start, then silence. Dry, short, organic. No metallic ring, no synthesizer. Hint of dust. No tail.'],
  ['ui-nav-slab.mp3', 0.5,
    'A single sliding of a heavy laminated card across a wet concrete surface, ending in a soft thud, then silence. Low-mid body around 200 Hz, mid friction around 1 kHz, no high sparkle. Sounds like a panel locking into place.'],
  ['ui-lock-on.mp3', 0.5,
    'A single vinyl sticker being firmly pressed and smoothed onto wet asphalt, with a faint mechanical click at the end like a buckle, then silence. Tactile, gritty, organic. Mid presence around 800 Hz, click transient 4 kHz. Street-textured, not clean.'],
  ['ui-randomize-roll.mp3', 0.5,
    'A single short rapid shuffle of small plastic tokens or buckles, ending in one decisive snap, then silence. Three to five tiny shuffles then a final clack. Mid frequencies dominant, no musical pitch, no whoosh.'],
  ['ui-photo-shutter.mp3', 0.5,
    'A single disposable film camera shutter, mechanical, slightly dampened as if held against a jacket, then silence. Crisp click in the middle, soft wind-up before. No digital camera beep. Slightly lo-fi, like a 1990s point-and-shoot.'],
  ['ui-remove-x.mp3', 0.5,
    'A single sticker being peeled off asphalt with a short crinkle, reversed energy, then silence. Starts with adhesive resistance then a soft release. Mid frequencies around 1.5 kHz, slight crackle. Feels like removal, not deletion.'],
  ['ui-equip-snap.mp3', 0.5,
    'A single heavier vinyl decal being slammed flat onto a metal locker, ending with a satisfying THUNK, then silence. Bigger body than a regular sticker (200 Hz weight), sharp slap transient at 2 kHz. Confident, final, equipment-locked-in feel.'],
  ['ui-stamp-save.mp3', 0.5,
    'A heavy rubber ink stamp slammed onto thick craft paper resting on concrete, with a faint paper crunch tail. Massive low-mid thump around 150 Hz, paper crinkle in the tail. Sounds official, weighty, ritual. No reverb, dry room.'],
  ['ui-error-buzz.mp3', 0.5,
    'A single short failed marker scribble on wet paper, like a pen ran out mid-stroke, then silence. Rough, scratchy, low-mid rasp around 400 Hz with high friction noise 4-6 kHz. NOT a digital error beep. Tactile failure.'],
  ['ui-skip-cut.mp3', 0.5,
    'A single piece of masking tape being ripped abruptly off a wall in one short motion, then silence. Dry, decisive, mid frequencies around 1.2 kHz, tail crackle 5 kHz. Tape rip energy. No music. No whoosh.'],
  ['ui-hover-tick.mp3', 0.5,
    'A single fingernail tick on rough cardboard, very quiet and very short at the very start, then silence. Almost subliminal. High-mid transient 3 kHz only, no body. Like a metronome subtick.'],
];

async function genOne(filename, durationSeconds, text) {
  const outPath = resolve(OUT, filename);
  if (existsSync(outPath)) {
    console.log(`= ${filename} (skip — exists)`);
    return { filename, skipped: true };
  }
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: {
      'xi-api-key': KEY,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      duration_seconds: durationSeconds,
      prompt_influence: 0.5,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 240)}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log(`+ ${filename} (${buf.length} bytes)`);
  return { filename, bytes: buf.length };
}

let totalBytes = 0;
let count = 0;
let skipped = 0;
for (const [filename, dur, text] of SFX) {
  try {
    const r = await genOne(filename, dur, text);
    if (r.skipped) skipped += 1;
    else {
      count += 1;
      totalBytes += r.bytes;
    }
  } catch (err) {
    console.error(`! ${filename} FAILED:`, err.message);
  }
}
console.log(`\nDONE. ${count} generated, ${skipped} skipped. ${(totalBytes / 1024).toFixed(1)} KB total.`);
