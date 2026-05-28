import { describe, expect, it } from 'vitest';
import type { MissionDef } from '../gamification';
import type { RunSnapshot } from '../../services/runTracker';
import {
  MAX_ACTIVE_MISSIONS,
  acceptMission,
  initProgress,
  isComplete,
  isExpired,
  resolveMissions,
  updateProgress,
  type ActiveMission,
  type MissionProgress,
} from '../missions';

const makeDef = (overrides: Partial<MissionDef> & { type: MissionDef['type'] }): MissionDef => ({
  id: `m-test-${overrides.type}`,
  title: 'Test Mission',
  description: 'desc',
  rewardXp: 100,
  windowHours: 24,
  ...overrides,
});

const makeSnapshot = (overrides: Partial<RunSnapshot> = {}): RunSnapshot => ({
  state: 'ended',
  startedAt: Date.now(),
  elapsedMs: 60_000,
  totalMeters: 3000,
  metersInTerritory: 1000,
  points: [],
  touchedSpotIds: [],
  closedLoop: false,
  permissionDenied: false,
  ...overrides,
});

// ---------------------------------------------------------------------------
// initProgress
// ---------------------------------------------------------------------------

describe('initProgress', () => {
  it('spot-hunt: empty visited, required from def.spotIds', () => {
    const p = initProgress(makeDef({ type: 'spot-hunt', spotIds: ['a', 'b'] }));
    expect(p).toEqual({ type: 'spot-hunt', visited: [], required: ['a', 'b'] });
  });

  it('spot-hunt: defaults to empty required when no spotIds', () => {
    const p = initProgress(makeDef({ type: 'spot-hunt' }));
    expect(p).toEqual({ type: 'spot-hunt', visited: [], required: [] });
  });

  it('invasion: starts at 0 meters, requires 2000', () => {
    const p = initProgress(makeDef({ type: 'invasion' }));
    expect(p).toEqual({ type: 'invasion', metersRun: 0, requiredMeters: 2000 });
  });

  it('crew-pinned: starts at 0 km, requires 5', () => {
    const p = initProgress(makeDef({ type: 'crew-pinned' }));
    expect(p).toEqual({ type: 'crew-pinned', kmRun: 0, requiredKm: 5 });
  });

  it('night-drift: starts incomplete', () => {
    const p = initProgress(makeDef({ type: 'night-drift' }));
    expect(p).toEqual({ type: 'night-drift', metersRun: 0, requiredMeters: 3000, nightRun: false });
  });

  it('heritage: empty visited, required from def.spotIds', () => {
    const p = initProgress(makeDef({ type: 'heritage', spotIds: ['h1', 'h2'] }));
    expect(p).toEqual({ type: 'heritage', visited: [], required: ['h1', 'h2'] });
  });
});

// ---------------------------------------------------------------------------
// updateProgress
// ---------------------------------------------------------------------------

describe('updateProgress', () => {
  it('spot-hunt: merges touched spots without duplicates', () => {
    const p: MissionProgress = { type: 'spot-hunt', visited: ['a'], required: ['a', 'b', 'c'] };
    const next = updateProgress(p, makeSnapshot({ touchedSpotIds: ['a', 'b'] }));
    expect(next).toEqual({ type: 'spot-hunt', visited: ['a', 'b'], required: ['a', 'b', 'c'] });
  });

  it('invasion: accumulates metersInTerritory', () => {
    const p: MissionProgress = { type: 'invasion', metersRun: 500, requiredMeters: 2000 };
    const next = updateProgress(p, makeSnapshot({ metersInTerritory: 800 }));
    expect(next).toEqual({ type: 'invasion', metersRun: 1300, requiredMeters: 2000 });
  });

  it('crew-pinned: accumulates km from meters in territory', () => {
    const p: MissionProgress = { type: 'crew-pinned', kmRun: 2, requiredKm: 5 };
    const next = updateProgress(p, makeSnapshot({ metersInTerritory: 1500 }));
    expect(next).toEqual({ type: 'crew-pinned', kmRun: 3.5, requiredKm: 5 });
  });

  it('night-drift: marks completed when run started at night (23:00)', () => {
    const nightTs = new Date('2026-06-01T23:00:00').getTime();
    const p: MissionProgress = { type: 'night-drift', metersRun: 0, requiredMeters: 3000, nightRun: false };
    const next = updateProgress(p, makeSnapshot({ startedAt: nightTs }));
    expect(next).toEqual({ type: 'night-drift', metersRun: 3000, requiredMeters: 3000, nightRun: true });
  });

  it('night-drift: accumulates distance but stays nightRun=false during the day (14:00)', () => {
    const dayTs = new Date('2026-06-01T14:00:00').getTime();
    const p: MissionProgress = { type: 'night-drift', metersRun: 0, requiredMeters: 3000, nightRun: false };
    const next = updateProgress(p, makeSnapshot({ startedAt: dayTs, totalMeters: 1500 }));
    expect(next).toEqual({ type: 'night-drift', metersRun: 1500, requiredMeters: 3000, nightRun: false });
  });

  it('night-drift: nightRun stays true once set even on daytime run', () => {
    const dayTs = new Date('2026-06-01T10:00:00').getTime();
    const p: MissionProgress = { type: 'night-drift', metersRun: 1000, requiredMeters: 3000, nightRun: true };
    const next = updateProgress(p, makeSnapshot({ startedAt: dayTs, totalMeters: 500 }));
    expect(next).toEqual({ type: 'night-drift', metersRun: 1500, requiredMeters: 3000, nightRun: true });
  });

  it('heritage: merges touched spots', () => {
    const p: MissionProgress = { type: 'heritage', visited: [], required: ['h1', 'h2'] };
    const next = updateProgress(p, makeSnapshot({ touchedSpotIds: ['h1'] }));
    expect(next).toEqual({ type: 'heritage', visited: ['h1'], required: ['h1', 'h2'] });
  });
});

