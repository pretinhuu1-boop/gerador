import { Brain, Pin } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { supabase } from '../../../services/supabase';
import type { HermesMemory } from '../../../types/database';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { ErrorState, SupabaseOfflineHint } from '../WorkspaceState';

const KIND_LABEL: Record<HermesMemory['kind'], string> = {
  preference: 'Preferência',
  fact: 'Fato',
  goal: 'Meta',
  channel_pin: 'Canal pin',
  rule: 'Regra',
};

async function loadMemories(userId: string): Promise<HermesMemory[]> {
  const { data, error } = await supabase
    .from('hermes_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('importance', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as HermesMemory[]) ?? [];
}

export const MemoryWorkspace = () => {
  const { user } = useAuth();
  const { data: memories, loading, error, refresh } = useAsyncResource<HermesMemory[]>(
    () => (user ? loadMemories(user.id) : Promise.resolve([])),
    [user?.id],
    { enabled: Boolean(user), timeoutMs: 6000 },
  );

  return (
    <div className="h-full flex flex-col">
      <header className="h-14 shrink-0 flex items-center gap-3 pl-14 pr-6 md:pl-6 border-b border-border-subtle/50 bg-bg-base/60 backdrop-blur">
        <Brain className="h-4 w-4 text-brand" />
        <h2 className="font-display font-semibold text-sm">Memória do Hermes</h2>
        <span className="text-xs text-fg-muted ml-1">o que ele sabe sobre você</span>
        <div className="ml-auto text-xs font-mono text-fg-muted">{memories?.length ?? 0} pins</div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {loading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : error ? (
          <ErrorState detail={error} onRetry={refresh} hint={<SupabaseOfflineHint />} />
        ) : !memories?.length ? (
          <div className="text-center py-20 max-w-md mx-auto">
            <Pin className="h-10 w-10 mx-auto text-fg-muted mb-3" />
            <h3 className="font-display font-semibold text-lg">Sem memória ainda</h3>
            <p className="text-sm text-fg-secondary mt-2">
              Conforme você conversa com o Hermes, ele cria pins de preferências, metas e fatos
              importantes aqui. Você pode editar, deletar e priorizar tudo.
            </p>
          </div>
        ) : (
          memories.map((m) => (
            <Card key={m.id} className="flex items-start gap-3 p-4">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center">
                <Pin className="h-4 w-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="brand" size="sm">
                    {KIND_LABEL[m.kind]}
                  </Badge>
                  <span className="text-[10px] font-mono text-fg-muted">
                    importância {m.importance}/5
                  </span>
                </div>
                <p className="text-sm">{m.content}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
