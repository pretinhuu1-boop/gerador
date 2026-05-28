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

describe('evaluateBadgeUnlocks — night-owl', () => {
  it('unlocks when nightRuns reaches 10 (counting this run if started between 22h-04h local)', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 9, nightRuns: 9 },
      snapshot: { ...baseSnapshot(), startedAt: new Date('2026-05-28T03:30:00').getTime() },
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T04:00:00'),
    });
    expect(unlocks).toContain('night-owl');
  });

  it('does not unlock when nightRuns < 10', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 5, nightRuns: 5 },
      snapshot: { ...baseSnapshot(), startedAt: new Date('2026-05-28T03:30:00').getTime() },
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T04:00:00'),
    });
    expect(unlocks).not.toContain('night-owl');
  });
});

describe('evaluateBadgeUnlocks — cartographer', () => {
  it('unlocks when uniqueSpotsTouched reaches 11', () => {
    const elevenIds = Array.from({ length: 11 }, (_, i) => `spot-${i}`);
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 1, uniqueSpotsTouched: elevenIds },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('cartographer');
  });
});

describe('evaluateBadgeUnlocks — urban-marathon', () => {
  it('unlocks when kmThisWeek reaches 42', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 4, kmThisWeek: 42.1 },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('urban-marathon');
  });

  it('does not unlock under 42km', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 4, kmThisWeek: 41.9 },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).not.toContain('urban-marathon');
  });
});
