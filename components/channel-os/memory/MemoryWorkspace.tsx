import { Brain, Pin } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { supabase } from '../../../services/supabase';
import type { HermesMemory } from '../../../types/database';
import { Card } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { StatusChip } from '../../ui/StatusChip';
import { TopAppBar } from '../../shell/TopAppBar';
import { ErrorState, SupabaseOfflineHint } from '../WorkspaceState';

const KIND_LABEL: Record<HermesMemory['kind'], string> = {
  preference: 'Preferência',
  fact: 'Fato',
  goal: 'Meta',
  channel_pin: 'Canal pin',
  rule: 'Regra',
};

const KIND_TONE: Record<HermesMemory['kind'], 'brand' | 'info' | 'pending' | 'online' | 'default'> = {
  preference: 'brand',
  fact: 'info',
  goal: 'online',
  channel_pin: 'brand',
  rule: 'pending',
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

  const count = memories?.length ?? 0;

  return (
    <div className="h-full flex flex-col canvas-grid">
      <TopAppBar
        right={
          <StatusChip tone={count > 0 ? 'brand' : 'default'}>
            {count} {count === 1 ? 'pin' : 'pins'}
          </StatusChip>
        }
      />

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
                <Pin className="h-4 w-4 text-brand-light" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusChip tone={KIND_TONE[m.kind]}>{KIND_LABEL[m.kind]}</StatusChip>
                  <span className="text-[10px] font-mono text-fg-muted tabular-nums">
                    importância {m.importance}/5
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{m.content}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
