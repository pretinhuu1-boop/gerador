import React from 'react';
import {
  projectLngLat,
  getZoneById,
  getSpotById,
  type ProjectionOpts,
  type MapZoom,
} from '../../data/spLiveMap';
import type { MissionDef } from '../../data/gamification';
import { getCrewBySlug } from '../../data/crews';

interface Props {
  projection: ProjectionOpts;
  zoom: MapZoom;
  missions: MissionDef[];
}

export const MissionLayer: React.FC<Props> = ({ projection, zoom, missions }) => {
  if (zoom === 'city') return null;
  return (
    <g className="map-mission-layer">
      {missions.map((mission) => {
        const anchorSpot = mission.spotIds?.[0] ? getSpotById(mission.spotIds[0]) : undefined;
        const zone = mission.zoneId ? getZoneById(mission.zoneId) : undefined;
        const coord = anchorSpot?.coordinate ?? zone?.center;
        if (!coord) {
          if (import.meta.env.DEV) {
            console.warn(`[MissionLayer] mission ${mission.id} skipped: no anchor coord (zoneId=${mission.zoneId ?? 'none'}, spotIds=${mission.spotIds?.join(',') ?? 'none'})`);
          }
          return null;
        }
        const { x, y } = projectLngLat(coord, projection);
        const accent = zone ? getCrewBySlug(zone.crewSlug).accent : '#F4A52C';
        return (
          <g key={mission.id} className={`map-mission map-mission-${mission.type}`} transform={`translate(${x} ${y})`}>
            <circle r={11} fill="white" stroke="black" strokeWidth={2.5} />
            <circle r={8} fill={accent} stroke="black" strokeWidth={1.5} />
            <text className="map-mission-glyph" textAnchor="middle" y={3}>!</text>
            <title>{mission.title}</title>
          </g>
        );
      })}
    </g>
  );
};
