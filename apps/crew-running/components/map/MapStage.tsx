import React, { useCallback, useId, useMemo, useState } from 'react';
import {
  SP_SPOT_MAP_FEATURES,
  SP_ZONE_MAP_FEATURES,
  getZoneById,
  type SpZoneId,
} from '../../data/spLiveMap';
import { getCrewBySlug } from '../../data/crews';
import {
  INK_PER_FULL_OWNERSHIP,
  SAMPLE_MISSIONS,
  type RunXpBreakdown,
  type RunnerProgress,
} from '../../data/gamification';
import { HudOverlay } from './HudOverlay';
import { LayerRail } from './LayerRail';
import { RunHud } from './RunHud';
import { RunSummary } from './RunSummary';
import { CrewRadioOverlay } from './CrewRadioOverlay';
import { MapLibreCanvas } from './MapLibreCanvas';
import { ZoneSheet } from './ZoneSheet';
import { SpotSheet } from './SpotSheet';
import { CrewSheet } from './CrewSheet';
import { RunnerCard } from './RunnerCard';
import { type MapLayerState, type MapView } from './mapTypes';
import { getMapLayerPrefs, saveMapLayerPrefs } from '../../services/mapLayerStorage';
import { useRunController } from '../../hooks/useRunController';
import { useFriends } from '../../hooks/useFriends';
import { useInitialPosition } from '../../hooks/useInitialPosition';
import { getSavedCharacter, getSelfUserId } from '../../services/storage';

type SheetState =
  | { type: 'zone'; zoneId: SpZoneId }
  | { type: 'spot'; spotId: string }
  | { type: 'crew'; crewSlug: string }
  | { type: 'runner'; friendUserId: string }
  | null;

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
  const [sheet, setSheet] = useState<SheetState>(null);
  const canvasId = useId();
  const canvasDomId = `map-stage-canvas-${canvasId.replace(/[^\w-]/g, '')}`;

  const controller = useRunController(runnerProgress, selectedCrewSlug, onRunCompleted);
  const userCrew = getCrewBySlug(selectedCrewSlug);
  const userZoneId = getInitialZoneForCrew(selectedCrewSlug);
  const { friends } = useFriends();
  const initialPos = useInitialPosition();
  const selfUserId = useMemo(() => getSelfUserId(), []);
  const selfRunnerName = useMemo(
    () => getSavedCharacter()?.profile?.name || 'Runner',
    [],
  );

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
      const anyOn = next.territory || next.live || next.missions || next.history;
      if (!anyOn) return prev;
      saveMapLayerPrefs(next);
      return next;
    });
  }, []);

  const handleBackZoom = useCallback(() => {
    setSheet(null);
    setView((prev) => {
      if (prev.zoom === 'spot') return { zoom: 'zone', zoneId: prev.zoneId };
      if (prev.zoom === 'zone') return { zoom: 'city' };
      return prev;
    });
  }, []);

  const closeSheet = useCallback(() => setSheet(null), []);

  const handleCrewMarkerClick = useCallback((slug: string) => {
    setSheet({ type: 'crew', crewSlug: slug });
  }, []);

  const handleSpotClick = useCallback((spotId: string) => {
    setView((prev) => ({ ...prev, zoom: 'spot', spotId }));
    setSheet({ type: 'spot', spotId });
  }, []);

  const handleFriendClick = useCallback((userId: string) => {
    setSheet({ type: 'runner', friendUserId: userId });
  }, []);

  const handleZoneBannerClick = useCallback(() => {
    if (view.zoneId) setSheet({ type: 'zone', zoneId: view.zoneId });
  }, [view.zoneId]);

  const missionsForView = SAMPLE_MISSIONS.filter(
    (m) => view.zoom === 'spot' || !view.zoneId || m.zoneId === view.zoneId,
  );
  const visibleMissions = layers.missions ? missionsForView : [];
  const activeZone = view.zoneId ? getZoneById(view.zoneId) : undefined;

  const layerAvailability: Partial<Record<keyof MapLayerState, boolean>> = {
    missions: missionsForView.length > 0,
    history: false,
  };

  const { trackerActive, snapshot } = controller;

  return (
    <section
      className={`map-stage map-stage--${view.zoom}${trackerActive ? ' is-tracking' : ''}`}
      style={{ '--crew-accent': userCrew.accent } as React.CSSProperties}
      aria-label={`Mapa Crew Running - ${activeZone ? activeZone.label : 'cidade'}`}
    >
      <h2 className="sr-only">Mapa vivo da cidade</h2>
      <HudOverlay progress={runnerProgress} crewSlug={selectedCrewSlug} />

      <div className="map-stage-canvas">
        <div id={canvasDomId} className="map-stage-tiles">
          <MapLibreCanvas
            center={initialPos.center}
            layers={layers}
            activeCrewSlug={selectedCrewSlug}
            userPosition={snapshot.points[snapshot.points.length - 1] ?? null}
            trail={snapshot.points}
            zoom={view.zoom === 'city' ? 11 : view.zoom === 'zone' ? 13 : 15}
            mapZoom={view.zoom}
            ownershipByZone={ownershipByZone}
            activeZoneId={view.zoneId}
            activeSpotId={view.spotId}
            trailColor={userCrew.accent}
            onSelectSpot={view.zoom === 'zone' ? handleSpotClick : undefined}
            onSelectCrew={handleCrewMarkerClick}
            onSelectFriend={handleFriendClick}
            missions={visibleMissions}
            friends={friends}
            trackerActive={trackerActive}
          />
        </div>
      </div>

      {view.zoom !== 'city' && activeZone && !trackerActive && (
        <header className="map-stage-zone-banner">
          <button type="button" className="map-back" onClick={handleBackZoom} aria-label="Voltar zoom">←</button>
          <button type="button" className="map-stage-zone-title" onClick={handleZoneBannerClick} aria-label={`Detalhes ${activeZone.label}`}>
            <span className="map-stage-zone-label">{activeZone.label}</span>
            <span className="map-stage-zone-mission">{getCrewBySlug(activeZone.crewSlug).mission}</span>
          </button>
        </header>
      )}

      {!trackerActive && (
        <LayerRail
          layers={layers}
          onToggle={handleToggleLayer}
          availability={layerAvailability}
          controlsId={canvasDomId}
        />
      )}

      {!trackerActive && (
        <CrewRadioOverlay
          crewSlug={selectedCrewSlug}
          selfUserId={selfUserId}
          selfRunnerName={selfRunnerName}
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
            onClick={onBackToMenu ?? undefined}
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
          newlyUnlocked={controller.pendingSummary.newlyUnlocked ?? []}
          onSave={controller.saveSummary}
          onDiscard={controller.discardSummary}
          onDismissUnlocks={closeSheet}
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

      {sheet?.type === 'zone' && (
        <ZoneSheet
          zoneId={sheet.zoneId}
          progress={runnerProgress}
          friends={friends}
          open
          onClose={closeSheet}
        />
      )}
      {sheet?.type === 'spot' && (
        <SpotSheet spotId={sheet.spotId} open onClose={closeSheet} />
      )}
      {sheet?.type === 'crew' && (
        <CrewSheet
          crewSlug={sheet.crewSlug}
          progress={runnerProgress}
          friends={friends}
          isUserCrew={sheet.crewSlug === selectedCrewSlug}
          open
          onClose={closeSheet}
        />
      )}
      {sheet?.type === 'runner' && (() => {
        const friend = friends.find((f) => f.userId === sheet.friendUserId);
        return friend ? <RunnerCard friend={friend} open onClose={closeSheet} /> : null;
      })()}
    </section>
  );
};
