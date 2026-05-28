import React, { useId } from 'react';
import {
  SP_ZONE_MAP_FEATURES,
  polygonToPath,
  type ProjectionOpts,
  type SpZoneId,
  type SpZoneMapFeature,
} from '../../data/spLiveMap';
import { getCrewBySlug } from '../../data/crews';
import { territoryStatus } from '../../data/gamification';

interface Props {
  projection: ProjectionOpts;
  activeZoneId?: SpZoneId;
  ownershipByZone?: Partial<Record<SpZoneId, number>>;
  onSelectZone?: (zoneId: SpZoneId) => void;
}

interface ZonePatternProps {
  zone: SpZoneMapFeature;
  patternId: string;
}

const ZonePattern: React.FC<ZonePatternProps> = ({ zone, patternId }) => {
  const crew = getCrewBySlug(zone.crewSlug);
  // territory_pattern.png is full crew artwork (logo + skyline composition),
  // not a tileable texture. Tile it at 96x96 in userSpaceOnUse and the same
  // artwork stamps 6–9 times per zone, reading as duplication. Use
  // objectBoundingBox so the pattern fits each polygon bbox exactly once,
  // and dial the opacity down so the zone color reads first.
  return (
    <pattern
      id={patternId}
      patternUnits="objectBoundingBox"
      patternContentUnits="objectBoundingBox"
      width="1"
      height="1"
    >
      <rect x="0" y="0" width="1" height="1" fill={zone.color} fillOpacity="0.45" />
      <image
        href={crew.assets.pattern}
        x="0"
        y="0"
        width="1"
        height="1"
        preserveAspectRatio="xMidYMid slice"
        opacity="0.35"
      />
    </pattern>
  );
};

export const ZoneLayer: React.FC<Props> = ({ projection, activeZoneId, ownershipByZone, onSelectZone }) => {
  const reactId = useId();
  return (
    <g className="map-zone-layer">
      <defs>
        {SP_ZONE_MAP_FEATURES.map((zone) => (
          <ZonePattern key={zone.id} zone={zone} patternId={`zone-pattern-${reactId}-${zone.id}`} />
        ))}
      </defs>
      {SP_ZONE_MAP_FEATURES.map((zone) => {
        const path = polygonToPath(zone.polygon, projection);
        const dimmed = activeZoneId && activeZoneId !== zone.id;
        const ownership = ownershipByZone?.[zone.id] ?? 0;
        const status = territoryStatus(ownership);
        const className = [
          'map-zone',
          dimmed ? 'is-dimmed' : '',
          activeZoneId === zone.id ? 'is-active' : '',
          `is-status-${status}`,
        ]
          .filter(Boolean)
          .join(' ');
        const handleSelect = onSelectZone ? () => onSelectZone(zone.id) : undefined;
        const handleKeyDown = handleSelect
          ? (event: React.KeyboardEvent<SVGPathElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleSelect();
              }
            }
          : undefined;
        return (
          <path
            key={zone.id}
            d={path}
            className={className}
            fill={`url(#zone-pattern-${reactId}-${zone.id})`}
            stroke={zone.color}
            strokeWidth={activeZoneId === zone.id ? 3.5 : 2.2}
            onClick={handleSelect}
            onKeyDown={handleKeyDown}
            role={handleSelect ? 'button' : undefined}
            tabIndex={handleSelect ? 0 : undefined}
            aria-label={zone.label}
          />
        );
      })}
    </g>
  );
};

