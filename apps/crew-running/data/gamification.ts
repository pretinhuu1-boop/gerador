import type { SpZoneId } from './spLiveMap';

export type BadgeId =
  | 'first-blood'
  | 'night-owl'
  | 'invader'
  | 'cartographer'
  | 'urban-marathon'
  | 'local-legend'
  | 'streak-12'
  | 'solo-wolf'
  | 'pace-setter'
  | 'season-captain';

export type MissionType = 'spot-hunt' | 'invasion' | 'crew-pinned' | 'night-drift' | 'heritage';

export interface BadgeDef {
  id: BadgeId;
  name: string;
  hint: string;
}

export interface MissionDef {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  rewardXp: number;
  windowHours: number;
  zoneId?: SpZoneId;
  spotIds?: string[];
}

export interface RunnerProgress {
  xp: number;
  level: number;
  streakWeeks: number;
  lastRunAt: number;
  freezesAvailable: number;
  inkPerZone: Partial<Record<SpZoneId, number>>;
  inkUpdatedAt: number;
  badgeUnlocks: BadgeId[];
  patchesOwned: string[];
  weekKey: string;
  runsThisWeek: number;
}

// Returns ISO week key like "2026-W22" anchored to the LOCAL calendar day. We
// read getFullYear/getMonth/getDate from the local Date and rebuild as UTC at
// noon so DST shifts can't bump the day boundary in either direction.
export const isoWeekKey = (date: Date): string => {
  // Anchor both endpoints to UTC noon so DST shifts can't move the calendar
  // day and the diff stays an integer number of days.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1, 12));
  const days = Math.round((d.getTime() - yearStart.getTime()) / 86400000);
  const week = Math.floor(days / 7) + 1;
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

// Resolves an ISO-week string ("YYYY-Www") to the UTC date of that week's
// Thursday. Thursday is the ISO week anchor (week 1 = the one containing the
// first Thursday of the year). Returns null on malformed input.
const isoWeekKeyToThursday = (key: string): Date | null => {
  const match = /^(\d{4})-W(\d{2})$/.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  // Jan 4 is always in ISO week 1. Find that week's Monday, add (week-1)*7
  // days, then shift to Thursday (+3).
  const jan4 = new Date(Date.UTC(year, 0, 4, 12));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Mon = new Date(jan4);
  week1Mon.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const thursday = new Date(week1Mon);
  thursday.setUTCDate(week1Mon.getUTCDate() + (week - 1) * 7 + 3);
  return thursday;
};

// Diff in whole ISO weeks between two week keys. Crosses year boundaries
// correctly because we anchor each side to its Thursday in real ms.
const weeksBetween = (a: string, b: string): number => {
  if (a === b) return 0;
  const da = isoWeekKeyToThursday(a);
  const db = isoWeekKeyToThursday(b);
  if (!da || !db) return Number.NaN;
  return Math.round((db.getTime() - da.getTime()) / (7 * 86400000));
};

export interface StreakBumpResult {
  next: RunnerProgress;
  streakBumped: boolean;
  streakBroken: boolean;
  freezeUsed: boolean;
}

// Pure helper. Decides what the run completion does to the streak counters.
// Rules: 3 runs within the same ISO week maintain streak. If the new run falls
// in a different week from the stored weekKey and the previous week did NOT
// hit 3 runs, consume a freeze; if no freeze, reset streak.
export const bumpStreak = (progress: RunnerProgress, now: Date): StreakBumpResult => {
  const week = isoWeekKey(now);
  if (!progress.weekKey) {
    return {
      next: { ...progress, weekKey: week, runsThisWeek: 1, lastRunAt: now.getTime() },
      streakBumped: false,
      streakBroken: false,
      freezeUsed: false,
    };
  }
  if (week === progress.weekKey) {
    const runs = progress.runsThisWeek + 1;
    const reachedQuota = runs === STREAK_RUNS_REQUIRED && progress.runsThisWeek < STREAK_RUNS_REQUIRED;
    return {
      next: {
        ...progress,
        runsThisWeek: runs,
        lastRunAt: now.getTime(),
        streakWeeks: reachedQuota ? progress.streakWeeks + 1 : progress.streakWeeks,
      },
      streakBumped: reachedQuota,
      streakBroken: false,
      freezeUsed: false,
    };
  }
  // Different week. Evaluate gap.
  const gap = weeksBetween(progress.weekKey, week);
  const previousWeekHitQuota = progress.runsThisWeek >= STREAK_RUNS_REQUIRED;
  if (gap === 1 && previousWeekHitQuota) {
    return {
      next: {
        ...progress,
        weekKey: week,
        runsThisWeek: 1,
        lastRunAt: now.getTime(),
      },
      streakBumped: false,
      streakBroken: false,
      freezeUsed: false,
    };
  }
  if (progress.freezesAvailable > 0) {
    return {
      next: {
        ...progress,
        weekKey: week,
        runsThisWeek: 1,
        lastRunAt: now.getTime(),
        freezesAvailable: progress.freezesAvailable - 1,
      },
      streakBumped: false,
      streakBroken: false,
      freezeUsed: true,
    };
  }
  return {
    next: {
      ...progress,
      weekKey: week,
      runsThisWeek: 1,
      streakWeeks: 0,
      lastRunAt: now.getTime(),
    },
    streakBumped: false,
    streakBroken: true,
    freezeUsed: false,
  };
};

export const XP_BASE_PER_KM = 10;
export const XP_TERRITORY_MULT = 2;
export const XP_SPOT_BONUS = 15;
export const XP_LOOP_MULT = 1.5;
export const XP_INVASION_MULT = 1.5;
// Ink scale: 1 km of XP_BASE_PER_KM worth of in-territory running = 10 ink.
// Combined with INK_PER_FULL_OWNERSHIP (1000), this means ~100km of dedicated
// in-territory running takes a single runner to full ownership.
export const INK_PER_KM = 10;

export const STREAK_RUNS_REQUIRED = 3;
export const STREAK_BREAK_PENALTY = 0.8;
export const INK_DECAY_PER_DAY = 0.033;
export const INK_OWNERSHIP_OWNED = 0.6;
export const INK_OWNERSHIP_CONTESTED = 0.4;
// Ink scale conversion: this many points of accumulated "ink" in a zone equals
// 100% ownership for one runner. Picked so a few committed weeks of in-territory
// running visibly tilt the heatmap without being trivial to max out.
export const INK_PER_FULL_OWNERSHIP = 1000;

export const xpRequiredForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.round(100 * Math.pow(level - 1, 1.6));
};

