import { differenceInDays, parseISO } from 'date-fns';
import type { ScoreBreakdown } from '../../types/database';
import type { YouTubeChannel, YouTubeVideo } from './youtubeApi';
import { parseIsoDuration } from './youtubeApi';

// Channel OS Scout v1 — heuristic scoring.
// All sub-scores are 0..1. Final score is weighted, scaled 0..100.

interface InputBundle {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
}

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

function scoreEngagement(videos: YouTubeVideo[]): { value: number; rate: number } {
  if (!videos.length) return { value: 0, rate: 0 };
  let totalEngagementRate = 0;
  let counted = 0;
  for (const v of videos) {
    const views = Number(v.statistics?.viewCount ?? 0);
    if (views < 100) continue;
    const likes = Number(v.statistics?.likeCount ?? 0);
    const comments = Number(v.statistics?.commentCount ?? 0);
    totalEngagementRate += (likes + comments) / views;
    counted += 1;
  }
  if (!counted) return { value: 0, rate: 0 };
  const avg = totalEngagementRate / counted;
  // 5% engagement ≈ excellent; 0.5% ≈ floor. Log curve.
  const value = clamp(Math.log10(1 + avg * 200) / Math.log10(1 + 200 * 0.05));
  return { value, rate: avg };
}

function scoreConsistency(videos: YouTubeVideo[]): { value: number; weeklyCadence: number } {
  if (videos.length < 3) return { value: 0, weeklyCadence: 0 };
  const dates = videos
    .map((v) => parseISO(v.snippet.publishedAt).getTime())
    .sort((a, b) => b - a);
  const newest = dates[0];
  const oldest = dates[dates.length - 1];
  const spanDays = Math.max(1, (newest - oldest) / 86_400_000);
  const cadencePerWeek = (videos.length / spanDays) * 7;
  // Ideal: 2-4 videos/week. <0.5 fades, >7 saturates.
  let value: number;
  if (cadencePerWeek < 0.5) value = cadencePerWeek / 0.5 * 0.4;
  else if (cadencePerWeek <= 4) value = 0.4 + ((cadencePerWeek - 0.5) / 3.5) * 0.6;
  else value = clamp(1 - (cadencePerWeek - 4) / 10, 0.5, 1);
  return { value: clamp(value), weeklyCadence: cadencePerWeek };
}

function scoreGrowthProxy(channel: YouTubeChannel): { value: number; viewsPerSubscriber: number } {
  const subs = Number(channel.statistics.subscriberCount ?? 0);
  const views = Number(channel.statistics.viewCount ?? 0);
  const videoCount = Number(channel.statistics.videoCount ?? 1);
  const ratio = views / Math.max(1, subs);
  // Healthy faceless channels: views ≈ 20-100x sub count (broad reach).
  const value = clamp(Math.log10(1 + ratio) / Math.log10(101));
  // Also penalize ghost channels w/ <10 videos
  const volumeMod = clamp(Math.min(1, videoCount / 20));
  return { value: clamp(value * 0.7 + volumeMod * 0.3), viewsPerSubscriber: ratio };
}

function scoreCompetitionGap(videos: YouTubeVideo[]): { value: number; topPerformerRatio: number } {
  if (videos.length < 3) return { value: 0.4, topPerformerRatio: 1 };
  const views = videos.map((v) => Number(v.statistics?.viewCount ?? 0)).sort((a, b) => b - a);
  const top = views[0];
  const median = views[Math.floor(views.length / 2)] || 1;
  const ratio = top / Math.max(1, median);
  // High ratio = at least one viral hit ⇒ niche has upside but channel is inconsistent.
  // Sweet spot ≈ 3-10x (heuristic).
  let value: number;
  if (ratio < 2) value = 0.3;
  else if (ratio <= 10) value = 0.4 + ((ratio - 2) / 8) * 0.6;
  else value = clamp(1 - (ratio - 10) / 40, 0.5, 1);
  return { value: clamp(value), topPerformerRatio: ratio };
}

function scoreMonetization(channel: YouTubeChannel, videos: YouTubeVideo[]): { value: number } {
  const subs = Number(channel.statistics.subscriberCount ?? 0);
  // YPP threshold: 1k subs + 4k watch hours/year (proxy: avg duration × views).
  const subsPart = clamp(subs / 1000);
  const avgDur = videos.length
    ? videos.reduce((s, v) => s + parseIsoDuration(v.contentDetails?.duration ?? 'PT0S'), 0) /
      videos.length
    : 0;
  // Faceless long-form needs ≥8 min for mid-roll. Shorts/very short content scores lower for ads.
  const durPart = clamp(Math.min(1, avgDur / 480));
  return { value: clamp(subsPart * 0.5 + durPart * 0.5) };
}

const RECENCY_WEEKS_HALF_LIFE = 8;
function recencyFactor(channel: YouTubeChannel, videos: YouTubeVideo[]): number {
  if (!videos.length) return 0.3;
  const newest = Math.max(
    ...videos.map((v) => parseISO(v.snippet.publishedAt).getTime()),
    parseISO(channel.snippet.publishedAt).getTime(),
  );
  const daysSince = differenceInDays(Date.now(), newest);
  const weeks = daysSince / 7;
  return Math.pow(0.5, weeks / RECENCY_WEEKS_HALF_LIFE);
}

export interface ScoutScore {
  total: number;
  breakdown: ScoreBreakdown;
  signals: {
    engagementRate: number;
    weeklyCadence: number;
    viewsPerSubscriber: number;
    topPerformerRatio: number;
    daysSinceLast: number;
  };
}

export function computeChannelScore({ channel, videos }: InputBundle): ScoutScore {
  const eng = scoreEngagement(videos);
  const cons = scoreConsistency(videos);
  const growth = scoreGrowthProxy(channel);
  const gap = scoreCompetitionGap(videos);
  const mon = scoreMonetization(channel, videos);
  const recency = recencyFactor(channel, videos);

  // Weighted sum
  const weighted =
    growth.value * 0.28 +
    eng.value * 0.22 +
    cons.value * 0.18 +
    gap.value * 0.16 +
    mon.value * 0.16;

  const adjusted = weighted * (0.6 + 0.4 * recency); // dead channels dampened
  const total = Math.round(clamp(adjusted) * 100 * 100) / 100;

  const daysSinceLast = videos.length
    ? differenceInDays(
        Date.now(),
        Math.max(...videos.map((v) => parseISO(v.snippet.publishedAt).getTime())),
      )
    : 9999;

  return {
    total,
    breakdown: {
      growth: Math.round(growth.value * 100),
      engagement: Math.round(eng.value * 100),
      consistency: Math.round(cons.value * 100),
      monetization_potential: Math.round(mon.value * 100),
      competition_gap: Math.round(gap.value * 100),
    },
    signals: {
      engagementRate: eng.rate,
      weeklyCadence: cons.weeklyCadence,
      viewsPerSubscriber: growth.viewsPerSubscriber,
      topPerformerRatio: gap.topPerformerRatio,
      daysSinceLast,
    },
  };
}
