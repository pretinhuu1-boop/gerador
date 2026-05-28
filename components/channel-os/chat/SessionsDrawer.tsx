import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, MessageSquare, Plus, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { HermesSession } from '../../../types/database';
import { Button } from '../../ui/Button';
import { Skeleton } from '../../ui/Skeleton';
import { ErrorState, SupabaseOfflineHint } from '../WorkspaceState';
import { cn } from '../../../lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  sessions: HermesSession[] | null;
  loading: boolean;
  error: string | null;
  activeId: string | null;
  onSelect: (id: string) => void;
  onArchive: (id: string) => void;
  onNew: () => void;
  onRefresh: () => void;
}

export const SessionsDrawer = ({
  open,
  onClose,
  sessions,
  loading,
  error,
  activeId,
  onSelect,
  onArchive,
  onNew,
  onRefresh,
}: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg-overlay/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-bg-panel border-l border-border-subtle flex flex-col shadow-elevated"
            role="dialog"
            aria-label="Sessões do Hermes"
          >
            <header className="h-14 px-4 flex items-center justify-between border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-brand" />
                <h2 className="font-display font-semibold text-sm">Sessões</h2>
                <span className="text-[10px] font-mono text-fg-muted">
                  {sessions?.length ?? 0}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar sessões"
                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="p-3 border-b border-border-subtle">
              <Button variant="primary" size="sm" className="w-full" onClick={onNew}>
                <Plus className="h-3.5 w-3.5" /> Nova sessão
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <>
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </>
              ) : error ? (
                <ErrorState detail={error} onRetry={onRefresh} hint={<SupabaseOfflineHint />} />
              ) : !sessions?.length ? (
                <p className="text-xs text-fg-muted text-center py-12 px-6">
                  Nenhuma sessão ainda. Mande a primeira mensagem pro Hermes que ela vai aparecer aqui.
                </p>
              ) : (
                sessions.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    active={s.id === activeId}
                    onClick={() => onSelect(s.id)}
                    onArchive={() => onArchive(s.id)}
                  />
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

const SessionRow = ({
  session,
  active,
  onClick,
  onArchive,
}: {
  session: HermesSession;
  active: boolean;
  onClick: () => void;
  onArchive: () => void;
}) => {
  const ts = session.last_message_at ?? session.created_at;
  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-colors cursor-pointer',
        active
          ? 'bg-brand/15 border-brand/30 shadow-glow-brand'
          : 'border-transparent hover:bg-bg-elevated hover:border-border-subtle',
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2 px-3 py-2.5">
        <MessageSquare className={cn('h-3.5 w-3.5 shrink-0 mt-0.5', active ? 'text-brand' : 'text-fg-muted')} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-fg-primary truncate">
            {session.title ?? `Sessão de ${new Date(session.created_at).toLocaleDateString('pt-BR')}`}
          </div>
          <div className="text-[10px] font-mono text-fg-muted mt-0.5 inline-flex items-center gap-1.5">
            <span className="capitalize">{session.workspace_kind}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(ts), { addSuffix: true, locale: ptBR })}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onArchive();
          }}
          aria-label="Arquivar sessão"
          className="opacity-0 group-hover:opacity-100 h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-danger hover:bg-bg-elevated transition-opacity"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
