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

const CONDITIONS: Record<BadgeId, Condition> = {
  'first-blood': ({ history }) => history.totalRuns === 0,
  'night-owl': () => false,
  invader: () => false,
  cartographer: () => false,
  'urban-marathon': () => false,
  'local-legend': () => false,
  'streak-12': () => false,
  'solo-wolf': () => false,
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
