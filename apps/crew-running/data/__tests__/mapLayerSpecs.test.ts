import { describe, it, expect } from 'vitest';
import { buildZoneFill, buildZoneOutline, buildRoadsLine, buildSignalLine, buildSpotCircle } from '../mapLayerSpecs';
import { DARK_THEME, LIGHT_THEME } from '../mapThemes';

describe('mapLayerSpecs', () => {
  it('buildZoneFill uses theme fillOpacityRange', () => {
    const dark = buildZoneFill(DARK_THEME);
    const light = buildZoneFill(LIGHT_THEME);
    const darkPaint = dark.paint as Record<string, unknown>;
    const lightPaint = light.paint as Record<string, unknown>;
    const darkOpacity = darkPaint['fill-opacity'] as unknown[];
    const lightOpacity = lightPaint['fill-opacity'] as unknown[];
    expect(darkOpacity[4]).toBe(0.08);
    expect(lightOpacity[4]).toBe(0.12);
  });

  it('buildZoneOutline uses theme outline color', () => {
    const dark = buildZoneOutline(DARK_THEME);
    const light = buildZoneOutline(LIGHT_THEME);
    expect(JSON.stringify(dark.paint)).toContain('#ffffff');
    expect(JSON.stringify(light.paint)).toContain('#1a1a1a');
  });

  it('buildRoadsLine uses theme roads color', () => {
    const dark = buildRoadsLine(DARK_THEME);
    expect((dark.paint as Record<string, unknown>)['line-color']).toBe('#555');
  });
});
