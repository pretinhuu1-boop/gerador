import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Cpu,
  Sparkles,
  Telescope,
  PencilLine,
  Wand2,
  AlertCircle,
  Crown,
  Wrench,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../../hooks/useAuth';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import {
  fetchAgentsRegistry,
  fetchAgentMetrics,
  type AgentDescriptor,
  type AgentMetrics,
  type AgentsRegistry,
} from '../../../services/channelOS/agentsService';
import { StatusChip } from '../../ui/StatusChip';
import { TopAppBar } from '../../shell/TopAppBar';
import { ErrorState } from '../WorkspaceState';
import { cn } from '../../../lib/cn';

const ICON_BY_KEY: Record<string, typeof Sparkles> = {
  orchestrator: Sparkles,
  scout: Telescope,
  content: PencilLine,
  editor: Wand2,
};

export const AgentsWorkspace = () => {
  const { user } = useAuth();
  const [active, setActive] = useState<AgentDescriptor | null>(null);

  const {
    data: registry,
    loading,
    error,
    refresh,
  } = useAsyncResource<AgentsRegistry>(
    () => fetchAgentsRegistry(),
    [user?.id],
    { enabled: Boolean(user), timeoutMs: 8000 },
  );

  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  useEffect(() => {
    if (!user) return;
    fetchAgentMetrics(user.id).then(setMetrics).catch(() => undefined);
  }, [user?.id]);

  const metricsByKey = new Map(metrics.map((m) => [m.key, m]));
  const totalAgents = registry?.agents.length ?? 0;
  const totalCalls = metrics.reduce((s, m) => s + m.total_calls, 0);
  const onlineCount = totalAgents; // gateway exposes them all as "available"
  const lastActive = metrics
    .map((m) => m.last_used_at)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  return (
    <div className="h-full flex flex-col canvas-grid">
      <TopAppBar
        right={
          <StatusChip tone={totalAgents > 0 ? 'brand' : 'default'}>
            {totalAgents} {totalAgents === 1 ? 'agente' : 'agentes'}
          </StatusChip>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-5">
        <StatRow
          total={totalAgents}
          online={onlineCount}
          totalCalls={totalCalls}
          lastActive={lastActive}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="surface-panel h-48 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            detail={error}
            onRetry={refresh}
            hint={
              <>
                Confere se o Hermes Gateway tá rodando — endpoint{' '}
                <code className="font-mono">/v1/agents</code> precisa responder.
              </>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {(registry?.agents ?? []).map((a) => (
                <AgentCard
                  key={a.key}
                  agent={a}
                  metrics={metricsByKey.get(a.key) ?? null}
                  active={active?.key === a.key}
                  onClick={() => setActive(a)}
                />
              ))}
            </div>
            <FallbackChain registry={registry} />
          </>
        )}
      </div>

      {active && (
        <AgentDetailDrawer
          agent={active}
          metrics={metricsByKey.get(active.key) ?? null}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  );
};

// ---- Stat row ----

const StatRow = ({
  total,
  online,
  totalCalls,
  lastActive,
}: {
  total: number;
  online: number;
  totalCalls: number;
  lastActive?: string | null;
}) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    <Stat label="Agentes" value={total} tone="brand" />
    <Stat label="Online" value={online} tone="online" />
    <Stat label="Tool calls" value={totalCalls} tone="info" />
    <Stat
      label="Última atividade"
      value={
        lastActive
          ? formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: ptBR })
          : '—'
      }
      tone="default"
    />
  </div>
);

const Stat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: 'brand' | 'online' | 'info' | 'default';
}) => {
  const valueColor = {
    brand: 'text-brand-light',
    online: 'text-success',
    info: 'text-info',
    default: 'text-fg-primary',
  }[tone];
  return (
    <div className="surface-panel px-4 py-3.5 flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-fg-muted font-mono">
        {label}
      </span>
      <span className={cn('font-display text-2xl font-bold tabular-nums', valueColor)}>
        {value}
      </span>
    </div>
  );
};

// ---- Agent card ----

