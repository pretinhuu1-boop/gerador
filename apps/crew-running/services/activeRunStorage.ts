// Persistence for an in-progress run so a crashed/reloaded browser can resume.
//
// PRIVACY NOTE: this payload contains GPS coordinates for the live run.
// They live ONLY in the user's own browser localStorage — never sent over the
// network, never read by third-party scripts (no foreign code is loaded into
// this app). Cleared the moment the user finishes or discards a run.
import { canUseStorage } from './storageBase';

const KEY = 'crewActiveRun';

export interface PersistedActiveRun {
  startedAt: number;
  elapsedMs: number;
  state: 'tracking' | 'paused';
  points: Array<{ lng: number; lat: number; t: number; accuracy: number; isResumeAnchor?: boolean }>;
  touchedSpotIds: string[];
  totalMeters: number;
  metersInTerritory: number;
  crewSlug?: string;
  homeZoneId?: string;
}

const isShape = (value: unknown): value is PersistedActiveRun => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.startedAt === 'number' &&
    typeof obj.elapsedMs === 'number' &&
    (obj.state === 'tracking' || obj.state === 'paused') &&
    Array.isArray(obj.points) &&
    Array.isArray(obj.touchedSpotIds) &&
    typeof obj.totalMeters === 'number' &&
    typeof obj.metersInTerritory === 'number'
  );
};

export const getActiveRun = (): PersistedActiveRun | null => {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isShape(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveActiveRun = (run: PersistedActiveRun): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(run));
  } catch {
    // ignored
  }
};

export const clearActiveRun = (): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignored
  }
};
