import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { LayerRail } from '../LayerRail';
import type { MapLayerState } from '../mapTypes';

const defaultLayers: MapLayerState = {
  territory: true,
  live: true,
  missions: false,
  history: false,
};

describe('LayerRail', () => {
  it('L1: renders 4 chips', () => {
    render(<LayerRail layers={defaultLayers} onToggle={() => undefined} />);
    expect(screen.getAllByRole('button').length).toBe(4);
  });

  it('L2: active chip has aria-pressed=true', () => {
    render(<LayerRail layers={defaultLayers} onToggle={() => undefined} />);
    const territory = screen.getByRole('button', { name: /Território/i });
    const missions = screen.getByRole('button', { name: /Missões/i });
    expect(territory.getAttribute('aria-pressed')).toBe('true');
    expect(missions.getAttribute('aria-pressed')).toBe('false');
  });

  it('L3: chip disabled when availability=false has disabled + aria-disabled and ignores click', () => {
    const onToggle = vi.fn();
    render(
      <LayerRail
        layers={defaultLayers}
        onToggle={onToggle}
        availability={{ history: false }}
      />,
    );
    const history = screen.getByRole('button', { name: /História/i });
    expect((history as HTMLButtonElement).disabled).toBe(true);
    expect(history.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(history);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('L4: aria-controls is set to controlsId', () => {
    render(
      <LayerRail
        layers={defaultLayers}
        onToggle={() => undefined}
        controlsId="map-stage-svg-x"
      />,
    );
    const chips = screen.getAllByRole('button');
    for (const chip of chips) {
      expect(chip.getAttribute('aria-controls')).toBe('map-stage-svg-x');
    }
  });

  it('L5: clicking enabled chip fires onToggle with key', () => {
    const onToggle = vi.fn();
    render(<LayerRail layers={defaultLayers} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: /Missões/i }));
    expect(onToggle).toHaveBeenCalledWith('missions');
  });
});
