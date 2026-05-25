import { useEffect, useState } from 'react';
import { Activity, CircleAlert, CircleCheck, Cpu, ListChecks, Coins } from 'lucide-react';
import { gatewayHealthcheck } from '../../services/hermesGateway';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { cn } from '../../lib/cn';

interface IntegrationState {
  gateway: 'unknown' | 'online' | 'offline';
  elevenlabs: boolean | null;
  youtube: boolean | null;
  supabase: boolean | null;
  gemini: boolean | null;
}

export const StatusStrip = () => {
  const [state, setState] = useState<IntegrationState>({
    gateway: 'unknown',
    elevenlabs: null,
    youtube: null,
    supabase: isSupabaseConfigured ? null : false,
    gemini: null,
  });

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const health = await gatewayHealthcheck();
      if (!health.ok || !health.detail) {
        if (!cancelled) {
          setState((s) => ({ ...s, gateway: 'offline' }));
        }
        return;
      }
      try {
        const url = (import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088') + '/healthz';
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        setState({
          gateway: 'online',
          elevenlabs: Boolean(data.elevenlabs_configured),
          youtube: Boolean(data.youtube_configured),
          supabase: Boolean(data.supabase_configured),
          gemini: Boolean(data.gemini_embeddings_configured),
        });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, gateway: 'offline' }));
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Render queue counter — subscribe to in-flight renders for this user.
  const [renderQueue, setRenderQueue] = useState<{ rendering: number; queued: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const fetchCounts = async () => {
      const { data } = await supabase
        .from('content_renders')
        .select('status')
        .in('status', ['queued', 'tts', 'rendering', 'uploading']);
      if (cancelled || !data) return;
      const queued = data.filter((r) => r.status === 'queued').length;
      const rendering = data.length - queued;
      setRenderQueue({ queued, rendering });
    };
    fetchCounts();
    timer = setInterval(fetchCounts, 15_000);
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <footer className="h-8 shrink-0 flex items-center justify-between gap-4 px-4 border-t border-border-subtle bg-bg-subtle text-[10px] font-mono text-fg-muted">
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <Dot
          label="Gateway"
          state={
            state.gateway === 'online'
              ? 'ok'
              : state.gateway === 'offline'
                ? 'fail'
                : 'unknown'
          }
        />
        <span className="hidden sm:inline">·</span>
        <Pill label="Supabase" ok={state.supabase} />
        <Pill label="OpenRouter" ok={state.gateway === 'online'} />
        <Pill label="YouTube" ok={state.youtube} />
        <Pill label="ElevenLabs" ok={state.elevenlabs} />
        <Pill label="Gemini" ok={state.gemini} />
      </div>

      <div className="hidden md:flex items-center gap-3 text-fg-muted">
        {renderQueue && (renderQueue.rendering > 0 || renderQueue.queued > 0) && (
          <span className="inline-flex items-center gap-1.5 text-info">
            <Activity className="h-3 w-3" />
            <span>
              {renderQueue.rendering} renderizando{' '}
              {renderQueue.queued > 0 && `· ${renderQueue.queued} fila`}
            </span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 hidden lg:inline-flex">
          <Cpu className="h-3 w-3" /> Hermes 4.3-36B → 4-14B
        </span>
      </div>
    </footer>
  );
};

const Dot = ({ label, state }: { label: string; state: 'ok' | 'fail' | 'unknown' }) => {
  const color = state === 'ok' ? 'text-success' : state === 'fail' ? 'text-warn' : 'text-fg-muted';
  return (
    <span className={cn('inline-flex items-center gap-1.5', color)}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          state === 'ok' ? 'bg-success' : state === 'fail' ? 'bg-warn' : 'bg-fg-muted',
        )}
      />
      {label}
    </span>
  );
};

const Pill = ({ label, ok }: { label: string; ok: boolean | null }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1',
      ok === true ? 'text-fg-secondary' : ok === false ? 'text-fg-muted/60' : 'text-fg-muted',
    )}
  >
    {ok === true ? (
      <CircleCheck className="h-2.5 w-2.5 text-success" />
    ) : ok === false ? (
      <CircleAlert className="h-2.5 w-2.5 text-fg-muted" />
    ) : (
      <span className="h-2.5 w-2.5" />
    )}
    {label}
  </span>
);
