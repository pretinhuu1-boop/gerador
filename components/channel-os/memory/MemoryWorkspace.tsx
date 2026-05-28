import { useEffect, useState } from 'react';
import { Brain, Pin, Sparkles } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { supabase } from '../../../services/supabase';
import type { HermesMemory } from '../../../types/database';
import { Card } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { StatusChip } from '../../ui/StatusChip';
import { TopAppBar } from '../../shell/TopAppBar';
import { ErrorState, SupabaseOfflineHint } from '../WorkspaceState';
import { ProposalsTab } from './ProposalsTab';
import { listProposals } from '../../../services/channelOS/proposalsService';

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

type Tab = 'pins' | 'proposals';

async function loadMemories(userId: string): Promise<HermesMemory[]> {
  // Exclude proposals (they live in the same table but have metadata.proposal=true).
  const { data, error } = await supabase
    .from('hermes_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('importance', { ascending: false });
  if (error) throw new Error(error.message);
  const all = (data as HermesMemory[]) ?? [];
  return all.filter((m) => !(m.metadata as { proposal?: boolean } | null)?.proposal);
}

export const MemoryWorkspace = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('pins');
  const [proposalCount, setProposalCount] = useState(0);

  const {
    data: memories,
    loading,
    error,
    refresh,
  } = useAsyncResource<HermesMemory[]>(
    () => (user ? loadMemories(user.id) : Promise.resolve([])),
    [user?.id],
    { enabled: Boolean(user), timeoutMs: 6000 },
  );

  // Cheap proposals counter for the tab badge.
  useEffect(() => {
    if (!user) return;
    listProposals(user.id)
      .then((ps) => setProposalCount(ps.length))
      .catch(() => setProposalCount(0));
  }, [user?.id, tab]);

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

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex items-center gap-1">
          <TabButton
            active={tab === 'pins'}
            onClick={() => setTab('pins')}
            icon={Pin}
            label="Pins"
            count={count}
          />
          <TabButton
            active={tab === 'proposals'}
            onClick={() => setTab('proposals')}
            icon={Sparkles}
            label="Propostas"
            count={proposalCount}
            highlight={proposalCount > 0}
          />
        </div>

        {tab === 'pins' ? (
          loading ? (
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
            <div className="space-y-2">
              {memories.map((m) => (
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
              ))}
            </div>
          )
        ) : user ? (
          <ProposalsTab userId={user.id} />
        ) : null}
      </div>
    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  highlight,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Pin;
  label: string;
  count: number;
  highlight?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
      active
        ? 'bg-brand/15 text-fg-primary border border-brand/40 shadow-glow-brand'
        : 'border border-border-subtle text-fg-secondary hover:bg-bg-elevated',
    ].join(' ')}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
    <span
      className={[
        'ml-1 tabular-nums',
        highlight ? 'text-warn font-bold' : 'text-fg-muted',
      ].join(' ')}
    >
      {count}
    </span>
  </button>
);
