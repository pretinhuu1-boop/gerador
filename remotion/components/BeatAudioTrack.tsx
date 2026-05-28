/**
 * BeatAudioTrack — mounts all narration + SFX audio for a render at the
 * correct frame positions. Shared by every composition so renders aren't
 * silent (previous state: only Audiogram played the hook audio).
 *
 * Layout (frame 0 = render start):
 *   - hookAudioUrl  → <Audio> at frame 0 (full volume)
 *   - beats[i]
 *       narration → <Audio> mounted in <Sequence from={beats[i].t * fps}>
 *       sfx       → <Audio> with sfx_volume mounted same start position
 *
 * All beat.t timestamps are in seconds, pre-computed by the gateway pipeline
 * from real ElevenLabs MP3 durations.
 */
import { Audio, Sequence, useVideoConfig } from 'remotion';
import type { ContentBeat } from '../../types/database';

export interface BeatAudioBeat extends ContentBeat {
  /** Cumulative start time in seconds from frame 0. */
  t?: number;
  /** Real audio duration in seconds (post-ffprobe). */
  duration_s?: number;
  /** Signed Supabase Storage URL of the beat's TTS MP3. */
  audio_url?: string | null;
  /** Optional sound-effect MP3 URL (ElevenLabs sound-generation). */
  sfx_url?: string | null;
}

interface Props {
  beats: BeatAudioBeat[];
  hookAudioUrl?: string | null;
  /** Volume multiplier for narration. 1.0 = original ElevenLabs level. */
  narrationVolume?: number;
  /** Volume multiplier for SFX overlay so it doesn't drown narration. */
  sfxVolume?: number;
}

export const BeatAudioTrack: React.FC<Props> = ({
  beats,
  hookAudioUrl,
  narrationVolume = 1,
  sfxVolume = 0.45,
}) => {
  const { fps } = useVideoConfig();

  return (
    <>
      {hookAudioUrl ? <Audio src={hookAudioUrl} volume={narrationVolume} /> : null}
      {beats.map((b, i) => {
        const from = Math.max(0, Math.round((b.t ?? 0) * fps));
        const dur = Math.max(1, Math.round((b.duration_s ?? 2) * fps));
        return (
          <Sequence key={`beat-audio-${i}`} from={from} durationInFrames={dur}>
            {b.audio_url ? <Audio src={b.audio_url} volume={narrationVolume} /> : null}
            {b.sfx_url ? <Audio src={b.sfx_url} volume={sfxVolume} /> : null}
          </Sequence>
        );
      })}
    </>
  );
};
