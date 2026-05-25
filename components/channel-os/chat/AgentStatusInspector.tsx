import { useEffect, useState } from 'react';
import { Brain, MessageSquare, PencilLine, Pin, Sparkles, Telescope, Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../services/supabase';
import type { HermesMessage } from '../../../types/database';
import { Inspector, InspectorSection } from '../../ui/Inspector';
import { StatusChip } from '../../ui/StatusChip';

interface AgentRow {
  key: string;
  name: string;
  model: string;
  tone: 'online' | 'idle' | 'pending';
  icon: typeof Sparkles;
  description?: string;
}

const AGENTS: AgentRow[] = [
  { key: 'orchestrator', name: 'Hermes', model: '4.3-36B', tone: 'online', icon: Sparkles, description: 'Orquestrador' },
  { key: 'scout', name: 'Scout', model: '4-14B', tone: 'online', icon: Telescope, description: 'Discovery YouTube' },
  { key: 'content', name: 'Content', model: '4-14B', tone: 'idle', icon: PencilLine, description: 'Roteirização' },
];

interface ActivityEvent {
  id: string;
  ts: string;
  agent: string;
  action: string;
  detail: string;
  icon: typeof Sparkles;
}

const ICON_BY_AGENT: Record<string, typeof Sparkles> = {
  scout: Telescope,
  content: PencilLine,
  orchestrator: Sparkles,
  memory: Pin,
  system: MessageSquare,
};

function summarizeMessage(m: HermesMessage): ActivityEvent | null {
  if (m.role === 'tool' && m.tool_call_id) {
    const agent = (m.agent_name ?? 'system').toLowerCase();
    const Icon = m.tool_calls ? Wrench : ICON_BY_AGENT[agent] ?? Sparkles;
    return {
      id: m.id,
      ts: m.created_at,
      agent,
      action: 'tool.result',
      detail: (m.content ?? '').slice(0, 50),
      icon: Icon,
    };
  }
  if (m.role === 'assistant' && m.agent_name) {
    const Icon = ICON_BY_AGENT[m.agent_name] ?? Sparkles;
    return {
      id: m.id,
      ts: m.created_at,
      agent: m.agent_name,
      action: 'assistant',
      detail: (m.content ?? '').slice(0, 50),
      icon: Icon,
    };
  }
  return null;
}

export const AgentStatusInspector = () => {
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [memoryCount, setMemoryCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    Promise.all([
      supabase
        .from('hermes_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('hermes_memory')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('active', true),
    ]).then(([msgRes, memRes]) => {
      if (cancelled) return;
      const events = ((msgRes.data as HermesMessage[]) ?? [])
        .map(summarizeMessage)
        .filter((e): e is ActivityEvent => e !== null)
        .slice(0, 12);
      setActivity(events);
      setMemoryCount(memRes.count ?? 0);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <Inspector aria-label="Agentes e atividade">
      <InspectorSection
        title="Agentes"
        action={<StatusChip tone="online" dot>{AGENTS.filter((a) => a.tone === 'online').length} ativos</StatusChip>}
      >
        <ul className="space-y-1.5">
          {AGENTS.map((a) => {
            const Icon = a.icon;
            return (
              <li
                key={a.key}
                className="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-bg-elevated transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-brand-light shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-fg-primary truncate">
                    {a.name}{' '}
                    <span className="font-mono text-[10px] text-fg-muted">· {a.model}</span>
                  </div>
                  {a.description && (
                    <div className="text-[10px] text-fg-muted truncate">{a.description}</div>
                  )}
                </div>
                <StatusChip tone={a.tone} dot>
                  {a.tone === 'online' ? 'online' : a.tone === 'idle' ? 'idle' : 'pending'}
                </StatusChip>
              </li>
            );
          })}
        </ul>
      </InspectorSection>

      <InspectorSection
        title="Memória"
        action={
          memoryCount !== null && (
            <span className="text-[10px] font-mono text-fg-muted tabular-nums">
              {memoryCount} {memoryCount === 1 ? 'pin' : 'pins'}
            </span>
          )
        }
      >
        <div className="flex items-center gap-2.5 text-xs text-fg-secondary">
          <Brain className="h-3.5 w-3.5 text-brand-light" />
          <span>Hermes recupera pins relevantes a cada turn.</span>
        </div>
      </InspectorSection>

      <InspectorSection title="Atividade recente" className="flex-1 overflow-y-auto">
        {activity.length === 0 ? (
          <p className="text-[11px] text-fg-muted">
            Sem atividade ainda. Manda a primeira mensagem pro Hermes.
          </p>
        ) : (
          <ol className="space-y-2">
            {activity.map((e) => {
              const Icon = e.icon;
              return (
                <li key={e.id} className="flex items-start gap-2 text-[11px]">
                  <span className="font-mono text-[10px] text-fg-muted shrink-0 tabular-nums">
                    {formatTime(e.ts)}
                  </span>
                  <Icon className="h-3 w-3 mt-0.5 text-brand-light shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-fg-secondary">
                      <span className="font-mono text-fg-muted">{e.agent}.</span>
                      <span>{e.action}</span>
                    </div>
                    {e.detail && (
                      <div className="text-fg-muted truncate leading-snug">{e.detail}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </InspectorSection>

      <div className="mt-auto px-4 py-2.5 border-t border-border-subtle text-[10px] font-mono text-fg-muted">
        atualizado {activity.length > 0 ? formatDistance(activity[0].ts) : '—'}
      </div>
    </Inspector>
  );
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDistance(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
  } catch {
    return '—';
  }
}
