/**
 * RedditStories — 9:16 faceless template for narrated Reddit posts / scary stories /
 * confession threads. Renders a post header (subreddit + author + title) then beats
 * as scrolling highlighted text over a subtle gradient. Inspired by the
 * `reddit-to-tiktok-remotion` community template + the canonical "AITA voiceover"
 * pattern that dominates the niche.
 */
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import type { ContentBeat } from '../../types/database';
import { CaptionOverlay, type CaptionWord } from '../components/CaptionOverlay';
import { BeatAudioTrack, type BeatAudioBeat } from '../components/BeatAudioTrack';

export interface RedditStoriesProps {
  title: string;
  hook?: string | null;
  beats: ContentBeat[];
  cta?: string | null;
  brand?: string;
  accentColor?: string;
  subreddit?: string;
  author?: string;
  upvotes?: number;
  commentCount?: number;
  captions?: CaptionWord[];
  hookAudioUrl?: string | null;
}

const FPS = 30;
const HEADER_SECONDS = 3.5;
const DEFAULT_BEAT_SECONDS = 4;
const CTA_SECONDS = 2.5;

const ORANGE = '#ff4500';
const BG = '#050507';

const fadeIn = (frame: number, durationFrames = 14) =>
  interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

export const RedditStories: React.FC<RedditStoriesProps> = ({
  title,
  hook,
  beats,
  cta,
  brand,
  accentColor = ORANGE,
  subreddit = 'r/AmItheAsshole',
  author = 'u/throwaway_2026',
  upvotes = 12400,
  commentCount = 387,
  captions,
  hookAudioUrl,
}) => {
  const { durationInFrames } = useVideoConfig();
  const cleanBeats = beats.filter((b) => (b.text ?? '').trim().length > 0);

  const headerFrames = Math.round(HEADER_SECONDS * FPS);
  const ctaFrames = Math.round(CTA_SECONDS * FPS);
  const beatBudget = Math.max(FPS, durationInFrames - headerFrames - ctaFrames);
  const totalChars = cleanBeats.reduce((s, b) => s + Math.max(20, (b.text ?? '').length), 0) || 1;

  let cursor = headerFrames;
  const ranges = cleanBeats.map((b) => {
    const chars = Math.max(20, (b.text ?? '').length);
    const frames = Math.max(
      Math.round((DEFAULT_BEAT_SECONDS * FPS) / 2),
      Math.round((chars / totalChars) * beatBudget),
    );
    const start = cursor;
    cursor += frames;
    return { start, duration: frames };
  });

  return (
    <AbsoluteFill style={{ background: BG, color: '#f5f5fa', fontFamily: 'Inter, sans-serif' }}>
      <SubtleBackground accent={accentColor} />

      <Sequence from={0} durationInFrames={headerFrames}>
        <PostHeader
          subreddit={subreddit}
          author={author}
          title={hook ?? title}
          upvotes={upvotes}
          commentCount={commentCount}
          accent={accentColor}
        />
      </Sequence>

      {cleanBeats.map((beat, i) => (
        <Sequence key={i} from={ranges[i].start} durationInFrames={ranges[i].duration}>
          <BeatPanel beat={beat} index={i} total={cleanBeats.length} accent={accentColor} />
        </Sequence>
      ))}

      <Sequence from={cursor} durationInFrames={ctaFrames}>
        <CtaPanel text={cta ?? 'Comenta o que faria'} brand={brand ?? 'channel os'} accent={accentColor} />
      </Sequence>

      <BeatAudioTrack beats={cleanBeats as BeatAudioBeat[]} hookAudioUrl={hookAudioUrl} />

      {captions && captions.length > 0 && (
        <CaptionOverlay words={captions} accent={accentColor} />
      )}
    </AbsoluteFill>
  );
};

const SubtleBackground: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const drift = (frame % 900) / 900;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(at 50% ${30 + drift * 10}%, ${accent}1a 0px, transparent 55%),
                     linear-gradient(180deg, #0a0a0e 0%, #050507 100%)`,
      }}
    />
  );
};

const PostHeader: React.FC<{
  subreddit: string;
  author: string;
  title: string;
  upvotes: number;
  commentCount: number;
  accent: string;
}> = ({ subreddit, author, title, upvotes, commentCount, accent }) => {
  const frame = useCurrentFrame();
  const fmt = new Intl.NumberFormat('en-US').format;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <div
        style={{
          opacity: fadeIn(frame),
          width: 960,
          padding: 36,
          borderRadius: 24,
          background: '#1a1a1f',
          border: '1px solid #2a2a32',
          boxShadow: '0 16px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 24,
              color: '#fff',
            }}
          >
            r
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{subreddit}</div>
            <div style={{ fontSize: 18, color: '#9aa0a6' }}>Posted by {author} · 14h</div>
          </div>
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.15, margin: 0, color: '#f5f5fa' }}>
          {title}
        </h1>
        <div style={{ marginTop: 28, display: 'flex', gap: 32, fontSize: 22, color: '#cfd2d6' }}>
          <span>▲ {fmt(upvotes)}</span>
          <span>💬 {fmt(commentCount)}</span>
          <span>↗ Share</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const BeatPanel: React.FC<{
  beat: ContentBeat;
  index: number;
  total: number;
  accent: string;
}> = ({ beat, index, total, accent }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ padding: 80, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 920, opacity: fadeIn(frame), textAlign: 'left' }}>
        <div
          style={{
            fontSize: 18,
            color: accent,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 18,
            letterSpacing: 1.5,
          }}
        >
          parte {index + 1} de {total}
        </div>
        {beat.caption && (
          <div
            style={{
              display: 'inline-block',
              padding: '10px 22px',
              borderRadius: 16,
              background: `${accent}33`,
              border: `1px solid ${accent}66`,
              fontSize: 28,
              color: accent,
              marginBottom: 24,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {beat.caption}
          </div>
        )}
        <p style={{ fontSize: 48, lineHeight: 1.4, color: '#f5f5fa', margin: 0, fontWeight: 500 }}>
          {beat.text}
        </p>
      </div>
    </AbsoluteFill>
  );
};

const CtaPanel: React.FC<{ text: string; brand: string; accent: string }> = ({ text, brand, accent }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ opacity: fadeIn(frame), textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '24px 44px',
            borderRadius: 28,
            background: accent,
            color: '#fff',
            fontSize: 54,
            fontWeight: 800,
            marginBottom: 28,
          }}
        >
          {text}
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 22,
            color: '#9aa0a6',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {brand}
        </div>
      </div>
    </AbsoluteFill>
  );
};
