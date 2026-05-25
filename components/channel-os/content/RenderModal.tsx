import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Loader2, X, Sparkles } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { listVoices, type ElevenLabsVoice } from '../../../services/channelOS/voiceService';
import {
  createRender,
  latestRenderForDraft,
} from '../../../services/channelOS/renderService';
import type { ContentDraft, ContentRender, RenderQuality } from '../../../types/database';
import { RenderProgress } from './RenderProgress';
import { RenderedVideo } from './RenderedVideo';

interface Props {
  draft: ContentDraft;
  open: boolean;
  onClose: () => void;
  onRendered?: (render: ContentRender) => void;
}

export const RenderModal = ({ draft, open, onClose, onRendered }: Props) => {
  const [voices, setVoices] = useState<ElevenLabsVoice[] | null>(null);
  const [voiceId, setVoiceId] = useState<string>('');
  const [quality, setQuality] = useState<RenderQuality>('preview');
  const [renderId, setRenderId] = useState<string | null>(null);
  const [finalRender, setFinalRender] = useState<ContentRender | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listVoices().then((r) => {
      if (cancelled) return;
      setConfigured(r.configured);
      if (r.voices) setVoices(r.voices);
      if (r.default) setVoiceId((prev) => prev || r.default!);
    });
    latestRenderForDraft(draft.id)
      .then((r) => {
        if (cancelled || !r) return;
        if (r.status === 'rendered') {
          setFinalRender(r);
        } else if (['queued', 'tts', 'rendering', 'uploading'].includes(r.status)) {
          setRenderId(r.id);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, draft.id]);

  const onStart = async () => {
    setBusy(true);
    setError(null);
    setFinalRender(null);
    try {
      const { render_id } = await createRender({ draftId: draft.id, voiceId, quality });
      setRenderId(render_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onProgressDone = (r: ContentRender) => {
    if (r.status === 'rendered') {
      setFinalRender(r);
      onRendered?.(r);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-bg-overlay/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="surface-elevated w-full max-w-lg pointer-events-auto rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <header className="h-14 shrink-0 px-5 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-brand" />
                  <span className="font-display font-semibold text-sm">Renderizar MP4</span>
                  <Badge variant="brand" size="sm" className="capitalize">{draft.format}</Badge>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Fechar"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {finalRender ? (
                  <RenderedVideo render={finalRender} />
                ) : renderId ? (
                  <RenderProgress renderId={renderId} onDone={onProgressDone} />
                ) : (
                  <>
                    {configured === false && (
                      <div className="rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
                        ElevenLabs não plugado no gateway. Renderiza vai falhar sem TTS — configura
                        <code className="font-mono ml-1">ELEVENLABS_API_KEY</code> no docker/.env.
                      </div>
                    )}
                    <label className="block">
                      <span className="text-xs font-medium text-fg-secondary mb-1.5 block">Voz</span>
                      <select
                        value={voiceId}
                        onChange={(e) => setVoiceId(e.target.value)}
                        className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-fg-primary"
                      >
                        {(voices ?? []).map((v) => (
                          <option key={v.voice_id} value={v.voice_id}>
                            {v.name}
                          </option>
                        ))}
                        {!voices?.length && <option value="">default</option>}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-fg-secondary mb-1.5 block">
                        Qualidade
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {(['preview', 'final'] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() => setQuality(q)}
                            className={`rounded-lg px-3 py-2 text-sm border transition-colors ${
                              quality === q
                                ? 'bg-brand/15 border-brand/40 text-fg-primary shadow-glow-brand'
                                : 'border-border-subtle text-fg-secondary hover:bg-bg-elevated'
                            }`}
                          >
                            {q === 'preview' ? '480p (rápido)' : '1080p (final)'}
                          </button>
                        ))}
                      </div>
                    </label>
                    {error && (
                      <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                        {error}
                      </div>
                    )}
                    <div className="text-[11px] text-fg-muted">
                      O render roda em background no gateway: sintetiza TTS de cada beat
                      (ElevenLabs), monta com Remotion, sobe pro Supabase Storage. Você acompanha
                      em tempo real via Realtime.
                    </div>
                  </>
                )}
              </div>

              {!finalRender && !renderId && (
                <footer className="shrink-0 px-5 py-3 border-t border-border-subtle flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button variant="primary" size="md" loading={busy} onClick={onStart}>
                    {!busy && <Sparkles className="h-4 w-4" />}
                    Iniciar render
                  </Button>
                </footer>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
