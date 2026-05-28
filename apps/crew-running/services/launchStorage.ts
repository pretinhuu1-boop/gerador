// localStorage keys live in STORAGE_KEYS. Aliases keep older builds compatible:
// - gameIntroSeen mirrors title+citySignal (older builds wrote one combined key).
// - onboardingComplete mirrors guidedSetupComplete (renamed in Wave 1 refactor).
// - LEGACY_BOOT_KEY 'crewBootSeen' is the pre-state-machine boot flag.
// Read paths union both old and new keys; write paths set both so a downgrade
// would still see the player's progress.
import type { RunnerProgress } from '../data/gamification';
import { decayInk, xpToLevel } from '../data/gamification';

export type LaunchProgress = {
  consoleBootSeen: boolean;
  titleSeen: boolean;
  citySignalSeen: boolean;
  mainMenuSeen: boolean;
  onboardingStep: number;
  selectedCrewSlug: string;
  guidedSetupComplete: boolean;
  onboardingComplete: boolean;
  runnerCustomized: boolean;
};

const STORAGE_KEYS = {
  consoleBootSeen: 'crewConsoleBootSeen',
  titleSeen: 'crewTitleSeen',
  citySignalSeen: 'crewCitySignalSeen',
  guidedSetupComplete: 'crewGuidedSetupComplete',
  gameIntroSeen: 'crewGameIntroSeen',
  mainMenuSeen: 'crewMainMenuSeen',
  onboardingStep: 'crewOnboardingStep',
  selectedCrewSlug: 'crewSelectedCrewSlug',
  onboardingComplete: 'crewOnboardingComplete',
  runnerCustomized: 'crewRunnerCustomized',
  runnerProgress: 'crewRunnerProgress',
  mapLayers: 'crewMapLayers',
  activeRun: 'crewActiveRun',
} as const;

const LEGACY_BOOT_KEY = 'crewBootSeen';

const canUseStorage = () => {
  if (typeof window === 'undefined') return false;

  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
};

const readBoolean = (key: string): boolean => {
  if (!canUseStorage()) return false;

  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
};

const writeBoolean = (key: string, value = true): void => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Some browsers block storage in private or restricted contexts.
  }
};

const readString = (key: string): string => {
  if (!canUseStorage()) return '';

  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
};

const writeString = (key: string, value: string): void => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Some browsers block storage in private or restricted contexts.
  }
};

const readNumber = (key: string): number => {
  if (!canUseStorage()) return 0;

  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
};

const readConsoleBootSeen = (): boolean =>
  readBoolean(STORAGE_KEYS.consoleBootSeen) || readBoolean(LEGACY_BOOT_KEY);

const readTitleSeen = (): boolean =>
  readBoolean(STORAGE_KEYS.titleSeen) || readBoolean(STORAGE_KEYS.gameIntroSeen);

const readCitySignalSeen = (): boolean =>
  readBoolean(STORAGE_KEYS.citySignalSeen) || readBoolean(STORAGE_KEYS.gameIntroSeen);

const readGuidedSetupComplete = (): boolean =>
  readBoolean(STORAGE_KEYS.guidedSetupComplete) || readBoolean(STORAGE_KEYS.onboardingComplete);

const writeNumber = (key: string, value: number): void => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, String(Math.max(0, value)));
  } catch {
    // Some browsers block storage in private or restricted contexts.
  }
};

export const getLaunchProgress = (): LaunchProgress => ({
  consoleBootSeen: readConsoleBootSeen(),
  titleSeen: readTitleSeen(),
  citySignalSeen: readCitySignalSeen(),
  mainMenuSeen: readBoolean(STORAGE_KEYS.mainMenuSeen),
  onboardingStep: readNumber(STORAGE_KEYS.onboardingStep),
  selectedCrewSlug: readString(STORAGE_KEYS.selectedCrewSlug),
  guidedSetupComplete: readGuidedSetupComplete(),
  onboardingComplete: readGuidedSetupComplete(),
  runnerCustomized: readBoolean(STORAGE_KEYS.runnerCustomized),
});

