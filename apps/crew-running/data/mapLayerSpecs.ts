import type { FillLayerSpecification, LineLayerSpecification, CircleLayerSpecification } from 'maplibre-gl';
import type { MapTheme } from './mapThemes';

export const buildZoneFill = (theme: MapTheme): FillLayerSpecification => ({
  id: 'sp-zone-fill',
  type: 'fill',
  source: 'sp-zones',
  paint: {
    'fill-color': ['get', 'color'],
    'fill-opacity': [
      'interpolate', ['linear'], ['get', 'ownership'],
      0, theme.zone.fillOpacityRange[0],
      0.4, (theme.zone.fillOpacityRange[0] + theme.zone.fillOpacityRange[1]) / 2,
      1, theme.zone.fillOpacityRange[1],
    ],
  },
});

export const buildZoneOutline = (theme: MapTheme): LineLayerSpecification => ({
  id: 'sp-zone-outline',
  type: 'line',
  source: 'sp-zones',
  paint: {
    'line-color': ['case',
      ['has', 'dominantCrew'], ['get', 'crewColor'],
      theme.zone.neutralOutlineColor,
    ],
    'line-width': ['case',
      ['get', 'conquered'], theme.zone.conqueredOutlineWidth,
      theme.zone.neutralOutlineWidth,
    ],
    'line-opacity': ['case', ['get', 'active'], 0.9, 0.5],
  },
});

export const buildSpotCircle = (theme: MapTheme): CircleLayerSpecification => ({
  id: 'sp-spot-circle',
  type: 'circle',
  source: 'sp-spots',
  paint: {
    'circle-radius': 6,
    'circle-color': ['case', ['get', 'active'], theme.spot.activeColor, theme.spot.fillColor],
    'circle-stroke-color': theme.spot.strokeColor,
    'circle-stroke-width': 1.5,
    'circle-opacity': 0.85,
    'circle-stroke-opacity': 0.7,
  },
});

export const buildSignalLine = (theme: MapTheme): LineLayerSpecification => ({
  id: 'sp-signal-line',
  type: 'line',
  source: 'sp-signal',
  paint: {
    'line-color': theme.signal.color,
    'line-width': 2,
    'line-dasharray': [4, 3],
    'line-opacity': theme.signal.opacity,
  },
});

export const buildRoadsLine = (theme: MapTheme): LineLayerSpecification => ({
  id: 'sp-roads-line',
  type: 'line',
  source: 'sp-roads',
  paint: {
    'line-color': theme.roads.color,
    'line-width': 1,
    'line-opacity': theme.roads.opacity,
  },
});

export const buildTrailLine = (theme: MapTheme, trailColor: string): LineLayerSpecification => ({
  id: 'sp-trail-line',
  type: 'line',
  source: 'sp-trail',
  paint: {
    'line-color': trailColor,
    'line-width': theme.trail.width,
    'line-opacity': theme.trail.opacity,
  },
});
