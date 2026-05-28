import React from 'react';
import { CrewBadge } from '../CrewBadge';
import type { FriendRecord } from '../../data/friends';

type Props = {
  friends: FriendRecord[];
  onAdd: () => void;
};

export const FriendsStrip: React.FC<Props> = ({ friends, onAdd }) => {
  const empty = friends.length === 0;
  return (
    <div className="voce-panel__friends-strip" aria-label="Amigos da crew">
      <span className="voce-panel__friends-label">
        {empty ? 'AMIGOS · NENHUM AINDA' : `AMIGOS · ${friends.length}`}
      </span>
      <div className="voce-panel__friends-tiles">
        {friends.slice(0, 6).map((friend) => (
          <span
            key={friend.userId}
            className="voce-panel__friend-tile-slot"
            title={`${friend.runnerName} · ${friend.addMethod.toUpperCase()}`}
          >
            {friend.avatarDataUrl ? (
              <img
                src={friend.avatarDataUrl}
                alt={friend.runnerName}
                className="voce-panel__friend-tile"
              />
            ) : (
              <CrewBadge
                crew={friend.crewSlug}
                size="sm"
                className="voce-panel__friend-tile"
              />
            )}
          </span>
        ))}
        <button
          type="button"
          className="voce-panel__friend-add"
          onClick={onAdd}
          aria-label="Adicionar amigo"
        >
          +
        </button>
      </div>
    </div>
  );
};
