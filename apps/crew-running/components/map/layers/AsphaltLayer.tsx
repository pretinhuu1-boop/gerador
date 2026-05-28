import React from 'react';

// Painted asphalt + grain. Pure background, no a11y role. Reuses the
// same backdrop the StreetBackdrop legacy component pointed at so the
// art direction stays continuous with the rest of the launch surfaces.
type Props = {
  src?: string;
};

const DEFAULT_SRC = '/backgrounds/city-signal-map-2d.jpg';

export const AsphaltLayer: React.FC<Props> = ({ src = DEFAULT_SRC }) => (
  <div
    className="mapa-cidade__asphalt"
    role="presentation"
    style={{ backgroundImage: `url(${src})` }}
  />
);
