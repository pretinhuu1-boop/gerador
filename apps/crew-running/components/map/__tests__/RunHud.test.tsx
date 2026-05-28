import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { RunHud } from '../RunHud';
import type { RunSnapshot } from '../../../services/runTracker';

const snapshot = (overrides: Partial<RunSnapshot> = {}): RunSnapshot => ({
  state: 'tracking',
  startedAt: 1000,
  elapsedMs: 0,
  totalMeters: 0,
  metersInTerritory: 0,
  points: [],
  touchedSpotIds: [],
  closedLoop: false,
  permissionDenied: false,
  ...overrides,
});

const noops = {
  onPause: () => undefined,
  onResume: () => undefined,
  onStop: () => undefined,
};

describe('RunHud', () => {
  it('RH1: state=tracking shows AO VIVO and PAUSAR button', () => {
    render(<RunHud snapshot={snapshot()} totalSpots={11} {...noops} />);
    expect(screen.getByText('AO VIVO')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'PAUSAR' })).toBeTruthy();
  });

  it('RH2: state=paused shows PAUSADA and RETOMAR button', () => {
    render(
      <RunHud snapshot={snapshot({ state: 'paused' })} totalSpots={11} {...noops} />,
    );
    expect(screen.getByText('PAUSADA')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'RETOMAR' })).toBeTruthy();
  });

  it('RH3: 2500m displays as 2.50 km in main stat', () => {
    render(
      <RunHud snapshot={snapshot({ totalMeters: 2500 })} totalSpots={11} {...noops} />,
    );
    expect(screen.getByText('2.50')).toBeTruthy();
  });

  it('RH4: pace shows --:-- before reaching minimum distance', () => {
    render(
      <RunHud snapshot={snapshot({ totalMeters: 5, elapsedMs: 1000 })} totalSpots={11} {...noops} />,
    );
    expect(screen.getByText('--:--')).toBeTruthy();
  });

  it('RH4.b: pace shows mm:ss when there is enough distance and time', () => {
    // 1 km in 6 minutes = 6:00 per km
    render(
      <RunHud
        snapshot={snapshot({ totalMeters: 1000, elapsedMs: 6 * 60 * 1000 })}
        totalSpots={11}
        {...noops}
      />,
    );
    expect(screen.getByText(/^6:00$/)).toBeTruthy();
  });

  it('RH5: clicking PAUSAR fires onPause', () => {
    const onPause = vi.fn();
    render(<RunHud snapshot={snapshot()} totalSpots={11} {...noops} onPause={onPause} />);
    fireEvent.click(screen.getByRole('button', { name: 'PAUSAR' }));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('RH6: clicking ENCERRAR fires onStop', () => {
    const onStop = vi.fn();
    render(<RunHud snapshot={snapshot()} totalSpots={11} {...noops} onStop={onStop} />);
    fireEvent.click(screen.getByRole('button', { name: 'ENCERRAR' }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it('RH7: touchedSpotIds count over total renders as X/11', () => {
    render(
      <RunHud
        snapshot={snapshot({ touchedSpotIds: ['spot-vale', 'spot-republica'] })}
        totalSpots={11}
        {...noops}
      />,
    );
    expect(screen.getByText('2/11')).toBeTruthy();
  });
});
