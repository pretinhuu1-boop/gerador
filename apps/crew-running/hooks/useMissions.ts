import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getActiveMissions,
  getCompletedMissions,
  saveActiveMissions,
  appendCompletedMission,
} from '../services/storage';
import { SAMPLE_MISSIONS, type MissionDef } from '../data/gamification';
import {
  acceptMission,
  resolveMissions,
  type ActiveMission,
  type CompletedMission,
} from '../data/missions';
import type { RunSnapshot } from '../services/runTracker';

export const useMissions = (version: number = 0) => {
  const [active, setActive] = useState<ActiveMission[]>(getActiveMissions);
  const [completed, setCompleted] = useState<CompletedMission[]>(getCompletedMissions);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setActive(getActiveMissions());
    setCompleted(getCompletedMissions());
  }, [version, tick]);

  const available = useMemo(() => {
    const activeIds = new Set(active.map((m) => m.missionId));
    const completedIds = new Set(completed.map((m) => m.missionId));
    return SAMPLE_MISSIONS.filter(
      (m) => !activeIds.has(m.id) && !completedIds.has(m.id),
    );
  }, [active, completed]);

  const accept = useCallback((def: MissionDef): ActiveMission | null => {
    const current = getActiveMissions();
    const mission = acceptMission(def, current);
    if (!mission) return null;
    saveActiveMissions([...current, mission]);
    setTick((t) => t + 1);
    return mission;
  }, []);

  const resolveRun = useCallback((snapshot: RunSnapshot): CompletedMission[] => {
    const current = getActiveMissions();
    const { completed: nowCompleted, stillActive } = resolveMissions(
      current,
      snapshot,
      SAMPLE_MISSIONS,
    );
    for (const cm of nowCompleted) appendCompletedMission(cm);
    saveActiveMissions(stillActive);
    if (nowCompleted.length > 0 || stillActive.length !== current.length) {
      setTick((t) => t + 1);
    }
    return nowCompleted;
  }, []);

  const abandon = useCallback((missionId: string): void => {
    const current = getActiveMissions();
    const filtered = current.filter((m) => m.missionId !== missionId);
    if (filtered.length === current.length) return;
    saveActiveMissions(filtered);
    setTick((t) => t + 1);
  }, []);

  return useMemo(
    () => ({ active, completed, available, accept, resolveRun, abandon }),
    [active, completed, available, accept, resolveRun, abandon],
  );
};
