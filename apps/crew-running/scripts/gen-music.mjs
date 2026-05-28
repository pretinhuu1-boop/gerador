// Phase C — 5 crew motifs (Music API, 8s) + 5 runner-type stingers (SFX API, 1.5-2s).
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const KEY = readFileSync(resolve(ROOT, '.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) { console.error('ELEVENLABS_API_KEY missing'); process.exit(1); }

const CREW_OUT = resolve(ROOT, 'public/audio/music/crew');
const RT_OUT = resolve(ROOT, 'public/audio/music/runner-type');
mkdirSync(CREW_OUT, { recursive: true });
mkdirSync(RT_OUT, { recursive: true });

const CREW_MOTIFS = [
  ['mus-crew-downtown-rush.mp3', 8000,
    'An 8-second loopable São Paulo baile funk instrumental at 130 BPM in F minor. Heavy tamborzão kick on every beat, sharp clap on 2 and 4, distant whistle texture, slight vinyl crackle. Energy of rush hour downtown São Paulo at dusk — urgent but controlled. Bass mono below 80 Hz, wide stereo above. NO vocals, NO melody on top, NO synthesizer leads. Pure percussion + low bass + texture. Loop-perfect.'],
  ['mus-crew-north-breakers.mp3', 8000,
    'An 8-second loopable broken drum and bass instrumental at 168 BPM in A minor. Chopped Amen-style break beat, sub bass pulse, jungle texture but minimal — no melody, no synth leads, no pads. Slight tape hiss. Energy of breaking a hill climb at dawn. NO vocals. Stereo wide drums, mono sub. Loop-perfect transitions.'],
  ['mus-crew-south-striders.mp3', 8000,
    'An 8-second loopable deep house instrumental at 122 BPM in C minor. Slow steady four-on-the-floor kick, dry shaker on off-beats, soft sub bass pulse. Wet pavement reverb on the snare ghosts. NO synth lead, NO chord stab, NO vocal. Pure rhythm bed. Mood: long curved street at 6am, steady pace, no rush. Mono sub, stereo percussion. Loop-perfect.'],
  ['mus-crew-east-burners.mp3', 8000,
    'An 8-second loopable boom-bap hip-hop instrumental at 90 BPM in E minor. Crisp kick on 1 and 3, snappy snare on 2 and 4, vinyl crackle throughout, soft hi-hat triplets. Sub bass slow pulse. NO sample loop with melody, NO vocal, NO horn. Just drums and texture. Mood: street block warming up at noon, confident, posted. Mono sub, stereo drums. Loop-perfect.'],
  ['mus-crew-west-flow.mp3', 8000,
    'An 8-second loopable lo-fi dub instrumental at 75 BPM in G minor. Relaxed kick with long delay tail, sparse snare with spring reverb, soft sub bass drone, dub-style stereo echoes. NO melody, NO chord, NO vocal. Mood: open avenue, evening, flow state, no friction. Mono sub, very wide stereo echoes. Loop-perfect — the dub echoes should resolve cleanly at the loop point.'],
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

async function genMotif(filename, lengthMs, prompt) {
  const outPath = resolve(CREW_OUT, filename);
  if (existsSync(outPath)) { console.log(`= ${filename} (skip)`); return { skipped: true }; }
  const res = await fetch('https://api.elevenlabs.io/v1/music/compose', {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ prompt, music_length_ms: lengthMs }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log(`+ ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
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
console.log('--- Crew motifs (Music API) ---');
for (const [fn, ms, p] of CREW_MOTIFS) {
  try { const r = await genMotif(fn, ms, p); r.skipped ? skipped++ : count++; }
  catch (err) { console.error(`! ${fn}: ${err.message}`); }
}
console.log('--- Runner-type stingers (SFX API) ---');
for (const [fn, dur, txt] of RUNNER_STINGERS) {
  try { const r = await genStinger(fn, dur, txt); r.skipped ? skipped++ : count++; }
  catch (err) { console.error(`! ${fn}: ${err.message}`); }
}
console.log(`\nDONE. ${count} generated, ${skipped} skipped.`);
