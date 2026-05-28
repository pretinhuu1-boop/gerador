import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useIdentityFeed } from '../useIdentityFeed';
import {
  clearIdentityEvents,
  getIdentityEvents,
  appendIdentityEvent,
  type SavedCharacter,
} from '../../services/storage';
import type { LaunchProgress } from '../../services/launchStorage';

const baseProgress = (over: Partial<LaunchProgress> = {}): LaunchProgress => ({
  consoleBootSeen: true,
  titleSeen: true,
  citySignalSeen: true,
  mainMenuSeen: true,
  onboardingStep: 0,
  selectedCrewSlug: 'north-breakers',
  guidedSetupComplete: true,
  onboardingComplete: true,
  runnerCustomized: false,
  ...over,
});

const baseCharacter = (over: Partial<SavedCharacter> = {}): SavedCharacter => ({
  imageDataUrl: 'data:image/png;base64,xxx',
  crewSlug: 'north-breakers',
  runnerTypeId: 'sprint',
  renderStyleId: 'street-v2',
  slots: { top: 'a', bottom: 'b', shoes: 'c', accessory: 'd' },
  savedAt: 1_700_000_000_000,
  ...over,
});

beforeEach(() => {
  clearIdentityEvents();
});

describe('useIdentityFeed', () => {
  it('returns [] when storage empty and no context', () => {
    const { result } = renderHook(() => useIdentityFeed({}));
    expect(result.current).toEqual([]);
  });

  it('backfills CREW_JOINED + GUIDE_COMPLETED + LOOK_SAVED for returning user', () => {
    const { result } = renderHook(() =>
      useIdentityFeed({
        progress: baseProgress(),
        savedCharacter: baseCharacter(),
      }),
    );
    const kinds = result.current.map((e) => e.kind);
    expect(kinds).toContain('LOOK_SAVED');
    expect(kinds).toContain('GUIDE_COMPLETED');
    expect(kinds).toContain('CREW_JOINED');
  });

  it('does not duplicate backfill on second render of same context', () => {
    const { rerender } = renderHook(
      (props: { v: number }) =>
        useIdentityFeed({
          version: props.v,
          progress: baseProgress(),
          savedCharacter: baseCharacter(),
        }),
      { initialProps: { v: 0 } },
    );
    rerender({ v: 1 });
    const stored = getIdentityEvents();
    const lookSaved = stored.filter((e) => e.kind === 'LOOK_SAVED');
    expect(lookSaved.length).toBe(1);
  });

  it('returns events sorted newest first', () => {
    appendIdentityEvent({
      kind: 'LOOK_SAVED',
      payload: { crewSlug: 'north-breakers' },
      timestamp: 1000,
    });
    appendIdentityEvent({
      kind: 'CREW_JOINED',
      payload: { crewSlug: 'north-breakers' },
      timestamp: 2000,
    });
    const { result } = renderHook(() => useIdentityFeed({}));
    expect(result.current[0].timestamp).toBe(2000);
    expect(result.current[1].timestamp).toBe(1000);
  });

  it('re-reads when version bumps', () => {
    const { result, rerender } = renderHook(
      (props: { v: number }) => useIdentityFeed({ version: props.v }),
      { initialProps: { v: 0 } },
    );
    expect(result.current.length).toBe(0);
    appendIdentityEvent({
      kind: 'CREW_JOINED',
      payload: { crewSlug: 'north-breakers' },
      timestamp: 5000,
    });
    rerender({ v: 1 });
    expect(result.current.length).toBe(1);
  });
});
