import React from 'react';
import { CartridgeButton } from '../CartridgeButton';

type Props = {
  onClick?: () => void;
};

export const MapSocialHookButton: React.FC<Props> = ({ onClick }) => {
  const enabled = typeof onClick === 'function';
  return (
    <CartridgeButton
      variant={enabled ? 'solid' : 'chalk'}
      className="game-command voce-panel__map-hook"
      disabled={!enabled}
      aria-disabled={!enabled || undefined}
      sfx={enabled ? 'tap' : 'none'}
      onClick={enabled ? onClick : undefined}
    >
      {enabled ? 'ABRIR MAPA SOCIAL' : 'MAPA SOCIAL · EM BREVE'}
    </CartridgeButton>
  );
};
