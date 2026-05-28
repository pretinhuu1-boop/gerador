import React from 'react';
import type { SedeRoomConfig } from '../../data/sedeRooms';

type Props = {
  room: SedeRoomConfig;
};

export const SedeRoomPlaceholder: React.FC<Props> = ({ room }) => (
  <section className="sede-room-placeholder" data-testid={`sede-room-${room.id}`}>
    <span className="sede-room-placeholder__eyebrow">EM CONSTRUÇÃO</span>
    <h2 className="sede-room-placeholder__title">{room.label}</h2>
    <p className="sede-room-placeholder__copy">
      Esta sala chega numa próxima onda. O esqueleto da sede já roda — falta o conteúdo.
    </p>
  </section>
);
