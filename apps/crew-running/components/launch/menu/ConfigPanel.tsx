import React, { useEffect, useState } from 'react';
import { audio } from '../../../services/audio';
import { CartridgeButton } from '../../CartridgeButton';

const AudioMuteToggle: React.FC = () => {
  const [muted, setMuted] = useState(() => audio.isMuted());
  useEffect(() => audio.onMuteChange(setMuted), []);
  return (
    <CartridgeButton
      variant="chalk"
      className="game-command"
      onClick={() => audio.setMuted(!muted)}
      aria-pressed={!muted}
      sfx="none"
    >
      {muted ? 'SOM: MUDO' : 'SOM: ATIVO'}
    </CartridgeButton>
  );
};

type Props = {
  guideDone: boolean;
  primaryLabel: string;
  onReplayIntro: () => void;
  onReviewGuidedSetup: () => void;
  onStartGuidedSetup: () => void;
  onPrimaryAction: () => void;
};

export const ConfigPanel: React.FC<Props> = ({
  guideDone,
  primaryLabel,
  onReplayIntro,
  onReviewGuidedSetup,
  onStartGuidedSetup,
  onPrimaryAction,
}) => (
  <>
    <span className="main-menu__eyebrow">CONFIG</span>
    <h1>Ritmo seguro</h1>
    <ul className="main-menu__rules">
      <li>O mapa inicial mostra sinal coletivo.</li>
      <li>Seu caminho individual nao aparece nesta entrada.</li>
      <li>Sem pressao de ritmo. Entra no teu tempo.</li>
    </ul>
    <div className="main-menu__panel-actions">
      <AudioMuteToggle />
      <CartridgeButton variant="chalk" className="game-command" onClick={onReplayIntro}>
        REVER INTRO
      </CartridgeButton>
      <CartridgeButton
        variant="chalk"
        className="game-command"
        onClick={guideDone ? onReviewGuidedSetup : onStartGuidedSetup}
      >
        {guideDone ? 'REVER GUIA' : 'ABRIR GUIA'}
      </CartridgeButton>
      <CartridgeButton variant="solid" className="game-command game-command--primary" onClick={onPrimaryAction}>
        {primaryLabel}
      </CartridgeButton>
    </div>
  </>
);
