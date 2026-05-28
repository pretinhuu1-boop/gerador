import type { RunnerProfile } from '../data/runnerProfile';

const API_KEY_STORAGE = 'crew.gemini_api_key';
const CHARACTER_STORAGE = 'crew.saved_character';
const ENV_API_KEY =
  (
    (import.meta as ImportMeta & { env?: { VITE_GEMINI_API_KEY?: string } }).env
      ?.VITE_GEMINI_API_KEY ?? ''
  ).trim();

const canUseStorage = () => {
  if (typeof window === 'undefined') return false;

  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
};

const readItem = (key: string): string | null => {
  if (!canUseStorage()) return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeItem = (key: string, value: string): void => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Some browsers block storage in private or restricted contexts.
  }
};

const removeItem = (key: string): void => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Some browsers block storage in private or restricted contexts.
  }
};

export const getApiKey = (): string => readItem(API_KEY_STORAGE)?.trim() || ENV_API_KEY;
export const setApiKey = (key: string) => writeItem(API_KEY_STORAGE, key.trim());
export const clearApiKey = () => removeItem(API_KEY_STORAGE);

export type SavedCharacter = {
  imageDataUrl: string;
  profile?: RunnerProfile;
  crewSlug?: string;
  runnerTypeId?: string;
  renderStyleId?: 'street-v2';
  styleId?: string;
  slots: {
    top: string;
    bottom: string;
    shoes: string;
    accessory: string;
  };
  savedAt: number;
  backgroundRemoved?: boolean;
};

export const getSavedCharacter = (): SavedCharacter | null => {
  const raw = readItem(CHARACTER_STORAGE);
  if (!raw) return null;
  try { return JSON.parse(raw) as SavedCharacter; } catch { return null; }
};

export const saveCharacter = (c: SavedCharacter) =>
  writeItem(CHARACTER_STORAGE, JSON.stringify(c));

export const clearSavedCharacter = () => removeItem(CHARACTER_STORAGE);
