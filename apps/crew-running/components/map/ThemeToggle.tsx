import React from 'react';
import type { ThemeId } from '../../data/mapThemes';

interface Props {
  themeId: ThemeId;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<Props> = ({ themeId, onToggle }) => (
  <button
    type="button"
    className="map-theme-toggle"
    onClick={onToggle}
    aria-label={themeId === 'dark' ? 'Mudar para modo dia' : 'Mudar para modo noite'}
  >
    <span className="map-theme-toggle__icon" aria-hidden>
      {themeId === 'dark' ? '☀' : '☾'}
    </span>
  </button>
);
