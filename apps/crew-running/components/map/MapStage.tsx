import React, { useCallback, useMemo, useState } from 'react';
import {
  SP_SIGNAL_ROUTE,
  SP_ZONE_MAP_FEATURES,
  getZoneById,
  polylineToPath,
  projectLngLat,
  type MapZoom,
  type ProjectionOpts,
  type SpZoneId,
} from '../../data/spLiveMap';
import { getCrewBySlug } from '../../data/crews';
import { SAMPLE_MISSIONS, type RunnerProgress } from '../../data/gamification';
import { ZoneLayer } from './ZoneLayer';
import { SpotLayer } from './SpotLayer';
import { MissionLayer } from './MissionLayer';
import { HudOverlay } from './HudOverlay';
import { LayerRail } from './LayerRail';
import { DEFAULT_MAP_LAYERS, type MapLayerState, type MapView } from './mapTypes';

const VIEWBOX_W = 800;
const VIEWBOX_H = 700;
const PADDING = 40;

const PROJECTION: ProjectionOpts = {
  width: VIEWBOX_W,
  height: VIEWBOX_H,
  padding: PADDING,
};

interface Props {
  runnerProgress: RunnerProgress;
  selectedCrewSlug?: string;
  onStartRun?: () => void;
  onBackToMenu?: () => void;
}

const getInitialZoneForCrew = (slug?: string): SpZoneId | undefined => {
  if (!slug) return undefined;
  const zone = SP_ZONE_MAP_FEATURES.find((z) => z.crewSlug === slug);
  return zone?.id;
};

export const MapStage: React.FC<Props> = ({ runnerProgress, selectedCrewSlug, onStartRun, onBackToMenu }) => {
  const [view, setView] = useState<MapView>(() => ({ zoom: 'city' }));
  const [layers, setLayers] = useState<MapLayerState>(DEFAULT_MAP_LAYERS);

  const userCrew = getCrewBySlug(selectedCrewSlug);
  const userZoneId = getInitialZoneForCrew(selectedCrewSlug);

  const ownershipByZone = useMemo(() => {
    const out: Partial<Record<SpZoneId, number>> = {};
    for (const zone of SP_ZONE_MAP_FEATURES) {
      const ink = runnerProgress.inkPerZone[zone.id] ?? 0;
      out[zone.id] = Math.min(1, ink / 1000);
    }
    return out;
  }, [runnerProgress.inkPerZone]);

  const handleToggleLayer = useCallback((key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSelectZone = useCallback((zoneId: SpZoneId) => {
    setView({ zoom: 'zone', zoneId });
  }, []);

  const handleSelectSpot = useCallback((spotId: string) => {
    setView((prev) => ({ ...prev, zoom: 'spot', spotId }));
  }, []);

  const handleBackZoom = useCallback(() => {
    setView((prev) => {
      if (prev.zoom === 'spot') return { zoom: 'zone', zoneId: prev.zoneId };
      if (prev.zoom === 'zone') return { zoom: 'city' };
      return prev;
    });
  }, []);

  const userPos = userZoneId ? projectLngLat(getZoneById(userZoneId)!.center, PROJECTION) : null;
  const signalPath = polylineToPath(SP_SIGNAL_ROUTE, PROJECTION);
  const visibleMissions = layers.missions
    ? SAMPLE_MISSIONS.filter((m) => view.zoom === 'spot' || !view.zoneId || m.zoneId === view.zoneId)
    : [];
  const activeZone = view.zoneId ? getZoneById(view.zoneId) : undefined;
  const liveBadges = view.zoom === 'city' && layers.live
    ? SP_ZONE_MAP_FEATURES.map((zone) => ({
        zone,
        center: projectLngLat(zone.center, PROJECTION),
      }))
    : [];

  return (
    <section className={`map-stage map-stage--${view.zoom}`}>
      <HudOverlay progress={runnerProgress} crewSlug={selectedCrewSlug} />

      <div className="map-stage-canvas">
        <svg
          viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="map-stage-svg"
          role="img"
          aria-label={`Mapa de Sao Paulo - zoom ${view.zoom}`}
        >
          {layers.territory && (
            <ZoneLayer
              projection={PROJECTION}
              activeZoneId={view.zoneId}
              ownershipByZone={ownershipByZone}
              onSelectZone={view.zoom === 'city' ? handleSelectZone : undefined}
            />
          )}

          {view.zoom !== 'city' && layers.live && (
            <path d={signalPath} className="map-signal-route" fill="none" strokeDasharray="6 4" />
          )}

          <SpotLayer
            projection={PROJECTION}
            zoom={view.zoom}
            activeZoneId={view.zoneId}
            activeSpotId={view.spotId}
            onSelectSpot={view.zoom === 'zone' ? handleSelectSpot : undefined}
          />

          {layers.missions && <MissionLayer projection={PROJECTION} zoom={view.zoom} missions={visibleMissions} />}

          {liveBadges.map(({ zone, center }) => (
            <g key={`live-${zone.id}`} className="map-live-pulse" transform={`translate(${center.x} ${center.y})`}>
              <circle r={10} className="map-live-halo" stroke={zone.color} />
              <image href={getCrewBySlug(zone.crewSlug).assets.badge} x={-14} y={-14} width={28} height={28} />
            </g>
          ))}

          {userPos && (
            <g className="map-user-pin" transform={`translate(${userPos.x} ${userPos.y})`}>
              <circle r={14} fill="white" stroke={userCrew.accent} strokeWidth={3} />
              <image href={userCrew.assets.badge} x={-10} y={-10} width={20} height={20} />
            </g>
          )}
        </svg>
      </div>

      {view.zoom !== 'city' && activeZone && (
        <header className="map-stage-zone-banner">
          <button type="button" className="map-back" onClick={handleBackZoom} aria-label="Voltar zoom">←</button>
          <div className="map-stage-zone-title">
            <span className="map-stage-zone-label">{activeZone.label}</span>
            <span className="map-stage-zone-mission">{getCrewBySlug(activeZone.crewSlug).mission}</span>
          </div>
        </header>
      )}

      <LayerRail layers={layers} onToggle={handleToggleLayer} />

      <footer className="map-stage-actions">
        <button
          type="button"
          className="map-action-primary"
          onClick={onStartRun}
          disabled={!onStartRun}
          aria-disabled={!onStartRun}
        >
          INICIAR CORRIDA
        </button>
        <button
          type="button"
          className="map-action-secondary"
          onClick={onBackToMenu}
          disabled={!onBackToMenu}
          aria-disabled={!onBackToMenu}
        >
          QG
        </button>
      </footer>
    </section>
  );
};
