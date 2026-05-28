import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { SpotLayer } from '../SpotLayer';
import {
  SP_SPOT_MAP_FEATURES,
  getSpotsByZone,
  type ProjectionOpts,
} from '../../../data/spLiveMap';

const projection: ProjectionOpts = { width: 800, height: 700, padding: 40 };

const renderSvg = (children: React.ReactNode) =>
  render(<svg viewBox="0 0 800 700">{children}</svg>);

describe('SpotLayer', () => {
  it('S1: zoom=city renders nothing', () => {
    const { container } = renderSvg(<SpotLayer projection={projection} zoom="city" />);
    expect(container.querySelector('.map-spot-layer')).toBeNull();
  });

  it('S2: zoom=zone renders only spots of activeZoneId', () => {
    const { container } = renderSvg(
      <SpotLayer projection={projection} zoom="zone" activeZoneId="centro" />,
    );
    const dots = container.querySelectorAll('.map-spot');
    const expected = getSpotsByZone('centro').length;
    expect(dots.length).toBe(expected);
  });

  it('S3: zoom=spot renders all spots and shows labels', () => {
    const { container } = renderSvg(<SpotLayer projection={projection} zoom="spot" />);
    const dots = container.querySelectorAll('.map-spot');
    const labels = container.querySelectorAll('.map-spot-label');
    expect(dots.length).toBe(SP_SPOT_MAP_FEATURES.length);
    expect(labels.length).toBe(SP_SPOT_MAP_FEATURES.length);
  });

  it('S4: locked spot does not fire onSelectSpot on click', () => {
    const onSelectSpot = vi.fn();
    const { container } = renderSvg(
      <SpotLayer
        projection={projection}
        zoom="spot"
        onSelectSpot={onSelectSpot}
      />,
    );
    const locked = container.querySelector('.map-spot.is-locked .map-spot-dot');
    expect(locked).toBeTruthy();
    fireEvent.click(locked!);
    expect(onSelectSpot).not.toHaveBeenCalled();
  });

  it('S5: clicking an active spot fires onSelectSpot with its id', () => {
    const onSelectSpot = vi.fn();
    const { container } = renderSvg(
      <SpotLayer
        projection={projection}
        zoom="zone"
        activeZoneId="centro"
        onSelectSpot={onSelectSpot}
      />,
    );
    const active = container.querySelector('.map-spot.is-open .map-spot-dot');
    expect(active).toBeTruthy();
    fireEvent.click(active!);
    expect(onSelectSpot).toHaveBeenCalledTimes(1);
    expect(typeof onSelectSpot.mock.calls[0][0]).toBe('string');
  });

  it('S6: keyboard Enter/Space activates active spot', () => {
    const onSelectSpot = vi.fn();
    const { container } = renderSvg(
      <SpotLayer
        projection={projection}
        zoom="zone"
        activeZoneId="centro"
        onSelectSpot={onSelectSpot}
      />,
    );
    const active = container.querySelector('.map-spot.is-open .map-spot-dot');
    fireEvent.keyDown(active!, { key: 'Enter' });
    expect(onSelectSpot).toHaveBeenCalled();
  });

  it('S7: activeSpotId marks one spot is-active', () => {
    const { container } = renderSvg(
      <SpotLayer
        projection={projection}
        zoom="spot"
        activeSpotId="spot-vale"
      />,
    );
    const actives = container.querySelectorAll('.map-spot.is-active');
    expect(actives.length).toBe(1);
  });
});
