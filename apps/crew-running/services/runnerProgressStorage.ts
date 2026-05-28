// Persistence for the gamified runner profile (XP, streak, ink, badges).
// Kept in localStorage; nothing here is PII. Ink decay is applied lazily on
// read so a long absence does not require background work.
import { decayInk, xpToLevel, type RunnerProgress } from '../data/gamification';
import { canUseStorage } from './storageBase';

const KEY = 'crewRunnerProgress';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DEFAULT: RunnerProgress = {
  xp: 0,
  level: 1,
  streakWeeks: 0,
  lastRunAt: 0,
  freezesAvailable: 1,
  inkPerZone: {},
  inkUpdatedAt: Date.now(),
  badgeUnlocks: [],
  patchesOwned: [],
  weekKey: '',
  runsThisWeek: 0,
};

const isShape = (value: unknown): value is Partial<RunnerProgress> => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  const numericOrMissing = (k: string) => obj[k] === undefined || typeof obj[k] === 'number';
  return (
    numericOrMissing('xp') &&
    numericOrMissing('level') &&
    numericOrMissing('streakWeeks') &&
    numericOrMissing('lastRunAt') &&
    numericOrMissing('freezesAvailable') &&
    numericOrMissing('inkUpdatedAt') &&
    numericOrMissing('runsThisWeek') &&
    (obj.inkPerZone === undefined || typeof obj.inkPerZone === 'object') &&
    (obj.badgeUnlocks === undefined || Array.isArray(obj.badgeUnlocks)) &&
    (obj.patchesOwned === undefined || Array.isArray(obj.patchesOwned)) &&
    (obj.weekKey === undefined || typeof obj.weekKey === 'string')
  );
};

// Whitelist-pick: only known fields survive a parse round-trip, so an old
// schema version that wrote extra fields cannot leak forward into memory.
const pick = (parsed: Partial<RunnerProgress>): RunnerProgress => ({
  ...DEFAULT,
  xp: parsed.xp ?? DEFAULT.xp,
  level: parsed.level ?? DEFAULT.level,
  streakWeeks: parsed.streakWeeks ?? DEFAULT.streakWeeks,
  lastRunAt: parsed.lastRunAt ?? DEFAULT.lastRunAt,
  freezesAvailable: parsed.freezesAvailable ?? DEFAULT.freezesAvailable,
  inkPerZone: parsed.inkPerZone ?? DEFAULT.inkPerZone,
  inkUpdatedAt: parsed.inkUpdatedAt ?? DEFAULT.inkUpdatedAt,
  badgeUnlocks: parsed.badgeUnlocks ?? DEFAULT.badgeUnlocks,
  patchesOwned: parsed.patchesOwned ?? DEFAULT.patchesOwned,
  weekKey: parsed.weekKey ?? DEFAULT.weekKey,
  runsThisWeek: parsed.runsThisWeek ?? DEFAULT.runsThisWeek,
});

export const getRunnerProgress = (): RunnerProgress => {
  if (!canUseStorage()) return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as unknown;
    if (!isShape(parsed)) return DEFAULT;
    const merged = pick(parsed);
    const now = Date.now();
    const daysSince = (now - merged.inkUpdatedAt) / MS_PER_DAY;
    if (daysSince > 0.01) {
      const inkPerZone = { ...merged.inkPerZone };
      for (const key of Object.keys(inkPerZone) as Array<keyof typeof inkPerZone>) {
        const current = inkPerZone[key];
        if (typeof current === 'number') {
          inkPerZone[key] = decayInk(current, daysSince);
        }
      }
      merged.inkPerZone = inkPerZone;
      merged.inkUpdatedAt = now;
    }
    merged.level = xpToLevel(merged.xp);
    return merged;
  } catch {
    return DEFAULT;
  }
};

export const saveRunnerProgress = (progress: RunnerProgress): void => {
  if (!canUseStorage()) return;
  try {
    const normalized: RunnerProgress = { ...progress, level: xpToLevel(progress.xp) };
    window.localStorage.setItem(KEY, JSON.stringify(normalized));
  } catch {
    // Some browsers block storage in private or restricted contexts.
  }
};
