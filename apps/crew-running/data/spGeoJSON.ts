import type { FeatureCollection, Feature, Polygon, Point, LineString } from 'geojson';
import {
  SP_ZONE_MAP_FEATURES,
  SP_SPOT_MAP_FEATURES,
  SP_SIGNAL_ROUTE,
  SP_ROADS_POLYLINES,
  type LngLat,
  type SpZoneId,
} from './spLiveMap';

type ZoneProperties = {
  id: SpZoneId;
  label: string;
  crewSlug: string;
  color: string;
  ownership: number;
  active: boolean;
};

type SpotProperties = {
  id: string;
  zoneId: SpZoneId;
  name: string;
  active: boolean;
};

const lngLatToPosition = (p: LngLat): [number, number] => [p.lng, p.lat];

export const toZonesGeoJSON = (
  ownershipByZone?: Partial<Record<SpZoneId, number>>,
  activeZoneId?: SpZoneId,
): FeatureCollection<Polygon, ZoneProperties> => ({
  type: 'FeatureCollection',
  features: SP_ZONE_MAP_FEATURES.map((zone) => ({
    type: 'Feature' as const,
    properties: {
      id: zone.id,
      label: zone.label,
      crewSlug: zone.crewSlug,
      color: zone.color,
      ownership: ownershipByZone?.[zone.id] ?? 0,
      active: zone.id === activeZoneId,
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [zone.polygon.map(lngLatToPosition)],
    },
  })),
});

export const toSpotsGeoJSON = (
  visibleZoneId?: SpZoneId,
): FeatureCollection<Point, SpotProperties> => {
  const spots = visibleZoneId
    ? SP_SPOT_MAP_FEATURES.filter((s) => s.zoneId === visibleZoneId)
    : SP_SPOT_MAP_FEATURES;
  return {
    type: 'FeatureCollection',
    features: spots.map((spot) => ({
      type: 'Feature' as const,
      properties: {
        id: spot.id,
        zoneId: spot.zoneId,
        name: spot.name,
        active: spot.active,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: lngLatToPosition(spot.coordinate),
      },
    })),
  };
};

export const toSignalRouteGeoJSON = (): Feature<LineString> => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: SP_SIGNAL_ROUTE.map(lngLatToPosition),
  },
});

export const toRoadsGeoJSON = (): FeatureCollection<LineString> => ({
  type: 'FeatureCollection',
  features: SP_ROADS_POLYLINES.map((line, i) => ({
    type: 'Feature' as const,
    properties: { index: i },
    geometry: {
      type: 'LineString' as const,
      coordinates: line.map(lngLatToPosition),
    },
  })),
});

export const toTrailGeoJSON = (
  points: LngLat[],
): Feature<LineString> | null => {
  if (points.length < 2) return null;
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: points.map(lngLatToPosition),
    },
  };
};
