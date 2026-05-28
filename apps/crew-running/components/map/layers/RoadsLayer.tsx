import React, { useMemo } from 'react';
import {
  SP_ROADS_POLYLINES,
  SP_SIGNAL_ROUTE,
  polylineToPath,
  type ProjectionOpts,
} from '../../../data/spLiveMap';

type Props = {
  projection: ProjectionOpts;
};

export const RoadsLayer: React.FC<Props> = ({ projection }) => {
  const roads = useMemo(
    () => SP_ROADS_POLYLINES.map((line) => polylineToPath(line, projection)),
    [projection],
  );
  const signal = useMemo(
    () => polylineToPath(SP_SIGNAL_ROUTE, projection),
    [projection],
  );

  return (
    <g className="mapa-cidade__roads" role="presentation" aria-hidden="true">
      {roads.map((d, idx) => (
        <path key={idx} d={d} className="mapa-cidade__road" />
      ))}
      <path d={signal} className="mapa-cidade__signal" />
    </g>
  );
};
