import React from 'react';
import { CartridgeButton } from '../../CartridgeButton';
import { CrewBadge } from '../../CrewBadge';
import { SheetPreview } from '../../SheetPreview';
import type { CrewZone } from '../../../data/crews';
import type { SavedCharacter } from '../../../services/storage';
import type { GenerateResult, SheetVariant } from '../../../services/crewService';

type Props = {
  crew: CrewZone;
  hasPhoto: boolean;
  hasName: boolean;
  runnerSaved: boolean;
  savedCharacter: SavedCharacter | null;
  savedAtLabel: string;
  runnerName: string;
  runnerTypeLabel: string;
  passportStyle: React.CSSProperties;
  result: GenerateResult | null;
  loading: boolean;
  error: string | null;
  savingVariantIndex: SheetVariant['index'] | null;
  onSaveVariant: (variant: SheetVariant) => void | Promise<void>;
  onAdjust: () => void;
};

export const FichaTab: React.FC<Props> = ({
  crew,
  hasPhoto, hasName,
  runnerSaved, savedCharacter,
  savedAtLabel, runnerName, runnerTypeLabel,
  passportStyle,
  result, loading, error, savingVariantIndex, onSaveVariant,
  onAdjust,
}) => {
  if (result && !loading) {
    return (
      <section
        id="creator-panel-ficha"
        role="tabpanel"
        aria-labelledby="creator-tab-ficha"
        className="runner-tab__section"
      >
        <h3 className="section-label">Escolhe teu look</h3>
        <SheetPreview
          result={result}
          loading={loading}
          error={error}
          savingVariantIndex={savingVariantIndex}
          onSave={onSaveVariant}
        />
      </section>
    );
  }

  if (runnerSaved && savedCharacter) {
    return (
      <section
        id="creator-panel-ficha"
        role="tabpanel"
        aria-labelledby="creator-tab-ficha"
        className="runner-tab__section runner-tab__passport"
        style={passportStyle}
      >
        <div className="runner-tab__passport-head">
          <span>IDENTIDADE SALVA</span>
          <strong>{runnerName}</strong>
          <CrewBadge crew={crew} size="md" />
        </div>
        <img
          className="runner-tab__passport-figure"
          src={savedCharacter.imageDataUrl}
          alt={`Runner ${runnerName}`}
        />
        <div className="runner-tab__passport-grid">
          <span>CREW</span><strong>{crew.zone}</strong>
          <span>TIPO</span><strong>{runnerTypeLabel}</strong>
          <span>LOOK</span><strong>SALVO</strong>
          <span>ID</span><strong>{savedAtLabel}</strong>
        </div>
        <CartridgeButton variant="chalk" className="game-command" onClick={onAdjust}>
          AJUSTAR RUNNER
        </CartridgeButton>
      </section>
    );
  }

  // Empty state: checklist
  const items: Array<[string, boolean]> = [
    ['FOTO', hasPhoto],
    ['PERFIL', hasName],
    ['LOOK', false],
  ];

  return (
    <section
      id="creator-panel-ficha"
      role="tabpanel"
      aria-labelledby="creator-tab-ficha"
      className="runner-tab__section runner-tab__checklist"
    >
      <h3 className="section-label">PRONTO PRA SAIR DA CASA</h3>
      <ul aria-label="Checklist de prontidão">
        {items.map(([label, done]) => (
          <li key={label} className={done ? 'is-done' : ''}>
            <span aria-hidden>{done ? '✓' : '○'}</span>
            {label} {done ? '✓' : 'PENDENTE'}
          </li>
        ))}
      </ul>
      <p className="runner-tab__checklist-hint">
        {!hasPhoto || !hasName
          ? 'Sobe foto e nome nas abas FOTO e PERFIL.'
          : 'Escolhe o tipo e equipamento na aba LOOK, depois CRIAR RUNNER.'}
      </p>
    </section>
  );
};
