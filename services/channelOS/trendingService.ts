import { supabase } from '../supabase';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

export interface TrendingVideo {
  video_id: string;
  title: string;
  channel_id: string;
  channel_title: string;
  published_at: string;
  category_id: string | null;
  tags: string[];
  thumbnail: string | null;
  duration_iso: string | null;
  views: number;
  likes: number;
  comments: number;
}

export interface TrendingSnapshot {
  region_code: string;
  category_id: string | null;
  videos: TrendingVideo[];
  fetched_at: string;
  expires_at: string;
}

/** Reads the most recent cached snapshot from Supabase (RLS allows read).
 *  Falls back to null when nothing cached yet — UI shows a "rodar /trending"
 *  hint pra usuário pedir pro Hermes popular a tabela. */
export async function getLatestTrending(
  region: string = 'BR',
  categoryId: string | null = null,
): Promise<TrendingSnapshot | null> {
  const q = supabase
    .from('trending_snapshots')
    .select('region_code, category_id, videos, fetched_at, expires_at')
    .eq('region_code', region)
    .order('fetched_at', { ascending: false })
    .limit(1);
  const built = categoryId ? q.eq('category_id', categoryId) : q.is('category_id', null);
  const { data, error } = await built.maybeSingle<TrendingSnapshot>();
  if (error) throw new Error(error.message);
  return data ?? null;
}

/** Forces a refresh by calling the gateway tool directly via /v1/trending/fetch.
 *  Returns the freshly-fetched snapshot. */
export async function refreshTrending(
  region: string = 'BR',
  categoryId: string | null = null,
  maxResults: number = 25,
): Promise<TrendingSnapshot> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) throw new Error('Sem sessão — faça login.');
  const res = await fetch(`${GATEWAY_URL}/v1/trending/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      region,
      category_id: categoryId,
      max_results: maxResults,
      force_refresh: true,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { region: string; category_id: string | null; videos: TrendingVideo[]; fetched_at?: string; expires_at?: string };
  return {
    region_code: data.region,
    category_id: data.category_id,
    videos: data.videos,
    fetched_at: data.fetched_at ?? new Date().toISOString(),
    expires_at: data.expires_at ?? new Date(Date.now() + 4 * 3600_000).toISOString(),
  };
}
