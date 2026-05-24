import { supabase } from '../supabase';
import type { Channel, ScoutRun } from '../../types/database';
import { listRecentVideos, resolveChannel, type YouTubeChannel, type YouTubeVideo } from './youtubeApi';
import { computeChannelScore, type ScoutScore } from './scoring';

export interface ScoutResult {
  channelRow: Channel;
  raw: YouTubeChannel;
  videos: YouTubeVideo[];
  score: ScoutScore;
}

export async function scoutAndPersist(
  userId: string,
  query: string,
  options: { runId?: string } = {},
): Promise<ScoutResult> {
  const raw = await resolveChannel(query);
  const videos = await listRecentVideos(raw, 15);
  const score = computeChannelScore({ channel: raw, videos });

  const subscriberCount = Number(raw.statistics.subscriberCount ?? 0);
  const viewCount = Number(raw.statistics.viewCount ?? 0);
  const videoCount = Number(raw.statistics.videoCount ?? 0);

  const { data: upsert, error } = await supabase
    .from('channels')
    .upsert(
      {
        user_id: userId,
        platform: 'youtube',
        platform_id: raw.id,
        handle: raw.snippet.customUrl ?? null,
        title: raw.snippet.title,
        description: raw.snippet.description ?? null,
        thumbnail_url: raw.snippet.thumbnails.high?.url ?? raw.snippet.thumbnails.default?.url ?? null,
        country: raw.snippet.country ?? null,
        language: raw.snippet.defaultLanguage ?? null,
        subscriber_count: subscriberCount,
        view_count: viewCount,
        video_count: videoCount,
        score: score.total,
        score_breakdown: score.breakdown,
        last_fetched_at: new Date().toISOString(),
        status: 'tracking',
      },
      { onConflict: 'user_id,platform,platform_id' },
    )
    .select()
    .single<Channel>();

  if (error) throw new Error(`Falha ao salvar canal: ${error.message}`);

  // metric snapshot
  await supabase.from('channel_metrics').insert({
    channel_id: upsert.id,
    subscriber_count: subscriberCount,
    view_count: viewCount,
    video_count: videoCount,
    score: score.total,
    extra: { signals: score.signals },
  });

  // videos
  if (videos.length) {
    await supabase.from('channel_videos').upsert(
      videos.map((v) => ({
        channel_id: upsert.id,
        platform_video_id: v.id,
        title: v.snippet.title,
        description: v.snippet.description?.slice(0, 1000) ?? null,
        thumbnail_url: v.snippet.thumbnails.high?.url ?? v.snippet.thumbnails.medium?.url ?? null,
        published_at: v.snippet.publishedAt,
        duration_seconds: v.contentDetails?.duration
          ? parseIsoDurationLocal(v.contentDetails.duration)
          : null,
        view_count: Number(v.statistics?.viewCount ?? 0),
        like_count: Number(v.statistics?.likeCount ?? 0),
        comment_count: Number(v.statistics?.commentCount ?? 0),
        extra: { tags: v.snippet.tags ?? [] },
        fetched_at: new Date().toISOString(),
      })),
      { onConflict: 'channel_id,platform_video_id' },
    );
  }

  if (options.runId) {
    await supabase.from('scout_run_channels').upsert({
      run_id: options.runId,
      channel_id: upsert.id,
      score: score.total,
      rank: 1,
    });
  }

  return { channelRow: upsert, raw, videos, score };
}

export async function createScoutRun(userId: string, query: string): Promise<ScoutRun> {
  const { data, error } = await supabase
    .from('scout_runs')
    .insert({ user_id: userId, query, status: 'running', started_at: new Date().toISOString() })
    .select()
    .single<ScoutRun>();
  if (error) throw new Error(`Falha ao criar run: ${error.message}`);
  return data;
}

export async function finalizeScoutRun(
  runId: string,
  patch: { status: 'done' | 'error'; results_count?: number; error?: string },
) {
  await supabase
    .from('scout_runs')
    .update({ ...patch, ended_at: new Date().toISOString() })
    .eq('id', runId);
}

export async function listTrackedChannels(userId: string): Promise<Channel[]> {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'tracking')
    .order('score', { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

function parseIsoDurationLocal(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
}
