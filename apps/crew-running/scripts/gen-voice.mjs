// Phase D v2 — 12 PT-BR voice lines via Eleven v3 (latest expressive model).
// Uses inline audio tags ([pausa] [sussurra] [calmo] [empolgado] [sorri] [respira])
// and lower stability + higher style for humanized delivery.
// FORCE=1 (default) overwrites existing files. Set FORCE=0 to skip existing.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const KEY = readFileSync(resolve(ROOT, '.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) { console.error('ELEVENLABS_API_KEY missing'); process.exit(1); }

const FORCE = process.env.FORCE !== '0';

const VOICES = {
  system_fem_warm: 'x3mAOLD9WzlmrFCwA1S3',       // Evelin Perdomo
  leader_fem_downtown: 'lRbfoJL2IRJBT7ma6o7n',   // Rita
  leader_mas_north: 'xNGAXaCH8MaasNuo7Hr7',      // Beto
  leader_mas_east: 'hwnuNyWkl9DjdTFykrN6',       // Adriano-Narrador
  leader_fem_south_west: '33B4UnXyTNbgLmdEDh5P', // Keren
};

// [relativePath, voiceKey, text (with v3 audio tags), stability, style]
const LINES = [
  ['voice/boot/voice-boot-sinal-ativo.mp3', 'system_fem_warm',
    '[calmo] Sinal... ativo.', 0.3, 0.55],
  ['voice/boot/voice-boot-cidade-ouviu.mp3', 'system_fem_warm',
    '[respira] A cidade... ouviu teu sinal.', 0.3, 0.6],
  ['voice/guided/voice-guided-step-0.mp3', 'system_fem_warm',
    '[calmo] Checkpoint um. [pausa] A cidade ouviu teu sinal. O mapa acende por presença coletiva. [pausa breve] Chega perto, respira... e escolhe teu lugar.', 0.3, 0.55],
  ['voice/guided/voice-guided-step-1.mp3', 'system_fem_warm',
    '[calmo] Checkpoint dois. [pausa] Crew veste o mapa. Cada zona tem cor, patch e missão leve. [pausa breve] Primeiro vem identidade, depois vem rua.', 0.3, 0.55],
  ['voice/guided/voice-guided-step-2.mp3', 'system_fem_warm',
    '[sussurra] Checkpoint três. [pausa] Teu caminho... fica teu. A crew recebe pulso coletivo. [pausa breve] O sinal não abre teu caminho individual.', 0.3, 0.6],
  ['voice/guided/voice-guided-step-3.mp3', 'system_fem_warm',
    '[calmo] Checkpoint quatro. [pausa] Monte teu runner. Foto do rosto, perfil e equipamento... viram tua primeira marca na cidade.', 0.3, 0.55],
  ['voice/guided/voice-crew-downtown-rush.mp3', 'leader_fem_downtown',
    '[empolgado] Avenida-pulso... acesa no centro!', 0.3, 0.7],
  ['voice/guided/voice-crew-north-breakers.mp3', 'leader_mas_north',
    '[empolgado] Subida... quebrando a rotina.', 0.3, 0.65],
  ['voice/guided/voice-crew-south-striders.mp3', 'leader_fem_south_west',
    '[calmo] Curva longa... ritmo constante.', 0.35, 0.55],
  ['voice/guided/voice-crew-east-burners.mp3', 'leader_mas_east',
    '[calmo] Heat-route... abrindo o bairro.', 0.3, 0.6],
  ['voice/guided/voice-crew-west-flow.mp3', 'leader_fem_south_west',
    '[calmo] Linha fluida... atravessando o mapa.', 0.35, 0.55],
  ['voice/saved/voice-saved-cidade-pronta.mp3', 'system_fem_warm',
    '[sorri] Tua cidade ouviu. [pausa breve] Pronta... quando você for.', 0.3, 0.6],
];

async function genOne(relPath, voiceKey, text, stability, style) {
  const outPath = resolve(ROOT, 'public/audio', relPath);
  mkdirSync(dirname(outPath), { recursive: true });
  if (!FORCE && existsSync(outPath)) { console.log(`= ${relPath} (skip)`); return { skipped: true }; }
  const voiceId = VOICES[voiceKey];
  if (!voiceId) throw new Error(`unknown voice key ${voiceKey}`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: 'eleven_v3',
      voice_settings: {
        stability,
        similarity_boost: 0.8,
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
console.log(`\nDONE. ${count} generated (Eleven v3), ${skipped} skipped.`);