const AgentCard = ({
  agent,
  metrics,
  active,
  onClick,
}: {
  agent: AgentDescriptor;
  metrics: AgentMetrics | null;
  active: boolean;
  onClick: () => void;
}) => {
  const Icon = ICON_BY_KEY[agent.key] ?? Bot;
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'text-left surface-panel p-4 transition-all hover:border-brand/40',
        active && 'border-brand/40 shadow-glow-brand',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-10 w-10 shrink-0 rounded-md flex items-center justify-center text-white font-mono text-[11px] font-bold tracking-wider"
          style={{
            backgroundColor: agent.badge_color,
            color: agent.is_main ? '#0a0a0e' : '#0a0a0e',
          }}
        >
          {agent.badge}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="font-display font-semibold text-sm text-fg-primary truncate">
              {agent.name}
            </div>
            {agent.is_main && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-brand-light">
                <Crown className="h-3 w-3" /> main
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-fg-secondary leading-relaxed line-clamp-2">
            {agent.description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StatusChip tone="online" dot>
          {agent.role}
        </StatusChip>
      </div>

      <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between text-[10px] font-mono text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <Cpu className="h-3 w-3" /> {agent.model.split('/').pop()}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wrench className="h-3 w-3" /> {agent.tools_count}
          {agent.tools_count === 1 ? ' tool' : ' tools'}
        </span>
        {metrics ? (
          <span className="tabular-nums">{metrics.total_calls} calls</span>
        ) : (
          <span className="opacity-60">—</span>
        )}
      </div>
    </motion.button>
  );
};

// ---- Detail drawer ----

const AgentDetailDrawer = ({
  agent,
  metrics,
  onClose,
}: {
  agent: AgentDescriptor;
  metrics: AgentMetrics | null;
  onClose: () => void;
}) => {
  const Icon = ICON_BY_KEY[agent.key] ?? Bot;
  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-bg-overlay/70 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-md h-full bg-bg-panel border-l border-border-subtle shadow-elevated overflow-y-auto"
      >
        <header className="h-14 px-5 border-b border-border-subtle flex items-center justify-between bg-bg-panel/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span
              className="h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold text-bg-base"
              style={{ backgroundColor: agent.badge_color }}
            >
              {agent.badge}
            </span>
            <span className="font-display font-semibold text-sm">{agent.name}</span>
            {agent.is_main && <StatusChip tone="brand">main</StatusChip>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
          >
            ×
          </button>
        </header>

        <div className="p-5 space-y-5">
          <p className="text-sm text-fg-secondary leading-relaxed">{agent.description}</p>

          <Section title="Modelo">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusChip tone="info">{agent.model.split('/').pop()}</StatusChip>
              {agent.model_chain.slice(1).map((m) => (
                <StatusChip key={m} tone="default">
                  fallback · {m.split('/').pop()}
                </StatusChip>
              ))}
            </div>
            <div className="mt-2 text-[10px] font-mono text-fg-muted">
              temperature: <span className="text-fg-secondary">{agent.temperature}</span> ·
              cache: <span className="text-fg-secondary">{agent.cache_system_prompt ? 'on' : 'off'}</span> ·
              prompt: <span className="text-fg-secondary tabular-nums">{agent.system_prompt_chars} chars</span>
            </div>
          </Section>

          <Section title={`Allowed tools (${agent.tools_count})`}>
            <div className="flex flex-wrap gap-1.5">
              {agent.allowed_tools.map((t) => (
                <code
                  key={t}
                  className="text-[10px] font-mono px-2 py-1 rounded-md bg-bg-elevated border border-border-subtle text-fg-secondary"
                >
                  {t}
                </code>
              ))}
            </div>
          </Section>

          <Section title="Atividade">
            {metrics ? (
              <div className="text-xs text-fg-secondary space-y-1">
                <div>
                  Total de calls:{' '}
                  <span className="font-mono tabular-nums text-fg-primary">
                    {metrics.total_calls}
                  </span>
                </div>
                {metrics.last_used_at && (
                  <div>
                    Última vez:{' '}
                    <span className="font-mono text-fg-primary">
                      {formatDistanceToNow(new Date(metrics.last_used_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-fg-muted">Sem atividade registrada ainda.</p>
            )}
          </Section>
        </div>
      </motion.aside>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted mb-2">
      {title}
    </h3>
    {children}
  </div>
);

const FallbackChain = ({ registry }: { registry: AgentsRegistry | null }) => {
  if (!registry || registry.fallback_chain.length === 0) return null;
  return (
    <div className="surface-panel p-4 flex items-start gap-3">
      <AlertCircle className="h-4 w-4 text-info shrink-0 mt-px" />
      <div className="flex-1 text-xs text-fg-secondary">
        <div className="font-semibold text-fg-primary mb-1">Fallback global ativo</div>
        <p className="leading-relaxed mb-2">
          Se Hermes falhar, OpenRouter roteia automaticamente pra:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {registry.fallback_chain.map((m) => (
            <code
              key={m}
              className="text-[10px] font-mono px-2 py-1 rounded-md bg-bg-elevated border border-border-subtle"
            >
              {m}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
};
