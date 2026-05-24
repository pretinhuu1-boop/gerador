import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PencilLine, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAppStore } from '../../../stores/appStore';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import {
  createDraft,
  listDrafts,
} from '../../../services/channelOS/contentService';
import type { ContentDraft } from '../../../types/database';
import { Button } from '../../ui/Button';
import { ErrorState, LoadingGrid, SupabaseOfflineHint } from '../WorkspaceState';
import { DraftCard } from './DraftCard';
import { DraftDetail } from './DraftDetail';

export const ContentWorkspace = () => {
  const { user } = useAuth();
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const [active, setActive] = useState<ContentDraft | null>(null);
  const [creating, setCreating] = useState(false);

  const {
    data: drafts,
    loading,
    error,
    refresh,
  } = useAsyncResource<ContentDraft[]>(
    () => (user ? listDrafts(user.id) : Promise.resolve([])),
    [user?.id],
    { enabled: Boolean(user), timeoutMs: 6000 },
  );

  const onCreateBlank = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const fresh = await createDraft({
        userId: user.id,
        title: 'Novo rascunho',
        format: 'short',
        beats: [{ text: '' }],
      });
      setActive(fresh);
      refresh();
    } catch {
      // surfaced inline by next refresh's error state
    } finally {
      setCreating(false);
    }
  };

  const onSaved = (next: ContentDraft) => {
    setActive(next);
    refresh();
  };

  return (
    <div className="h-full flex flex-col">
      <header className="h-14 shrink-0 flex items-center gap-3 pl-14 pr-6 md:pl-6 border-b border-border-subtle/50 bg-bg-base/60 backdrop-blur">
        <PencilLine className="h-4 w-4 text-brand" />
        <h2 className="font-display font-semibold text-sm">Content</h2>
        <span className="text-xs text-fg-muted ml-1 hidden sm:inline">
          roteiros · drafts gerados pelo Hermes
        </span>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-xs font-mono text-fg-muted hidden sm:block">
            {drafts?.length ?? 0} draft{(drafts?.length ?? 0) === 1 ? '' : 's'}
          </div>
          <Button variant="primary" size="sm" loading={creating} onClick={onCreateBlank}>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Novo rascunho</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {loading ? (
          <LoadingGrid count={3} />
        ) : error ? (
          <ErrorState detail={error} onRetry={refresh} hint={<SupabaseOfflineHint />} />
        ) : !drafts?.length ? (
          <EmptyState onAskHermes={() => setActiveWorkspace('home')} onCreate={onCreateBlank} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {drafts.map((d) => (
              <DraftCard
                key={d.id}
                draft={d}
                active={active?.id === d.id}
                onClick={() => setActive(d)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <DraftDetail draft={active} onClose={() => setActive(null)} onSaved={onSaved} />
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyState = ({ onAskHermes, onCreate }: { onAskHermes: () => void; onCreate: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-20 max-w-md mx-auto"
  >
    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 border border-brand/30 shadow-glow-brand mb-4">
      <PencilLine className="h-6 w-6 text-brand" />
    </div>
    <h3 className="font-display font-semibold text-lg">Sem rascunhos ainda</h3>
    <p className="text-sm text-fg-secondary mt-2">
      Peça pro Hermes Chat — algo como{' '}
      <em>"10 ideias de Shorts faceless de mistério e me dá roteiro do mais forte"</em> — ou comece um
      rascunho em branco.
    </p>
    <div className="mt-5 flex items-center justify-center gap-2">
      <Button variant="primary" size="md" onClick={onAskHermes}>
        <Sparkles className="h-4 w-4" /> Pedir pro Hermes
      </Button>
      <Button variant="secondary" size="md" onClick={onCreate}>
        <Plus className="h-4 w-4" /> Rascunho em branco
      </Button>
    </div>
  </motion.div>
);
