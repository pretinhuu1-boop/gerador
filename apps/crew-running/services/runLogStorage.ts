import { canUseStorage } from './storageBase';
import type { LngLat } from '../data/spLiveMap';

const KEY = 'crewRunLogs';
const MAX_LOGS = 50;

export interface LocalRunLog {
  id: string;
  crewSlug: string;
  zoneId?: string;
  startedAt: string;
  finishedAt: string;
  totalKm: number;
  totalMeters: number;
  elapsedMs: number;
  nightRun: boolean;
  route: LngLat[];
  touchedSpots: string[];
  weekKey: string;
  synced: boolean;
}

export const getRunLogs = (): LocalRunLog[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

export const saveRunLog = (log: LocalRunLog): void => {
  if (!canUseStorage()) return;
  const logs = getRunLogs();
  logs.push(log);
  if (logs.length > MAX_LOGS) {
    const syncedIdx = logs.findIndex((l) => l.synced);
    if (syncedIdx >= 0) logs.splice(syncedIdx, 1);
    else logs.shift();
  }
  try { window.localStorage.setItem(KEY, JSON.stringify(logs)); } catch { /* ignored */ }
};

export const markRunLogSynced = (id: string): void => {
  if (!canUseStorage()) return;
  const logs = getRunLogs();
  const log = logs.find((l) => l.id === id);
  if (log) log.synced = true;
  try { window.localStorage.setItem(KEY, JSON.stringify(logs)); } catch { /* ignored */ }
};

export const getUnsyncedRunLogs = (): LocalRunLog[] => getRunLogs().filter((l) => !l.synced);
