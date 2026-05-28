import type { MapZoom, SpZoneId } from '../../data/spLiveMap';

export interface MapLayerState {
  territory: boolean;
  live: boolean;
  missions: boolean;
  history: boolean;
}

export interface MapView {
  zoom: MapZoom;
  zoneId?: SpZoneId;
  spotId?: string;
}

export interface ProjectedPoint {
  x: number;
  y: number;
}

export const DEFAULT_MAP_LAYERS: MapLayerState = {
  territory: true,
  live: true,
  missions: false,
  history: false,
};

// MapaCidade unified component variants. See vault blueprint
// 2026-05-28-mapa-cidade-gamificado-blueprint.md.
//   menu    — home panel surface: pings interactive, gamification light
//   run     — fullscreen run controller: pings + missions + HUD + friends
//   signal  — city-signal-entry crew picker: pings only, no gamification
//   ambient — decorative background: aria-hidden, no interactivity
export type MapaCidadeVariant = 'menu' | 'run' | 'signal' | 'ambient';
