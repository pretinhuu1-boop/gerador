import React from 'react';
import { xpProgressInLevel, xpToLevel, type RunnerProgress } from '../../data/gamification';
import { getCrewBySlug } from '../../data/crews';

interface Props {
  progress: RunnerProgress;
  crewSlug?: string;
  onOpenProfile?: () => void;
}

export const HudOverlay: React.FC<Props> = ({ progress, crewSlug, onOpenProfile }) => {
  const level = xpToLevel(progress.xp);
  const { current, needed, pct } = xpProgressInLevel(progress.xp);
  const crew = getCrewBySlug(crewSlug);
  return (
    <div className="map-hud-overlay" role="region" aria-label="Runner status">
      <div className="map-hud-streak" aria-label={`Streak ${progress.streakWeeks} semanas`}>
        <span className="map-hud-streak-icon" aria-hidden>•</span>
        <span className="map-hud-streak-value">{progress.streakWeeks}</span>
      </div>
      <div className="map-hud-xp-block">
        <div className="map-hud-level">
          <span className="map-hud-level-label">LV</span>
          <span className="map-hud-level-value" style={{ color: crew.accent }}>{level}</span>
        </div>
        <div className="map-hud-xp-bar" aria-label={`${current} de ${needed} XP`}>
          <div className="map-hud-xp-fill" style={{ width: `${Math.round(pct * 100)}%`, background: crew.accent }} />
        </div>
        <div className="map-hud-xp-num">{progress.xp} XP</div>
      </div>
      <button
        type="button"
        className="map-hud-profile"
        onClick={onOpenProfile}
        disabled={!onOpenProfile}
        aria-disabled={!onOpenProfile}
        aria-label="Abrir perfil"
      >
        <img src={crew.assets.badge} alt={crew.name} />
      </button>
    </div>
  );
};
