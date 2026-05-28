import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { RunSummary } from '../RunSummary';
import type { RunXpBreakdown } from '../../../data/gamification';
import type { RunSnapshot } from '../../../services/runTracker';

const snap: RunSnapshot = {
  state: 'ended',
  startedAt: 0,
  elapsedMs: 12 * 60 * 1000,
  totalMeters: 2500,
  metersInTerritory: 1500,
  points: [],
  touchedSpotIds: ['spot-vale', 'spot-republica'],
  closedLoop: true,
  permissionDenied: false,
};

const baseBreakdown: RunXpBreakdown = {
  baseXp: 10,
  territoryXp: 30,
  spotXp: 30,
  loopMult: 1.5,
  invasionMult: 1,
  total: 105,
};

describe('RunSummary', () => {
  it('RS1: renders as role=dialog with aria-modal', () => {
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={() => undefined}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    const dialog = screen.getByRole('dialog', { name: /resumo da corrida/i });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('RS2: total XP shown as +X XP', () => {
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={() => undefined}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    expect(screen.getByText('+105 XP')).toBeTruthy();
  });

  it('RS3: streakBumped shows good notice', () => {
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={true}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={() => undefined}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    expect(screen.getByText('Streak +1!')).toBeTruthy();
  });

  it('RS4: streakBroken shows bad notice', () => {
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={false}
        streakBroken={true}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={() => undefined}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    expect(screen.getByText('Streak quebrado.')).toBeTruthy();
  });

  it('RS5: freezeUsed shows freeze notice', () => {
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={true}
        newlyUnlocked={[]}
        onSave={() => undefined}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    expect(screen.getByText(/Freeze usado/i)).toBeTruthy();
  });

  it('RS6: clicking SALVAR fires onSave', () => {
    const onSave = vi.fn();
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={onSave}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /SALVAR/ }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('RS7: clicking DESCARTAR fires onDiscard', () => {
    const onDiscard = vi.fn();
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={() => undefined}
        onDiscard={onDiscard}
        onDismissUnlocks={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /DESCARTAR/ }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('RS8: hides Loop multiplier chip when loopMult=1', () => {
    render(
      <RunSummary
        snapshot={{ ...snap, closedLoop: false }}
        breakdown={{ ...baseBreakdown, loopMult: 1 }}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={() => undefined}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    expect(screen.queryByText(/^Loop ×/)).toBeNull();
  });

  it('RS9: renders multiplier chip explanation when loop multiplier is active', () => {
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={[]}
        onSave={() => undefined}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    expect(screen.getByText(/loop ×1.5/i)).toBeInTheDocument();
    expect(screen.getByText(/fechou volta/i)).toBeInTheDocument();
  });

  it('RS10: renders badge unlock toast when newlyUnlocked is non-empty', () => {
    render(
      <RunSummary
        snapshot={snap}
        breakdown={baseBreakdown}
        streakBumped={false}
        streakBroken={false}
        freezeUsed={false}
        newlyUnlocked={['first-blood']}
        onSave={() => undefined}
        onDiscard={() => undefined}
        onDismissUnlocks={() => undefined}
      />,
    );
    expect(screen.getByText(/primeira sangue/i)).toBeInTheDocument();
  });
});
