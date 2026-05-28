// Phase B — 7 ambient beds via ElevenLabs Music API (/v1/music/compose).
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const KEY = readFileSync(resolve(ROOT, '.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) { console.error('ELEVENLABS_API_KEY missing'); process.exit(1); }

const OUT = resolve(ROOT, 'public/audio/ambient');
mkdirSync(OUT, { recursive: true });

const AMBIENTS = [
  ['amb-boot-cold.mp3', 30000,
    'A 30-second ambient field recording of a São Paulo underpass at 4am before rush hour begins. Distant low sub rumble from a parked truck, faint electrical hum, occasional signal burst like a transistor radio searching for a station. No melody. No instruments. No drums. Pure environmental atmosphere. Cold, gritty, ritualistic. Sub frequencies dominant around 50 Hz, sparse mid hiss around 2 kHz, no high frequencies above 8 kHz. Wide stereo ambience. Loop-friendly — the end should match the beginning.'],
  ['amb-title-pulse.mp3', 60000,
    'A 60-second slow ambient bed of a city street at night, with a soft heartbeat-like pulse every 2 seconds buried in the mix. Distant traffic three blocks away, faint light rain on canvas. No melody, no instruments. The pulse is felt more than heard. Frequencies: 50-80 Hz sub heartbeat, 200-400 Hz street body, gentle 3 kHz rain texture. Wide stereo. Loop-friendly start and end.'],
  ['amb-city-signal.mp3', 90000,
    'A 90-second expansive ambient bed of a city map coming alive. Background: distant traffic, faint church bell three kilometers away, soft wind. Foreground: five subtle sonar-like pings, each at different intervals and panned across stereo. The pings are organic, not digital — like dropping a small stone in a puddle, recorded close. Slow breathing pace, no rush. No melody, no instruments. The bed sits at very low volume; the pings sit slightly above. Loop-friendly.'],
  ['amb-hq-room.mp3', 60000,
    'A 60-second ambient bed of a small back room used as a crew clubhouse. Close textures: occasional rustle of a vinyl sticker being moved, faint zipper of a jacket, low refrigerator hum, distant city outside a closed window. Intimate, slightly enclosed feel. No melody, no instruments, no voices. Frequencies: 80 Hz room tone, mid 500 Hz body, occasional 2 kHz sticker friction. Wide stereo but close perspective. Loop-friendly.'],
  ['amb-locker-room.mp3', 90000,
    'A 90-second ambient bed of a locker room or training space. Soft echo around 400ms decay, faint metal locker clank in the distance every 15-20 seconds, slow water drip every 8 seconds, fabric shuffle as if someone is changing. No voices, no music. The space feels tactile and physical. Frequencies: 100 Hz body, 800 Hz metal resonance, gentle 4 kHz water drip. Stereo with mid emphasis. Loop-friendly.'],
  ['amb-guided-attention.mp3', 75000,
    'A 75-second very low ambient bed designed to sit underneath spoken voice. Very minimal — just a quiet room tone with occasional barely-audible distant traffic and a single soft sub pulse every 4 seconds. No melody, no instruments. Frequencies extremely contained: 60 Hz sub pulse, soft 300 Hz body, nothing above 6 kHz. Wide stereo but very dry, no reverb. Designed to duck under speech. Loop-friendly.'],
  ['amb-saved-stamp-wash.mp3', 10000,
    'A 10-second one-shot ambient swell. Starts quiet with a soft sub rumble at 50 Hz, then over 7 seconds opens up like a cinema theater curtain — adding gentle wide stereo wash, a hint of distant city pulse, soft rain texture. Ends at full presence then quick fade. No melody, no instruments. Feels like a door opening to the city. Frequencies build from sub through low-mid 200 Hz to gentle 5 kHz air.'],
];

async function genOne(filename, lengthMs, prompt) {
  const outPath = resolve(OUT, filename);
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

let count = 0, skipped = 0, totalKB = 0;
for (const [filename, lengthMs, prompt] of AMBIENTS) {
  try {
    const r = await genOne(filename, lengthMs, prompt);
    if (r.skipped) skipped += 1; else { count += 1; totalKB += r.bytes / 1024; }
  } catch (err) {
    console.error(`! ${filename} FAILED: ${err.message}`);
  }
}
console.log(`\nDONE. ${count} generated, ${skipped} skipped. ${totalKB.toFixed(1)} KB total.`);
