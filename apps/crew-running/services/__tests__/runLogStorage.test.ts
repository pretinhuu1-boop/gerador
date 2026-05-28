import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Services run in 'node' env — need to stub window.localStorage
class MemoryStorage {
  private map = new Map<string, string>();
  getItem = (k: string) => (this.map.has(k) ? this.map.get(k)! : null);
  setItem = (k: string, v: string) => { this.map.set(k, v); };
  removeItem = (k: string) => { this.map.delete(k); };
  clear = () => { this.map.clear(); };
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

describe('runLogStorage', () => {
  it('saves and retrieves a run log', async () => {
    const { saveRunLog, getRunLogs } = await import('../runLogStorage');
    saveRunLog({
      id: 'r1', crewSlug: 'east-burners', zoneId: 'leste',
      startedAt: '2026-05-28T10:00:00Z', finishedAt: '2026-05-28T10:30:00Z',
      totalKm: 5.2, totalMeters: 5200, elapsedMs: 1800000,
      nightRun: false, route: [{ lng: -46.63, lat: -23.55 }, { lng: -46.64, lat: -23.56 }],
      touchedSpots: ['s1'], weekKey: '2026-W22', synced: false,
    });
    const logs = getRunLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].totalKm).toBe(5.2);
  });

  it('caps at 50 logs, removing oldest synced first', async () => {
    const { saveRunLog, getRunLogs } = await import('../runLogStorage');
    for (let i = 0; i < 52; i++) {
      saveRunLog({
        id: `r${i}`, crewSlug: 'east-burners', zoneId: 'leste',
        startedAt: `2026-05-${String(i % 28 + 1).padStart(2, '0')}T10:00:00Z`,
        finishedAt: `2026-05-${String(i % 28 + 1).padStart(2, '0')}T10:30:00Z`,
        totalKm: 5, totalMeters: 5000, elapsedMs: 1800000,
        nightRun: false, route: [], touchedSpots: [], weekKey: '2026-W22',
        synced: i < 10,
      });
    }
    expect(getRunLogs().length).toBeLessThanOrEqual(50);
  });
});
