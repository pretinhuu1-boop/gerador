// Phase C v2 — crew motifs at BPM-EXACT length (8 bars of 4/4 = 32 beats).
// Duration in ms = (60_000 / BPM) * 32. ffmpeg post-trim enforces exact length
// so AudioBufferSourceNode.loop=true produces a beat-perfect loop.
// FORCE=1 (default) overwrites. Set FORCE=0 to skip existing.
import { readFileSync, existsSync, mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const KEY = readFileSync(resolve(ROOT, '.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) { console.error('ELEVENLABS_API_KEY missing'); process.exit(1); }

const FORCE = process.env.FORCE !== '0';

const CREW_OUT = resolve(ROOT, 'public/audio/music/crew');
const RT_OUT = resolve(ROOT, 'public/audio/music/runner-type');
mkdirSync(CREW_OUT, { recursive: true });
mkdirSync(RT_OUT, { recursive: true });

const barsToMs = (bpm, bars = 8) => Math.round((60_000 / bpm) * 4 * bars);

// [filename, bpm, bars, prompt]
const CREW_MOTIFS = [
  ['mus-crew-downtown-rush.mp3', 130, 8,
    'A São Paulo baile funk drum bed in F minor. ' +
    'STRICT: exactly 8 bars of 4/4 at 130 BPM. ' +
    'Heavy tamborzão kick on every quarter note, sharp clap on beats 2 and 4 of each bar, distant whistle texture, slight vinyl crackle. ' +
    'The very first sample MUST be the downbeat (beat 1, bar 1) at full volume — NO intro silence, NO build-up, NO fade-in. ' +
    'The very last beat is the eighth-note before bar 9 beat 1 — NO outro fade, NO tail decay. ' +
    'When this file is concatenated with itself, the boundary must produce a continuous, on-grid kick pattern with zero gap. ' +
    'NO vocals, NO melodic lead, NO synthesizer pad. Pure percussion plus mono sub bass below 80 Hz.'],
  ['mus-crew-north-breakers.mp3', 168, 8,
    'A broken drum and bass instrumental in A minor. ' +
    'STRICT: exactly 8 bars of 4/4 at 168 BPM. ' +
    'Chopped Amen-style break, sub bass pulse, jungle texture, minimal — drums and bass only. ' +
    'The very first sample MUST be the downbeat at full velocity. NO intro silence, NO build-up. ' +
    'The last 16th-note ends exactly one 16th before the next downbeat. NO outro fade. ' +
    'Concatenating two copies must give a continuous, on-grid break. NO melody, NO synth pad, NO vocal.'],
  ['mus-crew-south-striders.mp3', 122, 8,
    'A deep house drum bed in C minor. ' +
    'STRICT: exactly 8 bars of 4/4 at 122 BPM. ' +
    'Four-on-the-floor kick on every beat, dry shaker on off-beats (the "and" of each beat), soft mono sub pulse following the kick. ' +
    'First sample = downbeat kick at full level. NO intro silence, NO fade-in. ' +
    'Last sample = the off-beat shaker right before bar 9 beat 1. NO outro fade. ' +
    'Two concatenated copies must sound like one continuous 16-bar bed. NO synth lead, NO chord, NO vocal.'],
  ['mus-crew-east-burners.mp3', 90, 8,
    'A boom-bap hip-hop drum bed in E minor. ' +
    'STRICT: exactly 8 bars of 4/4 at 90 BPM. ' +
    'Crisp kick on beats 1 and 3, snare on 2 and 4, swung hi-hat eighth-notes, vinyl crackle through entire bed, mono sub bass slow pulse. ' +
    'First sample = kick on bar 1 beat 1 at full level. NO intro, NO build. ' +
    'Last sample = the swung hi-hat right before bar 9 beat 1. NO outro fade. ' +
    'Concatenating two copies must read as one 16-bar continuous bed. NO sample loop with melody, NO vocal, NO horn stab.'],
  ['mus-crew-west-flow.mp3', 75, 8,
    'A lo-fi dub drum bed in G minor. ' +
    'STRICT: exactly 8 bars of 4/4 at 75 BPM. ' +
    'Relaxed kick with short delay, sparse snare with spring reverb tail that fully resolves within its own bar, soft sub bass drone, dub-style stereo echoes that loop on a 1-bar grid (NOT longer). ' +
    'First sample = downbeat kick. NO intro, NO fade-in. ' +
    'Last sample = the last 16th before bar 9 beat 1. ALL reverb and echo tails decay back to the bed level BEFORE the loop point — no audible delay carrying over the boundary. ' +
    'Concatenating two copies must sound like one continuous 16-bar bed with no echo discontinuity. NO melody, NO chord, NO vocal.'],
];

const RUNNER_STINGERS = [
  ['mus-rt-sprint.mp3', 1.5,
    'A single explosive kick drum hit at 50 Hz with an air-sucking inhale on top and a cymbal swell that gets cut off abruptly at the end. Aggressive, urgent, sprint-energy. NO melody, NO musical chord. Just kick, breath, cut. 1.2 seconds total then silence.'],
  ['mus-rt-long-run.mp3', 2.0,
    'Three steady kick drum hits at 110 BPM with a soft sub bass pulse continuing underneath, ending with a final soft tail. Sense of starting to move at sustainable pace. NO melody, NO chord. Just kicks plus sub. 1.6 seconds then silence.'],
  ['mus-rt-night-run.mp3', 2.0,
    'A cold reverb tail wash with a single distant sonar-like ping at the start, gradually decaying into silence. Eerie, confident, late-night quiet. NO melody. NO bright frequencies. Mid-to-low only.'],
  ['mus-rt-crew-pace.mp3', 1.5,
    'Two kick drum hits at 100 BPM with a sharp sticker snap layered on the second hit. Sense of collective lets-go energy. NO melody, NO chord. Just two kicks plus snap. 1.4 seconds then silence.'],
  ['mus-rt-urban-trail.mp3', 1.5,
    'A gravel crunch under a running shoe, immediately followed by a kick drum hit and a low rasp. Raw asphalt-and-dirt energy. NO melody, NO musical pitch. Pure texture plus kick. 1.5 seconds then silence.'],
];

async function genMotif(filename, bpm, bars, prompt) {
  const outPath = resolve(CREW_OUT, filename);
  if (!FORCE && existsSync(outPath)) { console.log(`= ${filename} (skip)`); return { skipped: true }; }
  const exactMs = barsToMs(bpm, bars);
  // Ask for slightly longer than target so we can trim to exact bar count.
  const requestMs = Math.max(10_000, exactMs + 1000);
  const res = await fetch('https://api.elevenlabs.io/v1/music/compose', {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ prompt, music_length_ms: requestMs }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const rawPath = outPath + '.raw.mp3';
  writeFileSync(rawPath, buf);
  // Trim to EXACT bar duration so AudioBufferSourceNode.loop = on-grid.
  const exactSec = (exactMs / 1000).toFixed(6);
  execFileSync('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', rawPath,
    '-t', exactSec,
    '-ar', '44100', '-b:a', '192k',
    outPath,
  ]);
  execFileSync('rm', [rawPath]);
  console.log(`+ ${filename} (${bpm} BPM × ${bars} bars = ${exactSec}s)`);
  return { bytes: buf.length };
}

async function genStinger(filename, dur, text) {
  const outPath = resolve(RT_OUT, filename);
  if (existsSync(outPath)) { console.log(`= ${filename} (skip)`); return { skipped: true }; }
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text, duration_seconds: Math.max(0.5, dur), prompt_influence: 0.5 }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log(`+ ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
  return { bytes: buf.length };
}

let count = 0, skipped = 0;
console.log('--- Crew motifs (Music API, BPM-locked) ---');
for (const [fn, bpm, bars, p] of CREW_MOTIFS) {
  try { const r = await genMotif(fn, bpm, bars, p); r.skipped ? skipped++ : count++; }
  catch (err) { console.error(`! ${fn}: ${err.message}`); }
}
console.log('--- Runner-type stingers (SFX API) ---');
for (const [fn, dur, txt] of RUNNER_STINGERS) {
  try { const r = await genStinger(fn, dur, txt); r.skipped ? skipped++ : count++; }
  catch (err) { console.error(`! ${fn}: ${err.message}`); }
}
console.log(`\nDONE. ${count} generated, ${skipped} skipped.`);
