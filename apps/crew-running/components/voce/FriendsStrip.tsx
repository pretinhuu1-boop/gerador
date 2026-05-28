import React from 'react';
import { CrewBadge } from '../CrewBadge';
import type { FriendRecord } from '../../data/friends';
import { TAG_EMOJI, type FriendNote } from '../../data/friendNotes';

type Props = {
  friends: FriendRecord[];
  onAdd: () => void;
  notesByFriend?: Map<string, FriendNote>;
};

export const FriendsStrip: React.FC<Props> = ({ friends, onAdd, notesByFriend }) => {
  const empty = friends.length === 0;
  return (
    <div className="voce-panel__friends-strip" aria-label="Amigos da crew">
      <span className="voce-panel__friends-label">
        {empty ? 'AMIGOS · NENHUM AINDA' : `AMIGOS · ${friends.length}`}
      </span>
      <div className="voce-panel__friends-tiles">
        {friends.slice(0, 6).map((friend) => {
          const friendNote = notesByFriend?.get(friend.userId);
          const tagEmoji = friendNote?.tag ? TAG_EMOJI[friendNote.tag] : undefined;
          return (
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
              {tagEmoji && (
                <span className="voce-panel__friend-tag-badge" aria-label={friendNote?.tag}>
                  {tagEmoji}
                </span>
              )}
            </span>
          );
        })}
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
