// Seam-fix loopable ambients + crew motifs.
// Technique: split file at midpoint, swap halves, acrossfade the join (500ms tri).
// Result: original START becomes new END, original END becomes new START. The
// resulting loop boundary is in the middle of original content (already
// continuous). The crossfade kills the click. Output is original_duration
// shortened by the crossfade window.
import { existsSync, mkdirSync, copyFileSync, renameSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public/audio');

// Files that loop and benefit from acrossfade smoothing.
// NOTE: crew motifs are now BPM-locked from gen-music.mjs (exact 8-bar duration);
// applying acrossfade-swap to them shifts the beat grid off — keep them out.
// Only atmospheric ambients (no musical grid) get the swap treatment.
const LOOPABLE = [
  'ambient/amb-boot-cold.mp3',
  'ambient/amb-title-pulse.mp3',
  'ambient/amb-city-signal.mp3',
  'ambient/amb-hq-room.mp3',
  'ambient/amb-locker-room.mp3',
  'ambient/amb-guided-attention.mp3',
];

const XFADE = 0.5; // seconds — half-second crossfade kills clicks but stays musical

function run(bin, args) {
  return execFileSync(bin, args, { encoding: 'utf8' }).trim();
}

function getDuration(path) {
  return Number(
    run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]),
  );
}

function fixOne(rel) {
  const full = resolve(PUBLIC, rel);
  if (!existsSync(full)) { console.log(`! missing: ${rel}`); return; }
  const dur = getDuration(full);
  if (!Number.isFinite(dur) || dur < 2) { console.log(`! too short: ${rel} (${dur}s)`); return; }
  const half = (dur / 2).toFixed(3);
  const backupDir = resolve(ROOT, 'public/audio/.unseamed');
  mkdirSync(backupDir, { recursive: true });
  const backup = resolve(backupDir, rel.replace(/\//g, '__'));
  const tmp = full + '.tmp.mp3';
  if (!existsSync(backup)) {
    copyFileSync(full, backup);
  } else {
    // Restore from backup so we don't double-seam-fix
    copyFileSync(backup, full);
  }
  const filter =
    `[0:a]atrim=0:${half},asetpts=PTS-STARTPTS[a];` +
    `[0:a]atrim=${half},asetpts=PTS-STARTPTS[b];` +
    `[b][a]acrossfade=d=${XFADE}:c1=tri:c2=tri`;
  run('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', full,
    '-filter_complex', filter,
    '-ar', '44100', '-b:a', '192k',
    tmp,
  ]);
  renameSync(tmp, full);
  const newDur = getDuration(full);
  console.log(`+ ${rel}  ${dur.toFixed(2)}s → ${newDur.toFixed(2)}s`);
}

for (const rel of LOOPABLE) {
  try { fixOne(rel); } catch (err) { console.error(`! ${rel}: ${err.message.split('\n')[0]}`); }
}
console.log('\nDONE. Originals backed up to public/audio/.unseamed/.');
