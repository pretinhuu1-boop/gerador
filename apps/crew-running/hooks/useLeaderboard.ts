import { useEffect, useState } from 'react';
import { getSupabase } from '../services/supabaseClient';

export interface LeaderboardEntry {
  userId: string;
  runnerName: string;
  crewSlug: string;
  avatarUrl?: string;
  totalKm: number;
  totalInk: number;
  runsCount: number;
  rank: number;
}

const mapRow = (row: Record<string, unknown>): LeaderboardEntry => ({
  userId: row.user_id as string,
  runnerName: row.runner_name as string,
  crewSlug: row.crew_slug as string,
  avatarUrl: (row.avatar_url as string) || undefined,
  totalKm: Number(row.total_km),
  totalInk: Number(row.total_ink),
  runsCount: Number(row.runs_count),
  rank: Number(row.rank),
});

export const useZoneLeaderboard = (zoneId: string, weekKey: string) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setEntries([]); return; }
    setLoading(true);
    sb.from('zone_leaderboard')
      .select('*')
      .eq('zone_id', zoneId)
      .eq('week_key', weekKey)
      .order('rank', { ascending: true })
      .limit(10)
      .then(({ data }) => {
        setEntries((data ?? []).map(mapRow));
        setLoading(false);
      });
  }, [zoneId, weekKey]);

  return { entries, loading };
};

export const useCrewTopRunners = (crewSlug: string, weekKey: string, limit = 3) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setEntries([]); return; }
    setLoading(true);
    sb.from('zone_leaderboard')
      .select('*')
      .eq('crew_slug', crewSlug)
      .eq('week_key', weekKey)
      .order('total_ink', { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        setEntries((data ?? []).map(mapRow));
        setLoading(false);
      });
  }, [crewSlug, weekKey, limit]);

  return { entries, loading };
};
