import type { MissionDef, MissionType } from './gamification';
import type { RunSnapshot } from '../services/runTracker';

export const MAX_ACTIVE_MISSIONS = 3;

export interface ActiveMission {
  missionId: string;
  acceptedAt: number;
  expiresAt: number;
  progress: MissionProgress;
}

export type MissionProgress =
  | { type: 'spot-hunt'; visited: string[]; required: string[] }
  | { type: 'invasion'; metersRun: number; requiredMeters: number }
  | { type: 'crew-pinned'; kmRun: number; requiredKm: number }
  | { type: 'night-drift'; metersRun: number; requiredMeters: number; nightRun: boolean }
  | { type: 'heritage'; visited: string[]; required: string[] };

export interface CompletedMission {
  missionId: string;
  completedAt: number;
  xpEarned: number;
}

export const initProgress = (def: MissionDef): MissionProgress => {
  switch (def.type) {
    case 'spot-hunt':
      return { type: 'spot-hunt', visited: [], required: def.spotIds ?? [] };
    case 'invasion':
      return { type: 'invasion', metersRun: 0, requiredMeters: 2000 };
    case 'crew-pinned':
      return { type: 'crew-pinned', kmRun: 0, requiredKm: 5 };
    case 'night-drift':
      return { type: 'night-drift', metersRun: 0, requiredMeters: 3000, nightRun: false };
    case 'heritage':
      return { type: 'heritage', visited: [], required: def.spotIds ?? [] };
  }
  return def.type satisfies never;
};

const uniqueUnion = (existing: string[], incoming: string[]): string[] => {
  const set = new Set(existing);
  for (const id of incoming) set.add(id);
  return Array.from(set);
};

const isNightHour = (ts: number): boolean => {
  const h = new Date(ts).getHours();
  return h >= 22 || h < 4;
};

export const updateProgress = (
  progress: MissionProgress,
  snapshot: RunSnapshot,
): MissionProgress => {
  switch (progress.type) {
    case 'spot-hunt':
      return {
        ...progress,
        visited: uniqueUnion(progress.visited, snapshot.touchedSpotIds),
      };
    case 'invasion':
      return {
        ...progress,
        metersRun: progress.metersRun + snapshot.metersInTerritory,
      };
    case 'crew-pinned':
      return {
        ...progress,
        kmRun: progress.kmRun + snapshot.metersInTerritory / 1000,
      };
    case 'night-drift':
      return {
        ...progress,
        metersRun: progress.metersRun + snapshot.totalMeters,
        nightRun: progress.nightRun || isNightHour(snapshot.startedAt),
      };
    case 'heritage':
      return {
        ...progress,
        visited: uniqueUnion(progress.visited, snapshot.touchedSpotIds),
      };
  }
};

export const isComplete = (progress: MissionProgress): boolean => {
  switch (progress.type) {
    case 'spot-hunt':
      return (
        progress.required.length > 0 &&
        progress.required.every((id) => progress.visited.includes(id))
      );
    case 'invasion':
      return progress.metersRun >= progress.requiredMeters;
    case 'crew-pinned':
      return progress.kmRun >= progress.requiredKm;
    case 'night-drift':
      return progress.nightRun && progress.metersRun >= progress.requiredMeters;
    case 'heritage':
      return (
        progress.required.length > 0 &&
        progress.required.every((id) => progress.visited.includes(id))
      );
  }
};

export const isExpired = (mission: ActiveMission): boolean =>
  Date.now() > mission.expiresAt;

export interface ResolveMissionsResult {
  completed: CompletedMission[];
  stillActive: ActiveMission[];
}

export const resolveMissions = (
  active: ActiveMission[],
  snapshot: RunSnapshot,
  missionDefs: MissionDef[],
): ResolveMissionsResult => {
  const completed: CompletedMission[] = [];
  const stillActive: ActiveMission[] = [];
  for (const m of active) {
    if (isExpired(m)) continue;
    const updated = { ...m, progress: updateProgress(m.progress, snapshot) };
    if (isComplete(updated.progress)) {
      const def = missionDefs.find((d) => d.id === m.missionId);
      completed.push({
        missionId: m.missionId,
        completedAt: Date.now(),
        xpEarned: def?.rewardXp ?? 0,
      });
    } else {
      stillActive.push(updated);
    }
  }
  return { completed, stillActive };
};

export const acceptMission = (
  def: MissionDef,
  active: ActiveMission[],
): ActiveMission | null => {
  if (active.length >= MAX_ACTIVE_MISSIONS) return null;
  if (active.some((m) => m.missionId === def.id)) return null;

  const now = Date.now();
  return {
    missionId: def.id,
    acceptedAt: now,
    expiresAt: now + def.windowHours * 3600000,
    progress: initProgress(def),
  };
};
