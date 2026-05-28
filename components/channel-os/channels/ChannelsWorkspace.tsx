import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { listTrackedChannels } from '../../../services/channelOS/scoutService';
import type { Channel } from '../../../types/database';
import { StatusChip } from '../../ui/StatusChip';
import { TopAppBar } from '../../shell/TopAppBar';
import { ChannelCard } from '../scout/ChannelCard';
import { ChannelDetail } from '../scout/ChannelDetail';
import { ErrorState, LoadingGrid, SupabaseOfflineHint } from '../WorkspaceState';
import { OAuthConnections } from './OAuthConnections';
import { ExternalPipelinesStatus } from './ExternalPipelinesStatus';

export const ChannelsWorkspace = () => {
  const { user } = useAuth();
  const [active, setActive] = useState<Channel | null>(null);

  const { data: channels, loading, error, refresh } = useAsyncResource<Channel[]>(
    () => (user ? listTrackedChannels(user.id) : Promise.resolve([])),
    [user?.id],
    { enabled: Boolean(user), timeoutMs: 6000 },
  );

  const count = channels?.length ?? 0;

  return (
    <div className="h-full flex flex-col canvas-grid">
      <TopAppBar
        right={
          <StatusChip tone={count > 0 ? 'brand' : 'default'}>
            {count} rastreado{count === 1 ? '' : 's'}
          </StatusChip>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <OAuthConnections />
        <ExternalPipelinesStatus />

        {loading ? (
          <LoadingGrid count={3} />
        ) : error ? (
          <ErrorState detail={error} onRetry={refresh} hint={<SupabaseOfflineHint />} />
        ) : !channels?.length ? (
          <p className="text-sm text-fg-secondary text-center py-20">
            Nenhum canal rastreado ainda. Use o workspace <strong>Scout</strong> pra adicionar.
          </p>
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
