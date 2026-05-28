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
          <button
            key={friend.userId}
            type="button"
            className="voce-panel__friend-tile-button"
            title={`${friend.runnerName} · ${friend.addMethod.toUpperCase()}`}
            aria-label={`Amigo ${friend.runnerName}`}
          >
            {friend.avatarDataUrl ? (
              <img
                src={friend.avatarDataUrl}
                alt=""
                className="voce-panel__friend-tile"
              />
            ) : (
              <CrewBadge
                crew={friend.crewSlug}
                size="sm"
                className="voce-panel__friend-tile"
              />
            )}
          </button>
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
