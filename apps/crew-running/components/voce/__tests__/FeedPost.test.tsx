import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeedPost } from '../FeedPost';
import { IDENTITY_EVENT_VARIANTS, type IdentityEvent } from '../../../data/identityEvents';
import type { SavedCharacter } from '../../../services/storage';

const sampleSaved: SavedCharacter = {
  imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
  profile: { name: 'NINA QA', sex: 'female', heightCm: 170, weightKg: 70, personality: '' },
  crewSlug: 'west-flow',
  runnerTypeId: 'crew-pace',
  slots: { top: 'jersey_black', bottom: 'shorts_grey', shoes: 'kicks_white', accessory: 'cap_red' },
  savedAt: 1_700_000_000_000,
};

const buildEvent = (overrides: Partial<IdentityEvent> = {}): IdentityEvent => ({
  id: 'look_saved_1700000000000',
  kind: 'LOOK_SAVED',
  timestamp: 1_700_000_000_000,
  payload: { crewSlug: 'west-flow', runnerTypeId: 'crew-pace' },
  ...overrides,
});

describe('FeedPost chrome', () => {
  it('uses the kind-variant rail token as a CSS custom property', () => {
    const { container } = render(<FeedPost event={buildEvent()} />);
    const li = container.querySelector('.voce-feed-post') as HTMLElement;
    expect(li.style.getPropertyValue('--rail-color')).toBe(
      IDENTITY_EVENT_VARIANTS.LOOK_SAVED.railToken,
    );
    expect(li.style.getPropertyValue('--swatch-color')).toBe(
      IDENTITY_EVENT_VARIANTS.LOOK_SAVED.swatchToken,
    );
  });

  it('renders the variant headline + body for the event kind', () => {
    render(<FeedPost event={buildEvent({ kind: 'CREW_JOINED' })} />);
    expect(screen.getByText('ENTROU NA CREW')).toBeInTheDocument();
    expect(screen.getByText(/Sinal aceito/)).toBeInTheDocument();
  });
});

describe('FeedPost date footer', () => {
  it('renders <time> with ISO dateTime when timestamp > 0', () => {
    const { container } = render(<FeedPost event={buildEvent()} />);
    const time = container.querySelector('time.voce-feed-post__date');
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute('dateTime', '2023-11-14T22:13:20.000Z');
  });

  it('omits the date footer entirely when timestamp is the synthetic sentinel 0', () => {
    const { container } = render(<FeedPost event={buildEvent({ timestamp: 0 })} />);
    expect(container.querySelector('time')).toBeNull();
  });
});

describe('FeedPost runner look card', () => {
  it('renders the runner look card for LOOK_SAVED when a saved character image is available', () => {
    const { container } = render(
      <FeedPost event={buildEvent({ kind: 'LOOK_SAVED' })} savedCharacter={sampleSaved} />,
    );
    expect(container.querySelector('.runner-look-card')).not.toBeNull();
    expect(container.querySelector('.runner-look-card__name')?.textContent).toBe('NINA QA');
    expect(container.querySelector('.runner-look-card__photo img')).toHaveAttribute(
      'src',
      sampleSaved.imageDataUrl,
    );
  });

  it('does NOT render the look card for non-look kinds', () => {
    const { container } = render(
      <FeedPost event={buildEvent({ kind: 'CREW_JOINED' })} savedCharacter={sampleSaved} />,
    );
    expect(container.querySelector('[class*="runner-look"]')).toBeNull();
  });

  it('renders a crew-anchored look card when savedCharacter is missing but event has crewSlug', () => {
    // H1 fix: feed must still surface kind context (badge + runner type)
    // even when savedCharacter was wiped or never existed.
    const { container } = render(<FeedPost event={buildEvent({ kind: 'LOOK_SAVED' })} />);
    expect(container.querySelector('.runner-look-card')).not.toBeNull();
  });

  it('does NOT render the look card on LOOK_SAVED when neither savedCharacter nor crewSlug exist', () => {
    const { container } = render(
      <FeedPost event={buildEvent({ kind: 'LOOK_SAVED', payload: {} })} />,
    );
    expect(container.querySelector('[class*="runner-look"]')).toBeNull();
  });
});

describe('FeedPost vanity-metric guard', () => {
  it('contains zero engagement-metric copy in the rendered DOM', () => {
    const { container } = render(
      <FeedPost event={buildEvent({ kind: 'LOOK_SAVED' })} savedCharacter={sampleSaved} />,
    );
    const text = container.textContent ?? '';
    const forbidden = /\b(like|likes|view|views|follower|followers|streak|share|publicar)\b/i;
    expect(text).not.toMatch(forbidden);
  });
});
