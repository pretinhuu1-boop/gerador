import React from 'react';
import type { RunSnapshot } from '../../services/runTracker';

const formatTime = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatKm = (meters: number): string => (meters / 1000).toFixed(2);

const formatPace = (meters: number, ms: number): string => {
  if (meters < 10 || ms < 1000) return '--:--';
  const minPerKm = ms / 1000 / 60 / (meters / 1000);
  const m = Math.floor(minPerKm);
  const s = Math.floor((minPerKm - m) * 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

interface Props {
  snapshot: RunSnapshot;
  totalSpots: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  accentColor?: string;
}

export const RunHud: React.FC<Props> = ({ snapshot, totalSpots, onPause, onResume, onStop, accentColor }) => {
  const tracking = snapshot.state === 'tracking';
  const paused = snapshot.state === 'paused';
  return (
    <div className="run-hud" role="region" aria-label="Corrida em andamento">
      <header className="run-hud-banner">
        <span className="run-hud-status">{paused ? 'PAUSADA' : 'AO VIVO'}</span>
        <span className="run-hud-time">{formatTime(snapshot.elapsedMs)}</span>
      </header>
      <dl className="run-hud-stats">
        <div className="run-hud-stat run-hud-stat--main">
          <dt>KM</dt>
          <dd style={accentColor ? { color: accentColor } : undefined}>{formatKm(snapshot.totalMeters)}</dd>
        </div>
        <div className="run-hud-stat">
          <dt>PACE</dt>
          <dd>{formatPace(snapshot.totalMeters, snapshot.elapsedMs)}</dd>
        </div>
        <div className="run-hud-stat">
          <dt>EM TERRIT</dt>
          <dd>{formatKm(snapshot.metersInTerritory)} km</dd>
        </div>
        <div className="run-hud-stat">
          <dt>SPOTS</dt>
          <dd>{snapshot.touchedSpotIds.length}/{totalSpots}</dd>
        </div>
      </dl>
      <footer className="run-hud-actions">
        {tracking ? (
          <button type="button" className="run-hud-button run-hud-button--chalk" onClick={onPause}>
            PAUSAR
          </button>
        ) : (
          <button type="button" className="run-hud-button run-hud-button--chalk" onClick={onResume}>
            RETOMAR
          </button>
        )}
        <button type="button" className="run-hud-button run-hud-button--stop" onClick={onStop}>
          ENCERRAR
        </button>
      </footer>
    </div>
  );
};
