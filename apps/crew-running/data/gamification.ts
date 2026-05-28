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
}

export const XP_BASE_PER_KM = 10;
export const XP_TERRITORY_MULT = 2;
export const XP_SPOT_BONUS = 15;
export const XP_LOOP_MULT = 1.5;
export const XP_INVASION_MULT = 1.5;

export const STREAK_RUNS_REQUIRED = 3;
export const STREAK_BREAK_PENALTY = 0.8;
export const INK_DECAY_PER_DAY = 0.033;
export const INK_OWNERSHIP_OWNED = 0.6;
export const INK_OWNERSHIP_CONTESTED = 0.4;

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
  { id: 'invader', name: 'Invasor', hint: '5 invasoes bem-sucedidas.' },
  { id: 'cartographer', name: 'Cartografo', hint: 'Toque todos os 11 spots.' },
  { id: 'urban-marathon', name: 'Maratona Urbana', hint: '42km numa unica semana.' },
  { id: 'local-legend', name: 'Local Legend', hint: 'Captain de zone por 4 semanas seguidas.' },
  { id: 'streak-12', name: 'Streak 12', hint: '12 semanas mantendo o streak.' },
  { id: 'solo-wolf', name: 'Solo Wolf', hint: '50km solo no proprio territorio.' },
  { id: 'pace-setter', name: 'Pace Setter', hint: '5x top-3 da crew na semana.' },
  { id: 'season-captain', name: 'Season Captain', hint: 'Top 10 individuais ao final da temporada.' },
];

export const SAMPLE_MISSIONS: MissionDef[] = [
  {
    id: 'm-spot-hunt-centro',
    type: 'spot-hunt',
    title: 'Spot Hunt Centro',
    description: 'Toque Vale, Republica e Luz em 48h.',
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
    title: 'Invasao Leste',
    description: '5km na zona East Burners.',
    rewardXp: 300,
    windowHours: 24,
    zoneId: 'leste',
  },
];

export const computeRunXp = (params: {
  distanceKm: number;
  kmInTerritory: number;
  spotsTouched: number;
  closedLoop: boolean;
  isInvasion: boolean;
}): number => {
  const base = params.distanceKm * XP_BASE_PER_KM;
  const territoryBonus = params.kmInTerritory * XP_BASE_PER_KM * (XP_TERRITORY_MULT - 1);
  const spotBonus = params.spotsTouched * XP_SPOT_BONUS;
  const subtotal = base + territoryBonus + spotBonus;
  const loopMult = params.closedLoop ? XP_LOOP_MULT : 1;
  const invasionMult = params.isInvasion ? XP_INVASION_MULT : 1;
  return Math.round(subtotal * loopMult * invasionMult);
};
