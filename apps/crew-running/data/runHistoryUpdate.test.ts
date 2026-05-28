import { describe, it, expect } from 'vitest';
import { applyRunToHistory } from './runHistoryUpdate';
import { emptyRunHistoryStats, breakdownRunXp, isoWeekKey } from './gamification';
import type { RunSnapshot } from '../services/runTracker';

const baseSnapshot = (): RunSnapshot => ({
  state: 'ended',
  startedAt: new Date('2026-05-28T10:00:00').getTime(),
  elapsedMs: 1_800_000,
  totalMeters: 5000,
  metersInTerritory: 1500,
  points: [],
  touchedSpotIds: ['spot-vale'],
  closedLoop: false,
  permissionDenied: false,
});

describe('applyRunToHistory', () => {
  it('increments totalRuns, totalKm, soloTerritoryKm', () => {
    const next = applyRunToHistory({
      prior: emptyRunHistoryStats(),
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 1.5,
        spotsTouched: 1,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: isoWeekKey(new Date('2026-05-28T10:00:00')),
      priorWeekKey: '',
    });
    expect(next.totalRuns).toBe(1);
    expect(next.totalKm).toBeCloseTo(5);
    expect(next.soloTerritoryKm).toBeCloseTo(1.5);
    expect(next.uniqueSpotsTouched).toEqual(['spot-vale']);
  });

  it('deduplicates spot ids across runs', () => {
    const start = { ...emptyRunHistoryStats(), uniqueSpotsTouched: ['spot-vale'] };
    const next = applyRunToHistory({
      prior: start,
      snapshot: { ...baseSnapshot(), touchedSpotIds: ['spot-vale', 'spot-luz'] },
      breakdown: breakdownRunXp({
        distanceKm: 3,
        kmInTerritory: 0,
        spotsTouched: 2,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: isoWeekKey(new Date('2026-05-28T10:00:00')),
      priorWeekKey: '',
    });
    expect(next.uniqueSpotsTouched.sort()).toEqual(['spot-luz', 'spot-vale']);
  });

  it('resets kmThisWeek when crossing weeks', () => {
    const start = { ...emptyRunHistoryStats(), kmThisWeek: 20 };
    const next = applyRunToHistory({
      prior: start,
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: '2026-W23',
      priorWeekKey: '2026-W22',
    });
    expect(next.kmThisWeek).toBeCloseTo(5);
  });

  it('accumulates kmThisWeek inside same week', () => {
    const start = { ...emptyRunHistoryStats(), kmThisWeek: 20 };
    const next = applyRunToHistory({
      prior: start,
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: '2026-W22',
      priorWeekKey: '2026-W22',
    });
    expect(next.kmThisWeek).toBeCloseTo(25);
  });

  it('increments nightRuns when started between 22h-04h local', () => {
    const next = applyRunToHistory({
      prior: emptyRunHistoryStats(),
      snapshot: { ...baseSnapshot(), startedAt: new Date('2026-05-28T03:30:00').getTime() },
      breakdown: breakdownRunXp({
        distanceKm: 3,
        kmInTerritory: 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      }),
      runWeekKey: '2026-W22',
      priorWeekKey: '2026-W22',
    });
    expect(next.nightRuns).toBe(1);
  });

  it('increments invasionsSucceeded when breakdown.invasionMult > 1', () => {
    const next = applyRunToHistory({
      prior: emptyRunHistoryStats(),
      snapshot: baseSnapshot(),
      breakdown: breakdownRunXp({
        distanceKm: 5,
        kmInTerritory: 5,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: true,
      }),
      runWeekKey: '2026-W22',
      priorWeekKey: '2026-W22',
    });
    expect(next.invasionsSucceeded).toBe(1);
  });
});
