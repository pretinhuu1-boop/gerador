/**
 * Audiogram — 9:16 podcast/ASMR clip with audio waveform reacting to the narration.
 * If an `audioSrc` is provided we use Remotion's <Audio> + visualizeAudio for true
 * FFT bars; otherwise we render a procedural pseudo-waveform that still sells the
 * "voice clip" feel. Beats render as scrolling caption cards over the waveform.
 */
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import type { ContentBeat } from '../../types/database';
import { CaptionOverlay, type CaptionWord } from '../components/CaptionOverlay';
import { BeatAudioTrack, type BeatAudioBeat } from '../components/BeatAudioTrack';
import { computeBeatRanges, endOfBeats } from '../components/beatRanges';

export interface AudiogramProps {
  title: string;
  hook?: string | null;
  beats: ContentBeat[];
  cta?: string | null;
  brand?: string;
  accentColor?: string;
  audioSrc?: string | null;
  speakerLabel?: string;
  captions?: CaptionWord[];
  hookAudioUrl?: string | null;
}

const FPS = 30;
const HOOK_SECONDS = 2.5;
const DEFAULT_BEAT_SECONDS = 4;
const CTA_SECONDS = 2;

const BG = '#06060a';
const DEFAULT_ACCENT = '#22d3a8';
const BAR_COUNT = 32;

export const Audiogram: React.FC<AudiogramProps> = ({
  title,
  hook,
  beats,
  cta,
  brand,
  accentColor = DEFAULT_ACCENT,
  audioSrc,
  speakerLabel,
  captions,
  hookAudioUrl,
}) => {
  const { durationInFrames, fps } = useVideoConfig();
  const cleanBeats = beats.filter((b) => (b.text ?? '').trim().length > 0);

  const hookFrames = Math.round(HOOK_SECONDS * fps);
  const ctaFrames = Math.round(CTA_SECONDS * fps);
  const ranges = computeBeatRanges(cleanBeats, {
    totalFrames: durationInFrames,
    leadingFrames: hookFrames,
    trailingFrames: ctaFrames,
    fps,
    fallbackMinSeconds: DEFAULT_BEAT_SECONDS,
  });
  const cursor = endOfBeats(ranges, hookFrames);

  return (
    <AbsoluteFill style={{ background: BG, color: '#f5f5fa', fontFamily: 'Inter, sans-serif' }}>
      <GradientOrb accent={accentColor} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <WaveformBars accent={accentColor} audioSrc={audioSrc ?? hookAudioUrl ?? null} />
      </AbsoluteFill>

      <Sequence from={0} durationInFrames={hookFrames}>
        <HookPanel text={hook ?? title} accent={accentColor} speakerLabel={speakerLabel} />
      </Sequence>

      {cleanBeats.map((beat, i) => (
        <Sequence key={i} from={ranges[i].start} durationInFrames={ranges[i].duration}>
          <BeatCaption beat={beat} index={i} total={cleanBeats.length} accent={accentColor} />
        </Sequence>
      ))}

      <Sequence from={cursor} durationInFrames={ctaFrames}>
        <CtaPanel text={cta ?? 'Ouve até o fim'} brand={brand ?? 'channel os'} accent={accentColor} />
      </Sequence>

      <BeatAudioTrack
        beats={cleanBeats as BeatAudioBeat[]}
        hookAudioUrl={hookAudioUrl ?? audioSrc ?? null}
      />

      {captions && captions.length > 0 && (
        <CaptionOverlay words={captions} accent={accentColor} bottomOffset={180} />
      )}
    </AbsoluteFill>
  );
};

const GradientOrb: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const pulse = (Math.sin(frame / 30) + 1) / 2;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(at 50% 55%, ${accent}${pulse > 0.5 ? '33' : '22'} 0px, transparent 50%),
                     linear-gradient(180deg, #0a0a14 0%, #050507 100%)`,
      }}
    />
  );
};

// Hooks can't be conditional → split into two components. WaveformBarsFromAudio
// only mounts when audioSrc is present, so useAudioData never gets an empty URL.
const WaveformBarsProcedural: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const levels = Array.from({ length: BAR_COUNT }, (_, i) => {
    const offset = (i / BAR_COUNT) * Math.PI * 2;
    const v = Math.sin(frame / 6 + offset) * 0.5 + 0.5;
    const noise = ((frame * 13 + i * 7) % 100) / 600;
    return Math.max(0.05, v * 0.7 + noise);
  });
  return <Bars accent={accent} levels={levels} />;
};

const WaveformBarsFromAudio: React.FC<{ accent: string; audioSrc: string }> = ({ accent, audioSrc }) => {
  const audioData = useAudioData(audioSrc);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!audioData) {
    return <WaveformBarsProcedural accent={accent} />;
  }
  const levels = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 64,
  }).slice(0, BAR_COUNT);
  return <Bars accent={accent} levels={levels} />;
};

const WaveformBars: React.FC<{ accent: string; audioSrc: string | null }> = ({ accent, audioSrc }) =>
  audioSrc ? <WaveformBarsFromAudio accent={accent} audioSrc={audioSrc} /> : <WaveformBarsProcedural accent={accent} />;

const Bars: React.FC<{ accent: string; levels: number[] }> = ({ accent, levels }) => {
  return (
    <div
      style={{
        width: 880,
        height: 360,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
      }}
    >
      {levels.map((v, i) => {
        const h = Math.max(8, v * 360);
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: h,
              borderRadius: 6,
              background: `linear-gradient(180deg, ${accent}ee 0%, ${accent}55 100%)`,
              boxShadow: `0 0 24px ${accent}55`,
              transition: 'height 60ms linear',
            }}
          />
        );
      })}
    </div>
  );
};

const HookPanel: React.FC<{ text: string; accent: string; speakerLabel?: string }> = ({
  text,
  accent,
  speakerLabel,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  const lift = interpolate(frame, [0, 18], [40, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: 'flex-start', alignItems: 'center' }}>
      <div style={{ opacity, transform: `translateY(${lift}px)`, textAlign: 'center', marginTop: 80 }}>
        {speakerLabel && (
          <div
            style={{
              fontSize: 22,
              fontFamily: 'JetBrains Mono, monospace',
              color: accent,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            {speakerLabel}
          </div>
        )}
        <h1
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
            color: '#f5f5fa',
            maxWidth: 900,
          }}
        >
          {text}
        </h1>
      </div>
    </AbsoluteFill>
  );
};

const BeatCaption: React.FC<{ beat: ContentBeat; index: number; total: number; accent: string }> = ({
  beat,
  index,
  total,
  accent,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const lift = interpolate(frame, [0, 18], [24, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: 'flex-end' }}>
      <div style={{ opacity, transform: `translateY(${lift}px)` }}>
        <div
          style={{
            fontSize: 18,
            color: accent,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 12,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {index + 1} / {total}
        </div>
        <p
          style={{
            fontSize: 54,
            lineHeight: 1.3,
            color: '#f5f5fa',
            margin: 0,
            fontWeight: 600,
            maxWidth: 920,
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
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <div style={{ opacity, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '22px 42px',
            borderRadius: 28,
            background: accent,
            color: '#06060a',
            fontSize: 48,
            fontWeight: 800,
            marginBottom: 24,
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
