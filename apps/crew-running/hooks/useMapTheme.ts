import { useCallback, useState } from 'react';
import { getThemeById, type MapTheme, type ThemeId } from '../data/mapThemes';
import { getThemePreference, saveThemePreference } from '../services/themeStorage';

export const useMapTheme = () => {
  const [themeId, setThemeId] = useState<ThemeId>(() => getThemePreference());
  const theme: MapTheme = getThemeById(themeId);

  const toggle = useCallback(() => {
    const next: ThemeId = themeId === 'dark' ? 'light' : 'dark';
    saveThemePreference(next);
    setThemeId(next);
  }, [themeId]);

  return { theme, themeId, toggle };
};
