import type { LngLat, SpSpotMapFeature, SpZoneId, SpZoneMapFeature } from '../data/spLiveMap';
import { SP_SPOT_MAP_FEATURES, SP_ZONE_MAP_FEATURES, getZoneByCrewSlug } from '../data/spLiveMap';
import { haversineMeters, pointInPolygon } from '../data/geo';

export type RunState = 'idle' | 'tracking' | 'paused' | 'ended';

export interface TrackedPoint extends LngLat {
  t: number; // wall-clock ms
  accuracy: number;
  isResumeAnchor?: boolean;
}

export interface RunSnapshot {
  state: RunState;
  startedAt: number;
  elapsedMs: number;
  totalMeters: number;
  metersInTerritory: number;
  points: TrackedPoint[];
  touchedSpotIds: string[];
  crewSlug?: string;
  homeZoneId?: SpZoneId;
  closedLoop: boolean;
  permissionDenied: boolean;
}

type Listener = (snap: RunSnapshot) => void;

const POSITION_ACCURACY_MAX_M = 30;
const POSITION_MIN_STEP_M = 5;
const CLOSED_LOOP_THRESHOLD_M = 80;
const SPOT_PROXIMITY_M = 50;

interface WakeLockSentinelLike {
  release: () => Promise<void> | void;
}

interface GeolocationNavigator {
  geolocation?: Geolocation;
  wakeLock?: { request: (kind: 'screen') => Promise<WakeLockSentinelLike> };
}

const createInitialSnapshot = (): RunSnapshot => ({
  state: 'idle',
  startedAt: 0,
  elapsedMs: 0,
  totalMeters: 0,
  metersInTerritory: 0,
  points: [],
  touchedSpotIds: [],
  closedLoop: false,
  permissionDenied: false,
});

