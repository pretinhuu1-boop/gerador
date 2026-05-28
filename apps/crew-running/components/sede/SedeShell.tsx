import React, { useState } from 'react';
import type { CrewZone } from '../../data/crews';
import { SEDE_ROOMS_BY_ID, type SedeRoomId } from '../../data/sedeRooms';
import { SedeHeader } from './SedeHeader';
import { SedeRoomGrid } from './SedeRoomGrid';
import { SedeFooter } from './SedeFooter';
import { SedeRoomPlaceholder } from './SedeRoomPlaceholder';
import type { SedeViewer } from './SedeRoomCard';

type Props = {
  crew: CrewZone;
  viewer: SedeViewer;
  onBack: () => void;
  onSwitchCrew: () => void;
};

export const SedeShell: React.FC<Props> = ({ crew, viewer, onBack, onSwitchCrew }) => {
  const [activeRoom, setActiveRoom] = useState<SedeRoomId | null>(null);

  return (
    <div className="sede-shell" data-crew={crew.slug}>
      <SedeHeader crew={crew} viewer={viewer} />

      {activeRoom === null ? (
        <SedeRoomGrid onOpenRoom={setActiveRoom} viewer={viewer} />
      ) : (
        <div className="sede-room">
          <button
            type="button"
            className="game-command sede-room__close"
            onClick={() => setActiveRoom(null)}
          >
            FECHAR SALA
          </button>
          <SedeRoomPlaceholder room={SEDE_ROOMS_BY_ID[activeRoom]} />
        </div>
      )}

      <SedeFooter onBack={onBack} onSwitchCrew={onSwitchCrew} />
    </div>
  );
};
