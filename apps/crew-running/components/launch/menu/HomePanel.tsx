import React from 'react';
import type { CrewZone } from '../../../data/crews';
import type { LaunchProgress } from '../../../services/launchStorage';
import type { SavedCharacter } from '../../../services/storage';
import { CartridgeButton } from '../../CartridgeButton';
import { CrewBadge } from '../../CrewBadge';

type Props = {
  activeCrew: CrewZone;
  homeCopy: string;
  runnerSaved: boolean;
  savedCharacter: SavedCharacter | null;
  runnerName: string;
  progress: LaunchProgress;
  guideStatusLabel: string;
  runnerStatusLabel: string;
  onShowRunnerPanel: () => void;
  onShowCrewsPanel: () => void;
};

export const HomePanel: React.FC<Props> = ({
  activeCrew,
  homeCopy,
  runnerSaved,
  savedCharacter,
  runnerName,
  progress,
  guideStatusLabel,
  runnerStatusLabel,
  onShowRunnerPanel,
  onShowCrewsPanel,
}) => (
  <>
    <div className="main-menu__panel-head">
      <CrewBadge crew={activeCrew} size="md" />
      <div>
        <span className="main-menu__eyebrow">{activeCrew.zone} ONLINE</span>
        <strong>QG DE MISSÃO</strong>
      </div>
      <img src={activeCrew.assets.marker} alt="" aria-hidden />
    </div>
    <h1>{activeCrew.name}</h1>
    <p>{homeCopy}</p>
    {runnerSaved && (
      <div className="main-menu__runner-pass">
        <div className="main-menu__runner-portrait">
          {savedCharacter ? (
            <img src={savedCharacter.imageDataUrl} alt="Runner ready" />
          ) : (
            <CrewBadge crew={activeCrew} size="lg" />
          )}
        </div>
        <div>
          <span>RUNNER SALVO</span>
          <strong>{runnerName}</strong>
          <p>Identidade salva para a proxima fase. O caminho individual fica fechado nesta entrada.</p>
        </div>
      </div>
    )}
    <div className="main-menu__status">
      <span>SINAL</span>
      <strong>{progress.citySignalSeen ? 'OK' : 'ABERTO'}</strong>
      <span>GUIA</span>
      <strong>{guideStatusLabel}</strong>
      <span>RUNNER</span>
      <strong>{runnerStatusLabel}</strong>
    </div>
    <div className="main-menu__panel-actions main-menu__panel-actions--secondary">
      {runnerSaved && (
        <CartridgeButton variant="chalk" className="game-command" onClick={onShowRunnerPanel}>
          VER RUNNER
        </CartridgeButton>
      )}
      <CartridgeButton variant="chalk" className="game-command" onClick={onShowCrewsPanel}>
        TROCAR CREW
      </CartridgeButton>
    </div>
  </>
);
