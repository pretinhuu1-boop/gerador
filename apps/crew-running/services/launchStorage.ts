// localStorage keys live in STORAGE_KEYS. Aliases keep older builds compatible:
// - gameIntroSeen mirrors title+citySignal (older builds wrote one combined key).
// - onboardingComplete mirrors guidedSetupComplete (renamed in Wave 1 refactor).
// - LEGACY_BOOT_KEY 'crewBootSeen' is the pre-state-machine boot flag.
// Read paths union both old and new keys; write paths set both so a downgrade
// would still see the player's progress.
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
