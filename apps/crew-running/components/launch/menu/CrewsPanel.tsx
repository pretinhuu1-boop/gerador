import React from 'react';
import type { CrewZone } from '../../../data/crews';
import { CartridgeButton } from '../../CartridgeButton';
import { CrewPilotPreview } from '../CrewPilotPreview';

type Props = {
  activeCrew: CrewZone;
  runnerSaved: boolean;
  guideDone: boolean;
  onSelectCrew: (slug: string) => void;
  onPrimaryAction: () => void;
};

export const CrewsPanel: React.FC<Props> = ({
  activeCrew,
  runnerSaved,
  guideDone,
  onSelectCrew,
  onPrimaryAction,
}) => (
  <>
    <span className="main-menu__eyebrow">CREWS PILOTO</span>
    <h1>5 sinais no mapa</h1>
    <CrewPilotPreview activeSlug={activeCrew.slug} onSelect={onSelectCrew} />
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
      <CartridgeButton variant="solid" className="game-command game-command--primary" onClick={onPrimaryAction}>
        {runnerSaved ? 'AJUSTAR RUNNER' : guideDone ? 'MONTAR RUNNER' : 'ABRIR GUIA'}
      </CartridgeButton>
    </div>
  </>
);
