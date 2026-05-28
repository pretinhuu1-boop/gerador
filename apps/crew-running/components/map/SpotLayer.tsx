import React from 'react';
import {
  SP_SPOT_MAP_FEATURES,
  projectLngLat,
  type ProjectionOpts,
  type SpZoneId,
} from '../../data/spLiveMap';
import type { MapZoom } from '../../data/spLiveMap';

interface Props {
  projection: ProjectionOpts;
  zoom: MapZoom;
  activeZoneId?: SpZoneId;
  activeSpotId?: string;
  onSelectSpot?: (spotId: string) => void;
}

export const SpotLayer: React.FC<Props> = ({ projection, zoom, activeZoneId, activeSpotId, onSelectSpot }) => {
  if (zoom === 'city') return null;
  const visible = SP_SPOT_MAP_FEATURES.filter((spot) => {
    if (zoom === 'zone') return spot.zoneId === activeZoneId;
    if (zoom === 'spot') return true;
    return false;
  });
  return (
    <g className="map-spot-layer">
      {visible.map((spot) => {
        const { x, y } = projectLngLat(spot.coordinate, projection);
        const isActive = spot.id === activeSpotId;
        const isInZone = spot.zoneId === activeZoneId;
        const className = [
          'map-spot',
          spot.active ? 'is-open' : 'is-locked',
          isActive ? 'is-active' : '',
          isInZone ? 'is-in-zone' : 'is-out-zone',
        ]
          .filter(Boolean)
          .join(' ');
        const radius = zoom === 'spot' ? 7 : 5;
        return (
          <g key={spot.id} className={className} transform={`translate(${x} ${y})`}>
            <circle r={radius + 3} className="map-spot-halo" />
            <circle
              r={radius}
              className="map-spot-dot"
              onClick={onSelectSpot && spot.active ? () => onSelectSpot(spot.id) : undefined}
              role={onSelectSpot && spot.active ? 'button' : undefined}
              tabIndex={onSelectSpot && spot.active ? 0 : undefined}
              aria-label={spot.name}
            />
            {zoom === 'spot' && (
              <text className="map-spot-label" x={radius + 6} y={4}>
                {spot.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};
