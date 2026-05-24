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
