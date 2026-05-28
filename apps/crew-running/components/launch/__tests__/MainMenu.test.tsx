import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type React from 'react';
import { MainMenu } from '../MainMenu';
import type { LaunchProgress } from '../../../services/launchStorage';

const baseProgress: LaunchProgress = {
  consoleBootSeen: true,
  titleSeen: true,
  citySignalSeen: true,
  mainMenuSeen: true,
  onboardingStep: 0,
  selectedCrewSlug: 'downtown-rush',
  guidedSetupComplete: true,
  onboardingComplete: true,
  runnerCustomized: false,
};

const renderMenu = (overrides: Partial<React.ComponentProps<typeof MainMenu>> = {}) =>
  render(
    <MainMenu
      progress={baseProgress}
      selectedCrewSlug="downtown-rush"
      onSelectCrew={() => {}}
      onOpenWardrobe={() => {}}
      onOpenCrewHome={() => {}}
      onStartGuidedSetup={() => {}}
      onReviewGuidedSetup={() => {}}
      onOpenRunnerCreator={() => {}}
      onReplayIntro={() => {}}
      {...overrides}
    />,
  );

describe('MainMenu runner panel integration', () => {
  it('renders the wardrobe from the INÍCIO nav item', () => {
    renderMenu({
      runnerCreatorPanel: <div data-testid="runner-creator-panel">FOTO PERFIL LOOK FICHA</div>,
    });

    fireEvent.click(screen.getByRole('button', { name: 'INÍCIO' }));

    expect(screen.getByTestId('runner-creator-panel')).toBeInTheDocument();
    expect(screen.getByText('GUARDA ROUPA')).toBeInTheDocument();
  });

  it('renders the runner profile panel from the VOCÊ nav item', () => {
    renderMenu({
      runnerCreatorPanel: <div data-testid="runner-creator-panel">FOTO PERFIL LOOK FICHA</div>,
    });

    fireEvent.click(screen.getByRole('button', { name: 'VOCÊ' }));

    expect(screen.queryByTestId('runner-creator-panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AJUSTAR' })).toBeInTheDocument();
    expect(screen.getByText('MENSAGENS · F3')).toBeInTheDocument();
  });

  it('opens the creator only after AJUSTAR inside the RUNNER panel', () => {
    renderMenu({
      runnerCreatorPanel: <div data-testid="runner-creator-panel">FOTO PERFIL LOOK FICHA</div>,
    });

    fireEvent.click(screen.getByRole('button', { name: 'VOCÊ' }));
    fireEvent.click(screen.getByRole('button', { name: 'AJUSTAR' }));

    expect(screen.getByTestId('runner-creator-panel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'VOLTAR AO RUNNER' })).toBeInTheDocument();
  });

  it('opens gamification from the primary orange CTA after setup is done', () => {
    const onOpenMap = vi.fn();
    renderMenu({
      onOpenMap,
    });

    fireEvent.click(screen.getByRole('button', { name: 'ABRIR MAPA' }));

    expect(onOpenMap).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('runner-creator-panel')).not.toBeInTheDocument();
  });

  it('keeps crew choices disabled in the MVP after a crew is selected', () => {
    const onSelectCrew = vi.fn();
    renderMenu({
      onSelectCrew,
    });

    fireEvent.click(screen.getByRole('button', { name: 'CREWS PILOTO' }));
    const lockedCrews = screen.getAllByRole('button', { name: /Crew bloqueada/i });
    const activeCrew = screen.getByRole('button', { name: /Abrir sede da crew Centro Downtown Rush/i });

    expect(lockedCrews.length).toBeGreaterThan(1);
    expect(lockedCrews.every((button) => button.hasAttribute('disabled'))).toBe(true);
    expect(activeCrew).not.toHaveAttribute('disabled');
    fireEvent.click(lockedCrews[1]);
    expect(onSelectCrew).not.toHaveBeenCalled();
  });

  it('opens the guide from ABRIR GUIA instead of the map', () => {
    const onOpenMap = vi.fn();
    const onStartGuidedSetup = vi.fn();
    renderMenu({
      progress: {
        ...baseProgress,
        guidedSetupComplete: false,
        onboardingComplete: false,
        runnerCustomized: false,
      },
      initialPanel: 'crewHome',
      onOpenMap,
      onStartGuidedSetup,
    });

    fireEvent.click(screen.getByRole('button', { name: 'ABRIR GUIA' }));

    expect(onStartGuidedSetup).toHaveBeenCalledTimes(1);
    expect(onOpenMap).not.toHaveBeenCalled();
  });
});
