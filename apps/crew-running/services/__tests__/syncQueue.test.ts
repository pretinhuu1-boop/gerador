import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

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

describe('syncQueue', () => {
  it('enqueues an item and reads it back', async () => {
    const { enqueue, peekQueue } = await import('../syncQueue');
    enqueue('leaderboard', { zoneId: 'centro', km: 5 });
    const items = peekQueue('leaderboard');
    expect(items).toHaveLength(1);
    expect(items[0].payload.zoneId).toBe('centro');
  });

  it('dequeues removes the item', async () => {
    const { enqueue, peekQueue, dequeue } = await import('../syncQueue');
    enqueue('leaderboard', { zoneId: 'centro', km: 5 });
    const items = peekQueue('leaderboard');
    dequeue('leaderboard', items[0].id);
    expect(peekQueue('leaderboard')).toHaveLength(0);
  });
});
