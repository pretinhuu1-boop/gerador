import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Telescope, Plus, Loader2, AlertCircle } from 'lucide-react';
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
import { ErrorState, LoadingGrid, SupabaseOfflineHint } from '../WorkspaceState';
import { ChannelCard } from './ChannelCard';
import { ChannelDetail } from './ChannelDetail';

export const ScoutWorkspace = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scoutError, setScoutError] = useState<string | null>(null);
  const [active, setActive] = useState<Channel | null>(null);

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

  return (
    <div className="h-full flex flex-col">
      <header className="h-14 shrink-0 flex items-center gap-3 pl-14 pr-6 md:pl-6 border-b border-border-subtle/50 bg-bg-base/60 backdrop-blur">
        <Telescope className="h-4 w-4 text-brand" />
        <h2 className="font-display font-semibold text-sm">Scout</h2>
        <span className="text-xs text-fg-muted ml-1 hidden sm:inline">
          escanear canais · scoring heurístico
        </span>
        <div className="ml-auto text-xs font-mono text-fg-muted">
          {channels?.length ?? 0} rastreado{(channels?.length ?? 0) === 1 ? '' : 's'}
        </div>
      </header>

      <div className="px-6 pt-6">
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
              <ChannelCard key={c.id} channel={c} onClick={() => setActive(c)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && <ChannelDetail channel={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
};
