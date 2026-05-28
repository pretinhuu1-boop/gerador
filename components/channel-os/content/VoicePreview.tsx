import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, Mic, Play, Square } from 'lucide-react';
import {
  listVoices,
  synthesizeToObjectURL,
  type ElevenLabsVoice,
} from '../../../services/channelOS/voiceService';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { ContentBeat } from '../../../types/database';

interface Props {
  beats: ContentBeat[];
  hook?: string | null;
}

export const VoicePreview = ({ beats, hook }: Props) => {
  const [voices, setVoices] = useState<ElevenLabsVoice[] | null>(null);
  const [defaultVoice, setDefaultVoice] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState<string>('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [voicesError, setVoicesError] = useState<string | null>(null);

  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const [synthError, setSynthError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listVoices().then((r) => {
      if (cancelled) return;
      setConfigured(r.configured);
      if (r.error) setVoicesError(r.error);
      if (r.voices) setVoices(r.voices);
      if (r.default) {
        setDefaultVoice(r.default);
        setVoiceId(r.default);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      audioRef.current?.pause();
    },
    [],
  );

  const items: { idx: number; label: string; text: string }[] = [];
  if (hook?.trim()) items.push({ idx: -1, label: 'Hook', text: hook });
  beats
    .filter((b) => b.text?.trim())
    .forEach((b, i) => items.push({ idx: i, label: `Beat ${i + 1}`, text: b.text }));

  const playSample = async (idx: number, text: string) => {
    setSynthError(null);
    setBusyIdx(idx);
    try {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      const url = await synthesizeToObjectURL({
        text,
        voiceId: voiceId || undefined,
      });
      urlRef.current = url;
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = url;
      audioRef.current.onended = () => setPlayingIdx(null);
      await audioRef.current.play();
      setPlayingIdx(idx);
    } catch (e) {
      setSynthError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyIdx(null);
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlayingIdx(null);
  };

  if (configured === null) {
    return (
      <div className="text-xs text-fg-muted inline-flex items-center gap-2 py-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        verificando ElevenLabs no gateway…
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="rounded-xl border border-warn/30 bg-warn/10 px-3 py-3 text-xs text-warn flex items-start gap-2">
        <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" />
        <div>
          <div className="font-semibold mb-1">ElevenLabs não plugado no gateway</div>
          <div className="text-fg-secondary">
            Setta <code className="font-mono">ELEVENLABS_API_KEY</code> no{' '}
            <code className="font-mono">docker/.env</code> e reinicia o container.
          </div>
          {voicesError && (
            <div className="mt-1 font-mono text-[10px] opacity-80 break-all">{voicesError}</div>
          )}
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-3 text-xs text-fg-muted text-center">
        Sem texto pra narrar ainda. Adiciona um hook ou um beat.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-fg-muted inline-flex items-center gap-1.5">
          <Mic className="h-3 w-3" /> Voz · ElevenLabs
        </div>
        <select
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
          className="text-[11px] bg-bg-elevated border border-border-subtle rounded-md px-2 py-1 text-fg-primary"
        >
          {(voices ?? []).map((v) => (
            <option key={v.voice_id} value={v.voice_id}>
              {v.name}
              {v.voice_id === defaultVoice ? ' · default' : ''}
            </option>
          ))}
          {!voices?.length && defaultVoice && (
            <option value={defaultVoice}>default ({defaultVoice.slice(0, 8)}…)</option>
          )}
        </select>
      </div>

      {synthError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger inline-flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" />
          <span>{synthError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        {items.map((it) => {
          const playing = playingIdx === it.idx;
          const busy = busyIdx === it.idx;
          return (
            <div
              key={it.idx}
              className="surface-panel rounded-lg p-2.5 flex items-start gap-2"
            >
              <Button
                size="icon-sm"
                variant={playing ? 'danger' : 'secondary'}
                disabled={busy}
                onClick={() => (playing ? stop() : playSample(it.idx, it.text))}
                aria-label={playing ? 'Parar' : `Tocar ${it.label}`}
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : playing ? (
                  <Square className="h-3 w-3" fill="currentColor" />
                ) : (
                  <Play className="h-3 w-3" fill="currentColor" />
                )}
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="default" size="sm">{it.label}</Badge>
                </div>
                <p className="text-xs text-fg-secondary mt-1 line-clamp-2 leading-snug">
                  {it.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-fg-muted text-center">
        Cada play queima ~1 char/credit. Render completo com TTS sincronizado vem na Fase 2c.
      </div>
    </div>
  );
};
