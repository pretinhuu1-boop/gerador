import {
  type BadgeId,
  type RunnerProgress,
  type RunHistoryStats,
  type RunXpBreakdown,
} from './gamification';
import type { RunSnapshot } from '../services/runTracker';

export interface BadgeEvalInput {
  progress: RunnerProgress;
  history: RunHistoryStats;
  snapshot: RunSnapshot;
  breakdown: RunXpBreakdown;
  now: Date;
}

type Condition = (input: BadgeEvalInput) => boolean;

const isNightWindow = (startedAtMs: number): boolean => {
  const hour = new Date(startedAtMs).getHours();
  return hour >= 22 || hour < 4;
};

const CONDITIONS: Record<BadgeId, Condition> = {
  'first-blood': ({ history }) => history.totalRuns === 0,
  'night-owl': ({ history, snapshot }) => {
    const counting = isNightWindow(snapshot.startedAt) ? 1 : 0;
    return history.nightRuns + counting >= 10;
  },
  invader: ({ history, breakdown }) => {
    const counting = breakdown.invasionMult > 1 ? 1 : 0;
    return history.invasionsSucceeded + counting >= 5;
  },
  cartographer: ({ history }) => history.uniqueSpotsTouched.length >= 11,
  'urban-marathon': ({ history }) => history.kmThisWeek >= 42,
  'local-legend': () => false,
  'streak-12': ({ progress }) => progress.streakWeeks >= 12,
  'solo-wolf': ({ history, snapshot }) => {
    const thisRunKm = snapshot.metersInTerritory / 1000;
    return history.soloTerritoryKm + thisRunKm >= 50;
  },
  'pace-setter': () => false,
  'season-captain': () => false,
};

export const evaluateBadgeUnlocks = (input: BadgeEvalInput): BadgeId[] => {
  const owned = new Set(input.progress.badgeUnlocks);
  const newly: BadgeId[] = [];
  (Object.keys(CONDITIONS) as BadgeId[]).forEach((id) => {
    if (owned.has(id)) return;
    if (CONDITIONS[id](input)) newly.push(id);
  });
  return newly;
};
