/**
 * TopList — 9:16 Top N countdown template (Top 10/Top 5/Top 7).
 * Each beat becomes a numbered card (N → 1) revealed sequentially with a punchy
 * number-scale-in + slide animation. Format-fit for "ranking", "top scary",
 * "richest celebs", "worst plots" niches.
 */
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  spring,
} from 'remotion';
import type { ContentBeat } from '../../types/database';
import { CaptionOverlay, type CaptionWord } from '../components/CaptionOverlay';

export interface TopListProps {
  title: string;
  hook?: string | null;
  beats: ContentBeat[];
  cta?: string | null;
  brand?: string;
  accentColor?: string;
  countdownDirection?: 'desc' | 'asc';
  captions?: CaptionWord[];
}

const FPS = 30;
const TITLE_SECONDS = 2.5;
const ITEM_SECONDS = 3;
const CTA_SECONDS = 2.5;

const BG = '#08080c';
const DEFAULT_ACCENT = '#facc15';

export const TopList: React.FC<TopListProps> = ({
  title,
  hook,
  beats,
  cta,
  brand,
  accentColor = DEFAULT_ACCENT,
  countdownDirection = 'desc',
  captions,
}) => {
  const { durationInFrames } = useVideoConfig();
  const cleanBeats = beats.filter((b) => (b.text ?? '').trim().length > 0);

  const titleFrames = Math.round(TITLE_SECONDS * FPS);
  const ctaFrames = Math.round(CTA_SECONDS * FPS);
  const itemBudget = Math.max(FPS, durationInFrames - titleFrames - ctaFrames);
  const perItem = Math.max(Math.round(ITEM_SECONDS * FPS) / 2, Math.floor(itemBudget / Math.max(1, cleanBeats.length)));

  const total = cleanBeats.length;

  return (
    <AbsoluteFill style={{ background: BG, color: '#f5f5fa', fontFamily: 'Inter, sans-serif' }}>
      <NumberGrid accent={accentColor} />

      <Sequence from={0} durationInFrames={titleFrames}>
        <TitlePanel text={hook ?? title} total={total} accent={accentColor} />
      </Sequence>

      {cleanBeats.map((beat, i) => {
        const rank = countdownDirection === 'desc' ? total - i : i + 1;
        return (
          <Sequence
            key={i}
            from={titleFrames + i * perItem}
            durationInFrames={perItem}
          >
            <ItemPanel beat={beat} rank={rank} total={total} accent={accentColor} />
          </Sequence>
        );
      })}

      <Sequence from={titleFrames + total * perItem} durationInFrames={ctaFrames}>
        <CtaPanel text={cta ?? 'Qual te surpreendeu?'} brand={brand ?? 'channel os'} accent={accentColor} />
      </Sequence>

      {captions && captions.length > 0 && (
        <CaptionOverlay words={captions} accent={accentColor} />
      )}
    </AbsoluteFill>
  );
};

const NumberGrid: React.FC<{ accent: string }> = ({ accent }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(at 50% 100%, ${accent}1a 0px, transparent 50%),
                   linear-gradient(180deg, #0a0a0e 0%, #050507 100%)`,
    }}
  />
);

const TitlePanel: React.FC<{ text: string; total: number; accent: string }> = ({ text, total, accent }) => {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps: FPS, config: { damping: 12, mass: 0.8 } });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ textAlign: 'center', transform: `scale(${scale})` }}>
        <div
          style={{
            fontSize: 32,
            color: accent,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 24,
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          top {total}
        </div>
        <h1
          style={{
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.05,
            margin: 0,
            color: '#f5f5fa',
            maxWidth: 920,
          }}
        >
          {text}
        </h1>
      </div>
    </AbsoluteFill>
  );
};

const ItemPanel: React.FC<{ beat: ContentBeat; rank: number; total: number; accent: string }> = ({
  beat,
  rank,
  total,
  accent,
}) => {
  const frame = useCurrentFrame();
  const numberSpring = spring({ frame, fps: FPS, config: { damping: 10, mass: 0.6 } });
  const slide = interpolate(frame, [0, 18], [60, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });

  const isHero = rank === 1;

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ textAlign: 'center', width: 920 }}>
        <div
          style={{
            transform: `scale(${numberSpring})`,
            fontSize: isHero ? 360 : 280,
            fontWeight: 900,
            color: isHero ? accent : '#1a1a1f',
            WebkitTextStroke: isHero ? 'none' : `4px ${accent}`,
            lineHeight: 1,
            fontFamily: 'Inter, sans-serif',
            marginBottom: 12,
          }}
        >
          #{rank}
        </div>
        <div style={{ opacity, transform: `translateY(${slide}px)` }}>
          {beat.caption && (
            <h2
              style={{
                fontSize: 68,
                fontWeight: 800,
                color: '#f5f5fa',
                margin: '0 0 18px 0',
                lineHeight: 1.1,
              }}
            >
              {beat.caption}
            </h2>
          )}
          <p
            style={{
              fontSize: 36,
              lineHeight: 1.4,
              color: '#cfd2d6',
              maxWidth: 880,
              margin: '0 auto',
              fontWeight: 500,
            }}
          >
            {beat.text}
          </p>
          <div
            style={{
              marginTop: 28,
              fontSize: 18,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#6b7280',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {total - rank + 1} / {total}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const CtaPanel: React.FC<{ text: string; brand: string; accent: string }> = ({ text, brand, accent }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ opacity, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '24px 44px',
            borderRadius: 28,
            border: `3px solid ${accent}`,
            background: `${accent}22`,
            fontSize: 54,
            fontWeight: 800,
            color: '#f5f5fa',
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
