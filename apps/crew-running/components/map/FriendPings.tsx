import React from 'react';
import {
  getZoneByCrewSlug,
  projectLngLat,
  type ProjectionOpts,
} from '../../data/spLiveMap';
import type { FriendRecord } from '../../data/friends';

type Props = {
  friends: FriendRecord[];
  projection: ProjectionOpts;
};

const hashCode = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const offsetForFriend = (userId: string, index: number) => {
  const h = hashCode(userId);
  const angle = ((h % 360) + index * 47) * (Math.PI / 180);
  const radius = 14 + (h % 10);
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
};

export const FriendPings: React.FC<Props> = ({ friends, projection }) => {
  if (friends.length === 0) return null;

  const byZone = new Map<string, FriendRecord[]>();
  for (const friend of friends) {
    const slug = friend.crewSlug;
    if (!slug) continue;
    const zone = getZoneByCrewSlug(slug);
    if (!zone) continue;
    const list = byZone.get(zone.id) ?? [];
    list.push(friend);
    byZone.set(zone.id, list);
  }

  const nodes: React.ReactElement[] = [];
  byZone.forEach((zoneFriends, zoneId) => {
    const zone = zoneFriends[0].crewSlug ? getZoneByCrewSlug(zoneFriends[0].crewSlug) : undefined;
    if (!zone) return;
    const center = projectLngLat(zone.center, projection);
    zoneFriends.forEach((friend, index) => {
      const { dx, dy } = offsetForFriend(friend.userId, index);
      nodes.push(
        <g
          key={`${zoneId}-${friend.userId}`}
          className="friend-ping"
          transform={`translate(${center.x + dx}, ${center.y + dy})`}
        >
          <title>{`${friend.runnerName} · ${zone.label}`}</title>
          <circle r={9} className="friend-ping__halo" />
          <circle r={5} className="friend-ping__core" style={{ fill: zone.color }} />
          <circle r={5} className="friend-ping__ring" />
        </g>,
      );
    });
  });

  return <g className="friend-pings-layer" aria-label="Amigos conectados">{nodes}</g>;
};
