import React from 'react';
import type { CrewZone } from '../../../data/crews';
import { CartridgeButton } from '../../CartridgeButton';
import { CrewPilotPreview } from '../CrewPilotPreview';

type Props = {
  activeCrew: CrewZone;
  runnerSaved: boolean;
  guideDone: boolean;
  onSelectCrew: (slug: string) => void;
  onOpenGuide: () => void;
  onOpenCrewHome: () => void;
  crewLocked?: boolean;
};

export const CrewsPanel: React.FC<Props> = ({
  activeCrew,
  runnerSaved,
  guideDone,
  onSelectCrew,
  onOpenGuide,
  onOpenCrewHome,
  crewLocked = false,
}) => (
  <>
    <span className="main-menu__eyebrow">CREWS PILOTO</span>
    <h1>Crew travada</h1>
    <p>A crew escolhida fica fixa neste MVP. As outras entradas aparecem como referencia de mapa.</p>
    <CrewPilotPreview
      activeSlug={activeCrew.slug}
      onSelect={crewLocked ? undefined : onSelectCrew}
      onOpenActive={onOpenCrewHome}
      disabled={crewLocked}
    />
    <div
      className="main-menu__crew-dossier"
      style={{
        '--crew-accent': activeCrew.accent,
        backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,0,0,0.56)), url(${activeCrew.assets.shareCard})`,
      } as React.CSSProperties}
    >
      <div>
        <span>{activeCrew.zone} / {activeCrew.mission}</span>
        <strong>{activeCrew.name}</strong>
        <p>{activeCrew.introLine}</p>
      </div>
      <div className="main-menu__crew-members" aria-hidden>
        {activeCrew.assets.members.map((member) => (
          <img key={member} src={member} alt="" />
        ))}
      </div>
    </div>
    <div className="main-menu__panel-actions">
      <CartridgeButton
        variant="solid"
        className="game-command game-command--primary"
        onClick={guideDone || runnerSaved ? onOpenCrewHome : onOpenGuide}
      >
        {guideDone || runnerSaved ? 'ENTRAR NA SEDE' : 'ABRIR GUIA'}
      </CartridgeButton>
    </div>
  </>
);
