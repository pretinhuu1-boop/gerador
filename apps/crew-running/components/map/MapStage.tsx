import React, { useCallback, useId, useMemo, useState } from 'react';
import {
  SP_SIGNAL_ROUTE,
  SP_SPOT_MAP_FEATURES,
  SP_ZONE_MAP_FEATURES,
  getZoneById,
  polylineToPath,
  projectLngLat,
  type ProjectionOpts,
  type SpZoneId,
} from '../../data/spLiveMap';
import { getCrewBySlug } from '../../data/crews';
import {
  INK_PER_FULL_OWNERSHIP,
  SAMPLE_MISSIONS,
  type RunXpBreakdown,
  type RunnerProgress,
} from '../../data/gamification';
import { ZoneLayer } from './ZoneLayer';
import { SpotLayer } from './SpotLayer';
import { MissionLayer } from './MissionLayer';
import { HudOverlay } from './HudOverlay';
import { LayerRail } from './LayerRail';
import { TrailLayer } from './TrailLayer';
import { RunHud } from './RunHud';
import { RunSummary } from './RunSummary';
import { type MapLayerState, type MapView } from './mapTypes';
import { getMapLayerPrefs, saveMapLayerPrefs } from '../../services/mapLayerStorage';
import { useRunController } from '../../hooks/useRunController';

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
  onBackToMenu?: () => void;
  onRunCompleted?: (next: RunnerProgress, breakdown: RunXpBreakdown) => void;
}

const getInitialZoneForCrew = (slug?: string): SpZoneId | undefined => {
  if (!slug) return undefined;
  const zone = SP_ZONE_MAP_FEATURES.find((z) => z.crewSlug === slug);
  return zone?.id;
};

export const MapStage: React.FC<Props> = ({ runnerProgress, selectedCrewSlug, onBackToMenu, onRunCompleted }) => {
  const [view, setView] = useState<MapView>(() => ({ zoom: 'city' }));
  const [layers, setLayers] = useState<MapLayerState>(() => getMapLayerPrefs());
  const svgId = useId();
  const svgDomId = `map-stage-svg-${svgId.replace(/[^\w-]/g, '')}`;

  const controller = useRunController(runnerProgress, selectedCrewSlug, onRunCompleted);
  const userCrew = getCrewBySlug(selectedCrewSlug);
  const userZoneId = getInitialZoneForCrew(selectedCrewSlug);

  const ownershipByZone = useMemo(() => {
    const out: Partial<Record<SpZoneId, number>> = {};
    for (const zone of SP_ZONE_MAP_FEATURES) {
      const ink = runnerProgress.inkPerZone[zone.id] ?? 0;
      out[zone.id] = Math.min(1, ink / INK_PER_FULL_OWNERSHIP);
    }
    return out;
  }, [runnerProgress.inkPerZone]);

  const handleToggleLayer = useCallback((key: keyof MapLayerState) => {
    setLayers((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveMapLayerPrefs(next);
      return next;
    });
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

  const userZone = userZoneId ? getZoneById(userZoneId) : undefined;
  const userPos = userZone ? projectLngLat(userZone.center, PROJECTION) : null;
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

  const layerAvailability: Partial<Record<keyof MapLayerState, boolean>> = {
    missions: visibleMissions.length > 0 || layers.missions,
    history: false,
  };

  const { trackerActive, snapshot } = controller;

  return (
    <section
      className={`map-stage map-stage--${view.zoom}${trackerActive ? ' is-tracking' : ''}`}
      aria-label={`Mapa Crew Running - ${activeZone ? activeZone.label : 'cidade'}`}
    >
      <h2 className="sr-only">Mapa vivo da cidade</h2>
      <HudOverlay progress={runnerProgress} crewSlug={selectedCrewSlug} />

      <div className="map-stage-canvas">
        <svg
          id={svgDomId}
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

          {trackerActive && (
            <TrailLayer points={snapshot.points} projection={PROJECTION} color={userCrew.accent} />
          )}

          {liveBadges.map(({ zone, center }) => (
            <g key={`live-${zone.id}`} className="map-live-pulse" transform={`translate(${center.x} ${center.y})`}>
              <circle r={10} className="map-live-halo" stroke={zone.color} />
              <image href={getCrewBySlug(zone.crewSlug).assets.badge} x={-14} y={-14} width={28} height={28} />
            </g>
          ))}

          {userPos && !trackerActive && (
            <g className="map-user-pin" transform={`translate(${userPos.x} ${userPos.y})`}>
              <circle r={14} fill="white" stroke={userCrew.accent} strokeWidth={3} />
              <image href={userCrew.assets.badge} x={-10} y={-10} width={20} height={20} />
            </g>
          )}
        </svg>
      </div>

      {view.zoom !== 'city' && activeZone && !trackerActive && (
        <header className="map-stage-zone-banner">
          <button type="button" className="map-back" onClick={handleBackZoom} aria-label="Voltar zoom">←</button>
          <div className="map-stage-zone-title">
            <span className="map-stage-zone-label">{activeZone.label}</span>
            <span className="map-stage-zone-mission">{getCrewBySlug(activeZone.crewSlug).mission}</span>
          </div>
        </header>
      )}

      {!trackerActive && (
        <LayerRail
          layers={layers}
          onToggle={handleToggleLayer}
          availability={layerAvailability}
          controlsId={svgDomId}
        />
      )}

      {!trackerActive && (
        <footer className="map-stage-actions">
          <button type="button" className="map-action-primary" onClick={controller.startRun}>
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
      )}

      {trackerActive && (
        <RunHud
          snapshot={snapshot}
          totalSpots={SP_SPOT_MAP_FEATURES.length}
          onPause={controller.pauseRun}
          onResume={controller.resumeRun}
          onStop={controller.stopRun}
          accentColor={userCrew.accent}
        />
      )}

      {controller.pendingSummary && (
        <RunSummary
          snapshot={snapshot}
          breakdown={controller.pendingSummary.breakdown}
          streakBumped={controller.pendingSummary.streak.streakBumped}
          streakBroken={controller.pendingSummary.streak.streakBroken}
          freezeUsed={controller.pendingSummary.streak.freezeUsed}
          onSave={controller.saveSummary}
          onDiscard={controller.discardSummary}
        />
      )}

      {controller.permissionToastOpen && (
        <div className="run-permission-toast" role="alert">
          <p>Sem permissão de GPS. Permita localização no navegador e tente de novo.</p>
          <div className="run-permission-toast-actions">
            <button type="button" onClick={controller.retryPermission}>TENTAR DE NOVO</button>
            <button type="button" onClick={controller.closePermissionToast}>FECHAR</button>
          </div>
        </div>
      )}

      {controller.resumePromptOpen && (
        <div className="run-resume-backdrop" role="dialog" aria-modal="true" aria-label="Retomar corrida">
          <div className="run-resume-card">
            <h2 className="run-resume-title">Corrida em andamento</h2>
            <p>Você saiu da corrida aberta. Retomar ou descartar?</p>
            <div className="run-resume-actions">
              <button type="button" className="run-summary-button run-summary-button--save" onClick={controller.resumeStoredRun}>
                RETOMAR
              </button>
              <button type="button" className="run-summary-button run-summary-button--discard" onClick={controller.discardStoredRun}>
                DESCARTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
