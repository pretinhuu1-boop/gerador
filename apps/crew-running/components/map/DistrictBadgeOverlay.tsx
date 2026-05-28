// components/map/DistrictBadgeOverlay.tsx
import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import type { LngLat } from '../../data/spLiveMap';

export interface ConqueredDistrict {
  id: string;
  name: string;
  crewSlug: string;
  crewBadge: string;
  centroid: LngLat;
}

interface Props {
  districts: ConqueredDistrict[];
}

export const DistrictBadgeOverlay: React.FC<Props> = ({ districts }) => (
  <>
    {districts.map((d) => (
      <Marker key={d.id} longitude={d.centroid.lng} latitude={d.centroid.lat} anchor="center">
        <div className="district-badge-overlay" aria-label={`${d.name} — conquistado`}>
          <img src={d.crewBadge} alt="" aria-hidden className="district-badge-overlay__img" />
        </div>
      </Marker>
    ))}
  </>
);

