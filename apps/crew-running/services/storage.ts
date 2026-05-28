import type { RunnerProfile } from '../data/runnerProfile';
import {
  buildIdentityEventId,
  isIdentityEventKind,
  type IdentityEvent,
} from '../data/identityEvents';
import {
  isFriendAddMethod,
  type FriendRecord,
} from '../data/friends';
import {
  CREW_RADIO_MAX_PER_CREW,
  buildCrewRadioId,
  isCrewRadioMessage,
  isExpired,
  type CrewRadioMessage,
} from '../data/crewRadio';

const API_KEY_STORAGE = 'crew.gemini_api_key';
const CHARACTER_STORAGE = 'crew.saved_character';
const IDENTITY_EVENTS_STORAGE = 'crew.identity_events';
const IDENTITY_EVENTS_MAX = 50;
const FRIENDS_STORAGE = 'crew.friends';
const CREW_RADIO_STORAGE = 'crew.crew_radio';
const SELF_USER_ID_STORAGE = 'crew.self_user_id';
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

const writeItem = (key: string, value: string): boolean => {
  if (!canUseStorage()) return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (err) {
    // Surface quota / private mode failures so callers can detect lost writes.
    // Common causes: private browsing, full storage, restricted contexts.
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[storage] writeItem failed for ${key}:`, err);
    }
    return false;
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

const generateUserId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export const getSelfUserId = (): string => {
  const existing = readItem(SELF_USER_ID_STORAGE);
  if (existing && existing.length > 0) return existing;
  const next = generateUserId();
  writeItem(SELF_USER_ID_STORAGE, next);
  return next;
};

export const clearSelfUserId = () => removeItem(SELF_USER_ID_STORAGE);

const isFriendRecord = (value: unknown): value is FriendRecord => {
  if (!value || typeof value !== 'object') return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.userId === 'string' &&
    typeof f.runnerName === 'string' &&
    typeof f.addedAt === 'number' &&
    isFriendAddMethod(f.addMethod)
  );
};

export const getFriends = (): FriendRecord[] => {
  const raw = readItem(FRIENDS_STORAGE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFriendRecord);
  } catch {
    return [];
  }
};

export const addFriend = (friend: FriendRecord): FriendRecord => {
  const existing = getFriends();
  if (friend.userId === getSelfUserId()) return friend;
  const filtered = existing.filter((f) => f.userId !== friend.userId);
  const merged = [friend, ...filtered];
  writeItem(FRIENDS_STORAGE, JSON.stringify(merged));
  return friend;
};

export const removeFriend = (userId: string): void => {
  const existing = getFriends();
  const filtered = existing.filter((f) => f.userId !== userId);
  if (filtered.length === existing.length) return;
  writeItem(FRIENDS_STORAGE, JSON.stringify(filtered));
};

export const clearFriends = () => removeItem(FRIENDS_STORAGE);

export const getCrewRadio = (crewSlug?: string): CrewRadioMessage[] => {
  const raw = readItem(CREW_RADIO_STORAGE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    const valid = parsed.filter(isCrewRadioMessage).filter((m) => !isExpired(m, now));
    return crewSlug ? valid.filter((m) => m.crewSlug === crewSlug) : valid;
  } catch {
    return [];
  }
};

export const postCrewRadio = (
  message: Omit<CrewRadioMessage, 'id'> & { id?: string },
): CrewRadioMessage => {
  const id = message.id ?? buildCrewRadioId(message.authorUserId, message.postedAt);
  const next: CrewRadioMessage = {
    id,
    authorUserId: message.authorUserId,
    authorName: message.authorName,
    crewSlug: message.crewSlug,
    text: message.text,
    postedAt: message.postedAt,
    expiresAt: message.expiresAt,
  };
  const now = Date.now();
  const allValid = getCrewRadio();
  if (allValid.some((m) => m.id === id)) return next;
  const sameCrew = allValid.filter((m) => m.crewSlug === message.crewSlug);
  const otherCrews = allValid.filter((m) => m.crewSlug !== message.crewSlug);
  const merged = [next, ...sameCrew].slice(0, CREW_RADIO_MAX_PER_CREW);
  const combined = [...merged, ...otherCrews].filter((m) => !isExpired(m, now));
  writeItem(CREW_RADIO_STORAGE, JSON.stringify(combined));
  return next;
};

export const pruneCrewRadio = (): number => {
  const raw = readItem(CREW_RADIO_STORAGE);
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    const now = Date.now();
    const valid = parsed.filter(isCrewRadioMessage).filter((m) => !isExpired(m, now));
    if (valid.length === parsed.length) return 0;
    writeItem(CREW_RADIO_STORAGE, JSON.stringify(valid));
    return parsed.length - valid.length;
  } catch {
    return 0;
  }
};

export const clearCrewRadio = () => removeItem(CREW_RADIO_STORAGE);
