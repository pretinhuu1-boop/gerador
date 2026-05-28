import React, { useMemo } from 'react';
import { CREWS } from '../../data/crews';
import { territoryStatus } from '../../data/gamification';
import {
  SP_ZONE_MAP_FEATURES,
  getZoneByCrewSlug,
  projectLngLat,
  type ProjectionOpts,
  type SpZoneId,
} from '../../data/spLiveMap';

type Mode = 'intro' | 'menu';
type Ownership = Partial<Record<SpZoneId, number>>;

type Props = {
  activeSlug?: string;
  mode?: Mode;
  ownershipByZone?: Ownership;
  onSelectCrew?: (slug: string) => void;
};

const PROJECTION: ProjectionOpts = { width: 100, height: 100, padding: 8 };

const ARC_SKEW = 0.18;

const buildArc = (from: { x: number; y: number }, to: { x: number; y: number }): string => {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const skew = (to.x - from.x) * ARC_SKEW;
  return `M${from.x.toFixed(2)} ${from.y.toFixed(2)} Q ${(cx + skew).toFixed(2)} ${(cy - skew).toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
};

const ownershipForCrew = (
  ownership: Ownership | undefined,
  crewSlug: string,
): number => {
  if (!ownership) return 0;
  const zone = getZoneByCrewSlug(crewSlug);
  if (!zone) return 0;
  return ownership[zone.id] ?? 0;
};

export const LaunchCityMap: React.FC<Props> = ({
  activeSlug,
  mode = 'intro',
  ownershipByZone,
  onSelectCrew,
}) => {
  // SP_ZONE_MAP_FEATURES is a module-level frozen constant; the route paths
  // only need to compute once for the lifetime of this component instance.
  const routes = useMemo(() => {
    const centro = SP_ZONE_MAP_FEATURES.find((z) => z.id === 'centro');
    if (!centro) return [] as string[];
    const center = projectLngLat(centro.center, PROJECTION);
    return SP_ZONE_MAP_FEATURES.filter((z) => z.id !== 'centro').map((zone) =>
      buildArc(center, projectLngLat(zone.center, PROJECTION)),
    );
  }, []);

  const interactive = mode === 'menu' && typeof onSelectCrew === 'function';

  return (
    <div
      className={`launch-city-map launch-city-map--${mode}`}
      role={interactive ? 'group' : undefined}
      aria-label="Mapa vivo das crews"
    >
      <div className="launch-city-map__grid" aria-hidden />
      <svg className="launch-city-map__routes" viewBox="0 0 100 100" aria-hidden>
        {routes.map((d, idx) => (
          <path key={idx} pathLength={1} d={d} />
        ))}
      </svg>

      <div className="launch-city-map__scanner" aria-hidden>
        <span />
      </div>

      {CREWS.map((crew, index) => {
        const isActive = activeSlug ? crew.slug === activeSlug : !interactive;
        const zone = getZoneByCrewSlug(crew.slug);
        const projected = zone ? projectLngLat(zone.center, PROJECTION) : { x: 50, y: 50 };
        const ownership = ownershipForCrew(ownershipByZone, crew.slug);
        const status = territoryStatus(ownership);
        const style = {
          '--crew-accent': crew.accent,
          '--crew-secondary': crew.secondary,
          '--delay': `${0.24 + index * 0.16}s`,
          '--ink-ownership': ownership.toFixed(3),
          left: `${projected.x}%`,
          top: `${projected.y}%`,
        } as React.CSSProperties;
        const className = [
          'launch-city-map__ping',
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
              <span className="launch-city-map__halo" aria-hidden />
              <img src={crew.assets.ping} alt="" aria-hidden />
              <span>{crew.zone}</span>
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
            <span className="launch-city-map__halo" aria-hidden />
            <img src={crew.assets.ping} alt="" aria-hidden />
            <span>{crew.zone}</span>
          </div>
        );
      })}
    </div>
  );
};
