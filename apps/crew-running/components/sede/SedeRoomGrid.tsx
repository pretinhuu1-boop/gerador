import React from 'react';
import { SEDE_ROOMS, type SedeRoomId } from '../../data/sedeRooms';
import { SedeRoomCard, type SedeViewer } from './SedeRoomCard';

type Props = {
  onOpenRoom: (id: SedeRoomId) => void;
  viewer?: SedeViewer;
};

export const SedeRoomGrid: React.FC<Props> = ({ onOpenRoom, viewer = 'member' }) => (
  <div className="sede-room-grid" role="list">
    {SEDE_ROOMS.map((room) => (
      <div key={room.id} role="listitem" className="sede-room-grid__cell">
        <SedeRoomCard room={room} onOpen={onOpenRoom} viewer={viewer} />
      </div>
    ))}
  </div>
);
