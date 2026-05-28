import React from 'react';
import {
  xpProgressInLevel,
  xpToLevel,
  type RunnerProgress,
} from '../../data/gamification';
import { getCrewBySlug } from '../../data/crews';
import { BadgeGrid } from './BadgeGrid';

interface Props {
  progress: RunnerProgress;
  crewSlug?: string;
  onClose: () => void;
}

export const RunnerProfileScreen: React.FC<Props> = ({ progress, crewSlug, onClose }) => {
  const crew = getCrewBySlug(crewSlug);
  const level = xpToLevel(progress.xp);
  const { current, needed, pct } = xpProgressInLevel(progress.xp);
  return (
    <div
      className="runner-profile-screen-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Perfil do runner"
    >
      <div className="runner-profile-screen-card">
        <header className="runner-profile-screen-header">
          <img
            className="runner-profile-screen-badge"
            src={crew.assets.badge}
            alt={crew.name}
          />
          <div className="runner-profile-screen-identity">
            <p className="runner-profile-screen-crew">{crew.name}</p>
            <p className="runner-profile-screen-zone">{crew.zone}</p>
          </div>
          <button
            type="button"
            className="runner-profile-screen-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <dl className="runner-profile-screen-stats">
          <div>
            <dt>LV</dt>
            <dd style={{ color: crew.accent }}>{level}</dd>
          </div>
          <div>
            <dt>XP</dt>
            <dd>{progress.xp}</dd>
          </div>
          <div>
            <dt>Streak</dt>
            <dd>{progress.streakWeeks} semanas</dd>
          </div>
        </dl>

        <div
          className="runner-profile-screen-xp-bar"
          aria-label={`${current} de ${needed} XP`}
        >
          <div
            className="runner-profile-screen-xp-fill"
            style={{ width: `${Math.round(pct * 100)}%`, background: crew.accent }}
          />
        </div>

        <h3 className="runner-profile-screen-section-title">Conquistas</h3>
        <BadgeGrid unlocked={progress.badgeUnlocks} />
      </div>
    </div>
  );
};
