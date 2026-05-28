import React, { useMemo } from 'react';
import {
  SP_SIGNAL_ROUTE,
  SP_SPOT_MAP_FEATURES,
  SP_ZONE_MAP_FEATURES,
  getZoneByCrewSlug,
  type LngLat,
} from '../../data/spLiveMap';

type Props = {
  activeSlug?: string;
  tone?: 'ambient' | 'focused';
};

const MAP_BOUNDS = {
  east: -46.36,
  north: -23.36,
  south: -23.82,
  west: -46.88,
};

const projectPoint = ({ lng, lat }: LngLat) => {
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 100;
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 100;

  return { x, y };
};

const toSvgPoint = (point: LngLat) => {
  const { x, y } = projectPoint(point);
  return `${x.toFixed(2)},${y.toFixed(2)}`;
};

export const Sp3DMapBackground: React.FC<Props> = ({ activeSlug, tone = 'ambient' }) => {
  const activeZone = getZoneByCrewSlug(activeSlug);
  const routePoints = useMemo(
    () => SP_SIGNAL_ROUTE.map(toSvgPoint).join(' '),
    [],
  );

  return (
    <div className={`sp-3d-map-bg sp-3d-map-bg--${tone}`} aria-hidden>
      <svg
        className="sp-3d-map-bg__canvas"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="sp-3d-map-bg__roads">
          <path d="M6 28 C 22 18, 34 34, 48 26 S 78 12, 96 24" />
          <path d="M3 58 C 22 44, 38 52, 52 46 S 76 34, 98 42" />
          <path d="M12 82 C 25 72, 42 74, 57 65 S 80 55, 94 63" />
          <path d="M28 4 C 38 22, 34 42, 45 59 S 54 82, 49 98" />
          <path d="M67 2 C 60 21, 66 38, 58 55 S 67 78, 76 98" />
          <path d="M8 10 L92 92" />
          <path d="M92 8 L10 94" />
        </g>

        <g className="sp-3d-map-bg__zones">
          {SP_ZONE_MAP_FEATURES.map((zone) => {
            const selected = activeZone ? activeZone.id === zone.id : false;

            return (
              <polygon
                key={zone.id}
                className={`sp-3d-map-bg__zone ${selected ? 'is-selected' : ''}`}
                points={zone.polygon.map(toSvgPoint).join(' ')}
                style={{ color: zone.color }}
              />
            );
          })}
        </g>

        <polyline className="sp-3d-map-bg__route" points={routePoints} />

        <g className="sp-3d-map-bg__spots">
          {SP_SPOT_MAP_FEATURES.map((spot) => {
            const projected = projectPoint(spot.coordinate);
            const zone = SP_ZONE_MAP_FEATURES.find((item) => item.id === spot.zoneId);
            const selected = activeZone ? activeZone.id === spot.zoneId : false;

            return (
              <circle
                key={spot.id}
                className={`sp-3d-map-bg__spot ${selected ? 'is-selected' : ''}`}
                cx={projected.x}
                cy={projected.y}
                r={selected ? 1.5 : 1}
                style={{ color: zone?.color ?? '#34D9CA' }}
              />
            );
          })}
        </g>
      </svg>
      <div className="sp-3d-map-bg__shade" />
      <div className="sp-3d-map-bg__scan" />
      <div className="sp-3d-map-bg__attribution">
        SP piloto / mapa vetorial leve
      </div>
    </div>
  );
};
