import { beforeEach, describe, expect, it } from 'vitest';
import type { RunnerProgress } from '../data/gamification';

const STORAGE_KEY_RUNNER = 'crewRunnerProgress';
const STORAGE_KEY_LAYERS = 'crewMapLayers';
const STORAGE_KEY_ACTIVE = 'crewActiveRun';

// Minimal in-memory localStorage shim (vitest default node env has none).
const storageData = new Map<string, string>();
const memoryStorage = {
  getItem(key: string): string | null {
    return storageData.has(key) ? storageData.get(key)! : null;
  },
  setItem(key: string, value: string): void {
    storageData.set(key, value);
  },
  removeItem(key: string): void {
    storageData.delete(key);
  },
  clear(): void {
    storageData.clear();
  },
  key(): string | null {
    return null;
  },
  get length(): number {
    return storageData.size;
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).window = { localStorage: memoryStorage };

// Import after shim so launchStorage uses our window stub.
const {
  clearActiveRun,
  getActiveRun,
  getMapLayerPrefs,
  getRunnerProgress,
  saveActiveRun,
  saveMapLayerPrefs,
  saveRunnerProgress,
} = await import('./launchStorage');

beforeEach(() => {
  storageData.clear();
});

describe('RunnerProgress round-trip', () => {
  it('returns default when nothing is stored', () => {
    const progress = getRunnerProgress();
    expect(progress.xp).toBe(0);
    expect(progress.level).toBe(1);
    expect(progress.freezesAvailable).toBe(1);
    expect(progress.runsThisWeek).toBe(0);
    expect(progress.weekKey).toBe('');
  });

  it('persists then restores', () => {
    const sample: RunnerProgress = {
      xp: 540,
      level: 4,
      streakWeeks: 2,
      lastRunAt: Date.now(),
      freezesAvailable: 1,
      inkPerZone: { centro: 120, leste: 45 },
      inkUpdatedAt: Date.now(),
      badgeUnlocks: ['first-blood'],
      patchesOwned: [],
      weekKey: '2026-W22',
      runsThisWeek: 2,
    };
    saveRunnerProgress(sample);
    const restored = getRunnerProgress();
    expect(restored.xp).toBe(540);
    expect(restored.inkPerZone.centro).toBe(120);
    expect(restored.badgeUnlocks).toEqual(['first-blood']);
  });

  it('falls back to defaults when stored JSON is corrupt', () => {
    window.localStorage.setItem(STORAGE_KEY_RUNNER, '{not json');
    const progress = getRunnerProgress();
    expect(progress.xp).toBe(0);
  });

  it('falls back to defaults when stored shape is wrong', () => {
    window.localStorage.setItem(STORAGE_KEY_RUNNER, JSON.stringify({ xp: 'ten', level: 'one' }));
    const progress = getRunnerProgress();
    expect(progress.xp).toBe(0);
  });
});

describe('MapLayerPrefs round-trip', () => {
  it('defaults Territorio + Live on, others off', () => {
    const prefs = getMapLayerPrefs();
    expect(prefs.territory).toBe(true);
    expect(prefs.live).toBe(true);
    expect(prefs.missions).toBe(false);
    expect(prefs.history).toBe(false);
  });

  it('persists user overrides', () => {
    saveMapLayerPrefs({ territory: false, live: true, missions: true, history: false });
    const prefs = getMapLayerPrefs();
    expect(prefs.territory).toBe(false);
    expect(prefs.missions).toBe(true);
  });

  it('falls back to defaults on invalid shape', () => {
    window.localStorage.setItem(STORAGE_KEY_LAYERS, JSON.stringify({ territory: 'yes' }));
    const prefs = getMapLayerPrefs();
    expect(prefs.territory).toBe(true); // default
  });
});

describe('ActiveRun round-trip', () => {
  it('returns null when nothing stored', () => {
    expect(getActiveRun()).toBeNull();
  });

  it('persists and restores an active run', () => {
    saveActiveRun({
      startedAt: 1_700_000_000_000,
      elapsedMs: 120_000,
      state: 'tracking',
      points: [{ lng: -46.6, lat: -23.5, t: 1_700_000_000_000, accuracy: 8 }],
      touchedSpotIds: ['spot-vale'],
      totalMeters: 320,
      metersInTerritory: 200,
      crewSlug: 'downtown-rush',
      homeZoneId: 'centro',
    });
    const restored = getActiveRun();
    expect(restored?.totalMeters).toBe(320);
    expect(restored?.points).toHaveLength(1);
    expect(restored?.state).toBe('tracking');
  });

  it('clears active run', () => {
    saveActiveRun({
      startedAt: 0,
      elapsedMs: 0,
      state: 'tracking',
      points: [],
      touchedSpotIds: [],
      totalMeters: 0,
      metersInTerritory: 0,
    });
    clearActiveRun();
    expect(getActiveRun()).toBeNull();
  });

  it('returns null on corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY_ACTIVE, 'not json');
    expect(getActiveRun()).toBeNull();
  });
});
