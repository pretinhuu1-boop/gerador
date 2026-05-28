import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunnerProfileScreen } from '../RunnerProfileScreen';
import type { RunnerProgress } from '../../../data/gamification';

const baseProgress = (overrides: Partial<RunnerProgress> = {}): RunnerProgress => ({
  xp: 250,
  level: 1,
  streakWeeks: 3,
  lastRunAt: 0,
  freezesAvailable: 1,
  inkPerZone: {},
  inkUpdatedAt: 0,
  badgeUnlocks: ['first-blood'],
  patchesOwned: [],
  weekKey: '',
  runsThisWeek: 0,
  ...overrides,
});

describe('RunnerProfileScreen', () => {
  it('renders crew badge, level, streak, and BadgeGrid', () => {
    render(
      <RunnerProfileScreen
        progress={baseProgress()}
        crewSlug="downtown-rush"
        onClose={() => {}}
      />,
    );
    expect(screen.getByRole('dialog', { name: /perfil/i })).toBeInTheDocument();
    expect(screen.getByAltText(/Downtown Rush/i)).toBeInTheDocument();
    expect(screen.getByText(/lv\b/i)).toBeInTheDocument();
    expect(screen.getByText(/3 semanas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primeira Sangue.*desbloqueado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cartógrafo.*bloqueado/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <RunnerProfileScreen
        progress={baseProgress()}
        crewSlug="downtown-rush"
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /fechar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('falls back to default crew when crewSlug is undefined', () => {
    render(
      <RunnerProfileScreen
        progress={baseProgress()}
        crewSlug={undefined}
        onClose={() => {}}
      />,
    );
    // getCrewBySlug falls back to CREWS[0] (downtown-rush) — same crew assertion
    expect(screen.getByAltText(/Downtown Rush/i)).toBeInTheDocument();
  });
});
