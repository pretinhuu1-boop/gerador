import React from 'react';
import { CREWS } from '../../../data/crews';
import { territoryStatus } from '../../../data/gamification';
import {
  getZoneByCrewSlug,
  projectLngLat,
  type ProjectionOpts,
  type SpZoneId,
} from '../../../data/spLiveMap';

type Ownership = Partial<Record<SpZoneId, number>>;

type Props = {
  projection: ProjectionOpts;
  viewBoxWidth: number;
  viewBoxHeight: number;
  activeCrewSlug?: string;
  ownershipByZone?: Ownership;
  // When provided, pings render as <button>s with aria-pressed,
  // status rings, and 44x44 hit targets. Falsy = decorative.
  onSelectCrew?: (slug: string) => void;
};

const ownershipForCrew = (ownership: Ownership | undefined, slug: string): number => {
  if (!ownership) return 0;
  const zone = getZoneByCrewSlug(slug);
  if (!zone) return 0;
  return ownership[zone.id] ?? 0;
};

export const PingsLayer: React.FC<Props> = ({
  projection,
  viewBoxWidth,
  viewBoxHeight,
  activeCrewSlug,
  ownershipByZone,
  onSelectCrew,
}) => {
  const interactive = typeof onSelectCrew === 'function';

  return (
    <>
      {CREWS.map((crew, index) => {
        const zone = getZoneByCrewSlug(crew.slug);
        if (!zone) return null;
        const projected = projectLngLat(zone.center, projection);
        const leftPct = (projected.x / viewBoxWidth) * 100;
        const topPct = (projected.y / viewBoxHeight) * 100;
        const isActive = activeCrewSlug ? crew.slug === activeCrewSlug : !interactive;
        const ownership = ownershipForCrew(ownershipByZone, crew.slug);
        const status = territoryStatus(ownership);
        const style = {
          '--crew-accent': crew.accent,
          '--crew-secondary': crew.secondary,
          '--delay': `${0.18 + index * 0.12}s`,
          '--ink-ownership': ownership.toFixed(3),
          left: `${leftPct}%`,
          top: `${topPct}%`,
        } as React.CSSProperties;
        const className = [
          'mapa-cidade__ping',
          isActive ? 'is-active' : '',
          `is-status-${status}`,
        ]
          .filter(Boolean)
          .join(' ');
        const ariaLabel = `${crew.name}, ${crew.zone}${
          ownershipByZone ? ` · territorio ${status}` : ''
        }`;

        if (interactive) {
          return (
            <button
              key={crew.slug}
              type="button"
              className={className}
              style={style}
              aria-label={ariaLabel}
              aria-pressed={isActive}
              onClick={() => onSelectCrew(crew.slug)}
            >
              <span className="mapa-cidade__ping-halo" aria-hidden />
              <img src={crew.assets.ping} alt="" aria-hidden />
              <span className="mapa-cidade__ping-label">{crew.zone}</span>
            </button>
          );
        }

        return (
          <div
            key={crew.slug}
            className={className}
            style={style}
            aria-label={ariaLabel}
          >
            <span className="mapa-cidade__ping-halo" aria-hidden />
            <img src={crew.assets.ping} alt="" aria-hidden />
            <span className="mapa-cidade__ping-label">{crew.zone}</span>
          </div>
        );
      })}
    </>
  );
};
