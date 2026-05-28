import { describe, expect, it } from 'vitest';
import {
  SP_MAP_BOUNDS,
  SP_SPOT_MAP_FEATURES,
  SP_ZONE_MAP_FEATURES,
  getSpotById,
  getSpotsByZone,
  getZoneByCrewSlug,
  getZoneById,
  polygonToPath,
  polylineToPath,
  projectLngLat,
} from './spLiveMap';

const VIEW = { width: 100, height: 100, padding: 0 };

describe('projectLngLat', () => {
  it('projects SW bound to bottom-left corner', () => {
    const { x, y } = projectLngLat(
      { lng: SP_MAP_BOUNDS.minLng, lat: SP_MAP_BOUNDS.minLat },
      VIEW,
    );
    expect(x).toBeCloseTo(0, 3);
    expect(y).toBeCloseTo(100, 3);
  });

  it('projects NE bound to top-right corner', () => {
    const { x, y } = projectLngLat(
      { lng: SP_MAP_BOUNDS.maxLng, lat: SP_MAP_BOUNDS.maxLat },
      VIEW,
    );
    expect(x).toBeCloseTo(100, 3);
    expect(y).toBeCloseTo(0, 3);
  });

  it('keeps all SP zone polygon points inside the view box', () => {
    for (const zone of SP_ZONE_MAP_FEATURES) {
      for (const point of zone.polygon) {
        const { x, y } = projectLngLat(point, VIEW);
        expect(x).toBeGreaterThanOrEqual(-0.01);
        expect(x).toBeLessThanOrEqual(100.01);
        expect(y).toBeGreaterThanOrEqual(-0.01);
        expect(y).toBeLessThanOrEqual(100.01);
      }
    }
  });

  it('honors padding by shrinking the usable area', () => {
    const padded = projectLngLat(
      { lng: SP_MAP_BOUNDS.minLng, lat: SP_MAP_BOUNDS.minLat },
      { width: 100, height: 100, padding: 10 },
    );
    expect(padded.x).toBeCloseTo(10, 3);
    expect(padded.y).toBeCloseTo(90, 3);
  });
});

describe('polygon / polyline to path', () => {
  it('emits an empty string for empty input', () => {
    expect(polygonToPath([], VIEW)).toBe('');
    expect(polylineToPath([], VIEW)).toBe('');
  });

  it('closes polygons with Z', () => {
    const path = polygonToPath(SP_ZONE_MAP_FEATURES[0].polygon, VIEW);
    expect(path.startsWith('M')).toBe(true);
    expect(path.endsWith(' Z')).toBe(true);
  });

  it('does not close polylines', () => {
    const path = polylineToPath(
      [
        { lng: SP_MAP_BOUNDS.minLng, lat: SP_MAP_BOUNDS.minLat },
        { lng: SP_MAP_BOUNDS.maxLng, lat: SP_MAP_BOUNDS.maxLat },
      ],
      VIEW,
    );
    expect(path).toMatch(/^M\d/);
    expect(path).not.toMatch(/Z$/);
  });
});

describe('zone + spot getters', () => {
  it('finds zone by crew slug', () => {
    expect(getZoneByCrewSlug('downtown-rush')?.id).toBe('centro');
    expect(getZoneByCrewSlug('not-a-crew')).toBeUndefined();
  });

  it('finds zone by id', () => {
    expect(getZoneById('leste')?.crewSlug).toBe('east-burners');
    expect(getZoneById(undefined)).toBeUndefined();
  });

  it('lists spots for a zone, never crossing zones', () => {
    for (const zone of SP_ZONE_MAP_FEATURES) {
      const spots = getSpotsByZone(zone.id);
      for (const spot of spots) {
        expect(spot.zoneId).toBe(zone.id);
      }
    }
  });

  it('finds spot by id', () => {
    expect(getSpotById('spot-vale')?.zoneId).toBe('centro');
    expect(getSpotById(undefined)).toBeUndefined();
    expect(getSpotById('ghost-spot')).toBeUndefined();
  });

  it('ships 11 SP spots covering all 5 zones', () => {
    expect(SP_SPOT_MAP_FEATURES).toHaveLength(11);
    const zonesCovered = new Set(SP_SPOT_MAP_FEATURES.map((s) => s.zoneId));
    expect(zonesCovered.size).toBe(5);
  });
});
