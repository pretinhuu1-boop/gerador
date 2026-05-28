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
  clearCreatorDraft,
  clearActiveRun,
  getActiveRun,
  getCreatorDraft,
  getCreatorTab,
  getMapLayerPrefs,
  getRunnerProgress,
  saveActiveRun,
  saveCreatorDraft,
  saveMapLayerPrefs,
  saveRunnerProgress,
  setCreatorTab,
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

  it('E4: corrupt inkPerZone NaN falls back to defaults', () => {
    window.localStorage.setItem(
      STORAGE_KEY_RUNNER,
      JSON.stringify({
        xp: Number.NaN,
        inkPerZone: 'not-an-object',
        badgeUnlocks: 'not-an-array',
      }),
    );
    const progress = getRunnerProgress();
    expect(progress.xp).toBe(0);
    expect(progress.inkPerZone).toEqual({});
    expect(progress.badgeUnlocks).toEqual([]);
  });

  it('E5: schema with wrong field types falls back to defaults', () => {
    window.localStorage.setItem(
      STORAGE_KEY_RUNNER,
      JSON.stringify({ xp: 'ten', level: 'one', streakWeeks: 'two' }),
    );
    const progress = getRunnerProgress();
    expect(progress.xp).toBe(0);
    expect(progress.streakWeeks).toBe(0);
  });

  it('E6: extra unknown fields are dropped (whitelist merge)', () => {
    window.localStorage.setItem(
      STORAGE_KEY_RUNNER,
      JSON.stringify({
        xp: 50,
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
        legacyJunk: 'should-not-survive',
        otherJunk: 42,
      }),
    );
    const progress = getRunnerProgress();
    expect(progress.xp).toBe(50);
    const asRecord = progress as unknown as Record<string, unknown>;
    expect(asRecord.legacyJunk).toBeUndefined();
    expect(asRecord.otherJunk).toBeUndefined();
  });
});

describe('Creator tab persistence', () => {
  it('returns null when no creator tab stored', () => {
    expect(getCreatorTab()).toBeNull();
  });

  it('persists and restores creator tab', () => {
    setCreatorTab('look');
    expect(getCreatorTab()).toBe('look');
  });

  it('ignores corrupt tab value', () => {
    window.localStorage.setItem('crewCreatorTab', 'garbage');
    expect(getCreatorTab()).toBeNull();
  });
});

describe('Creator draft persistence', () => {
  it('persists and restores a sanitized creator draft', () => {
    saveCreatorDraft({
      photo: {
        base64: 'abc',
        mimeType: 'image/jpeg',
        previewUrl: 'data:image/jpeg;base64,abc',
      },
      profile: {
        name: '  Nina QA  ',
        sex: 'female',
        heightCm: 171.4,
        weightKg: 62.2,
        personality: 'ritmo frio',
      },
      runnerTypeId: 'night-run',
      locked: {
        top: 'top_tank_black',
        accessory: 'acc_blank_bib',
      },
    });

    const draft = getCreatorDraft();
    expect(draft?.photo?.mimeType).toBe('image/jpeg');
    expect(draft?.profile.name).toBe('Nina QA');
    expect(draft?.profile.heightCm).toBe(171);
    expect(draft?.runnerTypeId).toBe('night-run');
    expect(draft?.locked).toEqual({
      top: 'top_tank_black',
      accessory: 'acc_blank_bib',
    });
  });

  it('drops invalid values from corrupt creator drafts', () => {
    window.localStorage.setItem(
      'crewCreatorDraft',
      JSON.stringify({
        photo: { base64: '', mimeType: 'text/html', previewUrl: 'javascript:bad' },
        profile: { name: 'Runner', sex: 'invalid', heightCm: 999, weightKg: -1 },
        runnerTypeId: 'bad-type',
        locked: { hair: 'legacy', shoes: 'sho_runners_blk' },
      }),
    );

    const draft = getCreatorDraft();
    expect(draft?.photo).toBeNull();
    expect(draft?.profile.sex).toBe('female');
    expect(draft?.profile.heightCm).toBe(230);
    expect(draft?.profile.weightKg).toBe(35);
    expect(draft?.runnerTypeId).toBe('sprint');
    expect(draft?.locked).toEqual({ shoes: 'sho_runners_blk' });
  });

  it('clears creator draft', () => {
    saveCreatorDraft({
      photo: null,
      profile: {
        name: 'Nina',
        sex: 'female',
        heightCm: 170,
        weightKg: 70,
        personality: '',
      },
      runnerTypeId: 'sprint',
      locked: {},
    });
    clearCreatorDraft();
    expect(getCreatorDraft()).toBeNull();
  });
});
