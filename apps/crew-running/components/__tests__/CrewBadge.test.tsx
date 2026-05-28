import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CrewBadge } from '../CrewBadge';
import { getCrewBySlug } from '../../data/crews';

describe('CrewBadge', () => {
  it('resolves crew from slug string and sets accent', () => {
    const { container } = render(<CrewBadge crew="north-breakers" />);
    const img = container.querySelector('img')!;
    const crew = getCrewBySlug('north-breakers');
    expect(img.getAttribute('src')).toBe(crew.assets.badge);
    expect(img.style.getPropertyValue('--crew-accent')).toBe(crew.accent);
  });

  it('accepts a CrewZone object directly without resolving', () => {
    const crew = getCrewBySlug('downtown-rush');
    const { container } = render(<CrewBadge crew={crew} />);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('src')).toBe(crew.assets.badge);
  });

  it('falls back to default crew when slug undefined', () => {
    const { container } = render(<CrewBadge crew={undefined} />);
    const img = container.querySelector('img')!;
    // Should still render valid src (default crew badge)
    expect(img.getAttribute('src')).toMatch(/badge_128\.png$/);
  });

  it('applies size attribute matching the size prop', () => {
    const { container } = render(<CrewBadge crew="north-breakers" size="lg" />);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('96');
    expect(img.getAttribute('height')).toBe('96');
  });

  it('defaults size md (48px) when omitted', () => {
    const { container } = render(<CrewBadge crew="north-breakers" />);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('width')).toBe('48');
  });

  it('marks aria-hidden when no alt provided', () => {
    const { container } = render(<CrewBadge crew="north-breakers" />);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('aria-hidden')).toBe('true');
    expect(img.getAttribute('alt')).toBe('');
  });

  it('uses alt text when provided and does not mark aria-hidden', () => {
    const { container } = render(
      <CrewBadge crew="north-breakers" alt="Distintivo da crew Norte" />,
    );
    const img = container.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('Distintivo da crew Norte');
    expect(img.getAttribute('aria-hidden')).toBeNull();
  });

  it('adds is-pulsing-crew class when pulse is true', () => {
    const { container } = render(<CrewBadge crew="north-breakers" pulse />);
    const img = container.querySelector('img')!;
    expect(img.className).toMatch(/is-pulsing-crew/);
  });
});
