import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FichaTab } from '../tabs/FichaTab';
import { CREWS } from '../../../data/crews';
import type { GenerateResult } from '../../../services/crewService';

const crew = CREWS[0];

describe('FichaTab', () => {
  it('shows empty checklist when no progress', () => {
    render(
      <FichaTab
        crew={crew}
        hasPhoto={false}
        hasName={false}
        runnerSaved={false}
        savedCharacter={null}
        savedAtLabel="PENDENTE"
        runnerName="Runner"
        runnerTypeLabel="A DEFINIR"
        passportStyle={{}}
        result={null}
        loading={false}
        error={null}
        savingVariantIndex={null}
        onSaveVariant={() => {}}
        onAdjust={() => {}}
      />
    );
    expect(screen.getByText(/FOTO PENDENTE/)).toBeInTheDocument();
    expect(screen.getByText(/PERFIL PENDENTE/)).toBeInTheDocument();
  });

  it('shows passport when runner saved', () => {
    render(
      <FichaTab
        crew={crew}
        hasPhoto={true}
        hasName={true}
        runnerSaved={true}
        savedCharacter={{
          imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
          profile: { name: 'NINA', sex: 'female', heightCm: 170, weightKg: 70, personality: '' },
          crewSlug: crew.slug,
          runnerTypeId: 'sprint',
          slots: { top: 'a', bottom: 'b', shoes: 'c', accessory: 'd' },
          savedAt: Date.now(),
        }}
        savedAtLabel="28/05"
        runnerName="NINA"
        runnerTypeLabel="Sprint"
        passportStyle={{}}
        result={null}
        loading={false}
        error={null}
        savingVariantIndex={null}
        onSaveVariant={() => {}}
        onAdjust={vi.fn()}
      />
    );
    expect(screen.getByText('NINA')).toBeInTheDocument();
    expect(screen.getByText(/IDENTIDADE SALVA/)).toBeInTheDocument();
  });

  it('shows SheetPreview when generation result present and not saved', () => {
    const result: GenerateResult = {
      imageDataUrl: 'data:image/png;base64,abc',
      variants: [
        { index: 0, slots: { top: { id: 'a', label: 'A', prompt: '', iconUrl: '' }, bottom: { id: 'b', label: 'B', prompt: '', iconUrl: '' }, shoes: { id: 'c', label: 'C', prompt: '', iconUrl: '' }, accessory: { id: 'd', label: 'D', prompt: '', iconUrl: '' } } },
      ] as any,
    };
    render(
      <FichaTab
        crew={crew}
        hasPhoto={true}
        hasName={true}
        runnerSaved={false}
        savedCharacter={null}
        savedAtLabel="PENDENTE"
        runnerName="Runner"
        runnerTypeLabel="Sprint"
        passportStyle={{}}
        result={result}
        loading={false}
        error={null}
        savingVariantIndex={null}
        onSaveVariant={() => {}}
        onAdjust={() => {}}
      />
    );
    expect(screen.getByText(/Escolhe teu look/i)).toBeInTheDocument();
  });

  it('prioritizes a fresh generation result over an existing saved passport', () => {
    const result: GenerateResult = {
      imageDataUrl: 'data:image/png;base64,abc',
      variants: [
        { index: 0, slots: { top: { id: 'a', label: 'A', prompt: '', iconUrl: '' }, bottom: { id: 'b', label: 'B', prompt: '', iconUrl: '' }, shoes: { id: 'c', label: 'C', prompt: '', iconUrl: '' }, accessory: { id: 'd', label: 'D', prompt: '', iconUrl: '' } } },
      ] as any,
    };

    render(
      <FichaTab
        crew={crew}
        hasPhoto={true}
        hasName={true}
        runnerSaved={true}
        savedCharacter={{
          imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
          profile: { name: 'NINA', sex: 'female', heightCm: 170, weightKg: 70, personality: '' },
          crewSlug: crew.slug,
          runnerTypeId: 'sprint',
          slots: { top: 'a', bottom: 'b', shoes: 'c', accessory: 'd' },
          savedAt: Date.now(),
        }}
        savedAtLabel="28/05"
        runnerName="NINA"
        runnerTypeLabel="Sprint"
        passportStyle={{}}
        result={result}
        loading={false}
        error={null}
        savingVariantIndex={null}
        onSaveVariant={() => {}}
        onAdjust={() => {}}
      />
    );

    expect(screen.getByText(/Escolhe teu look/i)).toBeInTheDocument();
    expect(screen.queryByText(/IDENTIDADE SALVA/)).not.toBeInTheDocument();
  });
});
