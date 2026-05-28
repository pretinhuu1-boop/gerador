import { beforeEach, describe, expect, it } from 'vitest';
import { __resetRunTrackerForTests, runTracker } from './runTracker';
import { SP_SPOT_MAP_FEATURES, getZoneByCrewSlug } from '../data/spLiveMap';

const DOWNTOWN = 'downtown-rush';

beforeEach(() => {
  __resetRunTrackerForTests();
  // happy-dom defines navigator.geolocation as a getter-only property, so
  // direct assignment throws. Use defineProperty to swap in a stub that
  // satisfies the start() guard; synthetic positions still go through the
  // test seam, not the Geolocation API itself.
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      watchPosition: () => 0,
      clearWatch: () => undefined,
    },
  });
});

describe('runTracker state machine', () => {
  it('starts in idle', () => {
    expect(runTracker.getSnapshot().state).toBe('idle');
  });

  it('transitions idle -> tracking on start', () => {
    expect(runTracker.start(DOWNTOWN)).toBe(true);
    expect(runTracker.getSnapshot().state).toBe('tracking');
  });

  it('refuses double start', () => {
    runTracker.start(DOWNTOWN);
    expect(runTracker.start(DOWNTOWN)).toBe(false);
  });

  it('pauses and resumes', () => {
    runTracker.start(DOWNTOWN);
    runTracker.pause();
    expect(runTracker.getSnapshot().state).toBe('paused');
    runTracker.resume();
    expect(runTracker.getSnapshot().state).toBe('tracking');
  });

  it('stops with ended state', () => {
    runTracker.start(DOWNTOWN);
    const snap = runTracker.stop();
    expect(snap.state).toBe('ended');
  });
});

describe('runTracker accumulators', () => {
  const vale = SP_SPOT_MAP_FEATURES.find((s) => s.id === 'spot-vale')!;
  const downtownZone = getZoneByCrewSlug(DOWNTOWN)!;

  it('drops noisy points with poor accuracy', () => {
    runTracker.start(DOWNTOWN);
    runTracker.__ingestPositionForTests({ ...vale.coordinate, accuracy: 80, t: 0 });
    expect(runTracker.getSnapshot().points).toHaveLength(0);
  });

  it('drops sub-step points to filter stationary noise', () => {
    runTracker.start(DOWNTOWN);
    runTracker.__ingestPositionForTests({ ...vale.coordinate, accuracy: 8, t: 0 });
    runTracker.__ingestPositionForTests({
      lng: vale.coordinate.lng + 0.000001,
      lat: vale.coordinate.lat,
      accuracy: 8,
      t: 1000,
    });
    expect(runTracker.getSnapshot().points).toHaveLength(1);
  });

  it('accumulates total distance across valid steps', () => {
    runTracker.start(DOWNTOWN);
    runTracker.__ingestPositionForTests({ ...vale.coordinate, accuracy: 8, t: 0 });
    runTracker.__ingestPositionForTests({
      lng: vale.coordinate.lng + 0.001,
      lat: vale.coordinate.lat,
      accuracy: 8,
      t: 5000,
    });
    runTracker.__ingestPositionForTests({
      lng: vale.coordinate.lng + 0.002,
      lat: vale.coordinate.lat,
      accuracy: 8,
      t: 10000,
    });
    expect(runTracker.getSnapshot().totalMeters).toBeGreaterThan(150);
  });

  it('counts territory meters when midpoint is inside home zone polygon', () => {
    runTracker.start(DOWNTOWN);
    // Two points clearly inside the centro polygon
    runTracker.__ingestPositionForTests({ lng: -46.638, lat: -23.545, accuracy: 8, t: 0 });
    runTracker.__ingestPositionForTests({ lng: -46.637, lat: -23.546, accuracy: 8, t: 5000 });
    expect(runTracker.getSnapshot().metersInTerritory).toBeGreaterThan(0);
    expect(downtownZone.id).toBe('centro');
  });

  it('marks spots when within proximity', () => {
    runTracker.start(DOWNTOWN);
    runTracker.__ingestPositionForTests({ ...vale.coordinate, accuracy: 8, t: 0 });
    expect(runTracker.getSnapshot().touchedSpotIds).toContain('spot-vale');
  });

  it('detects closed loop when start ≈ end', () => {
    runTracker.start(DOWNTOWN);
    runTracker.__ingestPositionForTests({ ...vale.coordinate, accuracy: 8, t: 0 });
    runTracker.__ingestPositionForTests({
      lng: vale.coordinate.lng + 0.001,
      lat: vale.coordinate.lat,
      accuracy: 8,
      t: 5000,
    });
    // Returning to start (offset < 80m)
    runTracker.__ingestPositionForTests({
      lng: vale.coordinate.lng + 0.0001,
      lat: vale.coordinate.lat,
      accuracy: 8,
      t: 10000,
    });
    const snap = runTracker.stop();
    expect(snap.closedLoop).toBe(true);
  });

  it('does not mark closed loop for open routes', () => {
    runTracker.start(DOWNTOWN);
    runTracker.__ingestPositionForTests({ ...vale.coordinate, accuracy: 8, t: 0 });
    runTracker.__ingestPositionForTests({
      lng: vale.coordinate.lng + 0.01,
      lat: vale.coordinate.lat,
      accuracy: 8,
      t: 5000,
    });
    const snap = runTracker.stop();
    expect(snap.closedLoop).toBe(false);
  });
});
