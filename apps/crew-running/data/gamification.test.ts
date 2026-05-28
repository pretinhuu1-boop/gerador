import { describe, expect, it } from 'vitest';
import {
  BADGE_DEFS,
  INK_DECAY_PER_DAY,
  INK_OWNERSHIP_CONTESTED,
  INK_OWNERSHIP_OWNED,
  SAMPLE_MISSIONS,
  XP_BASE_PER_KM,
  XP_INVASION_MULT,
  XP_LOOP_MULT,
  XP_SPOT_BONUS,
  XP_TERRITORY_MULT,
  computeRunXp,
  decayInk,
  territoryStatus,
  xpProgressInLevel,
  xpRequiredForLevel,
  xpToLevel,
} from './gamification';

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
