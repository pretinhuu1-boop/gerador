import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RunnerLookCard } from '../RunnerLookCard';

describe('RunnerLookCard', () => {
  it('renders imageDataUrl when provided', () => {
    const { container } = render(
      <RunnerLookCard imageDataUrl="data:image/png;base64,abc" name="Lia" />,
    );
    const img = container.querySelector('.runner-look-card__photo img')!;
    expect(img.getAttribute('src')).toBe('data:image/png;base64,abc');
  });

  it('skips photo block when imageDataUrl missing', () => {
    const { container } = render(<RunnerLookCard name="Lia" />);
    expect(container.querySelector('.runner-look-card__photo')).toBeNull();
  });

  it('renders CrewBadge only when crewSlug truthy', () => {
    const { container, rerender } = render(<RunnerLookCard name="Lia" />);
    expect(container.querySelector('img')).toBeNull();
    rerender(<RunnerLookCard name="Lia" crewSlug="north-breakers" />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it('renders name and runner type label', () => {
    render(
      <RunnerLookCard
        name="Lia"
        runnerTypeLabel="Sprint"
        crewSlug="north-breakers"
      />,
    );
    expect(screen.getByText('Lia')).toBeInTheDocument();
    expect(screen.getByText('Sprint')).toBeInTheDocument();
  });

  it('applies size variant class', () => {
    const { container } = render(
      <RunnerLookCard name="Lia" size="lg" crewSlug="north-breakers" />,
    );
    expect(container.querySelector('.runner-look-card--lg')).not.toBeNull();
  });

  it('merges className passthrough', () => {
    const { container } = render(
      <RunnerLookCard name="Lia" className="voce-feed-post__look" crewSlug="north-breakers" />,
    );
    expect(container.querySelector('.voce-feed-post__look')).not.toBeNull();
  });
});
