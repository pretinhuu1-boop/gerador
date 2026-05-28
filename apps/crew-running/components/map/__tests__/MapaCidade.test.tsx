import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MapaCidade } from '../MapaCidade';
import type { MapaCidadeVariant } from '../mapTypes';

const VARIANTS: MapaCidadeVariant[] = ['menu', 'run', 'signal', 'ambient'];

describe('MapaCidade Phase A shell', () => {
  it('renders without crashing for every declared variant', () => {
    for (const variant of VARIANTS) {
      const { container } = render(<MapaCidade variant={variant} />);
      expect(container.querySelector('.mapa-cidade')).not.toBeNull();
    }
  });

  it('stamps the variant onto a data attribute + modifier class', () => {
    for (const variant of VARIANTS) {
      const { container } = render(<MapaCidade variant={variant} />);
      const root = container.querySelector('.mapa-cidade') as HTMLElement;
      expect(root.classList.contains(`mapa-cidade--${variant}`)).toBe(true);
      expect(root.dataset.variant).toBe(variant);
    }
  });
});

describe('MapaCidade ambient variant', () => {
  it('removes itself from the a11y tree via aria-hidden', () => {
    const { container } = render(<MapaCidade variant="ambient" />);
    const root = container.querySelector('.mapa-cidade') as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root.getAttribute('role')).toBeNull();
    expect(root.getAttribute('aria-label')).toBeNull();
  });

  it('does NOT mount the pings shell, even with an active crew', () => {
    const { container } = render(
      <MapaCidade variant="ambient" activeCrewSlug="downtown-rush" />,
    );
    expect(container.querySelector('.mapa-cidade__pings')).toBeNull();
  });
});

describe('MapaCidade interactive variants', () => {
  it.each<MapaCidadeVariant>(['menu', 'run', 'signal'])(
    'exposes role=group + aria-label for variant %s',
    (variant) => {
      const { container } = render(<MapaCidade variant={variant} />);
      const root = container.querySelector('.mapa-cidade') as HTMLElement;
      expect(root.getAttribute('role')).toBe('group');
      expect(root.getAttribute('aria-label')).toMatch(/mapa/i);
      expect(root.hasAttribute('aria-hidden')).toBe(false);
    },
  );

  it.each<MapaCidadeVariant>(['menu', 'run', 'signal'])(
    'mounts the pings shell for variant %s',
    (variant) => {
      const { container } = render(<MapaCidade variant={variant} />);
      expect(container.querySelector('.mapa-cidade__pings')).not.toBeNull();
    },
  );

  it('only mounts the overlays shell for variant=run', () => {
    const menu = render(<MapaCidade variant="menu" />);
    expect(menu.container.querySelector('.mapa-cidade__overlays')).toBeNull();
    menu.unmount();

    const signal = render(<MapaCidade variant="signal" />);
    expect(signal.container.querySelector('.mapa-cidade__overlays')).toBeNull();
    signal.unmount();

    const run = render(<MapaCidade variant="run" />);
    expect(run.container.querySelector('.mapa-cidade__overlays')).not.toBeNull();
  });
});

describe('MapaCidade activeCrewSlug', () => {
  it('falls back to "unset" when no slug is provided', () => {
    const { container } = render(<MapaCidade variant="menu" />);
    const root = container.querySelector('.mapa-cidade') as HTMLElement;
    expect(root.dataset.activeCrew).toBe('unset');
  });

  it('mirrors the slug onto the data attribute when provided', () => {
    const { container } = render(
      <MapaCidade variant="menu" activeCrewSlug="east-burners" />,
    );
    const root = container.querySelector('.mapa-cidade') as HTMLElement;
    expect(root.dataset.activeCrew).toBe('east-burners');
  });
});
