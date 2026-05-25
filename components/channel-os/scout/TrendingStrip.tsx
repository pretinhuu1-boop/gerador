import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, RefreshCw, ExternalLink, Eye, Heart, MessageCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  getLatestTrending,
  refreshTrending,
  type TrendingSnapshot,
} from '../../../services/channelOS/trendingService';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

const YT_CATEGORIES: { id: string | null; label: string }[] = [
  { id: null, label: 'Geral' },
  { id: '22', label: 'People' },
  { id: '24', label: 'Entertainment' },
  { id: '23', label: 'Comedy' },
  { id: '25', label: 'News' },
  { id: '10', label: 'Music' },
  { id: '20', label: 'Gaming' },
];

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;

export const TrendingStrip = () => {
  const [region] = useState('BR');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [snap, setSnap] = useState<TrendingSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getLatestTrending(region, categoryId)
      .then((s) => {
        if (!cancelled) setSnap(s);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Falha ao carregar trending');
      });
    return () => {
      cancelled = true;
    };
  }, [region, categoryId]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await refreshTrending(region, categoryId);
      setSnap(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4 space-y-3">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warn/15 border border-warn/30">
            <Flame className="h-4 w-4 text-warn" />
          </div>
          <div>
            <div className="text-sm font-display font-semibold">Trending agora</div>
            <div className="text-[11px] text-fg-muted">
              {snap
                ? `${snap.videos.length} vídeos · atualizado ${formatDistanceToNow(new Date(snap.fetched_at), { addSuffix: true, locale: ptBR })}`
                : 'cache vazio — clica em "Atualizar" pra puxar do YouTube'}
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" loading={loading} onClick={refresh}>
          {!loading && <RefreshCw className="h-3.5 w-3.5" />}
          Atualizar
        </Button>
      </header>

      <div className="flex flex-wrap gap-1">
        {YT_CATEGORIES.map((c) => (
          <button
            key={c.id ?? 'all'}
            type="button"
            onClick={() => setCategoryId(c.id)}
            className={[
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition',
              categoryId === c.id
                ? 'bg-brand/15 text-fg-primary border border-brand/40'
                : 'border border-border-subtle text-fg-secondary hover:bg-bg-elevated',
            ].join(' ')}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {error}
        </div>
      )}

      {!snap ? (
        <div className="flex items-center gap-2 text-sm text-fg-muted py-6 justify-center">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Puxando do YouTube…
            </>
          ) : (
            'Nada cacheado ainda pra essa região/categoria.'
          )}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
          {snap.videos.slice(0, 12).map((v, i) => (
            <motion.a
              key={v.video_id}
              whileHover={{ y: -2 }}
              href={`https://www.youtube.com/watch?v=${v.video_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group min-w-[200px] max-w-[200px] flex flex-col gap-2 rounded-xl border border-border-subtle bg-bg-base/60 p-2 hover:border-brand/40 transition"
            >
              <div className="relative aspect-video overflow-hidden rounded-lg bg-bg-base">
                {v.thumbnail ? (
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-bg-elevated to-bg-base" />
                )}
                <div className="absolute top-1 left-1">
                  <Badge size="sm" variant="warn">
                    #{i + 1}
                  </Badge>
                </div>
                <ExternalLink className="absolute top-1 right-1 h-3.5 w-3.5 text-white/70 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="min-h-[40px]">
                <div className="text-xs font-medium text-fg-primary line-clamp-2">{v.title}</div>
                <div className="text-[10px] text-fg-muted line-clamp-1 mt-0.5">
                  {v.channel_title}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-fg-muted font-mono">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {fmt(v.views)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {fmt(v.likes)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> {fmt(v.comments)}
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </section>
  );
};
