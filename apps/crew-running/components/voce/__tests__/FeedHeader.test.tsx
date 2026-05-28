import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedHeader } from '../FeedHeader';
import { CREWS } from '../../../data/crews';
import { RUNNER_TYPES } from '../../../data/runnerTypes';
import type { SavedCharacter } from '../../../services/storage';

const crew = CREWS[0];
const runnerType = RUNNER_TYPES[0];

const savedFixture: SavedCharacter = {
  imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
  profile: { name: 'NINA QA', sex: 'female', heightCm: 170, weightKg: 70, personality: '' },
  crewSlug: crew.slug,
  runnerTypeId: runnerType.id,
  slots: { top: 'jersey_black', bottom: 'shorts_grey', shoes: 'kicks_white', accessory: 'cap_red' },
  savedAt: 1_700_000_000_000,
};

const renderHeader = (overrides: Partial<React.ComponentProps<typeof FeedHeader>> = {}) =>
  render(
    <FeedHeader
      runnerName="NINA QA"
      crew={crew}
      savedCharacter={null}
      runnerType={runnerType}
      status="pending"
      onAdjust={() => undefined}
      lookCount={0}
      stickerCount={0}
      {...overrides}
    />,
  );

describe('FeedHeader status stamp', () => {
  it('shows RUNNER PRONTO stamp only when status is ready', () => {
    const { rerender } = renderHeader({ status: 'pending' });
    expect(screen.queryByText('RUNNER PRONTO')).toBeNull();

    rerender(
      <FeedHeader
        runnerName="NINA QA"
        crew={crew}
        savedCharacter={savedFixture}
        runnerType={runnerType}
        status="editing"
        onAdjust={() => undefined}
        lookCount={0}
        stickerCount={0}
      />,
    );
    expect(screen.queryByText('RUNNER PRONTO')).toBeNull();

    rerender(
      <FeedHeader
        runnerName="NINA QA"
        crew={crew}
        savedCharacter={savedFixture}
        runnerType={runnerType}
        status="ready"
        onAdjust={() => undefined}
        lookCount={3}
        stickerCount={0}
      />,
    );
    expect(screen.getByText('RUNNER PRONTO')).toBeInTheDocument();
  });
});

describe('FeedHeader portrait', () => {
  it('renders a CrewBadge fallback when no portrait is saved', () => {
    const { container } = renderHeader({ savedCharacter: null });
    expect(container.querySelector('.voce-feed-header__portrait img[src*="/crews/"]')).not.toBeNull();
    expect(container.querySelector('.voce-feed-header__portrait img[src^="data:"]')).toBeNull();
  });

  it('renders the saved portrait when imageDataUrl is present, with a meaningful alt', () => {
    const { container } = renderHeader({ savedCharacter: savedFixture });
    const img = container.querySelector('.voce-feed-header__portrait img') as HTMLImageElement;
    expect(img.src).toContain('data:image/png');
    expect(img.alt.toLowerCase()).toContain('nina qa');
  });
});

describe('FeedHeader stats chips', () => {
  it('renders exactly LOOKS, STICKERS, CREW — no engagement metrics', () => {
    const { container } = renderHeader({ lookCount: 3, stickerCount: 2 });
    const labels = Array.from(container.querySelectorAll('.voce-feed-header__stats li span'))
      .map((el) => el.textContent?.trim());
    expect(labels).toEqual(['LOOKS', 'STICKERS', 'CREW']);
  });

  it('surfaces lookCount + stickerCount + a hardcoded CREW of 1', () => {
    const { container } = renderHeader({ lookCount: 7, stickerCount: 4 });
    const values = Array.from(container.querySelectorAll('.voce-feed-header__stats li strong'))
      .map((el) => el.textContent?.trim());
    expect(values).toEqual(['7', '4', '1']);
  });

  it('does not leak follower/view/like copy anywhere in the header', () => {
    const { container } = renderHeader({ savedCharacter: savedFixture, status: 'ready', lookCount: 10 });
    expect(container.textContent ?? '').not.toMatch(/follower|view|like|streak/i);
  });
});

describe('FeedHeader actions', () => {
  it('invokes onAdjust when AJUSTAR is clicked', () => {
    const onAdjust = vi.fn();
    renderHeader({ onAdjust });
    screen.getByRole('button', { name: /AJUSTAR/i }).click();
    expect(onAdjust).toHaveBeenCalledTimes(1);
  });

  it('marks the F3 messages placeholder as aria-hidden', () => {
    const { container } = renderHeader();
    const dm = container.querySelector('.voce-feed-header__dm-placeholder');
    expect(dm).not.toBeNull();
    expect(dm).toHaveAttribute('aria-hidden', 'true');
    expect(dm?.textContent).toMatch(/F3/);
  });
});
