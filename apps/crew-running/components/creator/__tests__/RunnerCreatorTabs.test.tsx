// apps/crew-running/components/creator/__tests__/RunnerCreatorTabs.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { RunnerCreatorTabs } from '../RunnerCreatorTabs';
import { CREWS } from '../../../data/crews';

describe('RunnerCreatorTabs', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders 4 tab buttons + defaults to LOOK when no saved tab', () => {
    render(
      <RunnerCreatorTabs
        crew={CREWS[0]}
        apiKey=""
        onApiKeyReady={() => {}}
        onSaved={() => {}}
      />
    );
    expect(screen.getByRole('tab', { name: 'LOOK' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'PERFIL' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'LOOK' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'FICHA' })).toBeInTheDocument();
  });

  it('switches tab on click and persists selection', () => {
    render(
      <RunnerCreatorTabs
        crew={CREWS[0]}
        apiKey=""
        onApiKeyReady={() => {}}
        onSaved={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('tab', { name: 'PERFIL' }));
    expect(screen.getByRole('tab', { name: 'PERFIL' })).toHaveAttribute('aria-selected', 'true');
    expect(window.localStorage.getItem('crewCreatorTab')).toBe('perfil');
  });

  it('hydrates profile, runner type, and wardrobe draft after remount', () => {
    window.localStorage.setItem(
      'crewCreatorDraft',
      JSON.stringify({
        photo: null,
        profile: {
          name: 'NINA QA',
          sex: 'female',
          heightCm: 171,
          weightKg: 62,
          personality: 'ritmo frio',
        },
        runnerTypeId: 'night-run',
        locked: {
          accessory: 'acc_blank_bib',
        },
      }),
    );

    render(
      <RunnerCreatorTabs
        crew={CREWS[0]}
        apiKey=""
        onApiKeyReady={() => {}}
        onSaved={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'PERFIL' }));
    expect(screen.getByLabelText('NOME')).toHaveValue('NINA QA');
    expect(screen.getByRole('spinbutton', { name: /ALTURA/i })).toHaveValue(171);

    fireEvent.click(screen.getByRole('tab', { name: 'LOOK' }));
    expect(screen.getByRole('button', { name: /Night Run/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Remover trava Bib Sem Texto/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('persists profile edits as a creator draft', async () => {
    render(
      <RunnerCreatorTabs
        crew={CREWS[0]}
        apiKey=""
        onApiKeyReady={() => {}}
        onSaved={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'PERFIL' }));
    fireEvent.change(screen.getByLabelText('NOME'), { target: { value: 'Lia Centro' } });

    await waitFor(() => {
      const draft = JSON.parse(window.localStorage.getItem('crewCreatorDraft') ?? '{}');
      expect(draft.profile.name).toBe('Lia Centro');
    });
  });

  it('renders saved passport with the saved crew instead of the currently selected crew', () => {
    window.localStorage.setItem('crewCreatorTab', 'ficha');
    window.localStorage.setItem(
      'crew.saved_character',
      JSON.stringify({
        imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        profile: { name: 'NINA', sex: 'female', heightCm: 170, weightKg: 70, personality: '' },
        crewSlug: CREWS[0].slug,
        runnerTypeId: 'sprint',
        renderStyleId: 'street-v2',
        slots: { top: 'a', bottom: 'b', shoes: 'c', accessory: 'd' },
        savedAt: 1_700_000_000_000,
      }),
    );

    const { container } = render(
      <RunnerCreatorTabs
        crew={CREWS[1]}
        apiKey=""
        onApiKeyReady={() => {}}
        onSaved={() => {}}
      />
    );

    expect(screen.getByText('NINA')).toBeInTheDocument();
    const passportGrid = container.querySelector('.runner-tab__passport-grid');
    expect(passportGrid).not.toBeNull();
    expect(within(passportGrid as HTMLElement).getByText(CREWS[0].zone)).toBeInTheDocument();
    expect(within(passportGrid as HTMLElement).queryByText(CREWS[1].zone)).not.toBeInTheDocument();
  });
});
