import type { RunHistoryStats, RunXpBreakdown } from './gamification';
import type { RunSnapshot } from '../services/runTracker';

interface ApplyInput {
  prior: RunHistoryStats;
  snapshot: RunSnapshot;
  breakdown: RunXpBreakdown;
  runWeekKey: string;
  priorWeekKey: string;
}

const isNightWindow = (startedAtMs: number): boolean => {
  const hour = new Date(startedAtMs).getHours();
  return hour >= 22 || hour < 4;
};

export const applyRunToHistory = ({
  prior,
  snapshot,
  breakdown,
  runWeekKey,
  priorWeekKey,
}: ApplyInput): RunHistoryStats => {
  const km = snapshot.totalMeters / 1000;
  const territoryKm = snapshot.metersInTerritory / 1000;
  const sameWeek = runWeekKey === priorWeekKey;
  const mergedSpots = Array.from(
    new Set([...prior.uniqueSpotsTouched, ...snapshot.touchedSpotIds]),
  );
  return {
    totalRuns: prior.totalRuns + 1,
    totalKm: prior.totalKm + km,
    kmThisWeek: sameWeek ? prior.kmThisWeek + km : km,
    nightRuns: prior.nightRuns + (isNightWindow(snapshot.startedAt) ? 1 : 0),
    invasionsSucceeded: prior.invasionsSucceeded + (breakdown.invasionMult > 1 ? 1 : 0),
    uniqueSpotsTouched: mergedSpots,
    captainWeeks: prior.captainWeeks,
    weeklyTopThreeCount: prior.weeklyTopThreeCount,
    soloTerritoryKm: prior.soloTerritoryKm + territoryKm,
  };
};
