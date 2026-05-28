import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Telescope,
  PencilLine,
  Brain,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ChevronDown,
  ChevronRight,
  Wrench,
} from 'lucide-react';
import {
  executeMission,
  fetchMission,
  subscribeMission,
} from '../../../services/channelOS/missionsService';
import type {
  HermesMission,
  HermesMissionStep,
  HermesMissionStepStatus,
} from '../../../types/database';
import { Button } from '../../ui/Button';
import { StatusChip } from '../../ui/StatusChip';
import { cn } from '../../../lib/cn';

const AGENT_ICON: Record<string, typeof Sparkles> = {
  orchestrator: Sparkles,
  scout: Telescope,
  content: PencilLine,
  memory: Brain,
};

const AGENT_COLOR: Record<string, string> = {
  orchestrator: '#a855f7',
  scout: '#38f8a7',
  content: '#facc15',
  memory: '#a855f7',
};

const STEP_STATUS_TONE: Record<HermesMissionStepStatus, 'default' | 'online' | 'pending' | 'blocked' | 'info'> = {
  pending: 'default',
  running: 'info',
  done: 'online',
  error: 'blocked',
  skipped: 'default',
  cancelled: 'default',
};

interface Props {
  missionId: string;
  /** Optional initial plan (shown immediately while we fetch the full record). */
  initialTitle?: string;
}

