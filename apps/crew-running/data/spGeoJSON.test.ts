import { describe, expect, it } from 'vitest';
import {
  toZonesGeoJSON,
  toSpotsGeoJSON,
  toSignalRouteGeoJSON,
  toRoadsGeoJSON,
  toTrailGeoJSON,
} from './spGeoJSON';
import { SP_ZONE_MAP_FEATURES, SP_SPOT_MAP_FEATURES, SP_SIGNAL_ROUTE, SP_ROADS_POLYLINES } from './spLiveMap';

describe('toZonesGeoJSON', () => {
  it('returns a valid FeatureCollection with one Feature per zone', () => {
    const fc = toZonesGeoJSON();
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toHaveLength(SP_ZONE_MAP_FEATURES.length);
    fc.features.forEach((f) => {
      expect(f.type).toBe('Feature');
      expect(f.geometry.type).toBe('Polygon');
    });
  });

  it('uses [lng, lat] coordinate order', () => {
    const fc = toZonesGeoJSON();
    const centro = fc.features.find((f) => f.properties.id === 'centro')!;
    const [lng, lat] = centro.geometry.coordinates[0][0];
    expect(lng).toBeLessThan(0);
    expect(lat).toBeLessThan(0);
    expect(lng).toBeCloseTo(SP_ZONE_MAP_FEATURES[0].polygon[0].lng, 3);
    expect(lat).toBeCloseTo(SP_ZONE_MAP_FEATURES[0].polygon[0].lat, 3);
  });

  it('passes ownership through to feature properties', () => {
    const fc = toZonesGeoJSON({ centro: 0.75, norte: 0.2 });
    const centro = fc.features.find((f) => f.properties.id === 'centro')!;
    const norte = fc.features.find((f) => f.properties.id === 'norte')!;
    const sul = fc.features.find((f) => f.properties.id === 'sul')!;
    expect(centro.properties.ownership).toBe(0.75);
    expect(norte.properties.ownership).toBe(0.2);
    expect(sul.properties.ownership).toBe(0);
  });

  it('marks the active zone', () => {
    const fc = toZonesGeoJSON(undefined, 'leste');
    const leste = fc.features.find((f) => f.properties.id === 'leste')!;
    const centro = fc.features.find((f) => f.properties.id === 'centro')!;
    expect(leste.properties.active).toBe(true);
    expect(centro.properties.active).toBe(false);
  });

  it('includes crew color in properties', () => {
    const fc = toZonesGeoJSON();
    fc.features.forEach((f) => {
      expect(f.properties.color).toMatch(/^#/);
      expect(f.properties.crewSlug).toBeTruthy();
    });
  });
});

describe('toSpotsGeoJSON', () => {
  it('returns all spots when no zone filter', () => {
    const fc = toSpotsGeoJSON();
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toHaveLength(SP_SPOT_MAP_FEATURES.length);
    fc.features.forEach((f) => {
      expect(f.geometry.type).toBe('Point');
      expect(f.geometry.coordinates).toHaveLength(2);
    });
  });

  it('filters by zone when visibleZoneId is provided', () => {
    const fc = toSpotsGeoJSON('centro');
    const centroSpots = SP_SPOT_MAP_FEATURES.filter((s) => s.zoneId === 'centro');
    expect(fc.features).toHaveLength(centroSpots.length);
    fc.features.forEach((f) => {
      expect(f.properties.zoneId).toBe('centro');
    });
  });

  it('preserves active status in properties', () => {
    const fc = toSpotsGeoJSON();
    const luz = fc.features.find((f) => f.properties.id === 'spot-luz')!;
    const vale = fc.features.find((f) => f.properties.id === 'spot-vale')!;
    expect(luz.properties.active).toBe(false);
    expect(vale.properties.active).toBe(true);
  });
});

describe('toSignalRouteGeoJSON', () => {
  it('returns a LineString Feature', () => {
    const f = toSignalRouteGeoJSON();
    expect(f.type).toBe('Feature');
    expect(f.geometry.type).toBe('LineString');
    expect(f.geometry.coordinates).toHaveLength(SP_SIGNAL_ROUTE.length);
  });

  it('uses [lng, lat] coordinate order', () => {
    const f = toSignalRouteGeoJSON();
    const [lng, lat] = f.geometry.coordinates[0];
    expect(lng).toBeCloseTo(SP_SIGNAL_ROUTE[0].lng, 3);
    expect(lat).toBeCloseTo(SP_SIGNAL_ROUTE[0].lat, 3);
  });
});

describe('toRoadsGeoJSON', () => {
  it('returns a FeatureCollection of LineStrings matching SP_ROADS_POLYLINES', () => {
    const fc = toRoadsGeoJSON();
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features).toHaveLength(SP_ROADS_POLYLINES.length);
    fc.features.forEach((f) => {
      expect(f.geometry.type).toBe('LineString');
    });
  });
});

describe('toTrailGeoJSON', () => {
  it('returns null for fewer than 2 points', () => {
    expect(toTrailGeoJSON([])).toBeNull();
    expect(toTrailGeoJSON([{ lng: -46.6, lat: -23.5 }])).toBeNull();
  });

  it('returns a LineString Feature for 2+ points', () => {
    const points = [
      { lng: -46.6, lat: -23.5 },
      { lng: -46.61, lat: -23.51 },
      { lng: -46.62, lat: -23.52 },
    ];
    const f = toTrailGeoJSON(points)!;
    expect(f).not.toBeNull();
    expect(f.type).toBe('Feature');
    expect(f.geometry.type).toBe('LineString');
    expect(f.geometry.coordinates).toHaveLength(3);
    expect(f.geometry.coordinates[0]).toEqual([-46.6, -23.5]);
  });
});
