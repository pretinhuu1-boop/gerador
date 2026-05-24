import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import type { ContentBeat } from '../../types/database';

export interface StoriesVerticalProps {
  title: string;
  hook?: string | null;
  beats: ContentBeat[];
  cta?: string | null;
  brand?: string;
  accentColor?: string;
}

const FPS = 30;
const HOOK_SECONDS = 2.5;
const DEFAULT_BEAT_SECONDS = 4;
const CTA_SECONDS = 2.5;

const BG = '#0a0a0e';
const ACCENT_DEFAULT = '#a855f7';

const fadeIn = (frame: number, durationFrames = 12) =>
  interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const slideUp = (frame: number, durationFrames = 18) =>
  interpolate(frame, [0, durationFrames], [40, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

export const StoriesVertical: React.FC<StoriesVerticalProps> = ({
  title,
  hook,
  beats,
  cta,
  brand,
  accentColor = ACCENT_DEFAULT,
}) => {
  const { durationInFrames } = useVideoConfig();
  const cleanBeats = beats.filter((b) => (b.text ?? '').trim().length > 0);

  // Distribute remaining frames across beats based on text length.
  const hookFrames = Math.round(HOOK_SECONDS * FPS);
  const ctaFrames = Math.round(CTA_SECONDS * FPS);
  const beatBudget = Math.max(FPS, durationInFrames - hookFrames - ctaFrames);
  const totalChars = cleanBeats.reduce((s, b) => s + Math.max(20, (b.text || '').length), 0) || 1;

  let cursor = hookFrames;
  const beatRanges = cleanBeats.map((b) => {
    const chars = Math.max(20, (b.text || '').length);
    const frames = Math.max(Math.round(DEFAULT_BEAT_SECONDS * FPS) / 2, Math.round((chars / totalChars) * beatBudget));
    const start = cursor;
    cursor += frames;
    return { start, duration: frames };
  });

  return (
    <AbsoluteFill style={{ background: BG, color: '#f5f5fa', fontFamily: 'Inter, sans-serif' }}>
      <BackgroundGrid accent={accentColor} />

      <Sequence from={0} durationInFrames={hookFrames}>
        <HookPanel text={hook ?? title} accent={accentColor} />
      </Sequence>

      {cleanBeats.map((beat, i) => (
        <Sequence key={i} from={beatRanges[i].start} durationInFrames={beatRanges[i].duration}>
          <BeatPanel beat={beat} index={i} total={cleanBeats.length} accent={accentColor} />
        </Sequence>
      ))}

      <Sequence from={cursor} durationInFrames={ctaFrames}>
        <CtaPanel text={cta ?? 'Segue pro próximo'} brand={brand ?? 'channel os'} accent={accentColor} />
      </Sequence>
    </AbsoluteFill>
  );
};

const BackgroundGrid: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const drift = (frame % 600) / 600;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(at 30% ${20 + drift * 20}%, ${accent}33 0px, transparent 45%),
                     radial-gradient(at 70% 80%, #38f8a722 0px, transparent 50%),
                     radial-gradient(at 50% 100%, ${accent}22 0px, transparent 60%)`,
      }}
    />
  );
};

const HookPanel: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div
        style={{
          opacity: fadeIn(frame),
          transform: `translateY(${slideUp(frame)}px)`,
          textAlign: 'center',
          maxWidth: 880,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 18px',
            borderRadius: 999,
            background: `${accent}22`,
            border: `1px solid ${accent}55`,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: accent,
            marginBottom: 36,
            textTransform: 'uppercase',
          }}
        >
          hook
        </div>
        <h1 style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, margin: 0, color: '#f5f5fa' }}>
          {text}
        </h1>
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
    <AbsoluteFill style={{ padding: 80, justifyContent: 'flex-end' }}>
      {beat.b_roll && (
        <AbsoluteFill style={{ opacity: 0.18, alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              fontSize: 32,
              maxWidth: 720,
              textAlign: 'center',
              color: '#b4b4c8',
              fontStyle: 'italic',
            }}
          >
            {beat.b_roll}
          </div>
        </AbsoluteFill>
      )}
      <div
        style={{
          opacity: fadeIn(frame),
          transform: `translateY(${slideUp(frame, 22)}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontFamily: 'JetBrains Mono, monospace',
            color: accent,
            marginBottom: 12,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          beat {index + 1} / {total}
        </div>
        {beat.caption && (
          <div
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              borderRadius: 20,
              background: `${accent}cc`,
              color: '#0a0a0e',
              fontSize: 56,
              fontWeight: 800,
              marginBottom: 24,
              maxWidth: 880,
            }}
          >
            {beat.caption}
          </div>
        )}
        <p
          style={{
            fontSize: 42,
            lineHeight: 1.35,
            color: '#f5f5fa',
            maxWidth: 880,
            margin: 0,
            fontWeight: 500,
          }}
        >
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
      <div style={{ opacity: fadeIn(frame), textAlign: 'center', maxWidth: 880 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '20px 40px',
            borderRadius: 28,
            border: `2px solid ${accent}`,
            background: `${accent}22`,
            fontSize: 56,
            fontWeight: 800,
            color: '#f5f5fa',
            marginBottom: 36,
          }}
        >
          {text}
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 22,
            color: '#b4b4c8',
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
