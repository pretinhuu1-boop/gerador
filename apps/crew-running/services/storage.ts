import type { RunnerProfile } from '../data/runnerProfile';
import {
  buildIdentityEventId,
  isIdentityEventKind,
  type IdentityEvent,
} from '../data/identityEvents';

const API_KEY_STORAGE = 'crew.gemini_api_key';
const CHARACTER_STORAGE = 'crew.saved_character';
const IDENTITY_EVENTS_STORAGE = 'crew.identity_events';
const IDENTITY_EVENTS_MAX = 50;
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

const isPersistedIdentityEvent = (value: unknown): value is IdentityEvent => {
  if (!value || typeof value !== 'object') return false;
  const ev = value as Record<string, unknown>;
  return (
    typeof ev.id === 'string' &&
    typeof ev.timestamp === 'number' &&
    isIdentityEventKind(ev.kind) &&
    typeof ev.payload === 'object' &&
    ev.payload !== null
  );
};

export const getIdentityEvents = (): IdentityEvent[] => {
  const raw = readItem(IDENTITY_EVENTS_STORAGE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPersistedIdentityEvent);
  } catch {
    return [];
  }
};

export const appendIdentityEvent = (
  event: Omit<IdentityEvent, 'id'> & { id?: string },
): IdentityEvent => {
  const id = event.id ?? buildIdentityEventId(event.kind, event.timestamp);
  const next: IdentityEvent = {
    id,
    kind: event.kind,
    payload: event.payload,
    timestamp: event.timestamp,
  };
  const existing = getIdentityEvents();
  if (existing.some((e) => e.id === id)) return next;
  const merged = [next, ...existing].slice(0, IDENTITY_EVENTS_MAX);
  writeItem(IDENTITY_EVENTS_STORAGE, JSON.stringify(merged));
  return next;
};

export const clearIdentityEvents = () => removeItem(IDENTITY_EVENTS_STORAGE);
