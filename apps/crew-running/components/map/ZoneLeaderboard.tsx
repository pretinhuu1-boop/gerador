import React from 'react';
import { getCrewBySlug } from '../../data/crews';
import { useZoneLeaderboard } from '../../hooks/useLeaderboard';

interface Props {
  zoneId: string;
  weekKey: string;
  currentUserId: string;
}

export const ZoneLeaderboard: React.FC<Props> = ({ zoneId, weekKey, currentUserId }) => {
  const { entries, loading } = useZoneLeaderboard(zoneId, weekKey);

  if (loading) return <div className="zone-leaderboard__loading">Carregando ranking...</div>;

  if (entries.length === 0) {
    return <p className="zone-leaderboard__empty">Nenhum runner nesta zona esta semana.</p>;
  }

  return (
    <div className="zone-leaderboard">
      <h4 className="zone-leaderboard__title">RANKING DA ZONA</h4>
      <ol className="zone-leaderboard__list">
        {entries.map((entry) => {
          const crew = getCrewBySlug(entry.crewSlug);
          const isSelf = entry.userId === currentUserId;
          return (
            <li
              key={entry.userId}
              className={`zone-leaderboard__row ${isSelf ? 'is-self' : ''}`}
              data-is-self={isSelf}
              style={{ '--crew-accent': crew.accent } as React.CSSProperties}
            >
              <span className="zone-leaderboard__rank">{entry.rank}</span>
              <img src={crew.assets.badge} alt="" className="zone-leaderboard__badge" aria-hidden />
              <span className="zone-leaderboard__name">{entry.runnerName}</span>
              <span className="zone-leaderboard__km">{entry.totalKm} km</span>
              <span className="zone-leaderboard__ink">{entry.totalInk} tinta</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
