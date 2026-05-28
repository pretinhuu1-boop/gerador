import React, { useMemo } from 'react';
import { getSpotById, getZoneById } from '../../data/spLiveMap';
import { getCrewBySlug } from '../../data/crews';
import { SAMPLE_MISSIONS } from '../../data/gamification';
import { MapBottomSheet } from './MapBottomSheet';

interface Props {
  spotId: string;
  open: boolean;
  onClose: () => void;
}

export const SpotSheet: React.FC<Props> = ({ spotId, open, onClose }) => {
  const spot = getSpotById(spotId);
  if (!spot) return null;

  const zone = getZoneById(spot.zoneId);
  const crew = zone ? getCrewBySlug(zone.crewSlug) : undefined;

  const linkedMissions = useMemo(
    () => SAMPLE_MISSIONS.filter((m) => m.spotIds?.includes(spotId)),
    [spotId],
  );

  return (
    <MapBottomSheet
      open={open}
      onClose={onClose}
      title={spot.name}
      accent={crew?.accent}
    >
      <div className="spot-sheet">
        <div className="spot-sheet__status-row">
          <span className={`spot-sheet__status ${spot.active ? 'is-open' : 'is-locked'}`}>
            {spot.active ? 'ABERTO' : 'BLOQUEADO'}
          </span>
          {zone && (
            <span className="spot-sheet__zone" style={{ color: crew?.accent }}>
              {zone.label}
            </span>
          )}
        </div>

        {!spot.active && (
          <p className="spot-sheet__hint">
            {zone ? `Corra na zona ${zone.label} para desbloquear este spot.` : 'Spot bloqueado.'}
          </p>
        )}

        {spot.active && linkedMissions.length > 0 && (
          <div className="spot-sheet__section">
            <h4 className="spot-sheet__section-title">Missões vinculadas</h4>
            {linkedMissions.map((m) => (
              <div key={m.id} className="spot-sheet__mission">
                <span className="spot-sheet__mission-title">{m.title}</span>
                <span className="spot-sheet__mission-desc">{m.description}</span>
                <span className="spot-sheet__mission-xp">+{m.rewardXp} XP</span>
              </div>
            ))}
          </div>
        )}

        {spot.active && linkedMissions.length === 0 && (
          <p className="spot-sheet__empty">Nenhuma missão ativa neste spot.</p>
        )}
      </div>
    </MapBottomSheet>
  );
};
