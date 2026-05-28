export type SpZoneId = 'centro' | 'norte' | 'sul' | 'leste' | 'oeste';

export interface LngLat {
  lng: number;
  lat: number;
}

export interface SpZoneMapFeature {
  id: SpZoneId;
  label: string;
  crewSlug: string;
  color: string;
  center: LngLat;
  polygon: LngLat[];
}

export interface SpSpotMapFeature {
  id: string;
  zoneId: SpZoneId;
  name: string;
  active: boolean;
  coordinate: LngLat;
}

export const SP_CENTER: LngLat = { lng: -46.6333, lat: -23.5505 };

export const SP_ZONE_MAP_FEATURES: SpZoneMapFeature[] = [
  {
    id: 'centro',
    label: 'Centro',
    crewSlug: 'downtown-rush',
    color: '#C9302C',
    center: { lng: -46.6388, lat: -23.5452 },
    polygon: [
      { lng: -46.681, lat: -23.571 },
      { lng: -46.596, lat: -23.571 },
      { lng: -46.592, lat: -23.518 },
      { lng: -46.684, lat: -23.518 },
      { lng: -46.681, lat: -23.571 },
    ],
  },
  {
    id: 'norte',
    label: 'Norte',
    crewSlug: 'north-breakers',
    color: '#2EC4B6',
    center: { lng: -46.635, lat: -23.468 },
    polygon: [
      { lng: -46.741, lat: -23.518 },
      { lng: -46.531, lat: -23.518 },
      { lng: -46.532, lat: -23.392 },
      { lng: -46.665, lat: -23.374 },
      { lng: -46.755, lat: -23.43 },
      { lng: -46.741, lat: -23.518 },
    ],
  },
  {
    id: 'sul',
    label: 'Sul',
    crewSlug: 'south-striders',
    color: '#4DA3B5',
    center: { lng: -46.664, lat: -23.64 },
    polygon: [
      { lng: -46.768, lat: -23.573 },
      { lng: -46.551, lat: -23.573 },
      { lng: -46.536, lat: -23.725 },
      { lng: -46.678, lat: -23.79 },
      { lng: -46.795, lat: -23.68 },
      { lng: -46.768, lat: -23.573 },
    ],
  },
  {
    id: 'leste',
    label: 'Leste',
    crewSlug: 'east-burners',
    color: '#E85D2C',
    center: { lng: -46.53, lat: -23.552 },
    polygon: [
      { lng: -46.596, lat: -23.572 },
      { lng: -46.41, lat: -23.598 },
      { lng: -46.382, lat: -23.49 },
      { lng: -46.532, lat: -23.518 },
      { lng: -46.596, lat: -23.572 },
    ],
  },
  {
    id: 'oeste',
    label: 'Oeste',
    crewSlug: 'west-flow',
    color: '#F4A52C',
    center: { lng: -46.72, lat: -23.56 },
    polygon: [
      { lng: -46.851, lat: -23.6 },
      { lng: -46.681, lat: -23.571 },
      { lng: -46.684, lat: -23.518 },
      { lng: -46.755, lat: -23.43 },
      { lng: -46.856, lat: -23.496 },
      { lng: -46.851, lat: -23.6 },
    ],
  },
];

export const SP_SPOT_MAP_FEATURES: SpSpotMapFeature[] = [
  { id: 'spot-vale', zoneId: 'centro', name: 'Vale do Anhangabau', active: true, coordinate: { lng: -46.6388, lat: -23.5456 } },
  { id: 'spot-republica', zoneId: 'centro', name: 'Republica', active: true, coordinate: { lng: -46.6425, lat: -23.5436 } },
  { id: 'spot-luz', zoneId: 'centro', name: 'Parque da Luz', active: false, coordinate: { lng: -46.6334, lat: -23.5344 } },
  { id: 'spot-cantareira', zoneId: 'norte', name: 'Pico Cantareira', active: true, coordinate: { lng: -46.6338, lat: -23.4352 } },
  { id: 'spot-santana', zoneId: 'norte', name: 'Parque Santana', active: true, coordinate: { lng: -46.6239, lat: -23.5026 } },
  { id: 'spot-ibirapuera', zoneId: 'sul', name: 'Ibirapuera', active: true, coordinate: { lng: -46.6575, lat: -23.5874 } },
  { id: 'spot-povo', zoneId: 'sul', name: 'Parque do Povo', active: true, coordinate: { lng: -46.6887, lat: -23.5896 } },
  { id: 'spot-aclimacao', zoneId: 'leste', name: 'Aclimacao', active: true, coordinate: { lng: -46.6292, lat: -23.5712 } },
  { id: 'spot-tatuape', zoneId: 'leste', name: 'Tatuape Loop', active: true, coordinate: { lng: -46.5757, lat: -23.5408 } },
  { id: 'spot-villalobos', zoneId: 'oeste', name: 'Villa-Lobos', active: true, coordinate: { lng: -46.7254, lat: -23.5468 } },
  { id: 'spot-ponte', zoneId: 'oeste', name: 'Ponte Estaiada', active: false, coordinate: { lng: -46.6997, lat: -23.6092 } },
];

export const SP_SIGNAL_ROUTE: LngLat[] = [
  { lng: -46.6468, lat: -23.5484 },
  { lng: -46.6448, lat: -23.5465 },
  { lng: -46.6423, lat: -23.5437 },
  { lng: -46.6388, lat: -23.5449 },
  { lng: -46.6374, lat: -23.5471 },
  { lng: -46.6355, lat: -23.5502 },
  { lng: -46.6382, lat: -23.5526 },
  { lng: -46.6427, lat: -23.5521 },
  { lng: -46.6461, lat: -23.5502 },
];

export const getZoneByCrewSlug = (crewSlug?: string): SpZoneMapFeature | undefined =>
  SP_ZONE_MAP_FEATURES.find((zone) => zone.crewSlug === crewSlug);
