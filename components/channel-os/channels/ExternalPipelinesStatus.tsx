import { useEffect, useState } from 'react';
import { Server, ExternalLink } from 'lucide-react';
import { supabase } from '../../../services/supabase';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

interface PipelineStatus {
  video_assembler: boolean;
  clip_extractor: boolean;
  talking_head: boolean;
}

const PIPELINES = [
  {
    key: 'video_assembler' as const,
    label: 'Video Assembler',
    repo: 'harry0703/MoneyPrinterTurbo',
    repoUrl: 'https://github.com/harry0703/MoneyPrinterTurbo',
    description: 'Script → TTS → b-roll Pexels → MP4 9:16 (alternativa ao Remotion pra stock footage).',
    envVar: 'EXTERNAL_VIDEO_ASSEMBLER_URL',
  },
  {
    key: 'clip_extractor' as const,
    label: 'Clip Extractor',
    repo: 'SamurAIGPT/AI-Youtube-Shorts-Generator',
    repoUrl: 'https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator',
    description: 'YouTube longo → shorts virais 9:16 auto-cropados (yt-dlp + Whisper + OpenCV).',
    envVar: 'EXTERNAL_CLIP_EXTRACTOR_URL',
  },
  {
    key: 'talking_head' as const,
    label: 'Talking Head',
    repo: 'OpenTalker/SadTalker',
    repoUrl: 'https://github.com/OpenTalker/SadTalker',
    description: 'Foto + áudio → avatar com lipsync (Apache 2.0, GPU obrigatória).',
    envVar: 'EXTERNAL_TALKING_HEAD_URL',
  },
];

export const ExternalPipelinesStatus = () => {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setError('Sem sessão');
          return;
        }
        const res = await fetch(`${GATEWAY_URL}/v1/external/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Gateway ${res.status}`);
        setStatus(await res.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4 space-y-3">
      <header className="flex items-start gap-2">
        <Server className="h-4 w-4 text-fg-secondary mt-0.5" />
        <div>
          <h2 className="font-display text-sm font-semibold">Pipelines externos (opcional)</h2>
          <p className="text-[11px] text-fg-muted mt-0.5">
            Containers OSS que rodam separados — habilita ferramentas extras pro Hermes. Cada
            um tem seu repo e instruções próprias.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
          {error}
        </div>
      )}

      <div className="grid gap-2">
        {PIPELINES.map((p) => {
          const on = status?.[p.key] ?? false;
          return (
            <div
              key={p.key}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-base/60 px-3 py-2"
            >
              <span
                className={[
                  'h-2 w-2 rounded-full shrink-0',
                  on ? 'bg-success shadow-[0_0_10px_rgba(34,211,168,0.6)]' : 'bg-fg-muted/40',
                ].join(' ')}
                title={on ? 'configurado' : 'não configurado'}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {p.label}{' '}
                  <span className="text-[10px] text-fg-muted font-mono">— {p.repo}</span>
                </div>
                <div className="text-[11px] text-fg-muted line-clamp-1">{p.description}</div>
              </div>
              <a
                href={p.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-brand hover:bg-bg-elevated"
                title="Abrir repo no GitHub"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <code className="text-[10px] font-mono text-fg-muted hidden md:block">{p.envVar}</code>
            </div>
          );
        })}
      </div>
    </section>
  );
};
