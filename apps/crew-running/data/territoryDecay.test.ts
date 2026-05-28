import { describe, it, expect } from 'vitest';
import { applyInkDecay, computeOwnershipFromInk } from './territoryDecay';
import { SP_ZONE_MAP_FEATURES, type SpZoneId } from './spLiveMap';

describe('applyInkDecay', () => {
  const T = (days: number) => new Date('2026-05-28T00:00:00Z').getTime() + days * 86_400_000;

  it('returns empty map for empty input', () => {
    expect(applyInkDecay({}, T(0), T(7))).toEqual({});
  });

  it('returns unchanged values when no time has passed', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 500, leste: 200 };
    expect(applyInkDecay(ink, T(0), T(0))).toEqual({ centro: 500, leste: 200 });
  });

  it('decays each zone by INK_DECAY_PER_DAY ^ days', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 1000 };
    const out = applyInkDecay(ink, T(0), T(7));
    // 1000 * (1 - 0.033) ^ 7 = 1000 * 0.967^7 ≈ 790.65
    expect(out.centro).toBeCloseTo(790.65, 1);
  });

  it('clamps at zero — past values cannot rise from negatives', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 100 };
    const out = applyInkDecay(ink, T(0), T(365));
    expect(out.centro).toBeGreaterThanOrEqual(0);
    expect(out.centro).toBeLessThan(1); // effectively zero after a year
  });

  it('treats negative or zero day gap as zero decay (clock skew safety)', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 500 };
    expect(applyInkDecay(ink, T(10), T(0))).toEqual({ centro: 500 });
  });

  it('preserves undefined zones — only decays present keys', () => {
    const ink: Partial<Record<SpZoneId, number>> = { centro: 1000 };
    const out = applyInkDecay(ink, T(0), T(1));
    expect(out.leste).toBeUndefined();
    expect(out.centro).toBeDefined();
  });
});

describe('computeOwnershipFromInk', () => {
  it('returns 0 for every zone when no ink', () => {
    const out = computeOwnershipFromInk({}, SP_ZONE_MAP_FEATURES, 1000);
    for (const zone of SP_ZONE_MAP_FEATURES) {
      expect(out[zone.id]).toBe(0);
    }
  });

  it('returns ink / denominator clamped to 1', () => {
    const out = computeOwnershipFromInk(
      { centro: 500, leste: 1500, sul: 0 },
      SP_ZONE_MAP_FEATURES,
      1000,
    );
    expect(out.centro).toBeCloseTo(0.5);
    expect(out.leste).toBe(1); // clamped
    expect(out.sul).toBe(0);
  });

  it('includes every zone from the input feature list, defaulting absent ones to 0', () => {
    const out = computeOwnershipFromInk({ centro: 250 }, SP_ZONE_MAP_FEATURES, 1000);
    expect(Object.keys(out).sort()).toEqual(SP_ZONE_MAP_FEATURES.map((z) => z.id).sort());
    expect(out.centro).toBeCloseTo(0.25);
  });
});

describe('decay + ownership pipeline', () => {
  const T = (days: number) => new Date('2026-05-28T00:00:00Z').getTime() + days * 86_400_000;

  it('zone with full ownership decays to neutral over many idle weeks', () => {
    const fresh: Partial<Record<SpZoneId, number>> = { centro: 1000 }; // full ownership
    const ownershipFresh = computeOwnershipFromInk(fresh, SP_ZONE_MAP_FEATURES, 1000);
    expect(ownershipFresh.centro).toBe(1);

    const decayed = applyInkDecay(fresh, T(0), T(180)); // 6 months idle
    const ownershipDecayed = computeOwnershipFromInk(decayed, SP_ZONE_MAP_FEATURES, 1000);
    expect(ownershipDecayed.centro).toBeLessThan(0.01);
  });

  it('~half-life of idle (21 days) takes a fully owned zone to ~contested', () => {
    // INK_OWNERSHIP_CONTESTED is 0.4 per gamification.ts. With INK_DECAY_PER_DAY
    // 0.033, 1000 ink after 7 days is ~792 -> 0.79 ownership. Still owned.
    // After 21 days (≈ half-life) it should drop to ~0.5 — borderline owned.
    // Verified: 1000 * 0.967^21 ≈ 494.26 -> ownership ≈ 0.494, inside (0.45, 0.55).
    const fresh: Partial<Record<SpZoneId, number>> = { centro: 1000 };
    const decayed = applyInkDecay(fresh, T(0), T(21));
    const ownership = computeOwnershipFromInk(decayed, SP_ZONE_MAP_FEATURES, 1000);
    expect(ownership.centro).toBeGreaterThan(0.45);
    expect(ownership.centro).toBeLessThan(0.55);
  });
});
