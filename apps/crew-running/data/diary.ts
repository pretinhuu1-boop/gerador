import type { SpZoneId } from './spLiveMap';
import type { RunSnapshot } from '../services/runTracker';

export const DIARY_MAX_ENTRIES = 100;
export const DIARY_NOTE_MAX_LENGTH = 280;

export type DiaryMood = 'fire' | 'chill' | 'grind' | 'pain';

export const DIARY_MOODS: readonly DiaryMood[] = ['fire', 'chill', 'grind', 'pain'] as const;

export const MOOD_LABELS: Record<DiaryMood, string> = {
  fire: '🔥 Fogo',
  chill: '😎 Suave',
  grind: '💪 Ralou',
  pain: '😤 Sofrido',
};

export interface DiaryEntry {
  id: string;
  createdAt: number;
  distanceKm: number;
  durationMs: number;
  crewSlug?: string;
  zoneId?: SpZoneId;
  spotsVisited: string[];
  xpEarned: number;
  missionsCompleted: string[];
  note?: string;
  mood?: DiaryMood;
}

export const buildDiaryEntry = (opts: {
  snapshot: RunSnapshot;
  xpEarned: number;
  missionsCompleted: string[];
  note?: string;
  mood?: DiaryMood;
}): DiaryEntry => {
  const entry: DiaryEntry = {
    id: crypto.randomUUID?.() ?? `diary-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    distanceKm: opts.snapshot.totalMeters / 1000,
    durationMs: opts.snapshot.elapsedMs,
    crewSlug: opts.snapshot.crewSlug,
    zoneId: opts.snapshot.homeZoneId,
    spotsVisited: [...opts.snapshot.touchedSpotIds],
    xpEarned: opts.xpEarned,
    missionsCompleted: [...opts.missionsCompleted],
  };
  if (opts.note) entry.note = sanitizeDiaryNote(opts.note);
  if (opts.mood && isDiaryMood(opts.mood)) entry.mood = opts.mood;
  return entry;
};

export const isDiaryMood = (v: unknown): v is DiaryMood =>
  typeof v === 'string' && (DIARY_MOODS as readonly string[]).includes(v);

export const sanitizeDiaryNote = (text: string): string =>
  text.trim().slice(0, DIARY_NOTE_MAX_LENGTH);

export const isDiaryEntry = (v: unknown): v is DiaryEntry => {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.createdAt === 'number' &&
    typeof o.distanceKm === 'number' &&
    typeof o.durationMs === 'number' &&
    typeof o.xpEarned === 'number' &&
    Array.isArray(o.spotsVisited) &&
    o.spotsVisited.every((s: unknown) => typeof s === 'string') &&
    Array.isArray(o.missionsCompleted) &&
    o.missionsCompleted.every((s: unknown) => typeof s === 'string') &&
    (o.note === undefined || typeof o.note === 'string') &&
    (o.mood === undefined || isDiaryMood(o.mood)) &&
    (o.crewSlug === undefined || typeof o.crewSlug === 'string') &&
    (o.zoneId === undefined || typeof o.zoneId === 'string')
  );
};
