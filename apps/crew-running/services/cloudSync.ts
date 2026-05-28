// Cloud-side writes mirroring localStorage entities to Supabase.
// Every function is a no-op when there is no active session, so call sites
// can fire-and-forget without branching on connectivity. RLS keeps writes
// scoped to auth.uid(); we still pass user_id explicitly so the caller can
// observe which session the write went under.

import type { BadgeId, RunnerProgress, RunHistoryStats } from '../data/gamification';
import type { RunSnapshot } from './runTracker';
import { ensureAnonSession, getSupabase, isSupabaseConfigured } from './supabaseClient';

type CloudResult = { ok: true; userId: string } | { ok: false; reason: string };

const requireSession = async (): Promise<{ userId: string } | { reason: string }> => {
  if (!isSupabaseConfigured()) return { reason: 'not-configured' };
  const sb = getSupabase();
  if (!sb) return { reason: 'no-client' };
  const { data } = await sb.auth.getSession();
  const fromActiveSession = data.session?.user?.id;
  if (fromActiveSession) return { userId: fromActiveSession };
  // Fallback: if anonymous sign-ins are enabled in the project, this gives
  // us a session. If they are not, it returns null and we bail.
  const anonId = await ensureAnonSession();
  if (!anonId) return { reason: 'no-session' };
  return { userId: anonId };
};

export const pushRun = async (snapshot: RunSnapshot): Promise<CloudResult> => {
  const guard = await requireSession();
  if ('reason' in guard) return { ok: false, reason: guard.reason };
  const sb = getSupabase()!;

  const { error } = await sb.from('runs').insert({
    user_id: guard.userId,
    started_at: snapshot.startedAt,
    elapsed_ms: snapshot.elapsedMs,
    total_meters: snapshot.totalMeters,
    meters_in_territory: snapshot.metersInTerritory,
    points: snapshot.points as unknown as never,
    touched_spot_ids: snapshot.touchedSpotIds,
    crew_slug: snapshot.crewSlug ?? null,
    home_zone_id: snapshot.homeZoneId ?? null,
    closed_loop: snapshot.closedLoop,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true, userId: guard.userId };
};

export const pushRunnerProgress = async (progress: RunnerProgress): Promise<CloudResult> => {
  const guard = await requireSession();
  if ('reason' in guard) return { ok: false, reason: guard.reason };
  const sb = getSupabase()!;

  const { error } = await sb.from('runner_progress').upsert(
    {
      user_id: guard.userId,
      xp: progress.xp,
      level: progress.level,
      streak_weeks: progress.streakWeeks,
      last_run_at: progress.lastRunAt,
      freezes_available: progress.freezesAvailable,
      ink_per_zone: progress.inkPerZone as unknown as never,
      ink_updated_at: progress.inkUpdatedAt,
      patches_owned: progress.patchesOwned,
      week_key: progress.weekKey,
      runs_this_week: progress.runsThisWeek,
    },
    { onConflict: 'user_id' },
  );
  if (error) return { ok: false, reason: error.message };
  return { ok: true, userId: guard.userId };
};

export const pushRunHistoryStats = async (history: RunHistoryStats): Promise<CloudResult> => {
  const guard = await requireSession();
  if ('reason' in guard) return { ok: false, reason: guard.reason };
  const sb = getSupabase()!;

  const { error } = await sb.from('run_history_stats').upsert(
    {
      user_id: guard.userId,
      total_runs: history.totalRuns,
      total_km: history.totalKm,
      km_this_week: history.kmThisWeek,
      night_runs: history.nightRuns,
      invasions_succeeded: history.invasionsSucceeded,
      unique_spots_touched: history.uniqueSpotsTouched,
      captain_weeks: history.captainWeeks,
      weekly_top_three_count: history.weeklyTopThreeCount,
      solo_territory_km: history.soloTerritoryKm,
    },
    { onConflict: 'user_id' },
  );
  if (error) return { ok: false, reason: error.message };
  return { ok: true, userId: guard.userId };
};

export const pushBadgeUnlocks = async (badges: BadgeId[]): Promise<CloudResult> => {
  if (badges.length === 0) {
    return { ok: true, userId: '' };
  }
  const guard = await requireSession();
  if ('reason' in guard) return { ok: false, reason: guard.reason };
  const sb = getSupabase()!;

  const rows = badges.map((badge_id) => ({ user_id: guard.userId, badge_id }));
  // upsert with default-conflict suppression prevents duplicate writes when
  // the same badge unlocks again in a different session.
  const { error } = await sb.from('badge_unlocks').upsert(rows, {
    onConflict: 'user_id,badge_id',
    ignoreDuplicates: true,
  });
  if (error) return { ok: false, reason: error.message };
  return { ok: true, userId: guard.userId };
};

export type FinalizedRunSync = {
  snapshot: RunSnapshot;
  progress: RunnerProgress;
  history: RunHistoryStats;
  newlyUnlocked: BadgeId[];
};

export const pushFinalizedRun = async (
  payload: FinalizedRunSync,
): Promise<Array<{ entity: string; result: CloudResult }>> => {
  const results = await Promise.all([
    pushRun(payload.snapshot).then((result) => ({ entity: 'runs', result })),
    pushRunnerProgress(payload.progress).then((result) => ({ entity: 'runner_progress', result })),
    pushRunHistoryStats(payload.history).then((result) => ({ entity: 'run_history_stats', result })),
    pushBadgeUnlocks(payload.newlyUnlocked).then((result) => ({ entity: 'badge_unlocks', result })),
  ]);
  return results;
};
