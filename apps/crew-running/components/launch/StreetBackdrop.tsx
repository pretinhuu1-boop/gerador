import React from 'react';
import { getCrewBySlug } from '../../data/crews';

type StreetBackdropVariant = 'boot' | 'city' | 'hq' | 'saved';

type Props = {
  variant: StreetBackdropVariant;
  crewSlug?: string;
};

const BACKDROP_BY_VARIANT: Record<StreetBackdropVariant, string> = {
  boot: '/backgrounds/boot-underpass-2d.jpg',
  city: '/backgrounds/city-signal-map-2d.jpg',
  hq: '/backgrounds/hq-collage-2d.jpg',
  saved: '/backgrounds/city-signal-map-2d.jpg',
};

export const StreetBackdrop: React.FC<Props> = ({ variant, crewSlug }) => {
  const crew = getCrewBySlug(crewSlug);

  return (
    <div
      className={`street-backdrop street-backdrop--${variant}`}
      style={{
        '--street-bg': `url(${BACKDROP_BY_VARIANT[variant]})`,
        '--crew-accent': crew.accent,
        '--crew-secondary': crew.secondary,
      } as React.CSSProperties}
      aria-hidden
    >
      <span className="street-backdrop__route street-backdrop__route--one" />
      <span className="street-backdrop__route street-backdrop__route--two" />
      <span className="street-backdrop__ping street-backdrop__ping--one" />
      <span className="street-backdrop__ping street-backdrop__ping--two" />
      <span className="street-backdrop__ping street-backdrop__ping--three" />
    </div>
  );
};
