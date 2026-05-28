import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RunnerPanel } from '../RunnerPanel';
import { CREWS } from '../../../data/crews';
import type { LaunchProgress } from '../../../services/launchStorage';
import {
  appendIdentityEvent,
  clearIdentityEvents,
  getIdentityEvents,
  type SavedCharacter,
} from '../../../services/storage';

const crew = CREWS[0];

const baseProgress: LaunchProgress = {
  consoleBootSeen: true,
  titleSeen: true,
  citySignalSeen: true,
  mainMenuSeen: true,
  onboardingStep: 4,
  selectedCrewSlug: crew.slug,
  guidedSetupComplete: true,
  onboardingComplete: true,
  runnerCustomized: false,
};

const savedFixture: SavedCharacter = {
  imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
  profile: { name: 'NINA QA', sex: 'female', heightCm: 170, weightKg: 70, personality: '' },
  crewSlug: crew.slug,
  runnerTypeId: 'crew-pace',
  slots: { top: 'jersey_black', bottom: 'shorts_grey', shoes: 'kicks_white', accessory: 'cap_red' },
  savedAt: 1_700_000_000_000,
};

beforeEach(() => {
  clearIdentityEvents();
});

afterEach(() => {
  clearIdentityEvents();
});

const renderPanel = (overrides: Partial<React.ComponentProps<typeof RunnerPanel>> = {}) =>
  render(
    <RunnerPanel
      crew={crew}
      savedCharacter={null}
      progress={baseProgress}
      runnerName="RUNNER"
      onAdjust={() => undefined}
      guideDone={true}
      {...overrides}
    />,
  );

describe('RunnerPanel composition', () => {
  it('always renders the FeedHeader, FriendsStripPlaceholder, and MapSocialHookButton', () => {
    const { container } = renderPanel();
    expect(container.querySelector('.voce-feed-header')).not.toBeNull();
    expect(container.querySelector('.voce-panel__friends-strip')).not.toBeNull();
    expect(container.querySelector('.voce-panel__map-hook, [class*="map-hook"]')).not.toBeNull();
    expect(screen.getByText(/MAPA SOCIAL · EM BREVE/)).toBeInTheDocument();
  });

  it('uses an <ol> with an accessible label for the feed list', () => {
    const { container } = renderPanel();
    const list = container.querySelector('ol.voce-panel__feed');
    expect(list).not.toBeNull();
    expect(list).toHaveAttribute('aria-label');
    expect(list?.getAttribute('aria-label')?.toLowerCase()).toMatch(/identidade|linha do tempo/);
  });
});

describe('RunnerPanel empty state', () => {
  it('renders the synthetic CREW_JOINED card when there are no events but a crew is selected', () => {
    const { container } = renderPanel({ savedCharacter: null, progress: { ...baseProgress, citySignalSeen: false, guidedSetupComplete: false } });
    expect(container.querySelectorAll('.voce-feed-post')).toHaveLength(1);
    expect(screen.getByText('ENTROU NA CREW')).toBeInTheDocument();
    expect(container.querySelector('time')).toBeNull();
  });
});

describe('RunnerPanel with saved character', () => {
  it('backfills + renders at least one persisted event when a saved character is provided', async () => {
    const { container } = renderPanel({
      savedCharacter: savedFixture,
      progress: { ...baseProgress, runnerCustomized: true },
    });
    // Structural check: backfill writes events to storage, hook reads them,
    // panel renders a FeedPost per event. Assert on the LOOK_SAVED card
    // existence + its embedded RunnerLookCard, not on slot-formatting text
    // (that lives in identityEvents.ts and would silently rot this test).
    await waitFor(
      () => {
        const headlines = Array.from(container.querySelectorAll('.voce-feed-post__headline'))
          .map((el) => el.textContent?.trim());
        expect(headlines).toContain('LOOK SALVO');
      },
      { timeout: 1000 },
    );
    expect(container.querySelector('.voce-feed-post .runner-look-card')).not.toBeNull();
    expect(getIdentityEvents().some((e) => e.kind === 'LOOK_SAVED')).toBe(true);
  });
});

describe('RunnerPanel with pre-seeded events', () => {
  it('renders one FeedPost per stored event, newest first', async () => {
    appendIdentityEvent({
      kind: 'BADGE_EARNED',
      timestamp: 1_700_000_000_000,
      payload: { badgeId: 'first-loop' },
    });
    appendIdentityEvent({
      kind: 'STICKER_DROPPED',
      timestamp: 1_700_000_001_000,
      payload: { stickerId: 'tag-01' },
    });
    const { container } = renderPanel({ savedCharacter: savedFixture });
    await waitFor(
      () => {
        expect(container.querySelectorAll('.voce-feed-post').length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 1000 },
    );
    const headlines = Array.from(container.querySelectorAll('.voce-feed-post__headline')).map((el) =>
      el.textContent?.trim(),
    );
    // STICKER (ts 1_700_000_001_000) is newer than BADGE (ts 1_700_000_000_000) → STICKER first
    const firstTwo = headlines.slice(0, 2);
    expect(firstTwo[0]).toBe('STICKER COLETADO');
    expect(firstTwo[1]).toBe('BADGE DESBLOQUEADO');
  });

  it('reflects sticker count in the FeedHeader stats chip', async () => {
    appendIdentityEvent({
      kind: 'STICKER_DROPPED',
      timestamp: 1_700_000_000_000,
      payload: { stickerId: 'a' },
    });
    appendIdentityEvent({
      kind: 'STICKER_DROPPED',
      timestamp: 1_700_000_001_000,
      payload: { stickerId: 'b' },
    });
    const { container } = renderPanel({ savedCharacter: savedFixture });
    await waitFor(
      () => {
        const stickerStat = container
          .querySelectorAll('.voce-feed-header__stats li')[1]
          ?.querySelector('strong')?.textContent;
        expect(stickerStat).toBe('2');
      },
      { timeout: 1000 },
    );
  });
});
