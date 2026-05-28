import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MapLayerPrefs } from './mapLayerStorage';

const STORAGE_KEY = 'crewMapLayers';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem = (k: string) => (this.map.has(k) ? this.map.get(k)! : null);
  setItem = (k: string, v: string) => {
    this.map.set(k, v);
  };
  removeItem = (k: string) => {
    this.map.delete(k);
  };
  clear = () => {
    this.map.clear();
  };
}

let mem: MemoryStorage;

beforeEach(() => {
  mem = new MemoryStorage();
  vi.stubGlobal('window', { localStorage: mem });
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const loadStorage = async () => await import('./mapLayerStorage');

const DEFAULT: MapLayerPrefs = {
  territory: true,
  live: true,
  missions: false,
  history: false,
};

describe('getMapLayerPrefs', () => {
  it('returns defaults when storage is empty', async () => {
    const s = await loadStorage();
    expect(s.getMapLayerPrefs()).toEqual(DEFAULT);
  });

  it('returns defaults when storage holds malformed JSON', async () => {
    mem.setItem(STORAGE_KEY, '{not-json');
    const s = await loadStorage();
    expect(s.getMapLayerPrefs()).toEqual(DEFAULT);
  });

  it('returns defaults when the persisted shape is wrong', async () => {
    mem.setItem(STORAGE_KEY, JSON.stringify({ territory: 'yes', live: 1 }));
    const s = await loadStorage();
    expect(s.getMapLayerPrefs()).toEqual(DEFAULT);
  });

  it('fills missing keys from defaults instead of dropping them', async () => {
    mem.setItem(STORAGE_KEY, JSON.stringify({ territory: false, live: true }));
    const s = await loadStorage();
    expect(s.getMapLayerPrefs()).toEqual({
      territory: false,
      live: true,
      missions: DEFAULT.missions,
      history: DEFAULT.history,
    });
  });

  it('recovers to defaults when EVERY layer was persisted as false', async () => {
    mem.setItem(
      STORAGE_KEY,
      JSON.stringify({ territory: false, live: false, missions: false, history: false }),
    );
    const s = await loadStorage();
    // An empty map with no recovery path is treated as corruption.
    expect(s.getMapLayerPrefs()).toEqual(DEFAULT);
  });

  it('preserves an intentional single-layer-on state', async () => {
    mem.setItem(
      STORAGE_KEY,
      JSON.stringify({ territory: false, live: true, missions: false, history: false }),
    );
    const s = await loadStorage();
    expect(s.getMapLayerPrefs()).toEqual({
      territory: false,
      live: true,
      missions: false,
      history: false,
    });
  });
});

describe('saveMapLayerPrefs', () => {
  it('persists the full prefs object as JSON under the canonical key', async () => {
    const s = await loadStorage();
    const next: MapLayerPrefs = { territory: false, live: true, missions: true, history: false };
    s.saveMapLayerPrefs(next);
    expect(JSON.parse(mem.getItem(STORAGE_KEY)!)).toEqual(next);
  });

  it('no-throws when storage is unavailable', async () => {
    vi.unstubAllGlobals();
    vi.stubGlobal('window', undefined);
    vi.resetModules();
    const s = await loadStorage();
    expect(() =>
      s.saveMapLayerPrefs({ territory: true, live: false, missions: false, history: false }),
    ).not.toThrow();
  });
});
