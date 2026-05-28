// Persistence for map layer visibility toggles. Pure UI preference — no PII.
import { canUseStorage } from './storageBase';

const KEY = 'crewMapLayers';

export interface MapLayerPrefs {
  territory: boolean;
  live: boolean;
  missions: boolean;
  history: boolean;
}

const DEFAULT: MapLayerPrefs = {
  territory: true,
  live: true,
  missions: false,
  history: false,
};

const isShape = (value: unknown): value is Partial<MapLayerPrefs> => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (['territory', 'live', 'missions', 'history'] as const).every(
    (key) => obj[key] === undefined || typeof obj[key] === 'boolean',
  );
};

const pick = (parsed: Partial<MapLayerPrefs>): MapLayerPrefs => ({
  territory: parsed.territory ?? DEFAULT.territory,
  live: parsed.live ?? DEFAULT.live,
  missions: parsed.missions ?? DEFAULT.missions,
  history: parsed.history ?? DEFAULT.history,
});

export const getMapLayerPrefs = (): MapLayerPrefs => {
  if (!canUseStorage()) return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as unknown;
    if (!isShape(parsed)) return DEFAULT;
    return pick(parsed);
  } catch {
    return DEFAULT;
  }
};

export const saveMapLayerPrefs = (prefs: MapLayerPrefs): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // ignored
  }
};
