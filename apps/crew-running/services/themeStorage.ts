import { canUseStorage } from './storageBase';
import type { ThemeId } from '../data/mapThemes';

const KEY = 'crewMapTheme';

const isValid = (v: unknown): v is ThemeId => v === 'dark' || v === 'light';

export const getThemePreference = (): ThemeId => {
  if (!canUseStorage()) return 'dark';
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
      return 'dark';
    }
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : 'dark';
  } catch {
    return 'dark';
  }
};

export const saveThemePreference = (theme: ThemeId): void => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(theme));
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch { /* ignored */ }
};
