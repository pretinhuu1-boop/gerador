import React from 'react';
import type { CrewZone } from '../../data/crews';
import type { SedeViewer } from './SedeRoomCard';

type Props = {
  crew: CrewZone;
  viewer: SedeViewer;
};

export const SedeHeader: React.FC<Props> = ({ crew, viewer }) => (
  <header
    className="sede-header"
    style={{ '--crew-accent': crew.accent } as React.CSSProperties}
    data-viewer={viewer}
  >
    <div className="sede-header__badge" aria-hidden="true">
      <img src={crew.assets.badge} alt="" />
    </div>
    <div className="sede-header__copy">
      <span className="sede-header__eyebrow">{crew.zone}</span>
      <strong className="sede-header__name">{crew.name}</strong>
      <span className="sede-header__mission">{crew.mission}</span>
    </div>
    {viewer === 'visitor' && <span className="sede-header__visitor">VISITANTE</span>}
  </header>
);
