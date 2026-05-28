import React from 'react';
import { getCrewBySlug } from '../../data/crews';
import { MapBottomSheet } from './MapBottomSheet';
import type { FriendRecord } from '../../data/friends';

interface Props {
  friend: FriendRecord;
  open: boolean;
  onClose: () => void;
}

export const RunnerCard: React.FC<Props> = ({ friend, open, onClose }) => {
  const crew = friend.crewSlug ? getCrewBySlug(friend.crewSlug) : undefined;
  const d = new Date(friend.addedAt);
  const addedDate = Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');

  return (
    <MapBottomSheet
      open={open}
      onClose={onClose}
      title={friend.runnerName}
      accent={crew?.accent}
    >
      <div className="runner-card">
        <div className="runner-card__hero">
          {friend.avatarDataUrl ? (
            <img src={friend.avatarDataUrl} alt="" className="runner-card__avatar" />
          ) : (
            <div className="runner-card__avatar-placeholder" style={{ borderColor: crew?.accent }}>
              {friend.runnerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="runner-card__info">
            <span className="runner-card__name">{friend.runnerName}</span>
            {crew && (
              <span className="runner-card__crew" style={{ color: crew.accent }}>
                {crew.name} · {crew.zone}
              </span>
            )}
            {friend.runnerTypeId && (
              <span className="runner-card__type">{friend.runnerTypeId}</span>
            )}
          </div>
        </div>

        <div className="runner-card__meta">
          <div className="runner-card__meta-item">
            <span className="runner-card__meta-label">Adicionado</span>
            <span className="runner-card__meta-value">{addedDate}</span>
          </div>
          <div className="runner-card__meta-item">
            <span className="runner-card__meta-label">Via</span>
            <span className="runner-card__meta-value">{friend.addMethod.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </MapBottomSheet>
  );
};