export const xpToLevel = (xp: number): number => {
  if (xp <= 0) return 1;
  let level = 1;
  while (xpRequiredForLevel(level + 1) <= xp) level++;
  return level;
};

export const xpProgressInLevel = (xp: number): { current: number; needed: number; pct: number } => {
  const level = xpToLevel(xp);
  const base = xpRequiredForLevel(level);
  const next = xpRequiredForLevel(level + 1);
  const current = xp - base;
  const needed = next - base;
  return { current, needed, pct: needed > 0 ? Math.min(1, current / needed) : 0 };
};

export type TerritoryStatus = 'owned' | 'contested' | 'neutral';

export const territoryStatus = (ownership: number): TerritoryStatus => {
  if (ownership >= INK_OWNERSHIP_OWNED) return 'owned';
  if (ownership >= INK_OWNERSHIP_CONTESTED) return 'contested';
  return 'neutral';
};

export const decayInk = (ink: number, daysSince: number): number => {
  if (daysSince <= 0) return ink;
  const factor = Math.pow(1 - INK_DECAY_PER_DAY, daysSince);
  return Math.max(0, ink * factor);
};

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'first-blood', name: 'Primeira Sangue', hint: 'Sua primeira corrida.' },
  { id: 'night-owl', name: 'Madrugador', hint: '10 corridas entre 22h e 04h.' },
  { id: 'invader', name: 'Invasor', hint: '5 invasões bem-sucedidas.' },
  { id: 'cartographer', name: 'Cartógrafo', hint: 'Toque todos os 11 spots.' },
  { id: 'urban-marathon', name: 'Maratona Urbana', hint: '42km numa única semana.' },
  { id: 'local-legend', name: 'Local Legend', hint: 'Captain de zone por 4 semanas seguidas.' },
  { id: 'streak-12', name: 'Streak 12', hint: '12 semanas mantendo o streak.' },
  { id: 'solo-wolf', name: 'Solo Wolf', hint: '50km solo no próprio território.' },
  { id: 'pace-setter', name: 'Pace Setter', hint: '5x top-3 da crew na semana.' },
  { id: 'season-captain', name: 'Season Captain', hint: 'Top 10 individuais ao final da temporada.' },
];

