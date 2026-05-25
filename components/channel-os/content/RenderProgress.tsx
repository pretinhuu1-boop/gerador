import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchRender, subscribeRender } from '../../../services/channelOS/renderService';
import type { ContentRender, RenderStatus } from '../../../types/database';
import { cn } from '../../../lib/cn';

const STATUS_LABEL: Record<RenderStatus, string> = {
  queued: 'Na fila',
  tts: 'Sintetizando voz',
  rendering: 'Renderizando vídeo',
  uploading: 'Subindo arquivo',
  rendered: 'Pronto',
  error: 'Falhou',
  cancelled: 'Cancelado',
};

const TERMINAL: RenderStatus[] = ['rendered', 'error', 'cancelled'];

export const RenderProgress = ({
  renderId,
  onDone,
}: {
  renderId: string;
  onDone?: (render: ContentRender) => void;
}) => {
  const [render, setRender] = useState<ContentRender | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRender(renderId)
      .then((r) => {
        if (!cancelled) setRender(r);
        if (r && TERMINAL.includes(r.status) && onDone) onDone(r);
      })
      .catch((e) => !cancelled && setError(String(e)));
    const unsub = subscribeRender(renderId, (row) => {
      if (cancelled) return;
      setRender(row);
      if (TERMINAL.includes(row.status) && onDone) onDone(row);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [renderId, onDone]);

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-3 text-xs text-danger flex items-start gap-2">
        <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" /> {error}
      </div>
    );
  }
  if (!render) {
    return (
      <div className="text-xs text-fg-muted inline-flex items-center gap-2 py-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> conectando ao render…
      </div>
    );
  }

  const failed = render.status === 'error';
  const done = render.status === 'rendered';
  const pct = Math.max(0, Math.min(100, render.progress ?? 0));

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-elevated/40 p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs">
        {done ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
        ) : failed ? (
          <AlertCircle className="h-3.5 w-3.5 text-danger" />
        ) : (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
        )}
        <span className="font-semibold uppercase tracking-wider">
          {STATUS_LABEL[render.status]}
        </span>
        {render.stage && <span className="text-fg-muted">· {render.stage}</span>}
        <span className="ml-auto font-mono text-[11px] text-fg-muted">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-overlay overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            failed ? 'bg-danger' : done ? 'bg-success' : 'bg-brand',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {failed && render.error && (
        <div className="text-xs text-danger font-mono break-all">{render.error}</div>
      )}
      {render.retry_count > 0 && (
        <div className="text-[10px] text-fg-muted">tentativa {render.retry_count + 1}</div>
      )}
    </div>
  );
};