export const markConsoleBootSeen = () => {
  writeBoolean(STORAGE_KEYS.consoleBootSeen);
  writeBoolean(LEGACY_BOOT_KEY);
};

export const markTitleSeen = () => writeBoolean(STORAGE_KEYS.titleSeen);

export const markCitySignalSeen = () => {
  writeBoolean(STORAGE_KEYS.citySignalSeen);
  writeBoolean(STORAGE_KEYS.gameIntroSeen);
};

export const markGameIntroSeen = markCitySignalSeen;

export const markMainMenuSeen = () => writeBoolean(STORAGE_KEYS.mainMenuSeen);

export const setOnboardingStep = (step: number) =>
  writeNumber(STORAGE_KEYS.onboardingStep, step);

export const setSelectedCrewSlug = (slug: string) =>
  writeString(STORAGE_KEYS.selectedCrewSlug, slug);

export const markGuidedSetupComplete = () => {
  writeBoolean(STORAGE_KEYS.guidedSetupComplete);
  writeBoolean(STORAGE_KEYS.onboardingComplete);
  writeNumber(STORAGE_KEYS.onboardingStep, 0);
};

export const markOnboardingComplete = markGuidedSetupComplete;

export const markRunnerCustomized = () => writeBoolean(STORAGE_KEYS.runnerCustomized);

const DEFAULT_RUNNER_PROGRESS: RunnerProgress = {
  xp: 0,
  level: 1,
  streakWeeks: 0,
  lastRunAt: 0,
  freezesAvailable: 1,
  inkPerZone: {},
  inkUpdatedAt: Date.now(),
  badgeUnlocks: [],
  patchesOwned: [],
  weekKey: '',
  runsThisWeek: 0,
};

const isRunnerProgressShape = (value: unknown): value is Partial<RunnerProgress> => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  const numberOrMissing = (key: string) =>
    obj[key] === undefined || typeof obj[key] === 'number';
  return (
    numberOrMissing('xp') &&
    numberOrMissing('level') &&
    numberOrMissing('streakWeeks') &&
    numberOrMissing('lastRunAt') &&
    numberOrMissing('freezesAvailable') &&
    numberOrMissing('inkUpdatedAt') &&
    numberOrMissing('runsThisWeek') &&
    (obj.inkPerZone === undefined || typeof obj.inkPerZone === 'object') &&
    (obj.badgeUnlocks === undefined || Array.isArray(obj.badgeUnlocks)) &&
    (obj.patchesOwned === undefined || Array.isArray(obj.patchesOwned)) &&
    (obj.weekKey === undefined || typeof obj.weekKey === 'string')
  );
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Whitelist-merge: only known fields survive, so an old schema that wrote
// extra fields can't leak forward into runtime memory.
const pickRunnerProgress = (parsed: Partial<RunnerProgress>): RunnerProgress => ({
  ...DEFAULT_RUNNER_PROGRESS,
  xp: parsed.xp ?? DEFAULT_RUNNER_PROGRESS.xp,
  level: parsed.level ?? DEFAULT_RUNNER_PROGRESS.level,
  streakWeeks: parsed.streakWeeks ?? DEFAULT_RUNNER_PROGRESS.streakWeeks,
  lastRunAt: parsed.lastRunAt ?? DEFAULT_RUNNER_PROGRESS.lastRunAt,
  freezesAvailable: parsed.freezesAvailable ?? DEFAULT_RUNNER_PROGRESS.freezesAvailable,
  inkPerZone: parsed.inkPerZone ?? DEFAULT_RUNNER_PROGRESS.inkPerZone,
  inkUpdatedAt: parsed.inkUpdatedAt ?? DEFAULT_RUNNER_PROGRESS.inkUpdatedAt,
  badgeUnlocks: parsed.badgeUnlocks ?? DEFAULT_RUNNER_PROGRESS.badgeUnlocks,
  patchesOwned: parsed.patchesOwned ?? DEFAULT_RUNNER_PROGRESS.patchesOwned,
  weekKey: parsed.weekKey ?? DEFAULT_RUNNER_PROGRESS.weekKey,
  runsThisWeek: parsed.runsThisWeek ?? DEFAULT_RUNNER_PROGRESS.runsThisWeek,
});

