import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  Check,
  X,
  Wand2,
  Zap,
  Pin as PinIcon,
  Workflow,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  approveProposal,
  listProposals,
  rejectProposal,
  runImprover,
  type ImproverProposal,
  type ProposalKind,
} from '../../../services/channelOS/proposalsService';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { LoadingGrid, ErrorState } from '../WorkspaceState';

interface Props {
  userId: string;
}

const KIND_META: Record<ProposalKind, { label: string; icon: typeof Wand2; color: string }> = {
  skill: { label: 'Skill nova', icon: Wand2, color: '#a855f7' },
  automation: { label: 'Automação', icon: Zap, color: '#facc15' },
  memory_pin: { label: 'Memory pin', icon: PinIcon, color: '#22d3a8' },
  mission_template: { label: 'Mission template', icon: Workflow, color: '#60a5fa' },
};

export const ProposalsTab = ({ userId }: Props) => {
  const [proposals, setProposals] = useState<ImproverProposal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const refresh = async () => {
    setError(null);
    try {
      setProposals(await listProposals(userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    refresh();
  }, [userId]);

  const triggerRun = async () => {
    setRunning(true);
    setError(null);
    try {
      await runImprover(7);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const onApprove = async (p: ImproverProposal) => {
    setActingId(p.id);
    try {
      await approveProposal(p.id, p.metadata);
      setProposals((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActingId(null);
    }
  };

  const onReject = async (p: ImproverProposal) => {
    setActingId(p.id);
    try {
      await rejectProposal(p.id);
      setProposals((prev) => prev?.filter((x) => x.id !== p.id) ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand" />
            Propostas do Improver
          </h2>
          <p className="text-xs text-fg-muted mt-0.5">
            Análise meta da sua atividade dos últimos 7 dias → sugestões de skills, automations,
            memory pins e mission templates. Aprove pra virar pin fixo, rejeite pra descartar.
          </p>
        </div>
        <Button variant="secondary" size="sm" loading={running} onClick={triggerRun}>
          {!running && <Sparkles className="h-3.5 w-3.5" />}
          Rodar Improver
        </Button>
      </header>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      {proposals === null ? (
        <LoadingGrid count={3} />
      ) : proposals.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle bg-bg-elevated/30 py-12 text-center text-sm text-fg-muted">
          Sem propostas pendentes. Clica em <strong className="text-fg-secondary">Rodar Improver</strong>{' '}
          pra analisar sua atividade recente.
        </div>
      ) : (
        <div className="grid gap-3">
          {proposals.map((p) => {
            const kind = (p.metadata.proposal_kind as ProposalKind) ?? 'memory_pin';
            const meta = KIND_META[kind] ?? KIND_META.memory_pin;
            const Icon = meta.icon;
            const steps = (p.metadata.steps as string[] | undefined) ?? [];
            const rationale = p.metadata.rationale as string | undefined;
            const acting = actingId === p.id;
            return (
              <motion.article
                key={p.id}
                whileHover={{ y: -1 }}
                className="surface-elevated rounded-2xl border border-border-subtle p-4 flex flex-col gap-3"
              >
                <header className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                    style={{
                      background: `${meta.color}22`,
                      border: `1px solid ${meta.color}55`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge size="sm" variant="brand">
                        {meta.label}
                      </Badge>
                      <span className="text-[10px] text-fg-muted font-mono">
                        importância {p.importance}/5
                      </span>
                      <span className="text-[10px] text-fg-muted">
                        há {formatDistanceToNow(new Date(p.updated_at), { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1.5 leading-relaxed">{p.content}</p>
                  </div>
                </header>

                {rationale && (
                  <div className="rounded-lg border border-border-subtle bg-bg-base/40 px-3 py-2 text-xs text-fg-secondary">
                    <span className="text-[10px] uppercase tracking-wider text-fg-muted font-mono block mb-1">
                      Por quê
                    </span>
                    {rationale}
                  </div>
                )}

                {steps.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-fg-muted font-mono block mb-1.5">
                      Passos sugeridos
                    </span>
                    <ol className="space-y-1 text-xs text-fg-secondary pl-5 list-decimal">
                      {steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <footer className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReject(p)}
                    disabled={acting}
                    className="text-fg-muted hover:text-danger"
                  >
                    <X className="h-3.5 w-3.5" /> Rejeitar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApprove(p)}
                    loading={acting}
                  >
                    {!acting && <Check className="h-3.5 w-3.5" />}
                    Aprovar e fixar
                  </Button>
                </footer>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};
