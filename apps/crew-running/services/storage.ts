const API_KEY_STORAGE = 'crew.gemini_api_key';
const CHARACTER_STORAGE = 'crew.saved_character';

export const getApiKey = (): string => localStorage.getItem(API_KEY_STORAGE) ?? '';
export const setApiKey = (key: string) => localStorage.setItem(API_KEY_STORAGE, key.trim());
export const clearApiKey = () => localStorage.removeItem(API_KEY_STORAGE);

export type SavedCharacter = {
  imageDataUrl: string;
  styleId: string;
  slots: { hair: string; top: string; bottom: string; shoes: string };
  savedAt: number;
};

export const getSavedCharacter = (): SavedCharacter | null => {
  const raw = localStorage.getItem(CHARACTER_STORAGE);
  if (!raw) return null;
  try { return JSON.parse(raw) as SavedCharacter; } catch { return null; }
};

export const saveCharacter = (c: SavedCharacter) =>
  localStorage.setItem(CHARACTER_STORAGE, JSON.stringify(c));

export const clearSavedCharacter = () => localStorage.removeItem(CHARACTER_STORAGE);