// ---------------------------------------------------------------------------
// isComplete
// ---------------------------------------------------------------------------

describe('isComplete', () => {
  it('spot-hunt: true when all required visited', () => {
    expect(isComplete({ type: 'spot-hunt', visited: ['a', 'b'], required: ['a', 'b'] })).toBe(true);
  });

  it('spot-hunt: false when some required missing', () => {
    expect(isComplete({ type: 'spot-hunt', visited: ['a'], required: ['a', 'b'] })).toBe(false);
  });

  it('spot-hunt: false when required is empty', () => {
    expect(isComplete({ type: 'spot-hunt', visited: [], required: [] })).toBe(false);
  });

  it('invasion: true when metersRun >= required', () => {
    expect(isComplete({ type: 'invasion', metersRun: 2000, requiredMeters: 2000 })).toBe(true);
    expect(isComplete({ type: 'invasion', metersRun: 2500, requiredMeters: 2000 })).toBe(true);
  });

  it('invasion: false when under required', () => {
    expect(isComplete({ type: 'invasion', metersRun: 1999, requiredMeters: 2000 })).toBe(false);
  });

  it('crew-pinned: true when kmRun >= required', () => {
    expect(isComplete({ type: 'crew-pinned', kmRun: 5, requiredKm: 5 })).toBe(true);
  });

  it('crew-pinned: false when under required', () => {
    expect(isComplete({ type: 'crew-pinned', kmRun: 4.9, requiredKm: 5 })).toBe(false);
  });

  it('night-drift: complete only when both nightRun AND distance met', () => {
    expect(isComplete({ type: 'night-drift', metersRun: 3000, requiredMeters: 3000, nightRun: true })).toBe(true);
    expect(isComplete({ type: 'night-drift', metersRun: 3000, requiredMeters: 3000, nightRun: false })).toBe(false);
    expect(isComplete({ type: 'night-drift', metersRun: 1000, requiredMeters: 3000, nightRun: true })).toBe(false);
    expect(isComplete({ type: 'night-drift', metersRun: 0, requiredMeters: 3000, nightRun: false })).toBe(false);
  });

  it('heritage: true when all required visited', () => {
    expect(isComplete({ type: 'heritage', visited: ['h1', 'h2'], required: ['h1', 'h2'] })).toBe(true);
  });

  it('heritage: false when some missing', () => {
    expect(isComplete({ type: 'heritage', visited: ['h1'], required: ['h1', 'h2'] })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isExpired
// ---------------------------------------------------------------------------

describe('isExpired', () => {
  it('returns true when current time is past expiresAt', () => {
    const mission: ActiveMission = {
      missionId: 'm-1',
      acceptedAt: Date.now() - 100_000,
      expiresAt: Date.now() - 1,
      progress: { type: 'night-drift', metersRun: 0, requiredMeters: 3000, nightRun: false },
    };
    expect(isExpired(mission)).toBe(true);
  });

  it('returns false when current time is before expiresAt', () => {
    const mission: ActiveMission = {
      missionId: 'm-1',
      acceptedAt: Date.now(),
      expiresAt: Date.now() + 3_600_000,
      progress: { type: 'night-drift', metersRun: 0, requiredMeters: 3000, nightRun: false },
    };
    expect(isExpired(mission)).toBe(false);
  });

  it('returns true at the exact boundary (expiresAt === now - 1)', () => {
    const now = Date.now();
    const mission: ActiveMission = {
      missionId: 'm-1',
      acceptedAt: now - 10_000,
      expiresAt: now - 1,
      progress: { type: 'night-drift', metersRun: 0, requiredMeters: 3000, nightRun: false },
    };
    expect(isExpired(mission)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// acceptMission
// ---------------------------------------------------------------------------

describe('acceptMission', () => {
  const def = makeDef({ type: 'spot-hunt', id: 'm-new', spotIds: ['s1'], windowHours: 48 });

  it('creates an ActiveMission with correct fields', () => {
    const result = acceptMission(def, []);
    expect(result).not.toBeNull();
    expect(result!.missionId).toBe('m-new');
    expect(result!.expiresAt - result!.acceptedAt).toBe(48 * 3600000);
    expect(result!.progress).toEqual({ type: 'spot-hunt', visited: [], required: ['s1'] });
  });

  it('returns null when at max active missions', () => {
    const active: ActiveMission[] = Array.from({ length: MAX_ACTIVE_MISSIONS }, (_, i) => ({
      missionId: `m-${i}`,
      acceptedAt: Date.now(),
      expiresAt: Date.now() + 3_600_000,
      progress: { type: 'night-drift' as const, metersRun: 0, requiredMeters: 3000, nightRun: false },
    }));
    expect(acceptMission(def, active)).toBeNull();
  });

  it('returns null when mission already active', () => {
    const active: ActiveMission[] = [
      {
        missionId: 'm-new',
        acceptedAt: Date.now(),
        expiresAt: Date.now() + 3_600_000,
        progress: { type: 'spot-hunt', visited: [], required: ['s1'] },
      },
    ];
    expect(acceptMission(def, active)).toBeNull();
  });

  it('allows accepting up to MAX_ACTIVE_MISSIONS - 1 when not duplicate', () => {
    const active: ActiveMission[] = Array.from({ length: MAX_ACTIVE_MISSIONS - 1 }, (_, i) => ({
      missionId: `m-other-${i}`,
      acceptedAt: Date.now(),
      expiresAt: Date.now() + 3_600_000,
      progress: { type: 'night-drift' as const, metersRun: 0, requiredMeters: 3000, nightRun: false },
    }));
    const result = acceptMission(def, active);
    expect(result).not.toBeNull();
    expect(result!.missionId).toBe('m-new');
  });
});

// ---------------------------------------------------------------------------
// resolveMissions
// ---------------------------------------------------------------------------

describe('resolveMissions', () => {
  const defs: MissionDef[] = [
    makeDef({ type: 'invasion', id: 'm-inv', rewardXp: 200 }),
    makeDef({ type: 'spot-hunt', id: 'm-hunt', spotIds: ['s1'], rewardXp: 150 }),
  ];

  it('completes missions that meet criteria and returns stillActive for the rest', () => {
    const active: ActiveMission[] = [
      {
        missionId: 'm-inv',
        acceptedAt: Date.now(),
        expiresAt: Date.now() + 3_600_000,
        progress: { type: 'invasion', metersRun: 1800, requiredMeters: 2000 },
      },
      {
        missionId: 'm-hunt',
        acceptedAt: Date.now(),
        expiresAt: Date.now() + 3_600_000,
        progress: { type: 'spot-hunt', visited: [], required: ['s1'] },
      },
    ];
    const snap = makeSnapshot({ metersInTerritory: 500, touchedSpotIds: ['s1'] });
    const result = resolveMissions(active, snap, defs);
    expect(result.completed).toHaveLength(2);
    expect(result.completed.map((c) => c.missionId).sort()).toEqual(['m-hunt', 'm-inv']);
    expect(result.stillActive).toHaveLength(0);
  });

  it('drops expired missions from both lists', () => {
    const active: ActiveMission[] = [
      {
        missionId: 'm-inv',
        acceptedAt: Date.now() - 100_000,
        expiresAt: Date.now() - 1,
        progress: { type: 'invasion', metersRun: 0, requiredMeters: 2000 },
      },
    ];
    const result = resolveMissions(active, makeSnapshot(), defs);
    expect(result.completed).toHaveLength(0);
    expect(result.stillActive).toHaveLength(0);
  });

  it('keeps incomplete missions in stillActive', () => {
    const active: ActiveMission[] = [
      {
        missionId: 'm-inv',
        acceptedAt: Date.now(),
        expiresAt: Date.now() + 3_600_000,
        progress: { type: 'invasion', metersRun: 0, requiredMeters: 2000 },
      },
    ];
    const result = resolveMissions(active, makeSnapshot({ metersInTerritory: 100 }), defs);
    expect(result.completed).toHaveLength(0);
    expect(result.stillActive).toHaveLength(1);
    expect((result.stillActive[0].progress as { metersRun: number }).metersRun).toBe(100);
  });
});
