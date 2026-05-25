// Lightweight YouTube Data API v3 client used by the Scout MVP.
// Requires VITE_YOUTUBE_API_KEY (a public, restricted key).

const API = 'https://www.googleapis.com/youtube/v3';
const KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

type YouTubeError = { code: number; message: string };

const apiCall = async <T,>(path: string, params: Record<string, string>): Promise<T> => {
  if (!KEY) throw new Error('VITE_YOUTUBE_API_KEY ausente — configure no .env.local');
  const qs = new URLSearchParams({ ...params, key: KEY });
  const res = await fetch(`${API}/${path}?${qs.toString()}`);
  const json = await res.json();
  if (!res.ok) {
    const err = json.error as YouTubeError;
    throw new Error(`YouTube API ${err.code}: ${err.message}`);
  }
  return json as T;
};

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: { default?: { url: string }; high?: { url: string } };
    country?: string;
    defaultLanguage?: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
    hiddenSubscriberCount?: boolean;
  };
  contentDetails?: {
    relatedPlaylists: { uploads: string };
  };
  topicDetails?: {
    topicCategories?: string[];
  };
  brandingSettings?: {
    channel?: { keywords?: string };
  };
}

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: { default?: { url: string }; medium?: { url: string }; high?: { url: string } };
    channelId: string;
    channelTitle: string;
    tags?: string[];
  };
  statistics?: {
    viewCount: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails?: {
    duration: string;
  };
}

const CHANNEL_HANDLE_RE = /^@([A-Za-z0-9._-]+)$/;
const CHANNEL_ID_RE = /^UC[A-Za-z0-9_-]{20,}$/;

export async function resolveChannel(query: string): Promise<YouTubeChannel> {
  const trimmed = query.trim();

  if (CHANNEL_ID_RE.test(trimmed)) {
    const j = await apiCall<{ items: YouTubeChannel[] }>('channels', {
      part: 'snippet,statistics,contentDetails,topicDetails,brandingSettings',
      id: trimmed,
    });
    if (!j.items?.[0]) throw new Error(`Canal ${trimmed} não encontrado`);
    return j.items[0];
  }

  if (CHANNEL_HANDLE_RE.test(trimmed)) {
    const j = await apiCall<{ items: YouTubeChannel[] }>('channels', {
      part: 'snippet,statistics,contentDetails,topicDetails,brandingSettings',
      forHandle: trimmed,
    });
    if (!j.items?.[0]) throw new Error(`Handle ${trimmed} não resolveu`);
    return j.items[0];
  }

  // Fallback: search and grab top match
  const s = await apiCall<{ items: Array<{ id: { channelId: string } }> }>('search', {
    part: 'snippet',
    q: trimmed,
    type: 'channel',
    maxResults: '1',
  });
  const channelId = s.items?.[0]?.id?.channelId;
  if (!channelId) throw new Error(`Nenhum canal encontrado para "${trimmed}"`);
  const j = await apiCall<{ items: YouTubeChannel[] }>('channels', {
    part: 'snippet,statistics,contentDetails,topicDetails,brandingSettings',
    id: channelId,
  });
  if (!j.items?.[0]) throw new Error(`Canal ${channelId} inacessível`);
  return j.items[0];
}

export async function listRecentVideos(channel: YouTubeChannel, max = 12): Promise<YouTubeVideo[]> {
  const uploadsId = channel.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) return [];

  const playlist = await apiCall<{
    items: Array<{ contentDetails: { videoId: string } }>;
  }>('playlistItems', {
    part: 'contentDetails',
    playlistId: uploadsId,
    maxResults: String(max),
  });
  const ids = playlist.items.map((it) => it.contentDetails.videoId).join(',');
  if (!ids) return [];

  const videos = await apiCall<{ items: YouTubeVideo[] }>('videos', {
    part: 'snippet,statistics,contentDetails',
    id: ids,
  });
  return videos.items;
}

// ISO 8601 duration → seconds (PT1H2M3S)
export function parseIsoDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, h, mn, s] = m;
  return (+h || 0) * 3600 + (+mn || 0) * 60 + (+s || 0);
}

// ============================================================
// Discovery (search.list + bulk channels)
// ============================================================

export interface DiscoveryResult {
  channel_id: string;
  title: string;
  handle: string | null;
  description: string;
  country: string | null;
  language: string | null;
  subscriber_count: number;
  view_count: number;
  video_count: number;
  thumbnail_url: string | null;
}

export interface DiscoveryParams {
  query: string;
  region?: string;
  language?: string;
  minSubs?: number;
  maxSubs?: number;
  maxResults?: number;
  order?: 'relevance' | 'viewCount' | 'rating' | 'videoCount' | 'date';
}

export async function discoverChannels(p: DiscoveryParams): Promise<DiscoveryResult[]> {
  if (!KEY) throw new Error('VITE_YOUTUBE_API_KEY ausente');
  const search = await apiCall<{
    items: Array<{ id: { channelId: string }; snippet: YouTubeChannel['snippet'] }>;
  }>('search', {
    part: 'snippet',
    q: p.query,
    type: 'channel',
    maxResults: String(Math.min(50, (p.maxResults ?? 12) * 2)),
    order: p.order ?? 'relevance',
    ...(p.region ? { regionCode: p.region.toUpperCase() } : {}),
    ...(p.language ? { relevanceLanguage: p.language } : {}),
  });

  const ids = search.items
    .map((it) => it.id?.channelId)
    .filter((id): id is string => Boolean(id));
  if (!ids.length) return [];

  // Bulk resolve (max 50 ids per call — we have ≤24)
  const full = await apiCall<{ items: YouTubeChannel[] }>('channels', {
    part: 'snippet,statistics',
    id: ids.join(','),
  });

  const minSubs = p.minSubs ?? 0;
  const maxSubs = p.maxSubs ?? Number.MAX_SAFE_INTEGER;
  return full.items
    .map((c) => ({
      channel_id: c.id,
      title: c.snippet.title,
      handle: c.snippet.customUrl ?? null,
      description: (c.snippet.description ?? '').slice(0, 240),
      country: c.snippet.country ?? null,
      language: c.snippet.defaultLanguage ?? null,
      subscriber_count: Number(c.statistics.subscriberCount ?? 0),
      view_count: Number(c.statistics.viewCount ?? 0),
      video_count: Number(c.statistics.videoCount ?? 0),
      thumbnail_url: c.snippet.thumbnails.high?.url ?? c.snippet.thumbnails.default?.url ?? null,
    }))
    .filter((r) => r.subscriber_count >= minSubs && r.subscriber_count <= maxSubs)
    .sort((a, b) => b.subscriber_count - a.subscriber_count)
    .slice(0, p.maxResults ?? 12);
}
