import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen, act, within } from '@testing-library/react';
import { MapStage } from '../MapStage';
import { runTracker } from '../../../services/runTracker';
import type { RunnerProgress } from '../../../data/gamification';
import { saveActiveRun } from '../../../services/activeRunStorage';

const baseProgress: RunnerProgress = {
  xp: 0,
  level: 1,
  streakWeeks: 0,
  lastRunAt: 0,
  freezesAvailable: 1,
  inkPerZone: {},
  inkUpdatedAt: 0,
  badgeUnlocks: [],
  patchesOwned: [],
  weekKey: '',
  runsThisWeek: 0,
};

const installGeolocationStub = () => {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      watchPosition: () => 0,
      clearWatch: () => undefined,
    },
  });
};

beforeEach(() => {
  runTracker.reset();
  installGeolocationStub();
});

afterEach(() => {
  runTracker.reset();
});

describe('MapStage', () => {
  it('MS1: mounts with HUD, SVG canvas, layer rail and actions', () => {
    const { container } = render(
      <MapStage runnerProgress={baseProgress} selectedCrewSlug="downtown-rush" />,
    );
    expect(container.querySelector('.map-hud-overlay')).toBeTruthy();
    expect(container.querySelector('.map-stage-svg')).toBeTruthy();
    expect(container.querySelector('.map-layer-rail')).toBeTruthy();
    expect(container.querySelector('.map-stage-actions')).toBeTruthy();
  });

  it('MS2: no resume modal when nothing persisted', () => {
    render(<MapStage runnerProgress={baseProgress} selectedCrewSlug="downtown-rush" />);
    expect(screen.queryByRole('dialog', { name: /Retomar corrida/i })).toBeNull();
  });

  it('MS3: persisted paused run opens the resume modal on mount', () => {
    saveActiveRun({
      startedAt: Date.now() - 60_000,
      elapsedMs: 30_000,
      state: 'paused',
      points: [{ lng: -46.63, lat: -23.55, t: Date.now() - 60_000, accuracy: 5 }],
      touchedSpotIds: [],
      totalMeters: 120,
      metersInTerritory: 0,
      crewSlug: 'downtown-rush',
      homeZoneId: 'centro',
    });
    render(<MapStage runnerProgress={baseProgress} selectedCrewSlug="downtown-rush" />);
    const dialog = screen.getByRole('dialog', { name: /Retomar corrida/i });
    expect(within(dialog).getByRole('button', { name: 'RETOMAR' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'DESCARTAR' })).toBeTruthy();
  });

  it('MS5: starting a run swaps actions/rail for RunHud', () => {
    const { container } = render(
      <MapStage runnerProgress={baseProgress} selectedCrewSlug="downtown-rush" />,
    );
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'INICIAR CORRIDA' }));
    });
    expect(container.querySelector('.run-hud')).toBeTruthy();
    expect(container.querySelector('.map-layer-rail')).toBeNull();
    expect(container.querySelector('.map-stage-actions')).toBeNull();
  });

  it('MS6 + MS7: stopping a run opens summary; SALVAR fires onRunCompleted', () => {
    const onRunCompleted = vi.fn();
    render(
      <MapStage
        runnerProgress={baseProgress}
        selectedCrewSlug="downtown-rush"
        onRunCompleted={onRunCompleted}
      />,
    );
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'INICIAR CORRIDA' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'ENCERRAR' }));
    });
    expect(screen.getByRole('dialog', { name: /Resumo da corrida/i })).toBeTruthy();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /SALVAR CORRIDA/ }));
    });
    expect(onRunCompleted).toHaveBeenCalledTimes(1);
  });

  it('MS4: permission denied shows toast with retry button', () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });
    render(<MapStage runnerProgress={baseProgress} selectedCrewSlug="downtown-rush" />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'INICIAR CORRIDA' }));
    });
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('button', { name: /TENTAR DE NOVO/i })).toBeTruthy();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'FECHAR' }));
    });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(runTracker.getSnapshot().permissionDenied).toBe(false);
  });

  it('MS8: discard summary closes modal and resets tracker', () => {
    render(<MapStage runnerProgress={baseProgress} selectedCrewSlug="downtown-rush" />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'INICIAR CORRIDA' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'ENCERRAR' }));
    });
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /DESCARTAR/ }));
    });
    expect(screen.queryByRole('dialog', { name: /Resumo da corrida/i })).toBeNull();
    expect(runTracker.getSnapshot().state).toBe('idle');
  });
});
