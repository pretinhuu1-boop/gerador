// Module-level singleton that owns the active GPS run.
//
// Lifecycle: intentionally NOT tied to a React component. The tracker keeps
// running even if the user navigates away from MapStage (e.g. tabs into the
// QG menu) so a background tab doesn't kill an in-progress street run. The
// only ways to stop it are stop(), reset(), or pause(). React consumers
// subscribe via useRunTracker and the subscription cleans up on unmount.
//
// Privacy: collected GPS coordinates live ONLY in the user's own browser via
// activeRunStorage. They are never sent over the network and never read by
// foreign scripts (this app has no third-party JS). Cleared on stop / reset.
import type { LngLat, SpSpotMapFeature, SpZoneId, SpZoneMapFeature } from '../data/spLiveMap';
import { SP_SPOT_MAP_FEATURES, getZoneById, getZoneByCrewSlug } from '../data/spLiveMap';
import { haversineMeters, pointInPolygon } from '../data/geo';
import {
  clearActiveRun,
  getActiveRun,
  saveActiveRun,
  type PersistedActiveRun,
} from './activeRunStorage';

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

const PERSIST_THROTTLE_MS = 4000;

const toPersisted = (snap: RunSnapshot): PersistedActiveRun | null => {
  if (snap.state !== 'tracking' && snap.state !== 'paused') return null;
  return {
    startedAt: snap.startedAt,
    elapsedMs: snap.elapsedMs,
    state: snap.state,
    points: snap.points.map((p) => ({
      lng: p.lng,
      lat: p.lat,
      t: p.t,
      accuracy: p.accuracy,
      isResumeAnchor: p.isResumeAnchor,
    })),
    touchedSpotIds: snap.touchedSpotIds,
    totalMeters: snap.totalMeters,
    metersInTerritory: snap.metersInTerritory,
    crewSlug: snap.crewSlug,
    homeZoneId: snap.homeZoneId,
  };
};

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
  private lastPersistAt = 0;

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
    // Clear any stale denied flag so a retry after the user grants permission
    // actually starts.
    this.snapshot.permissionDenied = false;
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
    this.snapshot = { ...this.snapshot, state: 'paused' };
    this.persistNow();
    this.emit();
  }

  resume(): void {
    if (this.snapshot.state !== 'paused') return;
    this.lastTickAt = Date.now();
    const points = this.snapshot.points;
    const nextPoints =
      points.length > 0
        ? [...points.slice(0, -1), { ...points[points.length - 1], isResumeAnchor: true }]
        : points;
    this.snapshot = { ...this.snapshot, state: 'tracking', points: nextPoints };
    this.startWatch();
    this.acquireWakeLock();
    this.persistNow();
    this.emit();
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
    clearActiveRun();
    this.lastPersistAt = 0;
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
    clearActiveRun();
    this.lastPersistAt = 0;
    this.emit();
  }

  // Hydrates the tracker from localStorage. Caller (MapStage) invokes once on
  // mount so a refreshed browser can pick up an in-progress run. Returns the
  // snapshot for the caller to inspect (resume vs discard prompt).
  hydrateFromStorage(): RunSnapshot {
    if (this.snapshot.state !== 'idle') return this.snapshot;
    const stored = getActiveRun();
    if (!stored) return this.snapshot;
    const homeZone = stored.homeZoneId ? getZoneById(stored.homeZoneId as SpZoneId) : undefined;
    this.homeZone = homeZone;
    this.snapshot = {
      state: stored.state,
      startedAt: stored.startedAt,
      elapsedMs: stored.elapsedMs,
      totalMeters: stored.totalMeters,
      metersInTerritory: stored.metersInTerritory,
      points: stored.points.map((p) => ({
        lng: p.lng,
        lat: p.lat,
        t: p.t,
        accuracy: p.accuracy,
        isResumeAnchor: p.isResumeAnchor,
      })),
      touchedSpotIds: [...stored.touchedSpotIds],
      crewSlug: stored.crewSlug,
      homeZoneId: stored.homeZoneId as SpZoneId | undefined,
      closedLoop: false,
      permissionDenied: false,
    };
    // Restored runs come back paused so the user explicitly confirms resume.
    if (this.snapshot.state === 'tracking') {
      this.snapshot.state = 'paused';
    }
    this.emit();
    return this.snapshot;
  }

  // Test seam — injects a synthetic position. Production code MUST go through
  // watchPosition; this is exposed only for unit tests that exercise the
  // accumulators without spinning up a real Geolocation API.
  __ingestPositionForTests(point: TrackedPoint): void {
    this.ingestPosition(point);
  }

  private ingestPosition(point: TrackedPoint): void {
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
    this.persistThrottled();
  }

  private persistThrottled(): void {
    const now = Date.now();
    if (now - this.lastPersistAt < PERSIST_THROTTLE_MS) return;
    this.lastPersistAt = now;
    const persisted = toPersisted(this.snapshot);
    if (persisted) saveActiveRun(persisted);
  }

  private persistNow(): void {
    const persisted = toPersisted(this.snapshot);
    if (persisted) saveActiveRun(persisted);
    else clearActiveRun();
    this.lastPersistAt = Date.now();
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
