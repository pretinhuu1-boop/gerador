import { useMemo } from 'react';
import { Player } from '@remotion/player';
import { Film, AlertCircle } from 'lucide-react';
import {
  StoriesVertical,
  type StoriesVerticalProps,
} from '../../../remotion/compositions/StoriesVertical';
import type { ContentDraft } from '../../../types/database';

const FPS = 30;
const HOOK_S = 2.5;
const CTA_S = 2.5;
const MIN_BEAT_S = 2;
const CHARS_PER_S = 18; // ≈ narração média em pt-BR

function durationFor(draft: ContentDraft): number {
  if (draft.duration_seconds && draft.duration_seconds > 0) {
    return Math.max(8, draft.duration_seconds);
  }
  const beatsS = draft.beats.reduce((s, b) => {
    const chars = Math.max(20, (b.text || '').length);
    return s + Math.max(MIN_BEAT_S, chars / CHARS_PER_S);
  }, 0);
  return Math.ceil(HOOK_S + beatsS + CTA_S);
}

export const DraftPreview = ({ draft }: { draft: ContentDraft }) => {
  const totalSeconds = useMemo(() => durationFor(draft), [draft]);
  const durationInFrames = Math.max(FPS * 5, Math.round(totalSeconds * FPS));

  const inputProps: StoriesVerticalProps = useMemo(
    () => ({
      title: draft.title,
      hook: draft.hook,
      beats: draft.beats,
      cta: draft.cta,
      brand: 'channel os',
    }),
    [draft],
  );

  if (draft.format !== 'short' && draft.format !== 'reel' && draft.format !== 'tiktok') {
    return (
      <div className="rounded-xl border border-warn/30 bg-warn/10 px-3 py-3 text-xs text-warn inline-flex items-start gap-2">
        <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" />
        <span>
          Preview Stories vertical disponível só pra formato <code className="font-mono">short</code>,
          <code className="font-mono"> reel</code> ou <code className="font-mono">tiktok</code> (este é{' '}
          <code className="font-mono">{draft.format}</code>).
        </span>
      </div>
    );
  }

  if (!draft.beats.length && !draft.hook) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-6 text-center text-xs text-fg-muted">
        Sem beats ainda. Pede pro Hermes gerar um roteiro ou adiciona manualmente.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-fg-muted flex items-center gap-1.5">
        <Film className="h-3 w-3" />
        Preview · Stories 1080×1920 · {totalSeconds.toFixed(0)}s · {FPS}fps
      </div>
      <div className="rounded-xl overflow-hidden border border-border-subtle bg-bg-overlay aspect-[9/16] max-h-[60vh] mx-auto">
        <Player
          component={StoriesVertical}
          inputProps={inputProps}
          durationInFrames={durationInFrames}
          fps={FPS}
          compositionWidth={1080}
          compositionHeight={1920}
          controls
          loop
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="text-[10px] text-fg-muted text-center">
        Render real (MP4 com TTS sincronizado) vem na Fase 2c.
      </div>
    </div>
  );
};
