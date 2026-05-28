import React, { useMemo } from 'react';
import { getZoneById, getSpotsByZone, type SpZoneId } from '../../data/spLiveMap';
import { getCrewBySlug } from '../../data/crews';
import {
  INK_PER_FULL_OWNERSHIP,
  territoryStatus,
  SAMPLE_MISSIONS,
  type RunnerProgress,
  isoWeekKey,
} from '../../data/gamification';
import { MapBottomSheet } from './MapBottomSheet';
import type { FriendRecord } from '../../data/friends';
import { ZoneLeaderboard } from './ZoneLeaderboard';

interface Props {
  zoneId: SpZoneId;
  progress: RunnerProgress;
  friends: FriendRecord[];
  currentUserId: string;
  open: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  owned: 'DOMINADA',
  contested: 'DISPUTADA',
  neutral: 'NEUTRA',
};

export const ZoneSheet: React.FC<Props> = ({ zoneId, progress, friends, currentUserId, open, onClose }) => {
  const zone = getZoneById(zoneId);
  if (!zone) return null;

  const crew = getCrewBySlug(zone.crewSlug);
  const spots = getSpotsByZone(zoneId);
  const openSpots = spots.filter((s) => s.active).length;
  const ink = progress.inkPerZone[zoneId] ?? 0;
  const ownership = Math.min(1, ink / INK_PER_FULL_OWNERSHIP);
  const status = territoryStatus(ownership);

  const missions = useMemo(
    () => SAMPLE_MISSIONS.filter((m) => m.zoneId === zoneId),
    [zoneId],
  );

  const zoneFriends = useMemo(
    () => friends.filter((f) => f.crewSlug === zone.crewSlug),
    [friends, zone.crewSlug],
  );

  return (
    <MapBottomSheet open={open} onClose={onClose} title={zone.label} accent={crew.accent}>
      <div className="zone-sheet">
        <div className="zone-sheet__crew-row">
          <img src={crew.assets.badge} alt="" className="zone-sheet__badge" aria-hidden />
          <div>
            <span className="zone-sheet__crew-name">{crew.name}</span>
            <span className="zone-sheet__crew-mission">{crew.mission}</span>
          </div>
        </div>

        <div className="zone-sheet__stats">
          <div className="zone-sheet__stat">
            <span className="zone-sheet__stat-value">{Math.round(ownership * 100)}%</span>
            <span className="zone-sheet__stat-label">Domínio</span>
          </div>
          <div className="zone-sheet__stat">
            <span
              className="zone-sheet__stat-value"
              data-status={status}
            >
              {STATUS_LABELS[status]}
            </span>
            <span className="zone-sheet__stat-label">Status</span>
          </div>
          <div className="zone-sheet__stat">
            <span className="zone-sheet__stat-value">{Math.round(ink)}</span>
            <span className="zone-sheet__stat-label">Tinta</span>
          </div>
        </div>

        <div className="zone-sheet__bar">
          <div
            className="zone-sheet__bar-fill"
            style={{ width: `${ownership * 100}%`, background: crew.accent }}
          />
        </div>

        <div className="zone-sheet__section">
          <h4 className="zone-sheet__section-title">Spots</h4>
          <span className="zone-sheet__section-count">{openSpots}/{spots.length} abertos</span>
          <ul className="zone-sheet__spot-list">
            {spots.map((spot) => (
              <li key={spot.id} className={`zone-sheet__spot ${spot.active ? '' : 'is-locked'}`}>
                <span className="zone-sheet__spot-dot" />
                {spot.name}
              </li>
            ))}
          </ul>
        </div>

        {missions.length > 0 && (
          <div className="zone-sheet__section">
            <h4 className="zone-sheet__section-title">Missões</h4>
            {missions.map((m) => (
              <div key={m.id} className="zone-sheet__mission">
                <span className="zone-sheet__mission-type">{m.type}</span>
                <span className="zone-sheet__mission-title">{m.title}</span>
                <span className="zone-sheet__mission-xp">+{m.rewardXp} XP</span>
              </div>
            ))}
          </div>
        )}

        {zoneFriends.length > 0 && (
          <div className="zone-sheet__section">
            <h4 className="zone-sheet__section-title">Runners na zona</h4>
            <div className="zone-sheet__friends">
              {zoneFriends.map((f) => (
                <span key={f.userId} className="zone-sheet__friend-tag" style={{ borderColor: crew.accent }}>
                  {f.runnerName}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="zone-sheet__ranking">
          <ZoneLeaderboard
            zoneId={zoneId}
            weekKey={isoWeekKey(new Date())}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </MapBottomSheet>
  );
};
