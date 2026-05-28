import { describe, expect, it, vi } from 'vitest';
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

  it.each<MapaCidadeVariant>(['menu', 'run', 'signal', 'ambient'])(
    'keeps the inner SVG presentational so AT does not double-announce on variant %s',
    (variant) => {
      const { container } = render(<MapaCidade variant={variant} />);
      const svg = container.querySelector('svg.mapa-cidade__svg') as SVGElement;
      expect(svg.getAttribute('role')).toBe('presentation');
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.getAttribute('aria-label')).toBeNull();
    },
  );

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

describe('MapaCidade phase C interactivity', () => {
  it('renders interactive ping buttons when onSelectCrew is provided', () => {
    const { container } = render(
      <MapaCidade variant="menu" onSelectCrew={() => undefined} />,
    );
    const pings = container.querySelectorAll('button.mapa-cidade__ping');
    expect(pings).toHaveLength(5);
    pings.forEach((p) => {
      expect(p.getAttribute('aria-label')).toMatch(/,/);
    });
  });

  it('marks the active crew with aria-pressed=true and dims the rest', () => {
    const { container } = render(
      <MapaCidade
        variant="menu"
        activeCrewSlug="east-burners"
        onSelectCrew={() => undefined}
      />,
    );
    const pressed = container.querySelectorAll(
      'button.mapa-cidade__ping[aria-pressed="true"]',
    );
    expect(pressed).toHaveLength(1);
    expect(pressed[0].getAttribute('aria-label')).toMatch(/East Burners/);
  });

  it('falls back to non-interactive div pings when no callback', () => {
    const { container } = render(<MapaCidade variant="signal" />);
    expect(container.querySelectorAll('button.mapa-cidade__ping')).toHaveLength(0);
    expect(container.querySelectorAll('div.mapa-cidade__ping')).toHaveLength(5);
  });

  it('fires onSelectCrew with the crew slug on ping click', () => {
    const spy = vi.fn();
    const { container } = render(
      <MapaCidade variant="menu" activeCrewSlug="east-burners" onSelectCrew={spy} />,
    );
    const north = Array.from(
      container.querySelectorAll('button.mapa-cidade__ping'),
    ).find((b) => /North/.test(b.getAttribute('aria-label') ?? ''));
    (north as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledWith('north-breakers');
  });

  it('surfaces the territory tier in the aria-label when ownership is provided', () => {
    const { container } = render(
      <MapaCidade
        variant="menu"
        activeCrewSlug="downtown-rush"
        ownershipByZone={{ centro: 0.9 }}
        onSelectCrew={() => undefined}
      />,
    );
    const active = container.querySelector(
      'button.mapa-cidade__ping[aria-pressed="true"]',
    );
    expect(active?.getAttribute('aria-label')).toMatch(/owned/);
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
