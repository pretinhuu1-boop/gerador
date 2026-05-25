/**
 * CaptionOverlay — TikTok-style word-level captions overlay.
 *
 * Renders a centered bottom strip with the currently-active word highlighted.
 * Captions come from the pipeline pre-shifted to the global timeline
 * (timestamps in ms, frame 0 = render start).
 *
 * The grouping into "phrases" (chunks of N words shown together) is done by
 * `@remotion/captions` via createTikTokStyleCaptions when available — but since
 * that helper expects specific options, we implement a tight inline grouper
 * here so the component stays self-contained and tweakable per template.
 */
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface CaptionWord {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs: number;
  confidence: number | null;
}

interface Props {
  words: CaptionWord[];
  accent: string;
  /** Max words shown together as a "phrase". Default 4 — TikTok-style. */
  phraseSize?: number;
  /** Vertical position from bottom (px). Default 320 — above CTA safe zone. */
  bottomOffset?: number;
}

interface Phrase {
  words: CaptionWord[];
  startMs: number;
  endMs: number;
}

function group(words: CaptionWord[], size: number): Phrase[] {
  const phrases: Phrase[] = [];
  for (let i = 0; i < words.length; i += size) {
    const chunk = words.slice(i, i + size);
    if (chunk.length === 0) continue;
    phrases.push({
      words: chunk,
      startMs: chunk[0].startMs,
      endMs: chunk[chunk.length - 1].endMs,
    });
  }
  return phrases;
}

export const CaptionOverlay: React.FC<Props> = ({
  words,
  accent,
  phraseSize = 4,
  bottomOffset = 320,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!words || words.length === 0) return null;

  const nowMs = (frame / fps) * 1000;
  const phrases = group(words, phraseSize);
  const active = phrases.find((p) => nowMs >= p.startMs && nowMs <= p.endMs);
  if (!active) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: bottomOffset,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          maxWidth: 920,
          padding: '14px 24px',
          borderRadius: 18,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          fontFamily: 'Inter, sans-serif',
          fontSize: 44,
          fontWeight: 800,
          lineHeight: 1.15,
          color: '#f5f5fa',
          textAlign: 'center',
          textShadow: '0 2px 6px rgba(0,0,0,0.7)',
        }}
      >
        {active.words.map((w, i) => {
          const isActive = nowMs >= w.startMs && nowMs <= w.endMs;
          return (
            <span
              key={`${w.startMs}-${i}`}
              style={{
                color: isActive ? accent : '#f5f5fa',
                transform: isActive ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 80ms ease-out, color 60ms ease-out',
                display: 'inline-block',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
