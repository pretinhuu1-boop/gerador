import React from 'react';
import type { MapZoom, ProjectionOpts, SpZoneId } from '../../../data/spLiveMap';
import { SpotLayer } from '../SpotLayer';

// Phase B wrapper around the existing SpotLayer. Same reasoning as
// ZonesLayer — re-export under layers/ for the shell, inline later.
type Props = {
  projection: ProjectionOpts;
  zoom: MapZoom;
  activeZoneId?: SpZoneId;
  activeSpotId?: string;
  onSelectSpot?: (spotId: string) => void;
};

export const SpotsLayer: React.FC<Props> = (props) => <SpotLayer {...props} />;
