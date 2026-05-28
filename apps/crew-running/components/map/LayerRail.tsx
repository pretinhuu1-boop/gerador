import React from 'react';
import type { MapLayerState } from './mapTypes';

interface Props {
  layers: MapLayerState;
  onToggle: (key: keyof MapLayerState) => void;
}

const LABELS: Array<{ key: keyof MapLayerState; label: string }> = [
  { key: 'territory', label: 'Território' },
  { key: 'live', label: 'Live' },
  { key: 'missions', label: 'Missões' },
  { key: 'history', label: 'História' },
];

export const LayerRail: React.FC<Props> = ({ layers, onToggle }) => (
  <div className="map-layer-rail" role="toolbar" aria-label="Camadas do mapa">
    {LABELS.map(({ key, label }) => (
      <button
        key={key}
        type="button"
        className={`map-layer-chip${layers[key] ? ' is-on' : ''}`}
        aria-pressed={layers[key]}
        onClick={() => onToggle(key)}
      >
        <span className="map-layer-dot" aria-hidden>{layers[key] ? '●' : '○'}</span>
        <span className="map-layer-label">{label}</span>
      </button>
    ))}
  </div>
);
