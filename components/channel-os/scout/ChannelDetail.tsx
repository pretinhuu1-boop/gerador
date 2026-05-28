import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, Users, Film, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../../services/supabase';
import type { Channel, ChannelVideo, ScoreBreakdown } from '../../../types/database';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { Skeleton } from '../../ui/Skeleton';
import { ScoreRing } from './ScoreRing';

const compact = (n: number | null | undefined): string => {
  const v = Number(n ?? 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
};

export const ChannelDetail = ({ channel, onClose }: { channel: Channel; onClose: () => void }) => {
  const [videos, setVideos] = useState<ChannelVideo[] | null>(null);

  useEffect(() => {
    supabase
      .from('channel_videos')
      .select('*')
      .eq('channel_id', channel.id)
      .order('published_at', { ascending: false })
      .limit(15)
      .then(({ data }) => setVideos((data as ChannelVideo[]) ?? []));
  }, [channel.id]);

  const breakdown = (channel.score_breakdown ?? {}) as ScoreBreakdown;

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-bg-overlay/70 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-md h-full bg-bg-panel border-l border-border-subtle shadow-elevated overflow-y-auto"
      >
        <div className="sticky top-0 z-10 bg-bg-panel/95 backdrop-blur px-5 py-3 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-fg-muted">DETALHE</span>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start gap-4">
            <Avatar size="xl" src={channel.thumbnail_url} alt={channel.title} fallback={channel.title} />
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-lg leading-tight">{channel.title}</h2>
              {channel.handle && (
                <div className="text-sm text-fg-muted font-mono mt-0.5">{channel.handle}</div>
              )}
              <a
                href={`https://youtube.com/channel/${channel.platform_id}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> abrir no YouTube
              </a>
            </div>
            <ScoreRing score={Number(channel.score ?? 0)} size={64} thickness={6} />
          </div>

          {channel.description && (
            <p className="text-sm text-fg-secondary line-clamp-4 leading-relaxed">{channel.description}</p>
          )}

          <div className="grid grid-cols-3 gap-2">
            <StatTile icon={Users} label="Inscritos" value={compact(channel.subscriber_count)} />
            <StatTile icon={Eye} label="Views totais" value={compact(channel.view_count)} />
            <StatTile icon={Film} label="Vídeos" value={compact(channel.video_count)} />
          </div>

          <Section title="Breakdown do score">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(breakdown)
                .filter(([k, v]) => typeof v === 'number' && k !== 'hermes_verdict')
                .map(([k, v]) => (
                  <div key={k} className="surface-panel p-3 rounded-lg">
                    <div className="text-[10px] uppercase tracking-wider text-fg-muted">
                      {k.replace(/_/g, ' ')}
                    </div>
                    <div className="font-mono font-semibold text-lg mt-1">{Number(v)}</div>
                    <div className="mt-1 h-1 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all"
                        style={{ width: `${Number(v)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </Section>

          <Section title={`Últimos vídeos (${videos?.length ?? '...'})`}>
            {videos === null ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <p className="text-sm text-fg-muted">Sem vídeos persistidos ainda.</p>
            ) : (
              <ul className="space-y-2">
                {videos.map((v) => (
                  <li key={v.id} className="surface-panel p-3 rounded-lg flex gap-3">
                    {v.thumbnail_url && (
                      <img
                        src={v.thumbnail_url}
                        alt=""
                        className="h-14 w-24 object-cover rounded-md shrink-0 border border-border-subtle"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium line-clamp-2 leading-snug">{v.title}</div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-fg-muted">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {compact(v.view_count)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {v.published_at ? format(new Date(v.published_at), 'dd MMM yyyy') : '—'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="default">{channel.platform}</Badge>
            {channel.country && <Badge variant="default" className="uppercase">{channel.country}</Badge>}
            {channel.language && <Badge variant="default">{channel.language}</Badge>}
            <Badge variant="brand">{channel.status}</Badge>
          </div>
        </div>
      </motion.aside>
    </div>
  );
};

const StatTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="surface-panel p-3 rounded-lg">
    <div className="flex items-center gap-1.5 text-fg-muted text-[10px] uppercase tracking-wider">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <div className="font-mono font-semibold text-base mt-1">{value}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-2">{title}</h3>
    {children}
  </div>
);
