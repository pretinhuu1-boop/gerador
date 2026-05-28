import type { LngLat } from './spLiveMap';

export const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number): number => (deg * Math.PI) / 180;

// Great-circle distance between two coordinates in meters.
export const haversineMeters = (a: LngLat, b: LngLat): number => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sa = Math.sin(dLat / 2);
  const sn = Math.sin(dLng / 2);
  const h = sa * sa + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sn * sn;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
};

// Ray-casting point-in-polygon. Polygons are arrays of LngLat. Algorithm uses
// horizontal ray from the test point going east; counts crossings of polygon
// edges. Odd = inside, even = outside. Robust for the polygons we ship (closed,
// simple). Last point can equal first; we don't require it.
export const pointInPolygon = (point: LngLat, polygon: LngLat[]): boolean => {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    const intersect =
      pi.lat > point.lat !== pj.lat > point.lat &&
      point.lng < ((pj.lng - pi.lng) * (point.lat - pi.lat)) / (pj.lat - pi.lat) + pi.lng;
    if (intersect) inside = !inside;
  }
  return inside;
};

export interface SpotLike {
  id: string;
  coordinate: LngLat;
}

export const getSpotsWithinRadius = <T extends SpotLike>(
  origin: LngLat,
  radiusMeters: number,
  spots: T[],
): T[] => spots.filter((spot) => haversineMeters(origin, spot.coordinate) <= radiusMeters);
