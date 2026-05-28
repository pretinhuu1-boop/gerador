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

beforeEach(() => {
  mem = new MemoryStorage();
  vi.stubGlobal('localStorage', mem);
  vi.stubGlobal('crypto', { randomUUID: () => 'self-uuid' });
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const loadHook = async () => {
  const mod = await import('../useFriends');
  return mod.useFriends;
};

const friend = (userId: string, name = 'Bia') => ({
  userId,
  runnerName: name,
  crewSlug: 'east-burners',
  addedAt: 1_000,
  addMethod: 'qr' as const,
});

describe('useFriends', () => {
  it('starts with empty list when storage is empty', async () => {
    const useFriends = await loadHook();
    const { result } = renderHook(() => useFriends());
    expect(result.current.friends).toEqual([]);
  });

  it('reads existing friends on first render', async () => {
    mem.setItem('crew.friends', JSON.stringify([friend('a')]));
    const useFriends = await loadHook();
    const { result } = renderHook(() => useFriends());
    expect(result.current.friends.map((f) => f.userId)).toEqual(['a']);
  });

  it('add() bumps the local tick and re-reads storage', async () => {
    const useFriends = await loadHook();
    const { result } = renderHook(() => useFriends());
    act(() => {
      result.current.add(friend('a'));
    });
    expect(result.current.friends.map((f) => f.userId)).toEqual(['a']);
  });

  it('remove() drops the matching user', async () => {
    mem.setItem('crew.friends', JSON.stringify([friend('a'), friend('b')]));
    const useFriends = await loadHook();
    const { result } = renderHook(() => useFriends());
    act(() => {
      result.current.remove('a');
    });
    expect(result.current.friends.map((f) => f.userId)).toEqual(['b']);
  });

  it('refresh() picks up external storage writes', async () => {
    const useFriends = await loadHook();
    const { result } = renderHook(() => useFriends());
    mem.setItem('crew.friends', JSON.stringify([friend('ext', 'Ext')]));
    act(() => {
      result.current.refresh();
    });
    expect(result.current.friends.map((f) => f.userId)).toEqual(['ext']);
  });

  it('external version bump re-reads storage', async () => {
    const useFriends = await loadHook();
    const { result, rerender } = renderHook(({ v }: { v: number }) => useFriends(v), {
      initialProps: { v: 0 },
    });
    mem.setItem('crew.friends', JSON.stringify([friend('z', 'Z')]));
    rerender({ v: 1 });
    expect(result.current.friends.map((f) => f.userId)).toEqual(['z']);
  });
});
