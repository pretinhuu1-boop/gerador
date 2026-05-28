import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ZoneLayer } from '../ZoneLayer';
import { SP_ZONE_MAP_FEATURES, type ProjectionOpts } from '../../../data/spLiveMap';

const projection: ProjectionOpts = { width: 800, height: 700, padding: 40 };

const renderSvg = (children: React.ReactNode) =>
  render(<svg viewBox="0 0 800 700">{children}</svg>);

describe('ZoneLayer', () => {
  it('Z1: renders one path per zone', () => {
    const { container } = renderSvg(<ZoneLayer projection={projection} />);
    const paths = container.querySelectorAll('.map-zone');
    expect(paths.length).toBe(SP_ZONE_MAP_FEATURES.length);
  });

  it('Z2: clicking a zone fires onSelectZone with that id', () => {
    const onSelectZone = vi.fn();
    const { container } = renderSvg(
      <ZoneLayer projection={projection} onSelectZone={onSelectZone} />,
    );
    const centroPath = container.querySelector('[aria-label="Centro"]');
    expect(centroPath).toBeTruthy();
    fireEvent.click(centroPath!);
    expect(onSelectZone).toHaveBeenCalledWith('centro');
  });

  it('Z3+Z4: Enter and Space activate keyboard nav on role=button paths', () => {
    const onSelectZone = vi.fn();
    const { container } = renderSvg(
      <ZoneLayer projection={projection} onSelectZone={onSelectZone} />,
    );
    const path = container.querySelector('[aria-label="Norte"]');
    fireEvent.keyDown(path!, { key: 'Enter' });
    expect(onSelectZone).toHaveBeenCalledWith('norte');

    onSelectZone.mockReset();
    fireEvent.keyDown(path!, { key: ' ' });
    expect(onSelectZone).toHaveBeenCalledWith('norte');
  });

  it('Z3.b: irrelevant keys do not fire onSelectZone', () => {
    const onSelectZone = vi.fn();
    const { container } = renderSvg(
      <ZoneLayer projection={projection} onSelectZone={onSelectZone} />,
    );
    const path = container.querySelector('[aria-label="Sul"]');
    fireEvent.keyDown(path!, { key: 'Tab' });
    fireEvent.keyDown(path!, { key: 'Escape' });
    expect(onSelectZone).not.toHaveBeenCalled();
  });

  it('Z5: activeZoneId marks one zone is-active and dims others', () => {
    const { container } = renderSvg(
      <ZoneLayer projection={projection} activeZoneId="leste" />,
    );
    const active = container.querySelector('.map-zone.is-active');
    const dimmed = container.querySelectorAll('.map-zone.is-dimmed');
    expect(active?.getAttribute('aria-label')).toBe('Leste');
    expect(dimmed.length).toBe(SP_ZONE_MAP_FEATURES.length - 1);
  });

  it('Z6: ownership >= 0.6 maps to is-status-owned', () => {
    const { container } = renderSvg(
      <ZoneLayer
        projection={projection}
        ownershipByZone={{ centro: 0.85, norte: 0.5, sul: 0.2 }}
      />,
    );
    const centro = container.querySelector('[aria-label="Centro"]');
    const norte = container.querySelector('[aria-label="Norte"]');
    const sul = container.querySelector('[aria-label="Sul"]');
    expect(centro?.classList.contains('is-status-owned')).toBe(true);
    expect(norte?.classList.contains('is-status-contested')).toBe(true);
    expect(sul?.classList.contains('is-status-neutral')).toBe(true);
  });

  it('Z7: no onSelectZone -> no role=button or tabIndex on paths', () => {
    const { container } = renderSvg(<ZoneLayer projection={projection} />);
    const paths = container.querySelectorAll('.map-zone');
    for (const path of Array.from(paths)) {
      expect(path.getAttribute('role')).toBeNull();
      expect(path.getAttribute('tabindex')).toBeNull();
    }
  });
});