export const MissionCard = ({ missionId, initialTitle }: Props) => {
  const [mission, setMission] = useState<HermesMission | null>(null);
  const [steps, setSteps] = useState<HermesMissionStep[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMission(missionId)
      .then((res) => {
        if (cancelled || !res) return;
        setMission(res.mission);
        setSteps(res.steps);
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    const unsub = subscribeMission(missionId, ({ mission: m, step }) => {
      if (cancelled) return;
      if (m) setMission(m);
      if (step) {
        setSteps((prev) => {
          const idx = prev.findIndex((s) => s.id === step.id);
          if (idx === -1) return [...prev, step].sort((a, b) => a.step_index - b.step_index);
          const next = [...prev];
          next[idx] = step;
          return next;
        });
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [missionId]);

  const onExecute = async () => {
    setExecuting(true);
    setError(null);
    try {
      await executeMission(missionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setExecuting(false);
    }
  };

  const title = mission?.title ?? initialTitle ?? 'Carregando missão…';
  const status = mission?.status ?? 'draft';
  const isApproved = ['running', 'done'].includes(status);
  const isRunning = status === 'running';
  const isDone = status === 'done';
  const isError = status === 'error';
  const progress = mission?.progress ?? 0;

  return (
    <div className="surface-elevated rounded-xl overflow-hidden animate-fade-in">
      <header className="px-4 py-3 flex items-start gap-3 border-b border-border-subtle">
        <div className="h-9 w-9 shrink-0 rounded-md flex items-center justify-center bg-brand/15 border border-brand/30">
          <Sparkles className="h-4 w-4 text-brand-light" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
              missão
            </span>
            <StatusChip
              tone={
                isDone ? 'online' : isError ? 'blocked' : isRunning ? 'info' : 'brand'
              }
              dot={isRunning}
            >
              {status}
            </StatusChip>
          </div>
          <h3 className="font-display font-semibold text-sm text-fg-primary mt-0.5">{title}</h3>
          {mission?.brief && (
            <p className="text-xs text-fg-muted mt-1 line-clamp-2 leading-relaxed">
              {mission.brief}
            </p>
          )}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? 'Colapsar' : 'Expandir'}
          className="shrink-0 h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </header>

      {isApproved && (
        <div className="px-4 py-2 border-b border-border-subtle/60 bg-bg-base/40">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-fg-muted tabular-nums">
              {mission?.done_steps ?? 0} / {mission?.total_steps ?? steps.length} steps
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-bg-overlay overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isError ? 'bg-danger' : isDone ? 'bg-success' : 'bg-brand',
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-fg-muted tabular-nums w-9 text-right">
              {progress}%
            </span>
          </div>
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <ol className="px-4 py-3 space-y-2">
              {steps.length === 0 ? (
                <li className="text-xs text-fg-muted text-center py-4 inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Hermes está montando o plano…
                </li>
              ) : (
                steps.map((s) => <StepRow key={s.id} step={s} />)
              )}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>

      {!isApproved && steps.length > 0 && (
        <footer className="px-4 py-3 border-t border-border-subtle flex items-center justify-between gap-2 bg-bg-base/40">
          {error && (
            <span className="text-xs text-danger truncate flex-1">{error}</span>
          )}
          {!error && (
            <span className="text-[11px] text-fg-muted flex-1">
              Aprova pra Hermes começar a executar.
            </span>
          )}
          <Button variant="primary" size="sm" loading={executing} onClick={onExecute}>
            {!executing && <Play className="h-3.5 w-3.5" />}
            Aprovar e rodar
          </Button>
        </footer>
      )}
    </div>
  );
};

const StepRow = ({ step }: { step: HermesMissionStep }) => {
  const Icon = AGENT_ICON[step.agent_key] ?? Sparkles;
  const color = AGENT_COLOR[step.agent_key] ?? '#a855f7';
  const tone = STEP_STATUS_TONE[step.status];
  return (
    <li className="surface-panel rounded-lg p-3 flex items-start gap-3">
      <span className="font-mono text-[10px] text-fg-muted shrink-0 w-6 tabular-nums">
        #{step.step_index}
      </span>
      <Icon
        className="h-3.5 w-3.5 shrink-0 mt-0.5"
        style={{ color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-fg-primary leading-snug">{step.title}</p>
          <StepStatus status={step.status} tone={tone} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-mono text-fg-muted">
          <span className="capitalize" style={{ color }}>
            {step.agent_key}
          </span>
          {step.tool_name && (
            <span className="inline-flex items-center gap-1">
              <Wrench className="h-3 w-3" /> {step.tool_name}
            </span>
          )}
          {step.depends_on?.length ? (
            <span>
              ← #{step.depends_on.join(', #')}
            </span>
          ) : null}
        </div>
        {step.status === 'error' && step.error && (
          <p className="mt-1.5 text-[11px] text-danger break-words font-mono">{step.error}</p>
        )}
        {step.status === 'done' && step.result && (
          <ResultPreview result={step.result} />
        )}
      </div>
    </li>
  );
};

const StepStatus = ({
  status,
  tone,
}: {
  status: HermesMissionStepStatus;
  tone: 'default' | 'online' | 'pending' | 'blocked' | 'info';
}) => {
  const Icon = {
    pending: Clock,
    running: Loader2,
    done: CheckCircle2,
    error: XCircle,
    skipped: Clock,
    cancelled: XCircle,
  }[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
        tone === 'online' && 'bg-success/15 text-success',
        tone === 'blocked' && 'bg-danger/15 text-danger',
        tone === 'info' && 'bg-info/15 text-info',
        tone === 'default' && 'bg-fg-muted/15 text-fg-muted',
      )}
    >
      <Icon
        className={cn('h-3 w-3', status === 'running' && 'animate-spin')}
      />
      {status}
    </span>
  );
};

const ResultPreview = ({ result }: { result: Record<string, unknown> }) => {
  const keys = Object.keys(result).filter((k) => result[k] != null).slice(0, 4);
  if (!keys.length) return null;
  return (
    <div className="mt-1.5 text-[10px] font-mono text-fg-muted flex flex-wrap gap-2">
      {keys.map((k) => {
        const v = result[k];
        const display =
          typeof v === 'string'
            ? v.slice(0, 40)
            : Array.isArray(v)
              ? `${v.length} items`
              : typeof v === 'number'
                ? String(v)
                : '…';
        return (
          <span key={k} className="inline-flex items-center gap-1">
            <span className="text-fg-secondary">{k}:</span>
            <span className="text-fg-primary truncate max-w-[12rem]">{display}</span>
          </span>
        );
      })}
    </div>
  );
};
