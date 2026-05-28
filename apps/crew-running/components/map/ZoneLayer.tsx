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
  return (
    <pattern id={patternId} patternUnits="userSpaceOnUse" width="96" height="96">
      <rect width="96" height="96" fill={zone.color} fillOpacity="0.55" />
      <image href={crew.assets.pattern} x="0" y="0" width="96" height="96" preserveAspectRatio="xMidYMid slice" opacity="0.7" />
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

