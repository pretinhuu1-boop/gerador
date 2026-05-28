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

describe('MapaCidade phase B static layers', () => {
  it.each<MapaCidadeVariant>(['menu', 'run', 'signal', 'ambient'])(
    'mounts AsphaltLayer + SVG roads + zones for variant %s',
    (variant) => {
      const { container } = render(<MapaCidade variant={variant} />);
      expect(container.querySelector('.mapa-cidade__asphalt')).not.toBeNull();
      expect(container.querySelector('svg.mapa-cidade__svg')).not.toBeNull();
      expect(container.querySelector('.mapa-cidade__roads')).not.toBeNull();
      expect(container.querySelector('.map-zone-layer')).not.toBeNull();
    },
  );

  it('hides individual spot markers at city zoom (SpotLayer returns null)', () => {
    // The shell pins zoom="city" today; SpotLayer treats that as zoom-out
    // and renders nothing. Phase C lifts zoom into useMapView and the
    // assertion flips per active zoom level.
    const { container } = render(<MapaCidade variant="menu" />);
    expect(container.querySelector('.map-spot-layer')).toBeNull();
  });

  it('hides the SVG from a11y when variant=ambient', () => {
    const { container } = render(<MapaCidade variant="ambient" />);
    const svg = container.querySelector('svg.mapa-cidade__svg') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('exposes a meaningful SVG label on interactive variants', () => {
    const { container } = render(<MapaCidade variant="menu" />);
    const svg = container.querySelector('svg.mapa-cidade__svg') as SVGElement;
    expect(svg.getAttribute('aria-label')).toMatch(/Sao Paulo/i);
    expect(svg.getAttribute('aria-hidden')).toBeNull();
  });

  it('passes ownershipByZone through to ZonesLayer', () => {
    const { container } = render(
      <MapaCidade variant="menu" ownershipByZone={{ centro: 0.9 }} />,
    );
    // ZoneLayer derives a status class per zone; with ownership=0.9
    // the centro zone hits the "owned" tier.
    const owned = container.querySelector('.map-zone.is-status-owned');
    expect(owned).not.toBeNull();
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