export const SAMPLE_MISSIONS: MissionDef[] = [
  {
    id: 'm-spot-hunt-centro',
    type: 'spot-hunt',
    title: 'Spot Hunt Centro',
    description: 'Toque Vale, República e Luz em 48h.',
    rewardXp: 200,
    windowHours: 48,
    zoneId: 'centro',
    spotIds: ['spot-vale', 'spot-republica', 'spot-luz'],
  },
  {
    id: 'm-night-drift-weekly',
    type: 'night-drift',
    title: 'Night Drift',
    description: '3km entre 22h e 04h.',
    rewardXp: 150,
    windowHours: 168,
  },
  {
    id: 'm-invasion-leste',
    type: 'invasion',
    title: 'Invasão Leste',
    description: '5km na zona East Burners.',
    rewardXp: 300,
    windowHours: 24,
    zoneId: 'leste',
  },
];

export interface RunXpInput {
  distanceKm: number;
  kmInTerritory: number;
  spotsTouched: number;
  closedLoop: boolean;
  isInvasion: boolean;
}

export interface RunXpBreakdown {
  baseXp: number;
  territoryXp: number;
  spotXp: number;
  loopMult: number;
  invasionMult: number;
  total: number;
}

// Clamps each field to a sane range. Negative distance is impossible; territory
// km cannot exceed total km; spot count cannot be negative. Silent clamp (vs
// throwing) keeps GPS noise from breaking a run summary.
export const sanitizeRunXpInput = (raw: RunXpInput): RunXpInput => {
  const distanceKm = Math.max(0, raw.distanceKm);
  const kmInTerritory = Math.min(Math.max(0, raw.kmInTerritory), distanceKm);
  const spotsTouched = Math.max(0, Math.floor(raw.spotsTouched));
  return {
    distanceKm,
    kmInTerritory,
    spotsTouched,
    closedLoop: Boolean(raw.closedLoop),
    isInvasion: Boolean(raw.isInvasion),
  };
};

export const breakdownRunXp = (raw: RunXpInput): RunXpBreakdown => {
  const params = sanitizeRunXpInput(raw);
  const baseKm = params.distanceKm - params.kmInTerritory;
  const baseXp = Math.round(baseKm * XP_BASE_PER_KM);
  const territoryXp = Math.round(params.kmInTerritory * XP_BASE_PER_KM * XP_TERRITORY_MULT);
  const spotXp = params.spotsTouched * XP_SPOT_BONUS;
  const loopMult = params.closedLoop ? XP_LOOP_MULT : 1;
  const invasionMult = params.isInvasion ? XP_INVASION_MULT : 1;
  const subtotal = baseXp + territoryXp + spotXp;
  return {
    baseXp,
    territoryXp,
    spotXp,
    loopMult,
    invasionMult,
    total: Math.round(subtotal * loopMult * invasionMult),
  };
};

export const computeRunXp = (raw: RunXpInput): number => breakdownRunXp(raw).total;

export interface RunHistoryStats {
  totalRuns: number;
  totalKm: number;
  kmThisWeek: number;
  nightRuns: number;
  invasionsSucceeded: number;
  uniqueSpotsTouched: string[];
  captainWeeks: number;
  weeklyTopThreeCount: number;
  soloTerritoryKm: number;
}

export const emptyRunHistoryStats = (): RunHistoryStats => ({
  totalRuns: 0,
  totalKm: 0,
  kmThisWeek: 0,
  nightRuns: 0,
  invasionsSucceeded: 0,
  uniqueSpotsTouched: [],
  captainWeeks: 0,
  weeklyTopThreeCount: 0,
  soloTerritoryKm: 0,
});
