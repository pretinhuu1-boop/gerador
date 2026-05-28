import React from 'react';

type Props = {
  onBack: () => void;
  onSwitchCrew: () => void;
};

export const SedeFooter: React.FC<Props> = ({ onBack, onSwitchCrew }) => (
  <footer className="sede-footer">
    <button type="button" className="game-command" onClick={onBack}>
      VOLTAR
    </button>
    <button type="button" className="game-command sede-footer__switch" onClick={onSwitchCrew}>
      TROCAR CREW
    </button>
  </footer>
);
