import React from 'react';
import { BADGE_DEFS, type BadgeId } from '../../data/gamification';

interface Props {
  unlocked: BadgeId[];
  onDismiss: () => void;
}

const defById = (id: BadgeId) => BADGE_DEFS.find((b) => b.id === id);

export const BadgeUnlockToast: React.FC<Props> = ({ unlocked, onDismiss }) => {
  if (unlocked.length === 0) return null;
  return (
    <div
      className="badge-unlock-toast-backdrop"
      role="alertdialog"
      aria-label="Conquistas desbloqueadas"
    >
      <div className="badge-unlock-toast-card">
        <h2 className="badge-unlock-toast-title">Conquista desbloqueada</h2>
        <ul className="badge-unlock-toast-list">
          {unlocked.map((id) => {
            const def = defById(id);
            if (!def) return null;
            return (
              <li key={id} className="badge-unlock-toast-item">
                <strong className="badge-unlock-toast-name">{def.name}</strong>
                <span className="badge-unlock-toast-hint">{def.hint}</span>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          className="badge-unlock-toast-dismiss"
          onClick={onDismiss}
          aria-label="Fechar"
        >
          FECHAR
        </button>
      </div>
    </div>
  );
};
