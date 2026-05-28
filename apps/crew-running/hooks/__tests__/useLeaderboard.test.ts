import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useZoneLeaderboard, useCrewTopRunners } from '../useLeaderboard';

vi.mock('../../services/supabaseClient', () => ({
  getSupabase: () => null,
}));

describe('useZoneLeaderboard', () => {
  it('returns empty array when Supabase unavailable', () => {
    const { result } = renderHook(() => useZoneLeaderboard('centro', '2026-W22'));
    expect(result.current.entries).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});

describe('useCrewTopRunners', () => {
  it('returns empty array when Supabase unavailable', () => {
    const { result } = renderHook(() => useCrewTopRunners('east-burners', '2026-W22', 3));
    expect(result.current.entries).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
