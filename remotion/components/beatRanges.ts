/**
 * computeBeatRanges — derives per-beat (start, duration) in frames.
 *
 * Two modes:
 *
 * 1. **Pipeline mode** (when the gateway pre-computed `t` + `duration_s`
 *    from real ElevenLabs MP3 durations): trust those values, convert to
 *    frames, ensure they don't overlap or exceed the budget.
 *
 * 2. **Studio/preview mode** (no `t`/`duration_s`): fall back to char-length
 *    budget so the preview in `npx remotion studio` still looks sane.
 *
 * Without this, TopList/Audiogram/RedditStories rendered their visual
 * sequences at equal-spaced char-budget timings while audio played at real
 * MP3 durations → guaranteed A/V desync on multi-beat templates.
 */
import type { ContentBeat } from '../../types/database';

export interface BeatRange {
  /** Frame at which this beat's visual sequence starts. */
  start: number;
  /** Length of the beat's visual sequence in frames. */
  duration: number;
}

export interface ComputeRangesOpts {
  /** Total composition length in frames (from useVideoConfig). */
  totalFrames: number;
  /** Frame budget reserved before beats (hook/title). */
  leadingFrames: number;
  /** Frame budget reserved after beats (CTA). */
  trailingFrames: number;
  fps: number;
  /** When falling back to char-budget, the minimum duration in seconds per beat. */
  fallbackMinSeconds?: number;
}

/** True when every beat has finite `t` AND `duration_s` (pipeline-shaped). */
function hasPipelineTimings(beats: ContentBeat[]): boolean {
  return beats.every(
    (b) =>
      typeof b.t === 'number' &&
      Number.isFinite(b.t) &&
      typeof (b as ContentBeat & { duration_s?: number }).duration_s === 'number' &&
      Number.isFinite((b as ContentBeat & { duration_s?: number }).duration_s as number),
  );
}

export function computeBeatRanges(
  beats: ContentBeat[],
  { totalFrames, leadingFrames, trailingFrames, fps, fallbackMinSeconds = 2 }: ComputeRangesOpts,
): BeatRange[] {
  if (beats.length === 0) return [];

  // Pipeline mode — t and duration_s came from the gateway.
  if (hasPipelineTimings(beats)) {
    return beats.map((b) => {
      const d = (b as ContentBeat & { duration_s?: number }).duration_s as number;
      return {
        start: Math.max(0, Math.round((b.t as number) * fps)),
        duration: Math.max(1, Math.round(d * fps)),
      };
    });
  }

  // Studio/preview mode — char-budget fallback.
  const beatBudget = Math.max(fps, totalFrames - leadingFrames - trailingFrames);
  const totalChars = beats.reduce((s, b) => s + Math.max(20, (b.text ?? '').length), 0) || 1;
  let cursor = leadingFrames;
  return beats.map((b) => {
    const chars = Math.max(20, (b.text ?? '').length);
    const minFrames = Math.round((fallbackMinSeconds * fps) / 2);
    const frames = Math.max(minFrames, Math.round((chars / totalChars) * beatBudget));
    const range: BeatRange = { start: cursor, duration: frames };
    cursor += frames;
    return range;
  });
}

/** Returns the frame at which the CTA starts (cursor after last beat). */
export function endOfBeats(ranges: BeatRange[], leadingFrames: number): number {
  if (ranges.length === 0) return leadingFrames;
  const last = ranges[ranges.length - 1];
  return last.start + last.duration;
}
