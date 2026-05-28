import React, { useMemo } from 'react';
import { getCrewBySlug } from '../../data/crews';
import { getZoneByCrewSlug, SP_SPOT_MAP_FEATURES } from '../../data/spLiveMap';
import {
  INK_PER_FULL_OWNERSHIP,
  xpToLevel,
  type RunnerProgress,
} from '../../data/gamification';
import { MapBottomSheet } from './MapBottomSheet';
import type { FriendRecord } from '../../data/friends';

interface Props {
  crewSlug: string;
  progress: RunnerProgress;
  friends: FriendRecord[];
  isUserCrew: boolean;
  open: boolean;
  onClose: () => void;
}

export const CrewSheet: React.FC<Props> = ({ crewSlug, progress, friends, isUserCrew, open, onClose }) => {
  const crew = getCrewBySlug(crewSlug);
  const zone = getZoneByCrewSlug(crewSlug);

  const zoneInk = zone ? (progress.inkPerZone[zone.id] ?? 0) : 0;
  const ownership = Math.min(1, zoneInk / INK_PER_FULL_OWNERSHIP);
  const level = xpToLevel(progress.xp);

  const crewFriends = useMemo(
    () => friends.filter((f) => f.crewSlug === crewSlug),
    [friends, crewSlug],
  );

  const crewSpots = useMemo(() => {
    if (!zone) return { total: 0, open: 0 };
    const spots = SP_SPOT_MAP_FEATURES.filter((s) => s.zoneId === zone.id);
    return { total: spots.length, open: spots.filter((s) => s.active).length };
  }, [zone]);

  return (
    <MapBottomSheet open={open} onClose={onClose} title={crew.name} accent={crew.accent}>
      <div className="crew-sheet">
        <div className="crew-sheet__hero">
          <img src={crew.assets.badge} alt="" className="crew-sheet__badge" aria-hidden />
          <div className="crew-sheet__hero-info">
            <span className="crew-sheet__zone-name">{crew.zone}</span>
            <span className="crew-sheet__mission">{crew.mission}</span>
            {isUserCrew && <span className="crew-sheet__your-crew">SUA CREW</span>}
          </div>
        </div>

        <div className="crew-sheet__stats">
          <Stat label="Domínio" value={`${Math.round(ownership * 100)}%`} />
          <Stat label="Tinta" value={`${Math.round(zoneInk)}`} />
          <Stat label="Spots" value={`${crewSpots.open}/${crewSpots.total}`} />
          {isUserCrew && <Stat label="Seu Nível" value={`${level}`} />}
        </div>

        {isUserCrew && (
          <div className="crew-sheet__your-stats">
            <span className="crew-sheet__intro-line">"{crew.introLine}"</span>
          </div>
        )}

        {crewFriends.length > 0 && (
          <div className="crew-sheet__section">
            <h4 className="crew-sheet__section-title">
              Membros ({crewFriends.length})
            </h4>
            <div className="crew-sheet__members">
              {crewFriends.map((f) => (
                <div key={f.userId} className="crew-sheet__member">
                  <span className="crew-sheet__member-dot" style={{ background: crew.accent }} />
                  <span className="crew-sheet__member-name">{f.runnerName}</span>
                  <span className="crew-sheet__member-method">{f.addMethod.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {crewFriends.length === 0 && (
          <p className="crew-sheet__empty">
            {isUserCrew
              ? 'Adicione runners via NFC ou QR no mapa.'
              : 'Nenhum amigo nesta crew ainda.'}
          </p>
        )}
      </div>
    </MapBottomSheet>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="crew-sheet__stat">
    <span className="crew-sheet__stat-value">{value}</span>
    <span className="crew-sheet__stat-label">{label}</span>
  </div>
);
