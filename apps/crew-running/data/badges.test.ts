import { describe, it, expect } from 'vitest';
import { evaluateBadgeUnlocks } from './badges';
import { emptyRunHistoryStats, breakdownRunXp, type RunnerProgress } from './gamification';
import type { RunSnapshot } from '../services/runTracker';

const baseProgress = (): RunnerProgress => ({
  xp: 0,
  level: 1,
  streakWeeks: 0,
  lastRunAt: 0,
  freezesAvailable: 0,
  inkPerZone: {},
  inkUpdatedAt: 0,
  badgeUnlocks: [],
  patchesOwned: [],
  weekKey: '',
  runsThisWeek: 0,
});

const baseSnapshot = (): RunSnapshot => ({
  state: 'idle',
  startedAt: 0,
  elapsedMs: 0,
  totalMeters: 0,
  metersInTerritory: 0,
  points: [],
  touchedSpotIds: [],
  closedLoop: false,
  permissionDenied: false,
});

describe('evaluateBadgeUnlocks — first-blood', () => {
  it('unlocks first-blood when history shows zero prior runs', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: emptyRunHistoryStats(),
      snapshot: { ...baseSnapshot(), totalMeters: 1500 },
      breakdown: breakdownRunXp({
        distanceKm: 1.5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('first-blood');
  });

  it('does not unlock first-blood when already unlocked', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: { ...baseProgress(), badgeUnlocks: ['first-blood'] },
      history: { ...emptyRunHistoryStats(), totalRuns: 5 },
      snapshot: { ...baseSnapshot(), totalMeters: 1500 },
      breakdown: breakdownRunXp({
        distanceKm: 1.5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).not.toContain('first-blood');
  });
});
