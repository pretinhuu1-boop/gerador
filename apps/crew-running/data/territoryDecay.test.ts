import { describe, it, expect } from 'vitest';
import { applyInkDecay } from './territoryDecay';
import type { SpZoneId } from './spLiveMap';

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
