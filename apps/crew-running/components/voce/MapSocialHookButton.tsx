import React from 'react';
import { CartridgeButton } from '../CartridgeButton';

export const MapSocialHookButton: React.FC = () => (
  <CartridgeButton
    variant="chalk"
    className="game-command voce-panel__map-hook"
    disabled
    aria-disabled="true"
    sfx="none"
  >
    MAPA SOCIAL · EM BREVE
  </CartridgeButton>
);
