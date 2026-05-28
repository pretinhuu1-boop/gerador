// Phase D — 12 PT-BR voice lines via ElevenLabs Multilingual v2 TTS.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const KEY = readFileSync(resolve(ROOT, '.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) { console.error('ELEVENLABS_API_KEY missing'); process.exit(1); }

const VOICES = {
  system_fem_warm: 'x3mAOLD9WzlmrFCwA1S3',       // Evelin Perdomo - Smooth and Expressive
  leader_fem_downtown: 'lRbfoJL2IRJBT7ma6o7n',   // Rita - Youthful, Cheery, Vibrant
  leader_mas_north: 'xNGAXaCH8MaasNuo7Hr7',      // Beto - Friendly, Engaging, Energetic
  leader_mas_east: 'hwnuNyWkl9DjdTFykrN6',       // Adriano-Narrador
  leader_fem_south_west: '33B4UnXyTNbgLmdEDh5P', // Keren - Sweet, Vibrant, Rhythmic
};

// [relativePath, voiceKey, text, stability, style]
const LINES = [
  ['voice/boot/voice-boot-sinal-ativo.mp3', 'system_fem_warm', 'Sinal ativo.', 0.5, 0.2],
  ['voice/boot/voice-boot-cidade-ouviu.mp3', 'system_fem_warm', 'A cidade ouviu teu sinal.', 0.5, 0.2],
  ['voice/guided/voice-guided-step-0.mp3', 'system_fem_warm',
    'Checkpoint um. A cidade ouviu teu sinal. O mapa acende por presença coletiva. Chega perto, respira e escolhe teu lugar.', 0.5, 0.2],
  ['voice/guided/voice-guided-step-1.mp3', 'system_fem_warm',
    'Checkpoint dois. Crew veste o mapa. Cada zona tem cor, patch e missão leve. Primeiro vem identidade, depois vem rua.', 0.5, 0.2],
  ['voice/guided/voice-guided-step-2.mp3', 'system_fem_warm',
    'Checkpoint três. Teu caminho fica teu. A crew recebe pulso coletivo. O sinal não abre teu caminho individual.', 0.5, 0.2],
  ['voice/guided/voice-guided-step-3.mp3', 'system_fem_warm',
    'Checkpoint quatro. Monte teu runner. Foto do rosto, perfil e equipamento viram tua primeira marca na cidade.', 0.5, 0.2],
  ['voice/guided/voice-crew-downtown-rush.mp3', 'leader_fem_downtown', 'Avenida-pulso acesa no centro.', 0.4, 0.4],
  ['voice/guided/voice-crew-north-breakers.mp3', 'leader_mas_north', 'Subida quebrando a rotina.', 0.4, 0.4],
  ['voice/guided/voice-crew-south-striders.mp3', 'leader_fem_south_west', 'Curva longa, ritmo constante.', 0.4, 0.4],
  ['voice/guided/voice-crew-east-burners.mp3', 'leader_mas_east', 'Heat-route abrindo o bairro.', 0.4, 0.4],
  ['voice/guided/voice-crew-west-flow.mp3', 'leader_fem_south_west', 'Linha fluida atravessando o mapa.', 0.4, 0.4],
  ['voice/saved/voice-saved-cidade-pronta.mp3', 'system_fem_warm', 'Tua cidade ouviu. Pronta quando você for.', 0.5, 0.2],
];

async function genOne(relPath, voiceKey, text, stability, style) {
  const outPath = resolve(ROOT, 'public/audio', relPath);
  mkdirSync(dirname(outPath), { recursive: true });
  if (existsSync(outPath)) { console.log(`= ${relPath} (skip)`); return { skipped: true }; }
  const voiceId = VOICES[voiceKey];
  if (!voiceId) throw new Error(`unknown voice key ${voiceKey}`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability,
        similarity_boost: 0.85,
        style,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(outPath, buf);
  console.log(`+ ${relPath} (${(buf.length / 1024).toFixed(1)} KB)`);
  return { bytes: buf.length };
}

let count = 0, skipped = 0;
for (const [rel, vk, txt, st, sty] of LINES) {
  try { const r = await genOne(rel, vk, txt, st, sty); r.skipped ? skipped++ : count++; }
  catch (err) { console.error(`! ${rel}: ${err.message}`); }
}
console.log(`\nDONE. ${count} generated, ${skipped} skipped.`);
