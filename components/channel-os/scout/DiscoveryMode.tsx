import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Search, Plus, Users, Film, Eye, ExternalLink } from 'lucide-react';
import {
  discoverChannels,
  type DiscoveryResult,
  type DiscoveryParams,
} from '../../../services/channelOS/youtubeApi';
import { scoutAndPersist } from '../../../services/channelOS/scoutService';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { StatusChip } from '../../ui/StatusChip';

const compact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const DiscoveryMode = ({ onTracked }: { onTracked?: () => void }) => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('BR');
  const [minSubs, setMinSubs] = useState(10_000);
  const [maxSubs, setMaxSubs] = useState<number | ''>('');
  const [language, setLanguage] = useState('pt');
  const [results, setResults] = useState<DiscoveryResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const params: DiscoveryParams = {
        query: query.trim(),
        region: region || undefined,
        language: language || undefined,
        minSubs: minSubs || 0,
        maxSubs: typeof maxSubs === 'number' ? maxSubs : undefined,
        maxResults: 16,
      };
      const list = await discoverChannels(params);
      setResults(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSearching(false);
    }
  };

  const onTrack = async (r: DiscoveryResult) => {
    if (!user) return;
    setTrackingId(r.channel_id);
    try {
      await scoutAndPersist(user.id, r.channel_id);
      onTracked?.();
    } catch (e) {
      setError(`Falha ao trackear ${r.title}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="surface-elevated rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Nicho ou tema — ex: "mistério histórico", "finance shorts BR"'
              className="pl-9 h-11"
              disabled={searching}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!query.trim() || searching}
            className="h-11 shrink-0"
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" /> Discover
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <FilterField label="Região">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-bg-elevated border border-border-subtle rounded-md px-2 py-1 text-fg-primary"
            >
              <option value="BR">BR</option>
              <option value="US">US</option>
              <option value="GB">GB</option>
              <option value="ES">ES</option>
              <option value="MX">MX</option>
              <option value="PT">PT</option>
              <option value="">(qualquer)</option>
            </select>
          </FilterField>
          <FilterField label="Idioma">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-bg-elevated border border-border-subtle rounded-md px-2 py-1 text-fg-primary"
            >
              <option value="pt">pt</option>
              <option value="en">en</option>
              <option value="es">es</option>
              <option value="">(qualquer)</option>
            </select>
          </FilterField>
          <FilterField label="Min subs">
            <Input
              type="number"
              value={minSubs}
              onChange={(e) => setMinSubs(Number(e.target.value) || 0)}
              className="w-24 h-7 text-xs"
            />
          </FilterField>
          <FilterField label="Max subs">
            <Input
              type="number"
              value={maxSubs}
              onChange={(e) =>
                setMaxSubs(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="∞"
              className="w-24 h-7 text-xs"
            />
          </FilterField>
          <span className="text-fg-muted text-[10px] ml-auto font-mono">
            ~100 quota units por search
          </span>
        </div>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger inline-flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" /> {error}
          </div>
        )}
      </form>

      {results !== null && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Resultados
            </h3>
            <StatusChip tone={results.length > 0 ? 'brand' : 'default'}>
              {results.length} {results.length === 1 ? 'canal' : 'canais'}
            </StatusChip>
          </div>
          {results.length === 0 ? (
            <p className="text-sm text-fg-muted text-center py-12">
              Nenhum canal bateu nos filtros. Tenta ampliar a faixa de subs ou trocar a região.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {results.map((r) => (
                <DiscoveryCard
                  key={r.channel_id}
                  result={r}
                  tracking={trackingId === r.channel_id}
                  onTrack={() => onTrack(r)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FilterField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="inline-flex items-center gap-1.5">
    <span className="text-fg-muted font-mono uppercase tracking-wider">{label}</span>
    {children}
  </label>
);

const DiscoveryCard = ({
  result,
  tracking,
  onTrack,
}: {
  result: DiscoveryResult;
  tracking: boolean;
  onTrack: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    className="surface-panel p-4 hover:border-brand/40 transition-colors"
  >
    <div className="flex items-start gap-3">
      {result.thumbnail_url ? (
        <img
          src={result.thumbnail_url}
          alt=""
          className="h-12 w-12 rounded-full shrink-0 border border-border-subtle"
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-bg-elevated shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-display font-semibold text-sm leading-tight truncate">
            {result.title}
          </h4>
          <a
            href={`https://youtube.com/channel/${result.channel_id}`}
            target="_blank"
            rel="noreferrer"
            className="text-fg-muted hover:text-brand-light shrink-0"
            aria-label="Abrir no YouTube"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        {result.handle && (
          <div className="text-xs text-fg-muted font-mono truncate">{result.handle}</div>
        )}
        <p className="text-xs text-fg-secondary line-clamp-2 mt-1.5 leading-relaxed">
          {result.description || '—'}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] font-mono text-fg-muted">
          <Stat icon={Users} value={compact(result.subscriber_count)} label="subs" />
          <Stat icon={Eye} value={compact(result.view_count)} label="views" />
          <Stat icon={Film} value={compact(result.video_count)} label="vids" />
          {result.country && (
            <span className="uppercase text-fg-secondary">{result.country}</span>
          )}
        </div>
      </div>
    </div>
    <div className="mt-3 flex justify-end">
      <Button variant="primary" size="xs" loading={tracking} onClick={onTrack}>
        {!tracking && <Plus className="h-3 w-3" />}
        Trackear
      </Button>
    </div>
  </motion.div>
);

const Stat = ({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) => (
  <span className="inline-flex items-center gap-1">
    <Icon className="h-3 w-3" />
    <span className="tabular-nums text-fg-secondary">{value}</span>
    <span className="text-fg-muted">{label}</span>
  </span>
);
