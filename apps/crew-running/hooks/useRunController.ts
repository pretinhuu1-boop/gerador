// Owns the lifecycle around the singleton runTracker: hydrating from storage,
// the resume dialog, permission-denied UX, summary state, and the streak +
// breakdown computation that fires when a run ends. Keeps MapStage focused on
// rendering.
import { useCallback, useEffect, useState } from 'react';
import {
  INK_PER_KM,
  breakdownRunXp,
  bumpStreak,
  type RunXpBreakdown,
  type RunnerProgress,
  type StreakBumpResult,
} from '../data/gamification';
import { runTracker, type RunSnapshot } from '../services/runTracker';
import { useRunTracker } from './useRunTracker';

export interface PendingSummary {
  breakdown: RunXpBreakdown;
  streak: StreakBumpResult;
  nextProgress: RunnerProgress;
}

export interface RunController {
  snapshot: RunSnapshot;
  trackerActive: boolean;
  pendingSummary: PendingSummary | null;
  permissionToastOpen: boolean;
  resumePromptOpen: boolean;
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  stopRun: () => void;
  saveSummary: () => void;
  discardSummary: () => void;
  retryPermission: () => void;
  closePermissionToast: () => void;
  resumeStoredRun: () => void;
  discardStoredRun: () => void;
}

export const useRunController = (
  runnerProgress: RunnerProgress,
  selectedCrewSlug: string | undefined,
  onRunCompleted?: (next: RunnerProgress, breakdown: RunXpBreakdown) => void,
): RunController => {
  const snapshot = useRunTracker();
  const [pendingSummary, setPendingSummary] = useState<PendingSummary | null>(null);
  const [permissionToastOpen, setPermissionToastOpen] = useState(false);
  const [resumePromptOpen, setResumePromptOpen] = useState(false);

  // Hydrate any in-progress run that survived a reload. Runs come back as
  // 'paused' so the user must explicitly confirm before geolocation resumes.
  useEffect(() => {
    const restored = runTracker.hydrateFromStorage();
    if (restored.state === 'paused' && restored.startedAt > 0) {
      setResumePromptOpen(true);
    }
  }, []);

  useEffect(() => {
    if (snapshot.permissionDenied) setPermissionToastOpen(true);
  }, [snapshot.permissionDenied]);

  const startRun = useCallback(() => {
    const ok = runTracker.start(selectedCrewSlug);
    if (!ok && runTracker.getSnapshot().permissionDenied) {
      setPermissionToastOpen(true);
    }
  }, [selectedCrewSlug]);

  const pauseRun = useCallback(() => runTracker.pause(), []);
  const resumeRun = useCallback(() => runTracker.resume(), []);

  const stopRun = useCallback(() => {
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

  const saveSummary = useCallback(() => {
    if (!pendingSummary) return;
    onRunCompleted?.(pendingSummary.nextProgress, pendingSummary.breakdown);
    setPendingSummary(null);
    runTracker.reset();
  }, [pendingSummary, onRunCompleted]);

  const discardSummary = useCallback(() => {
    setPendingSummary(null);
    runTracker.reset();
  }, []);

  const retryPermission = useCallback(() => {
    setPermissionToastOpen(false);
    runTracker.reset();
    runTracker.start(selectedCrewSlug);
    if (runTracker.getSnapshot().permissionDenied) {
      setPermissionToastOpen(true);
    }
  }, [selectedCrewSlug]);

  const closePermissionToast = useCallback(() => setPermissionToastOpen(false), []);

  const resumeStoredRun = useCallback(() => {
    setResumePromptOpen(false);
    runTracker.resume();
  }, []);

  const discardStoredRun = useCallback(() => {
    setResumePromptOpen(false);
    runTracker.reset();
  }, []);

  return {
    snapshot,
    trackerActive: snapshot.state === 'tracking' || snapshot.state === 'paused',
    pendingSummary,
    permissionToastOpen,
    resumePromptOpen,
    startRun,
    pauseRun,
    resumeRun,
    stopRun,
    saveSummary,
    discardSummary,
    retryPermission,
    closePermissionToast,
    resumeStoredRun,
    discardStoredRun,
  };
};
