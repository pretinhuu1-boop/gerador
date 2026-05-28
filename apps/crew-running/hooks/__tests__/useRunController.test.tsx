import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRunController } from '../useRunController';
import { runTracker } from '../../services/runTracker';
import { saveActiveRun } from '../../services/activeRunStorage';
import type { RunnerProgress } from '../../data/gamification';

const baseProgress: RunnerProgress = {
  xp: 0,
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
};

const installGeolocationStub = () => {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      watchPosition: () => 0,
      clearWatch: () => undefined,
    },
  });
};

beforeEach(() => {
  runTracker.reset();
  installGeolocationStub();
});

afterEach(() => {
  runTracker.reset();
});

describe('useRunController', () => {
  it('C1: mount without an active run keeps resumePromptOpen=false', () => {
    const { result } = renderHook(() => useRunController(baseProgress, 'downtown-rush'));
    expect(result.current.resumePromptOpen).toBe(false);
    expect(result.current.trackerActive).toBe(false);
  });

  it('C2: mount with a stored paused run opens the resume prompt', () => {
    saveActiveRun({
      startedAt: Date.now() - 30_000,
      elapsedMs: 10_000,
      state: 'paused',
      points: [{ lng: -46.63, lat: -23.55, t: Date.now() - 30_000, accuracy: 5 }],
      touchedSpotIds: [],
      totalMeters: 100,
      metersInTerritory: 0,
      crewSlug: 'downtown-rush',
      homeZoneId: 'centro',
    });
    const { result } = renderHook(() => useRunController(baseProgress, 'downtown-rush'));
    expect(result.current.resumePromptOpen).toBe(true);
  });

  it('C3: startRun calls runTracker.start with the selected crew slug', () => {
    const spy = vi.spyOn(runTracker, 'start');
    const { result } = renderHook(() => useRunController(baseProgress, 'east-burners'));
    act(() => result.current.startRun());
    expect(spy).toHaveBeenCalledWith('east-burners');
    spy.mockRestore();
  });

  it('C4: stopRun populates pendingSummary with a breakdown', () => {
    const { result } = renderHook(() => useRunController(baseProgress, 'downtown-rush'));
    act(() => result.current.startRun());
    act(() => result.current.stopRun());
    expect(result.current.pendingSummary).not.toBeNull();
    expect(result.current.pendingSummary?.breakdown.total).toBeGreaterThanOrEqual(0);
    expect(result.current.pendingSummary?.streak).toBeDefined();
  });

  it('C5: saveSummary fires onRunCompleted with nextProgress', () => {
    const onRunCompleted = vi.fn();
    const { result } = renderHook(() =>
      useRunController(baseProgress, 'downtown-rush', onRunCompleted),
    );
    act(() => result.current.startRun());
    act(() => result.current.stopRun());
    const pending = result.current.pendingSummary;
    expect(pending).not.toBeNull();
    act(() => result.current.saveSummary());
    expect(onRunCompleted).toHaveBeenCalledTimes(1);
    expect(onRunCompleted.mock.calls[0][0]).toMatchObject({ xp: pending!.nextProgress.xp });
  });

  it('C6: retryPermission resets tracker and tries start again', () => {
    const startSpy = vi.spyOn(runTracker, 'start');
    const resetSpy = vi.spyOn(runTracker, 'reset');
    const { result } = renderHook(() => useRunController(baseProgress, 'downtown-rush'));
    act(() => result.current.retryPermission());
    expect(resetSpy).toHaveBeenCalled();
    expect(startSpy).toHaveBeenCalledWith('downtown-rush');
    startSpy.mockRestore();
    resetSpy.mockRestore();
  });
});
