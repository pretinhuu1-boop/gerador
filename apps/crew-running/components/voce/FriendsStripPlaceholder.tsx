import React from 'react';
import type { CrewZone } from '../../data/crews';
import { CrewBadge } from '../CrewBadge';

type Props = {
  crew: CrewZone;
};

export const FriendsStripPlaceholder: React.FC<Props> = ({ crew }) => {
  const tiles = Array.from({ length: 5 }, (_, i) => i);
  return (
    <div className="voce-panel__friends-strip" aria-hidden="true">
      <span className="voce-panel__friends-label">AMIGOS · ABRE NA FASE 2</span>
      <div className="voce-panel__friends-tiles">
        {tiles.map((i) => (
          <CrewBadge
            key={i}
            crew={crew}
            size="sm"
            className="voce-panel__friend-tile"
          />
        ))}
      </div>
    </div>
  );
};
