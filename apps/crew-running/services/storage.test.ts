import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IdentityEvent } from '../data/identityEvents';
import { emptyRunHistoryStats } from '../data/gamification';

const STORAGE_KEY = 'crew.identity_events';

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

beforeEach(async () => {
  mem = new MemoryStorage();
  vi.stubGlobal('window', { localStorage: mem });
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const loadStorage = async () => await import('./storage');

const sampleEvent = (overrides: Partial<Omit<IdentityEvent, 'id'>> = {}) => ({
  kind: 'LOOK_SAVED' as const,
  timestamp: 1_700_000_000_000,
  payload: { crewSlug: 'north-breakers', runnerTypeId: 'crew-pace' },
  ...overrides,
});

describe('getIdentityEvents', () => {
  it('returns empty array when nothing stored', async () => {
    const s = await loadStorage();
    expect(s.getIdentityEvents()).toEqual([]);
  });

  it('returns empty array when storage holds malformed JSON', async () => {
    mem.setItem(STORAGE_KEY, '{not-json');
    const s = await loadStorage();
    expect(s.getIdentityEvents()).toEqual([]);
  });

  it('returns empty array when storage holds non-array', async () => {
    mem.setItem(STORAGE_KEY, JSON.stringify({ kind: 'LOOK_SAVED' }));
    const s = await loadStorage();
    expect(s.getIdentityEvents()).toEqual([]);
  });

  it('filters out persisted entries that fail shape validation', async () => {
    const good = {
      id: 'look_saved_1',
      kind: 'LOOK_SAVED',
      timestamp: 1,
      payload: {},
    };
    const bad = [
      { id: 'x', kind: 'NOT_A_KIND', timestamp: 1, payload: {} },
      { id: 'y', kind: 'LOOK_SAVED', timestamp: 'not-a-number', payload: {} },
      { id: 'z', kind: 'LOOK_SAVED', timestamp: 1, payload: null },
      null,
      'string',
    ];
    mem.setItem(STORAGE_KEY, JSON.stringify([good, ...bad]));
    const s = await loadStorage();
    const events = s.getIdentityEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ id: 'look_saved_1', kind: 'LOOK_SAVED' });
  });
});

describe('appendIdentityEvent', () => {
  it('writes a new event and assigns deterministic id from kind + timestamp', async () => {
    const s = await loadStorage();
    const out = s.appendIdentityEvent(sampleEvent());
    expect(out.id).toBe('look_saved_1700000000000');
    expect(s.getIdentityEvents()).toHaveLength(1);
  });

  it('respects an explicit id when provided', async () => {
    const s = await loadStorage();
    s.appendIdentityEvent({ ...sampleEvent(), id: 'custom-id' });
    expect(s.getIdentityEvents()[0].id).toBe('custom-id');
  });

  it('prepends newest event to the head of the list', async () => {
    const s = await loadStorage();
    s.appendIdentityEvent(sampleEvent({ timestamp: 1 }));
    s.appendIdentityEvent(sampleEvent({ timestamp: 2 }));
    const events = s.getIdentityEvents();
    expect(events[0].timestamp).toBe(2);
    expect(events[1].timestamp).toBe(1);
  });

  it('dedupes by id (does not double-write same id)', async () => {
    const s = await loadStorage();
    s.appendIdentityEvent(sampleEvent({ timestamp: 5 }));
    s.appendIdentityEvent(sampleEvent({ timestamp: 5 }));
    expect(s.getIdentityEvents()).toHaveLength(1);
  });

  it('caps total stored events at 50 (FIFO drop oldest)', async () => {
    const s = await loadStorage();
    for (let i = 0; i < 55; i++) {
      s.appendIdentityEvent(sampleEvent({ kind: 'LOOK_SAVED', timestamp: i + 1 }));
    }
    const events = s.getIdentityEvents();
    expect(events).toHaveLength(50);
    expect(events[0].timestamp).toBe(55);
    expect(events[49].timestamp).toBe(6);
  });
});

describe('clearIdentityEvents', () => {
  it('removes the storage key', async () => {
    const s = await loadStorage();
    s.appendIdentityEvent(sampleEvent());
    expect(s.getIdentityEvents()).toHaveLength(1);
    s.clearIdentityEvents();
    expect(s.getIdentityEvents()).toEqual([]);
    expect(mem.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('localStorage unavailable', () => {
  it('returns empty + no-throws when window is absent', async () => {
    vi.unstubAllGlobals();
    vi.stubGlobal('window', undefined);
    vi.resetModules();
    const s = await loadStorage();
    expect(s.getIdentityEvents()).toEqual([]);
    expect(() => s.appendIdentityEvent(sampleEvent())).not.toThrow();
    expect(() => s.clearIdentityEvents()).not.toThrow();
  });

  it('returns empty + no-throws when localStorage access throws', async () => {
    const throwing = {
      get localStorage() {
        throw new Error('access denied');
      },
    };
    vi.unstubAllGlobals();
    vi.stubGlobal('window', throwing);
    vi.resetModules();
    const s = await loadStorage();
    expect(s.getIdentityEvents()).toEqual([]);
    expect(() => s.appendIdentityEvent(sampleEvent())).not.toThrow();
  });
});

describe('runHistoryStats persistence', () => {
  it('returns empty baseline when nothing stored', async () => {
    mem.removeItem('crew.run_history_stats');
    const s = await loadStorage();
    expect(s.loadRunHistoryStats()).toEqual(emptyRunHistoryStats());
  });

  it('round-trips written stats', async () => {
    const s = await loadStorage();
    const stats = {
      ...emptyRunHistoryStats(),
      totalRuns: 3,
      totalKm: 12.5,
      uniqueSpotsTouched: ['spot-vale', 'spot-republica'],
    };
    s.saveRunHistoryStats(stats);
    expect(s.loadRunHistoryStats()).toEqual(stats);
  });
});
