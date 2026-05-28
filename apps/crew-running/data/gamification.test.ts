import { describe, expect, it } from 'vitest';
import {
  BADGE_DEFS,
  INK_DECAY_PER_DAY,
  INK_OWNERSHIP_CONTESTED,
  INK_OWNERSHIP_OWNED,
  SAMPLE_MISSIONS,
  STREAK_RUNS_REQUIRED,
  XP_BASE_PER_KM,
  XP_INVASION_MULT,
  XP_LOOP_MULT,
  XP_SPOT_BONUS,
  XP_TERRITORY_MULT,
  breakdownRunXp,
  bumpStreak,
  computeRunXp,
  decayInk,
  isoWeekKey,
  sanitizeRunXpInput,
  territoryStatus,
  xpProgressInLevel,
  xpRequiredForLevel,
  xpToLevel,
  type RunnerProgress,
} from './gamification';

const baseProgress = (overrides: Partial<RunnerProgress> = {}): RunnerProgress => ({
  xp: 0,
  level: 1,
  streakWeeks: 0,
  lastRunAt: 0,
  freezesAvailable: 1,
  inkPerZone: {},
  inkUpdatedAt: 0,
  badgeUnlocks: [],
  patchesOwned: [],
  weekKey: '',
  runsThisWeek: 0,
  ...overrides,
});

describe('xpRequiredForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(xpRequiredForLevel(1)).toBe(0);
    expect(xpRequiredForLevel(0)).toBe(0);
    expect(xpRequiredForLevel(-1)).toBe(0);
  });

  it('matches the closed-form curve 100*(n-1)^1.6 at known levels', () => {
    expect(xpRequiredForLevel(2)).toBe(100);
    expect(xpRequiredForLevel(10)).toBe(Math.round(100 * Math.pow(9, 1.6)));
    expect(xpRequiredForLevel(25)).toBe(Math.round(100 * Math.pow(24, 1.6)));
    expect(xpRequiredForLevel(50)).toBe(Math.round(100 * Math.pow(49, 1.6)));
  });

  it('is strictly monotonic', () => {
    let prev = -1;
    for (let level = 1; level <= 60; level++) {
      const xp = xpRequiredForLevel(level);
      expect(xp).toBeGreaterThan(prev);
      prev = xp;
    }
  });
});

describe('xpToLevel', () => {
  it('clamps to level 1 for non-positive xp', () => {
    expect(xpToLevel(0)).toBe(1);
    expect(xpToLevel(-50)).toBe(1);
  });

  it('inverts xpRequiredForLevel at each threshold', () => {
    for (let level = 1; level <= 50; level++) {
      const xp = xpRequiredForLevel(level);
      expect(xpToLevel(xp)).toBe(level);
    }
  });

  it('stays at level for xp inside the band', () => {
    for (let level = 1; level <= 20; level++) {
      const lower = xpRequiredForLevel(level);
      const upper = xpRequiredForLevel(level + 1) - 1;
      if (upper < lower) continue;
      expect(xpToLevel(lower)).toBe(level);
      expect(xpToLevel(upper)).toBe(level);
    }
  });
});

describe('xpProgressInLevel', () => {
  it('reports zero progress at the threshold', () => {
    const p = xpProgressInLevel(xpRequiredForLevel(5));
    expect(p.current).toBe(0);
    expect(p.needed).toBeGreaterThan(0);
    expect(p.pct).toBe(0);
  });

  it('clamps pct to [0, 1]', () => {
    for (const xp of [0, 50, 1000, 100000]) {
      const p = xpProgressInLevel(xp);
      expect(p.pct).toBeGreaterThanOrEqual(0);
      expect(p.pct).toBeLessThanOrEqual(1);
    }
  });
});

describe('decayInk', () => {
  it('returns input when daysSince is non-positive', () => {
    expect(decayInk(500, 0)).toBe(500);
    expect(decayInk(500, -3)).toBe(500);
  });

  it('decays by INK_DECAY_PER_DAY per day, compounded', () => {
    const after1Day = decayInk(1000, 1);
    expect(after1Day).toBeCloseTo(1000 * (1 - INK_DECAY_PER_DAY), 4);
  });

  it('reaches near-zero around 30 days (>= ~36% remaining is wrong)', () => {
    const after30 = decayInk(1000, 30);
    expect(after30).toBeLessThan(400);
    expect(after30).toBeGreaterThan(280);
  });

  it('never goes negative', () => {
    expect(decayInk(1000, 365)).toBeGreaterThanOrEqual(0);
  });
});

describe('territoryStatus', () => {
  it('maps ownership to status per spec', () => {
    expect(territoryStatus(INK_OWNERSHIP_OWNED)).toBe('owned');
    expect(territoryStatus(INK_OWNERSHIP_OWNED + 0.1)).toBe('owned');
    expect(territoryStatus(INK_OWNERSHIP_CONTESTED)).toBe('contested');
    expect(territoryStatus(INK_OWNERSHIP_CONTESTED + 0.05)).toBe('contested');
    expect(territoryStatus(INK_OWNERSHIP_CONTESTED - 0.01)).toBe('neutral');
    expect(territoryStatus(0)).toBe('neutral');
  });
});

