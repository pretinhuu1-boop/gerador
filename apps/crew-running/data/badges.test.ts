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

  it('unlocks on the run that crosses the 11-spot threshold', () => {
    const tenIds = Array.from({ length: 10 }, (_, i) => `spot-${i}`);
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 5, uniqueSpotsTouched: tenIds },
      snapshot: { ...baseSnapshot(), touchedSpotIds: ['spot-fresh'] },
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 1,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('cartographer');
  });

  it('does not double-count when the touched spot is already in history', () => {
    const tenIds = Array.from({ length: 10 }, (_, i) => `spot-${i}`);
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 5, uniqueSpotsTouched: tenIds },
      snapshot: { ...baseSnapshot(), touchedSpotIds: ['spot-0'] },
      breakdown: breakdownRunXp({
        distanceKm: 1,
        kmInTerritory: 0,
        spotsTouched: 1,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).not.toContain('cartographer');
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

  it('does not unlock under 42km combined', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 4, kmThisWeek: 35 },
      snapshot: { ...baseSnapshot(), totalMeters: 6900 },
      breakdown: breakdownRunXp({
        distanceKm: 6.9,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).not.toContain('urban-marathon');
  });

  it('unlocks on the run that crosses 42km combined', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 4, kmThisWeek: 37 },
      snapshot: { ...baseSnapshot(), totalMeters: 5000 },
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('urban-marathon');
  });
});

describe('evaluateBadgeUnlocks — invader', () => {
  it('unlocks when invasionsSucceeded + this-run-invasion reaches 5', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 8, invasionsSucceeded: 4 },
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 5,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: true,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('invader');
  });
});

describe('evaluateBadgeUnlocks — streak-12', () => {
  it('unlocks when streakWeeks reaches 12', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: { ...baseProgress(), streakWeeks: 12 },
      history: { ...emptyRunHistoryStats(), totalRuns: 50 },
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
    expect(unlocks).toContain('streak-12');
  });
});

describe('evaluateBadgeUnlocks — solo-wolf', () => {
  it('unlocks when soloTerritoryKm + this-run own-territory km hits 50', () => {
    const unlocks = evaluateBadgeUnlocks({
      progress: baseProgress(),
      history: { ...emptyRunHistoryStats(), totalRuns: 10, soloTerritoryKm: 48 },
      snapshot: { ...baseSnapshot(), totalMeters: 3000, metersInTerritory: 3000 },
      breakdown: breakdownRunXp({
        distanceKm: 3,
        kmInTerritory: 3,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      now: new Date('2026-05-28T10:00:00Z'),
    });
    expect(unlocks).toContain('solo-wolf');
  });
});
