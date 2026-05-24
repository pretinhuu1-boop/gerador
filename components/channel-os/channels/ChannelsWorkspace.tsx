import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Tv } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { listTrackedChannels } from '../../../services/channelOS/scoutService';
import type { Channel } from '../../../types/database';
import { Skeleton } from '../../ui/Skeleton';
import { ChannelCard } from '../scout/ChannelCard';
import { ChannelDetail } from '../scout/ChannelDetail';

export const ChannelsWorkspace = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[] | null>(null);
  const [active, setActive] = useState<Channel | null>(null);

  useEffect(() => {
    if (!user) return;
    listTrackedChannels(user.id).then(setChannels);
  }, [user]);

  return (
    <div className="h-full flex flex-col">
      <header className="h-14 shrink-0 flex items-center gap-3 px-6 border-b border-border-subtle/50 bg-bg-base/60 backdrop-blur">
        <Tv className="h-4 w-4 text-brand" />
        <h2 className="font-display font-semibold text-sm">Canais rastreados</h2>
        <div className="ml-auto text-xs font-mono text-fg-muted">{channels?.length ?? 0}</div>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {channels === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : channels.length === 0 ? (
          <p className="text-sm text-fg-secondary text-center py-20">
            Nenhum canal ainda. Use o workspace <strong>Scout</strong> pra adicionar.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {channels.map((c) => (
              <ChannelCard key={c.id} channel={c} onClick={() => setActive(c)} />
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>{active && <ChannelDetail channel={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </div>
  );
};