export const getRunnerProgress = (): RunnerProgress => {
  if (!canUseStorage()) return DEFAULT_RUNNER_PROGRESS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.runnerProgress);
    if (!raw) return DEFAULT_RUNNER_PROGRESS;
    const parsed = JSON.parse(raw) as unknown;
    if (!isRunnerProgressShape(parsed)) return DEFAULT_RUNNER_PROGRESS;
    const merged: RunnerProgress = pickRunnerProgress(parsed);
    const now = Date.now();
    const daysSince = (now - merged.inkUpdatedAt) / MS_PER_DAY;
    if (daysSince > 0.01) {
      const inkPerZone = { ...merged.inkPerZone };
      for (const key of Object.keys(inkPerZone) as Array<keyof typeof inkPerZone>) {
        const current = inkPerZone[key];
        if (typeof current === 'number') {
          inkPerZone[key] = decayInk(current, daysSince);
        }
      }
      merged.inkPerZone = inkPerZone;
      merged.inkUpdatedAt = now;
    }
    merged.level = xpToLevel(merged.xp);
    return merged;
  } catch {
    return DEFAULT_RUNNER_PROGRESS;
  }
};

export interface MapLayerPrefs {
  territory: boolean;
  live: boolean;
  missions: boolean;
  history: boolean;
}

const DEFAULT_MAP_LAYERS: MapLayerPrefs = {
  territory: true,
  live: true,
  missions: false,
  history: false,
};

const isMapLayerPrefsShape = (value: unknown): value is Partial<MapLayerPrefs> => {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return (['territory', 'live', 'missions', 'history'] as const).every(
    (key) => obj[key] === undefined || typeof obj[key] === 'boolean',
  );
};

const pickMapLayerPrefs = (parsed: Partial<MapLayerPrefs>): MapLayerPrefs => ({
  territory: parsed.territory ?? DEFAULT_MAP_LAYERS.territory,
  live: parsed.live ?? DEFAULT_MAP_LAYERS.live,
  missions: parsed.missions ?? DEFAULT_MAP_LAYERS.missions,
  history: parsed.history ?? DEFAULT_MAP_LAYERS.history,
});

export const getMapLayerPrefs = (): MapLayerPrefs => {
  if (!canUseStorage()) return DEFAULT_MAP_LAYERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.mapLayers);
    if (!raw) return DEFAULT_MAP_LAYERS;
    const parsed = JSON.parse(raw) as unknown;
    if (!isMapLayerPrefsShape(parsed)) return DEFAULT_MAP_LAYERS;
    return pickMapLayerPrefs(parsed);
  } catch {
    return DEFAULT_MAP_LAYERS;
  }
};

export const saveMapLayerPrefs = (prefs: MapLayerPrefs): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.mapLayers, JSON.stringify(prefs));
  } catch {
    // ignored
  }
};

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

const isActiveRunShape = (value: unknown): value is PersistedActiveRun => {
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
    const raw = window.localStorage.getItem(STORAGE_KEYS.activeRun);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isActiveRunShape(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const saveActiveRun = (run: PersistedActiveRun): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.activeRun, JSON.stringify(run));
  } catch {
    // ignored
  }
};

export const clearActiveRun = (): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.activeRun);
  } catch {
    // ignored
  }
};

export const saveRunnerProgress = (progress: RunnerProgress): void => {
  if (!canUseStorage()) return;
  try {
    const normalized: RunnerProgress = { ...progress, level: xpToLevel(progress.xp) };
    window.localStorage.setItem(STORAGE_KEYS.runnerProgress, JSON.stringify(normalized));
  } catch {
    // Some browsers block storage in private or restricted contexts.
  }
};

export const resetLaunchProgress = () => {
  if (!canUseStorage()) return;

  for (const key of Object.values(STORAGE_KEYS)) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
  }

  try {
    window.localStorage.removeItem(LEGACY_BOOT_KEY);
  } catch {
    // Ignore storage failures.
  }
};