class RunTracker {
  private snapshot: RunSnapshot = createInitialSnapshot();
  private listeners = new Set<Listener>();
  private watchId: number | null = null;
  private wakeLock: WakeLockSentinelLike | null = null;
  private tickHandle: ReturnType<typeof setInterval> | null = null;
  private lastTickAt = 0;
  private homeZone: SpZoneMapFeature | undefined;
  private spotsCache: SpSpotMapFeature[] = SP_SPOT_MAP_FEATURES;
  private visibilityHandler = () => this.onVisibilityChange();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): RunSnapshot {
    return this.snapshot;
  }

  start(crewSlug?: string): boolean {
    if (this.snapshot.state === 'tracking' || this.snapshot.state === 'paused') return false;
    const nav = typeof navigator !== 'undefined' ? (navigator as GeolocationNavigator) : undefined;
    if (!nav?.geolocation) {
      this.update({ permissionDenied: true });
      return false;
    }
    this.homeZone = getZoneByCrewSlug(crewSlug);
    this.snapshot = {
      ...createInitialSnapshot(),
      state: 'tracking',
      startedAt: Date.now(),
      crewSlug,
      homeZoneId: this.homeZone?.id,
    };
    this.startWatch();
    this.startTick();
    this.acquireWakeLock();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
    this.emit();
    return true;
  }

  pause(): void {
    if (this.snapshot.state !== 'tracking') return;
    this.stopWatch();
    this.releaseWakeLock();
    this.update({ state: 'paused' });
  }

  resume(): void {
    if (this.snapshot.state !== 'paused') return;
    this.lastTickAt = Date.now();
    this.snapshot.points = this.snapshot.points.length
      ? [...this.snapshot.points.slice(0, -1), { ...this.snapshot.points[this.snapshot.points.length - 1], isResumeAnchor: true }]
      : this.snapshot.points;
    this.startWatch();
    this.acquireWakeLock();
    this.update({ state: 'tracking' });
  }

  stop(): RunSnapshot {
    if (this.snapshot.state === 'idle' || this.snapshot.state === 'ended') return this.snapshot;
    this.stopWatch();
    this.stopTick();
    this.releaseWakeLock();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    const points = this.snapshot.points;
    const closedLoop =
      points.length >= 2 && haversineMeters(points[0], points[points.length - 1]) < CLOSED_LOOP_THRESHOLD_M;
    this.update({ state: 'ended', closedLoop });
    return this.snapshot;
  }

  reset(): void {
    this.stopWatch();
    this.stopTick();
    this.releaseWakeLock();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    this.snapshot = createInitialSnapshot();
    this.emit();
  }

  // Test seam — injects a synthetic position. Real code uses watchPosition.
  ingestPosition(point: TrackedPoint): void {
    if (this.snapshot.state !== 'tracking') return;
    if (point.accuracy > POSITION_ACCURACY_MAX_M) return;
    const points = this.snapshot.points;
    const last = points[points.length - 1];
    if (last) {
      const step = haversineMeters(last, point);
      if (step < POSITION_MIN_STEP_M) return;
      const segmentMidpoint: LngLat = {
        lng: (last.lng + point.lng) / 2,
        lat: (last.lat + point.lat) / 2,
      };
      const inTerritory = this.homeZone ? pointInPolygon(segmentMidpoint, this.homeZone.polygon) : false;
      this.snapshot.totalMeters += step;
      if (inTerritory) this.snapshot.metersInTerritory += step;
    }
    this.snapshot.points = [...points, point];
    this.checkSpotProximity(point);
    this.emit();
  }

  private startWatch(): void {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as GeolocationNavigator;
    if (!nav.geolocation) return;
    this.watchId = nav.geolocation.watchPosition(
      (pos) => {
        this.ingestPosition({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
          accuracy: pos.coords.accuracy ?? POSITION_ACCURACY_MAX_M + 1,
          t: pos.timestamp,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          this.update({ permissionDenied: true });
          this.stop();
        }
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 12000 },
    );
  }

  private stopWatch(): void {
    if (this.watchId !== null) {
      if (typeof navigator !== 'undefined') {
        const nav = navigator as GeolocationNavigator;
        nav.geolocation?.clearWatch(this.watchId);
      }
      this.watchId = null;
    }
  }

  private startTick(): void {
    this.lastTickAt = Date.now();
    this.tickHandle = setInterval(() => {
      if (this.snapshot.state !== 'tracking') return;
      const now = Date.now();
      this.snapshot.elapsedMs += now - this.lastTickAt;
      this.lastTickAt = now;
      this.emit();
    }, 1000);
  }

  private stopTick(): void {
    if (this.tickHandle !== null) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  private async acquireWakeLock(): Promise<void> {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as GeolocationNavigator;
    if (!nav.wakeLock) return;
    try {
      this.wakeLock = await nav.wakeLock.request('screen');
    } catch {
      // Wake lock requests can fail (visibility / permissions); silently degrade.
    }
  }

  private releaseWakeLock(): void {
    if (this.wakeLock) {
      void Promise.resolve(this.wakeLock.release()).catch(() => undefined);
      this.wakeLock = null;
    }
  }

  private onVisibilityChange(): void {
    if (typeof document === 'undefined') return;
    if (document.visibilityState === 'visible' && this.snapshot.state === 'tracking' && !this.wakeLock) {
      void this.acquireWakeLock();
    }
  }

  private checkSpotProximity(point: TrackedPoint): void {
    const touched = new Set(this.snapshot.touchedSpotIds);
    for (const spot of this.spotsCache) {
      if (!spot.active || touched.has(spot.id)) continue;
      if (haversineMeters(point, spot.coordinate) <= SPOT_PROXIMITY_M) {
        touched.add(spot.id);
      }
    }
    if (touched.size !== this.snapshot.touchedSpotIds.length) {
      this.snapshot.touchedSpotIds = Array.from(touched);
    }
  }

  private update(patch: Partial<RunSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.snapshot);
  }
}

export const runTracker = new RunTracker();

export const __resetRunTrackerForTests = (): void => runTracker.reset();
