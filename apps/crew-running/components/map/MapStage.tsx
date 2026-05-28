import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
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
  INK_PER_KM,
  SAMPLE_MISSIONS,
  breakdownRunXp,
  bumpStreak,
  type RunXpBreakdown,
  type RunnerProgress,
  type StreakBumpResult,
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
import { getMapLayerPrefs, saveMapLayerPrefs } from '../../services/launchStorage';
import { runTracker } from '../../services/runTracker';
import { useRunTracker } from '../../hooks/useRunTracker';

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

interface PendingSummary {
  breakdown: RunXpBreakdown;
  streak: StreakBumpResult;
  nextProgress: RunnerProgress;
}

export const MapStage: React.FC<Props> = ({ runnerProgress, selectedCrewSlug, onBackToMenu, onRunCompleted }) => {
  const [view, setView] = useState<MapView>(() => ({ zoom: 'city' }));
  const [layers, setLayers] = useState<MapLayerState>(() => getMapLayerPrefs());
  const [permissionDeniedToast, setPermissionDeniedToast] = useState(false);
  const [pendingSummary, setPendingSummary] = useState<PendingSummary | null>(null);
  const [resumePromptOpen, setResumePromptOpen] = useState(false);
  const svgId = useId();

  // Resume an in-progress run if the user reloaded mid-corrida.
  useEffect(() => {
    const restored = runTracker.hydrateFromStorage();
    if (restored.state === 'paused' && restored.startedAt > 0) {
      setResumePromptOpen(true);
    }
  }, []);

  const trackerSnapshot = useRunTracker();
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

  const handleStartRun = useCallback(() => {
    const ok = runTracker.start(selectedCrewSlug);
    if (!ok && runTracker.getSnapshot().permissionDenied) {
      setPermissionDeniedToast(true);
    }
  }, [selectedCrewSlug]);

  const handleRetryPermission = useCallback(() => {
    setPermissionDeniedToast(false);
    runTracker.reset();
    runTracker.start(selectedCrewSlug);
    if (runTracker.getSnapshot().permissionDenied) {
      setPermissionDeniedToast(true);
    }
  }, [selectedCrewSlug]);

  const handleResumeStoredRun = useCallback(() => {
    setResumePromptOpen(false);
    runTracker.resume();
  }, []);

  const handleDiscardStoredRun = useCallback(() => {
    setResumePromptOpen(false);
    runTracker.reset();
  }, []);

  const handlePauseRun = useCallback(() => runTracker.pause(), []);
  const handleResumeRun = useCallback(() => runTracker.resume(), []);

  const handleStopRun = useCallback(() => {
    const snap = runTracker.stop();
    const distanceKm = snap.totalMeters / 1000;
    const kmInTerritory = snap.metersInTerritory / 1000;
    const breakdown = breakdownRunXp({
      distanceKm,
      kmInTerritory,
      spotsTouched: snap.touchedSpotIds.length,
      closedLoop: snap.closedLoop,
      isInvasion: false,
    });
    const ink = kmInTerritory * INK_PER_KM;
    const zoneKey = snap.homeZoneId;
    const inkPerZone = zoneKey
      ? { ...runnerProgress.inkPerZone, [zoneKey]: (runnerProgress.inkPerZone[zoneKey] ?? 0) + ink }
      : runnerProgress.inkPerZone;
    const streak = bumpStreak(
      {
        ...runnerProgress,
        xp: runnerProgress.xp + breakdown.total,
        lastRunAt: Date.now(),
        inkPerZone,
        inkUpdatedAt: Date.now(),
      },
      new Date(),
    );
    setPendingSummary({ breakdown, streak, nextProgress: streak.next });
  }, [runnerProgress]);

  const handleSaveSummary = useCallback(() => {
    if (!pendingSummary) return;
    onRunCompleted?.(pendingSummary.nextProgress, pendingSummary.breakdown);
    setPendingSummary(null);
    runTracker.reset();
  }, [pendingSummary, onRunCompleted]);

  const handleDiscardSummary = useCallback(() => {
    setPendingSummary(null);
    runTracker.reset();
  }, []);

  useEffect(() => {
    if (trackerSnapshot.permissionDenied) setPermissionDeniedToast(true);
  }, [trackerSnapshot.permissionDenied]);

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
    history: false, // not yet wired
  };

  const trackerActive = trackerSnapshot.state === 'tracking' || trackerSnapshot.state === 'paused';

  return (
    <section
      className={`map-stage map-stage--${view.zoom}${trackerActive ? ' is-tracking' : ''}`}
      aria-label={`Mapa Crew Running - ${activeZone ? activeZone.label : 'cidade'}`}
    >
      <h2 className="sr-only">Mapa vivo da cidade</h2>
      <HudOverlay progress={runnerProgress} crewSlug={selectedCrewSlug} />

      <div className="map-stage-canvas">
        <svg
          id={`map-stage-svg-${svgId}`}
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
            <TrailLayer points={trackerSnapshot.points} projection={PROJECTION} color={userCrew.accent} />
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
          controlsId={`map-stage-svg-${svgId}`}
        />
      )}

      {!trackerActive && (
        <footer className="map-stage-actions">
          <button
            type="button"
            className="map-action-primary"
            onClick={handleStartRun}
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
      )}

      {trackerActive && (
        <RunHud
          snapshot={trackerSnapshot}
          totalSpots={SP_SPOT_MAP_FEATURES.length}
          onPause={handlePauseRun}
          onResume={handleResumeRun}
          onStop={handleStopRun}
          accentColor={userCrew.accent}
        />
      )}

      {pendingSummary && (
        <RunSummary
          snapshot={trackerSnapshot}
          breakdown={pendingSummary.breakdown}
          streakBumped={pendingSummary.streak.streakBumped}
          streakBroken={pendingSummary.streak.streakBroken}
          freezeUsed={pendingSummary.streak.freezeUsed}
          onSave={handleSaveSummary}
          onDiscard={handleDiscardSummary}
        />
      )}

      {permissionDeniedToast && (
        <div className="run-permission-toast" role="alert">
          <p>Sem permissão de GPS. Permita localização no navegador e tente de novo.</p>
          <div className="run-permission-toast-actions">
            <button type="button" onClick={handleRetryPermission}>TENTAR DE NOVO</button>
            <button type="button" onClick={() => setPermissionDeniedToast(false)}>FECHAR</button>
          </div>
        </div>
      )}

      {resumePromptOpen && (
        <div className="run-resume-backdrop" role="dialog" aria-modal="true" aria-label="Retomar corrida">
          <div className="run-resume-card">
            <h2 className="run-resume-title">Corrida em andamento</h2>
            <p>Você saiu da corrida aberta. Retomar ou descartar?</p>
            <div className="run-resume-actions">
              <button type="button" className="run-summary-button run-summary-button--save" onClick={handleResumeStoredRun}>
                RETOMAR
              </button>
              <button type="button" className="run-summary-button run-summary-button--discard" onClick={handleDiscardStoredRun}>
                DESCARTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
