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
