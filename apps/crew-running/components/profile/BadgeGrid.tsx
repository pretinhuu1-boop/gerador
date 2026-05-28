import React from 'react';
import { BADGE_DEFS, type BadgeId } from '../../data/gamification';

interface Props {
  unlocked: BadgeId[];
}

export const BadgeGrid: React.FC<Props> = ({ unlocked }) => {
  const owned = new Set(unlocked);
  return (
    <ul className="badge-grid">
      {BADGE_DEFS.map((badge) => {
        const isUnlocked = owned.has(badge.id);
        return (
          <li
            key={badge.id}
            className={`badge-grid-item badge-grid-item--${isUnlocked ? 'unlocked' : 'locked'}`}
            aria-label={`${badge.name} ${isUnlocked ? 'desbloqueado' : 'bloqueado'}`}
          >
            <span className="badge-grid-name">{badge.name}</span>
            <span className="badge-grid-hint">{badge.hint}</span>
          </li>
        );
      })}
    </ul>
  );
};
