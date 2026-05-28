import React from 'react';
import { CREWS } from '../../data/crews';

type Props = {
  activeSlug?: string;
  mode?: 'intro' | 'menu';
};

export const LaunchCityMap: React.FC<Props> = ({ activeSlug, mode = 'intro' }) => {
  return (
    <div
      className={`launch-city-map launch-city-map--${mode}`}
      aria-label="Mapa vivo das crews"
    >
      <div className="launch-city-map__grid" aria-hidden />
      <svg className="launch-city-map__routes" viewBox="0 0 100 100" aria-hidden>
        <path pathLength={1} d="M12 52 C 25 43, 38 43, 50 49 S 70 61, 87 52" />
        <path pathLength={1} d="M50 49 C 46 38, 46 29, 48 18" />
        <path pathLength={1} d="M50 50 C 56 59, 58 68, 56 84" />
        <path pathLength={1} d="M50 49 C 61 43, 70 45, 84 36" />
        <path pathLength={1} d="M51 49 C 41 56, 30 57, 16 64" />
      </svg>

      <div className="launch-city-map__scanner" aria-hidden>
        <span />
      </div>

      {CREWS.map((crew, index) => {
        const isActive = activeSlug ? crew.slug === activeSlug : true;
        const style = {
          '--crew-accent': crew.accent,
          '--crew-secondary': crew.secondary,
          '--delay': `${0.24 + index * 0.16}s`,
          left: `${crew.map.x}%`,
          top: `${crew.map.y}%`,
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
