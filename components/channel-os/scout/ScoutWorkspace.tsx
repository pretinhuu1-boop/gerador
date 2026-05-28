import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Telescope, Plus, Loader2, AlertCircle, Search, Bookmark } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import {
  listTrackedChannels,
  scoutAndPersist,
  createScoutRun,
  finalizeScoutRun,
} from '../../../services/channelOS/scoutService';
import type { Channel } from '../../../types/database';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { StatusChip } from '../../ui/StatusChip';
import { TopAppBar } from '../../shell/TopAppBar';
import { ErrorState, LoadingGrid, SupabaseOfflineHint } from '../WorkspaceState';
import { ChannelCard } from './ChannelCard';
import { ChannelDetail } from './ChannelDetail';
import { DiscoveryMode } from './DiscoveryMode';
import { TrendingStrip } from './TrendingStrip';

type ScoutView = 'tracked' | 'discovery';

export const ScoutWorkspace = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scoutError, setScoutError] = useState<string | null>(null);
  const [active, setActive] = useState<Channel | null>(null);
  const [view, setView] = useState<ScoutView>('tracked');

  const { data: channels, loading, error: listError, refresh } = useAsyncResource<Channel[]>(
    () => (user ? listTrackedChannels(user.id) : Promise.resolve([])),
    [user?.id],
    { enabled: Boolean(user), timeoutMs: 6000 },
  );

  const onScout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !query.trim()) return;
    setScanning(true);
    setScoutError(null);
    let runId: string | null = null;
    try {
      const run = await createScoutRun(user.id, query.trim());
      runId = run.id;
      const result = await scoutAndPersist(user.id, query.trim(), { runId });
      await finalizeScoutRun(runId, { status: 'done', results_count: 1 });
      setActive(result.channelRow);
      setQuery('');
      refresh();
    } catch (err) {
      const message = (err as Error).message;
      setScoutError(message);
      if (runId) {
        try {
          await finalizeScoutRun(runId, { status: 'error', error: message });
        } catch {
          // Best-effort cleanup; ignore secondary failure.
        }
      }
    } finally {
      setScanning(false);
    }
  };

  const count = channels?.length ?? 0;
  return (
    <div className="h-full flex flex-col canvas-grid">
      <TopAppBar
        center={
          <SegmentedControl<ScoutView>
            value={view}
            onChange={setView}
            options={[
              { value: 'tracked', label: 'Rastreados', count, icon: Bookmark },
              { value: 'discovery', label: 'Discovery', icon: Search },
            ]}
          />
        }
        right={
          view === 'tracked' ? (
            <StatusChip tone={count > 0 ? 'brand' : 'default'}>
              {count} {count === 1 ? 'canal' : 'canais'}
            </StatusChip>
          ) : (
            <StatusChip tone="info">YouTube search</StatusChip>
          )
        }
      />

      {view === 'discovery' ? (
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
          <DiscoveryMode onTracked={refresh} />
        </div>
      ) : (
        <TrackedView
          channels={channels}
          loading={loading}
          listError={listError}
          refresh={refresh}
          query={query}
          setQuery={setQuery}
          scanning={scanning}
          scoutError={scoutError}
          onScout={onScout}
          onOpenChannel={setActive}
        />
      )}

      <AnimatePresence>
        {active && <ChannelDetail channel={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
};

interface TrackedViewProps {
  channels: Channel[] | null;
  loading: boolean;
  listError: string | null;
  refresh: () => void;
  query: string;
  setQuery: (q: string) => void;
  scanning: boolean;
  scoutError: string | null;
  onScout: (e: React.FormEvent) => Promise<void>;
  onOpenChannel: (c: Channel) => void;
}

const TrackedView = ({
  channels,
  loading,
  listError,
  refresh,
  query,
  setQuery,
  scanning,
  scoutError,
  onScout,
  onOpenChannel,
}: TrackedViewProps) => {
  return (
    <>
      <div className="px-6 pt-6 space-y-4">
        <TrendingStrip />
        <div className="surface-elevated p-4 rounded-2xl">
          <form onSubmit={onScout} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Cole um @handle, URL ou nome de canal YouTube — ex: "@mrbeast" ou "Linus Tech Tips"'
                className="pl-9 h-11"
                disabled={scanning}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!query.trim() || scanning}
              className="h-11 shrink-0"
            >
              {scanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Escaneando...
                </>
              ) : (
                <>
                  <Telescope className="h-4 w-4" /> Scout
                </>
              )}
            </Button>
          </form>
          {scoutError && (
            <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger inline-flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" />
              <span>{scoutError}</span>
            </div>
          )}
          {!import.meta.env.VITE_YOUTUBE_API_KEY && (
            <div className="mt-3 rounded-lg border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn inline-flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" />
              <span>
                Defina <code className="font-mono">VITE_YOUTUBE_API_KEY</code> no{' '}
                <code className="font-mono">.env.local</code> pra rodar fetch real.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        {loading ? (
          <LoadingGrid count={4} />
        ) : listError ? (
          <ErrorState detail={listError} onRetry={refresh} hint={<SupabaseOfflineHint />} />
        ) : !channels?.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 max-w-md mx-auto"
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated border border-border-subtle mb-4">
              <Telescope className="h-6 w-6 text-fg-muted" />
            </div>
            <h3 className="font-display font-semibold text-lg">Comece a escanear</h3>
            <p className="text-sm text-fg-secondary mt-2">
              Cola um handle, URL ou nome de canal YouTube acima. Scout calcula score heurístico
              (growth, engajamento, consistência, gap competitivo, potencial de monetização) e armazena
              no Supabase.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {channels.map((c) => (
              <ChannelCard key={c.id} channel={c} onClick={() => onOpenChannel(c)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
