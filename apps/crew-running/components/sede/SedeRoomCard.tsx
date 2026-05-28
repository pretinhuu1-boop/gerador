import React from 'react';
import type { SedeRoomConfig, SedeRoomId } from '../../data/sedeRooms';

export type SedeViewer = 'visitor' | 'member';

type Props = {
  room: SedeRoomConfig;
  onOpen: (id: SedeRoomId) => void;
  viewer?: SedeViewer;
};

export const SedeRoomCard: React.FC<Props> = ({ room, onOpen, viewer = 'member' }) => {
  const blocked = viewer === 'visitor' && room.memberOnly;
  return (
    <button
      type="button"
      className="sede-room-card"
      data-icon={room.iconKey}
      data-blocked={blocked || undefined}
      disabled={blocked}
      onClick={() => onOpen(room.id)}
    >
      <span className="sede-room-card__icon" aria-hidden="true" />
      <span className="sede-room-card__label">{room.shortLabel}</span>
      {blocked && <span className="sede-room-card__lock">SÓ MEMBROS</span>}
    </button>
  );
};
