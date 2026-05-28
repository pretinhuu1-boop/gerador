import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem = (k: string) => (this.map.has(k) ? this.map.get(k)! : null);
  setItem = (k: string, v: string) => { this.map.set(k, v); };
  removeItem = (k: string) => { this.map.delete(k); };
  clear = () => { this.map.clear(); };
}

let mem: MemoryStorage;
const NOW = 4_000_000_000_000;

beforeEach(() => {
  mem = new MemoryStorage();
  vi.stubGlobal('localStorage', mem);
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const loadHook = async () => {
  const mod = await import('../useCrewRadio');
  return mod.useCrewRadio;
};

describe('useCrewRadio', () => {
  it('starts empty when storage has no messages', async () => {
    const useCrewRadio = await loadHook();
    const { result } = renderHook(() =>
      useCrewRadio({ crewSlug: 'east-burners', selfUserId: 'self' }),
    );
    expect(result.current.messages).toEqual([]);
  });

  it('post writes a message and surfaces it', async () => {
    const useCrewRadio = await loadHook();
    const { result } = renderHook(() =>
      useCrewRadio({ crewSlug: 'east-burners', selfUserId: 'self', selfRunnerName: 'Me' }),
    );
    act(() => {
      result.current.post('hello');
    });
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].text).toBe('hello');
    expect(result.current.messages[0].authorName).toBe('Me');
    expect(result.current.messages[0].crewSlug).toBe('east-burners');
  });

  it('post sanitizes whitespace and rejects empty', async () => {
    const useCrewRadio = await loadHook();
    const { result } = renderHook(() =>
      useCrewRadio({ crewSlug: 'east-burners', selfUserId: 'self' }),
    );
    let saved;
    act(() => {
      saved = result.current.post('   ');
    });
    expect(saved).toBeNull();
    act(() => {
      saved = result.current.post('   trimmed   ');
    });
    expect(result.current.messages[0].text).toBe('trimmed');
  });

  it('post returns null when crewSlug is missing', async () => {
    const useCrewRadio = await loadHook();
    const { result } = renderHook(() => useCrewRadio({ selfUserId: 'self' }));
    let saved;
    act(() => {
      saved = result.current.post('hi');
    });
    expect(saved).toBeNull();
    expect(result.current.messages).toEqual([]);
  });

  it('60s prune interval refreshes messages', async () => {
    const useCrewRadio = await loadHook();
    const { result } = renderHook(() =>
      useCrewRadio({ crewSlug: 'east-burners', selfUserId: 'self' }),
    );
    act(() => {
      result.current.post('a');
    });
    expect(result.current.messages.length).toBe(1);
    act(() => {
      vi.advanceTimersByTime(60_001);
    });
    expect(result.current.messages.length).toBe(1);
  });
});
