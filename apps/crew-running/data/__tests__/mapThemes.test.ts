import { describe, it, expect } from 'vitest';
import { DARK_THEME, LIGHT_THEME, getThemeById, type MapTheme } from '../mapThemes';

describe('mapThemes', () => {
  it('DARK_THEME has alidade_smooth_dark basemap', () => {
    expect(DARK_THEME.basemapUrl).toContain('alidade_smooth_dark');
  });

  it('LIGHT_THEME has alidade_smooth basemap (not dark)', () => {
    expect(LIGHT_THEME.basemapUrl).toContain('alidade_smooth');
    expect(LIGHT_THEME.basemapUrl).not.toContain('dark');
  });

  it('getThemeById returns correct theme', () => {
    expect(getThemeById('dark')).toBe(DARK_THEME);
    expect(getThemeById('light')).toBe(LIGHT_THEME);
  });

  it('both themes have all required fields', () => {
    const check = (t: MapTheme) => {
      expect(t.zone.neutralOutlineColor).toBeTruthy();
      expect(t.zone.fillOpacityRange).toHaveLength(2);
      expect(t.spot.strokeColor).toBeTruthy();
      expect(t.hud.background).toBeTruthy();
      expect(t.ui.chrome).toBeTruthy();
    };
    check(DARK_THEME);
    check(LIGHT_THEME);
  });
});
