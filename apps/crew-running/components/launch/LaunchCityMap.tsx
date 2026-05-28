import React, { useMemo } from 'react';
import { CREWS } from '../../data/crews';
import {
  SP_ZONE_MAP_FEATURES,
  getZoneByCrewSlug,
  projectLngLat,
  type ProjectionOpts,
} from '../../data/spLiveMap';

type Props = {
  activeSlug?: string;
  mode?: 'intro' | 'menu';
};

const PROJECTION: ProjectionOpts = { width: 100, height: 100, padding: 8 };

export const LaunchCityMap: React.FC<Props> = ({ activeSlug, mode = 'intro' }) => {
  // SP_ZONE_MAP_FEATURES is a module-level frozen constant; the route paths
  // only need to compute once for the lifetime of this component instance.
  const routes = useMemo(() => {
    const centro = SP_ZONE_MAP_FEATURES.find((z) => z.id === 'centro');
    if (!centro) return [] as string[];
    const center = projectLngLat(centro.center, PROJECTION);
    return SP_ZONE_MAP_FEATURES.filter((z) => z.id !== 'centro').map((zone) => {
      const target = projectLngLat(zone.center, PROJECTION);
      const cx = (center.x + target.x) / 2;
      const cy = (center.y + target.y) / 2;
      const skew = (target.x - center.x) * 0.18;
      return `M${center.x.toFixed(2)} ${center.y.toFixed(2)} Q ${(cx + skew).toFixed(2)} ${(cy - skew).toFixed(2)} ${target.x.toFixed(2)} ${target.y.toFixed(2)}`;
    });
  }, []);

  return (
    <div
      className={`launch-city-map launch-city-map--${mode}`}
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
        const isActive = activeSlug ? crew.slug === activeSlug : true;
        const zone = getZoneByCrewSlug(crew.slug);
        const projected = zone ? projectLngLat(zone.center, PROJECTION) : { x: 50, y: 50 };
        const style = {
          '--crew-accent': crew.accent,
          '--crew-secondary': crew.secondary,
          '--delay': `${0.24 + index * 0.16}s`,
          left: `${projected.x}%`,
          top: `${projected.y}%`,
        } as React.CSSProperties;

        return (
          <div
            key={crew.slug}
            className={`launch-city-map__ping ${isActive ? 'is-active' : ''}`}
            style={style}
            aria-label={`${crew.name}, ${crew.zone}`}
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