describe('computeRunXp', () => {
  it('matches base case: 5km, no bonuses', () => {
    const xp = computeRunXp({
      distanceKm: 5,
      kmInTerritory: 0,
      spotsTouched: 0,
      closedLoop: false,
      isInvasion: false,
    });
    expect(xp).toBe(5 * XP_BASE_PER_KM);
  });

  it('doubles km inside territory (per spec: 20 XP/km in territory)', () => {
    const xp = computeRunXp({
      distanceKm: 1,
      kmInTerritory: 1,
      spotsTouched: 0,
      closedLoop: false,
      isInvasion: false,
    });
    expect(xp).toBe(XP_BASE_PER_KM * XP_TERRITORY_MULT);
  });

  it('adds spot bonus once per spot', () => {
    const xp = computeRunXp({
      distanceKm: 0,
      kmInTerritory: 0,
      spotsTouched: 3,
      closedLoop: false,
      isInvasion: false,
    });
    expect(xp).toBe(3 * XP_SPOT_BONUS);
  });

  it('applies loop multiplier when closedLoop', () => {
    const baseline = computeRunXp({
      distanceKm: 5,
      kmInTerritory: 0,
      spotsTouched: 0,
      closedLoop: false,
      isInvasion: false,
    });
    const looped = computeRunXp({
      distanceKm: 5,
      kmInTerritory: 0,
      spotsTouched: 0,
      closedLoop: true,
      isInvasion: false,
    });
    expect(looped).toBe(Math.round(baseline * XP_LOOP_MULT));
  });

  it('stacks invasion + loop multipliers', () => {
    const baseline = computeRunXp({
      distanceKm: 4,
      kmInTerritory: 0,
      spotsTouched: 0,
      closedLoop: false,
      isInvasion: false,
    });
    const stacked = computeRunXp({
      distanceKm: 4,
      kmInTerritory: 0,
      spotsTouched: 0,
      closedLoop: true,
      isInvasion: true,
    });
    expect(stacked).toBe(Math.round(baseline * XP_LOOP_MULT * XP_INVASION_MULT));
  });

  it('produces zero when all inputs are zero', () => {
    expect(
      computeRunXp({
        distanceKm: 0,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
    ).toBe(0);
  });
});

describe('catalog defs', () => {
  it('ships 10 distinct badges', () => {
    expect(BADGE_DEFS).toHaveLength(10);
    const ids = new Set(BADGE_DEFS.map((b) => b.id));
    expect(ids.size).toBe(BADGE_DEFS.length);
  });

  it('ships sample missions with positive rewards', () => {
    expect(SAMPLE_MISSIONS.length).toBeGreaterThan(0);
    for (const mission of SAMPLE_MISSIONS) {
      expect(mission.rewardXp).toBeGreaterThan(0);
      expect(mission.windowHours).toBeGreaterThan(0);
    }
  });
});

describe('sanitizeRunXpInput', () => {
  it('clamps negatives to zero', () => {
    const out = sanitizeRunXpInput({
      distanceKm: -5,
      kmInTerritory: -2,
      spotsTouched: -3,
      closedLoop: false,
      isInvasion: false,
    });
    expect(out.distanceKm).toBe(0);
    expect(out.kmInTerritory).toBe(0);
    expect(out.spotsTouched).toBe(0);
  });

  it('caps kmInTerritory at distanceKm', () => {
    const out = sanitizeRunXpInput({
      distanceKm: 3,
      kmInTerritory: 10,
      spotsTouched: 0,
      closedLoop: false,
      isInvasion: false,
    });
    expect(out.kmInTerritory).toBe(3);
  });

  it('floors fractional spot count', () => {
    const out = sanitizeRunXpInput({
      distanceKm: 1,
      kmInTerritory: 0,
      spotsTouched: 2.7,
      closedLoop: false,
      isInvasion: false,
    });
    expect(out.spotsTouched).toBe(2);
  });
});

describe('breakdownRunXp', () => {
  it('splits base vs territory km cleanly (spec: 20 XP/km in territory)', () => {
    const out = breakdownRunXp({
      distanceKm: 5,
      kmInTerritory: 2,
      spotsTouched: 0,
      closedLoop: false,
      isInvasion: false,
    });
    expect(out.baseXp).toBe(3 * XP_BASE_PER_KM);
    expect(out.territoryXp).toBe(2 * XP_BASE_PER_KM * XP_TERRITORY_MULT);
  });

  it('matches computeRunXp totals (refactor invariant)', () => {
    const cases = [
      { distanceKm: 5, kmInTerritory: 0, spotsTouched: 0, closedLoop: false, isInvasion: false },
      { distanceKm: 3, kmInTerritory: 3, spotsTouched: 0, closedLoop: false, isInvasion: false },
      { distanceKm: 4, kmInTerritory: 1, spotsTouched: 2, closedLoop: true, isInvasion: false },
      { distanceKm: 6, kmInTerritory: 0, spotsTouched: 0, closedLoop: true, isInvasion: true },
    ];
    for (const params of cases) {
      expect(breakdownRunXp(params).total).toBe(computeRunXp(params));
    }
  });
});

describe('isoWeekKey', () => {
  it('formats as YYYY-Www', () => {
    expect(isoWeekKey(new Date('2026-01-05T12:00:00Z'))).toMatch(/^2026-W\d{2}$/);
  });

  it('groups Monday-Sunday into the same week', () => {
    const mon = isoWeekKey(new Date(Date.UTC(2026, 0, 5, 12)));
    const sun = isoWeekKey(new Date(Date.UTC(2026, 0, 11, 12)));
    expect(mon).toBe(sun);
  });
});

describe('bumpStreak', () => {
  it('seeds weekKey on the very first run', () => {
    const now = new Date('2026-05-28T12:00:00Z');
    const result = bumpStreak(baseProgress(), now);
    expect(result.next.weekKey).toBe(isoWeekKey(now));
    expect(result.next.runsThisWeek).toBe(1);
    expect(result.next.streakWeeks).toBe(0);
    expect(result.streakBumped).toBe(false);
  });

  it('bumps streak after STREAK_RUNS_REQUIRED runs in the same week', () => {
    const now = new Date('2026-05-28T12:00:00Z');
    const week = isoWeekKey(now);
    let progress = baseProgress({ weekKey: week, runsThisWeek: 1 });
    progress = bumpStreak(progress, now).next; // 2
    expect(progress.streakWeeks).toBe(0);
    const third = bumpStreak(progress, now);
    expect(third.next.runsThisWeek).toBe(STREAK_RUNS_REQUIRED);
    expect(third.next.streakWeeks).toBe(1);
    expect(third.streakBumped).toBe(true);
  });

  it('does not double-bump streak on the 4th run in the same week', () => {
    const now = new Date('2026-05-28T12:00:00Z');
    const week = isoWeekKey(now);
    const progress = baseProgress({ weekKey: week, runsThisWeek: STREAK_RUNS_REQUIRED, streakWeeks: 1 });
    const result = bumpStreak(progress, now);
    expect(result.next.streakWeeks).toBe(1);
    expect(result.streakBumped).toBe(false);
  });

  it('preserves streak across adjacent weeks when previous week hit quota', () => {
    const lastWeek = new Date('2026-05-20T12:00:00Z');
    const thisWeek = new Date('2026-05-28T12:00:00Z');
    const progress = baseProgress({
      weekKey: isoWeekKey(lastWeek),
      runsThisWeek: STREAK_RUNS_REQUIRED,
      streakWeeks: 4,
    });
    const result = bumpStreak(progress, thisWeek);
    expect(result.next.streakWeeks).toBe(4);
    expect(result.next.weekKey).toBe(isoWeekKey(thisWeek));
    expect(result.next.runsThisWeek).toBe(1);
    expect(result.streakBroken).toBe(false);
  });

  it('consumes a freeze when previous week missed quota', () => {
    const lastWeek = new Date('2026-05-20T12:00:00Z');
    const thisWeek = new Date('2026-05-28T12:00:00Z');
    const progress = baseProgress({
      weekKey: isoWeekKey(lastWeek),
      runsThisWeek: 1,
      streakWeeks: 3,
      freezesAvailable: 1,
    });
    const result = bumpStreak(progress, thisWeek);
    expect(result.freezeUsed).toBe(true);
    expect(result.next.freezesAvailable).toBe(0);
    expect(result.next.streakWeeks).toBe(3);
  });

  it('preserves streak across year boundary (W52 -> next year W01)', () => {
    const dec = new Date('2026-12-28T12:00:00Z'); // ISO 2026-W53 or W52 depending on year
    const jan = new Date('2027-01-04T12:00:00Z'); // ISO 2027-W01
    const progress = baseProgress({
      weekKey: isoWeekKey(dec),
      runsThisWeek: STREAK_RUNS_REQUIRED,
      streakWeeks: 7,
      freezesAvailable: 0,
    });
    const result = bumpStreak(progress, jan);
    expect(result.next.streakWeeks).toBe(7);
    expect(result.streakBroken).toBe(false);
    expect(result.freezeUsed).toBe(false);
  });

  it('resets streak when no freeze available', () => {
    const lastWeek = new Date('2026-05-20T12:00:00Z');
    const thisWeek = new Date('2026-05-28T12:00:00Z');
    const progress = baseProgress({
      weekKey: isoWeekKey(lastWeek),
      runsThisWeek: 1,
      streakWeeks: 5,
      freezesAvailable: 0,
    });
    const result = bumpStreak(progress, thisWeek);
    expect(result.streakBroken).toBe(true);
    expect(result.next.streakWeeks).toBe(0);
  });
});
