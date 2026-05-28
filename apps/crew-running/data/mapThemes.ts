export type ThemeId = 'dark' | 'light';

export interface MapTheme {
  id: ThemeId;
  label: string;
  basemapUrl: string;
  zone: {
    neutralOutlineColor: string;
    neutralOutlineWidth: number;
    fillOpacityRange: [number, number];
    conqueredOutlineWidth: number;
  };
  spot: {
    strokeColor: string;
    fillColor: string;
    activeColor: string;
  };
  signal: { color: string; opacity: number };
  roads: { color: string; opacity: number };
  trail: { opacity: number; width: number };
  history: {
    routeOpacityRecent: number;
    routeOpacityOld: number;
    badgePinBackground: string;
  };
  hud: { background: string; text: string; accent: string; border: string };
  ui: {
    chrome: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    overlayBackground: string;
  };
}

const STADIA = 'https://tiles.stadiamaps.com/styles';

export const DARK_THEME: MapTheme = {
  id: 'dark',
  label: 'Noite',
  basemapUrl: `${STADIA}/alidade_smooth_dark.json`,
  zone: { neutralOutlineColor: '#ffffff', neutralOutlineWidth: 1.5, fillOpacityRange: [0.08, 0.35], conqueredOutlineWidth: 3 },
  spot: { strokeColor: '#fff', fillColor: 'transparent', activeColor: '#fff' },
  signal: { color: '#C9302C', opacity: 0.6 },
  roads: { color: '#555', opacity: 0.3 },
  trail: { opacity: 0.85, width: 3 },
  history: { routeOpacityRecent: 0.7, routeOpacityOld: 0.15, badgePinBackground: 'rgba(0,0,0,0.8)' },
  hud: { background: 'rgba(0,0,0,0.85)', text: '#e8e8e8', accent: 'var(--crew-accent)', border: 'rgba(255,255,255,0.1)' },
  ui: { chrome: '#0a0a0a', surface: '#141414', text: '#e8e8e8', textMuted: '#888', border: 'rgba(255,255,255,0.08)', overlayBackground: 'rgba(0,0,0,0.92)' },
};

export const LIGHT_THEME: MapTheme = {
  id: 'light',
  label: 'Dia',
  basemapUrl: `${STADIA}/alidade_smooth.json`,
  zone: { neutralOutlineColor: '#1a1a1a', neutralOutlineWidth: 1.5, fillOpacityRange: [0.12, 0.45], conqueredOutlineWidth: 3 },
  spot: { strokeColor: '#333', fillColor: 'transparent', activeColor: '#111' },
  signal: { color: '#E04040', opacity: 0.7 },
  roads: { color: '#bbb', opacity: 0.35 },
  trail: { opacity: 0.8, width: 3 },
  history: { routeOpacityRecent: 0.65, routeOpacityOld: 0.12, badgePinBackground: 'rgba(255,255,255,0.9)' },
  hud: { background: 'rgba(255,255,255,0.92)', text: '#1a1a1a', accent: 'var(--crew-accent)', border: 'rgba(0,0,0,0.08)' },
  ui: { chrome: '#f5f5f0', surface: '#ffffff', text: '#1a1a1a', textMuted: '#666', border: 'rgba(0,0,0,0.08)', overlayBackground: 'rgba(255,255,255,0.95)' },
};

export const getThemeById = (id: ThemeId): MapTheme => (id === 'light' ? LIGHT_THEME : DARK_THEME);
