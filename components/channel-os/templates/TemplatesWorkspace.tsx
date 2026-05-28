import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Package,
  Wrench,
  Workflow,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import { TopAppBar } from '../../shell/TopAppBar';
import { StatusChip } from '../../ui/StatusChip';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { ErrorState, LoadingGrid } from '../WorkspaceState';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchTemplates,
  type TemplatesRegistry,
  type VideoTemplate,
} from '../../../services/channelOS/templatesService';
import {
  deactivateKnowledgePin,
  listKnowledgeByKind,
  listKnowledgeCounts,
  type KnowledgeKind,
  type KnowledgeRecord,
} from '../../../services/channelOS/knowledgeService';
import { AddKnowledgePinModal } from './AddKnowledgePinModal';

type Tab = 'local' | 'remotion_template' | 'remotion_library' | 'remotion_skill' | 'remotion_workflow';

const TABS: { id: Tab; label: string; icon: typeof Film; kind?: KnowledgeKind }[] = [
  { id: 'local', label: 'Locais (renderizáveis)', icon: Film },
  { id: 'remotion_template', label: 'Templates comunidade', icon: Film, kind: 'remotion_template' },
  { id: 'remotion_library', label: 'Libraries', icon: Package, kind: 'remotion_library' },
  { id: 'remotion_skill', label: 'Skills', icon: Wrench, kind: 'remotion_skill' },
  { id: 'remotion_workflow', label: 'Workflows', icon: Workflow, kind: 'remotion_workflow' },
];

export const TemplatesWorkspace = () => {
  const [tab, setTab] = useState<Tab>('local');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  /** Bumped after a successful pin create/deactivate to invalidate the community list. */
  const [refreshTick, setRefreshTick] = useState(0);

  const {
    data: registry,
    loading: loadingLocal,
    error: errorLocal,
    refresh,
  } = useAsyncResource<TemplatesRegistry>(() => fetchTemplates(), [], { timeoutMs: 8000 });

  const [counts, setCounts] = useState<Record<KnowledgeKind, number> | null>(null);
  const reloadCounts = () =>
    listKnowledgeCounts()
      .then(setCounts)
      .catch(() => setCounts({} as Record<KnowledgeKind, number>));
  useEffect(() => {
    reloadCounts();
  }, [refreshTick]);

  const canAddPin = tab !== 'local';
  const currentKind: KnowledgeKind | null = tab === 'local' ? null : (tab as KnowledgeKind);

  return (
    <div className="h-full flex flex-col canvas-grid">
      <TopAppBar
        right={
          <StatusChip tone="brand">
            {(registry?.count ?? 0) + (counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0)} items
          </StatusChip>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-5">
        <header className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-bold">Templates & ecossistema Remotion</h1>
          <p className="text-sm text-fg-secondary">
            4 compositions renderizáveis localmente + biblioteca curada de templates, libs, skills
            e workflows da comunidade pra inspirar/plugar.
          </p>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const count =
                t.id === 'local'
                  ? (registry?.count ?? 0)
                  : counts?.[t.kind!] ?? 0;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition',
                    active
                      ? 'bg-brand/15 text-fg-primary border border-brand/40 shadow-glow-brand'
                      : 'border border-border-subtle text-fg-secondary hover:bg-bg-elevated',
                  ].join(' ')}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                  <span className="ml-1 text-fg-muted">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="relative inline-flex items-center flex-1 sm:w-72">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-fg-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, tag, descrição…"
                className="w-full rounded-lg border border-border-subtle bg-bg-elevated pl-8 pr-3 py-1.5 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-brand/50"
              />
            </label>
            {canAddPin && (
              <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            )}
          </div>
        </div>

        {tab === 'local' ? (
          loadingLocal ? (
            <LoadingGrid count={4} />
          ) : errorLocal ? (
            <ErrorState
              detail={errorLocal}
              onRetry={refresh}
              hint="O gateway expõe /v1/templates — verifique se está rodando."
            />
          ) : (
            <LocalGrid templates={filterTemplates(registry?.templates ?? [], search)} />
          )
        ) : (
          <CommunityTab
            kind={tab as KnowledgeKind}
            search={search}
            refreshTick={refreshTick}
            onDeactivate={() => setRefreshTick((n) => n + 1)}
          />
        )}
      </div>

      {currentKind && (
        <AddKnowledgePinModal
          kind={currentKind}
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onCreated={() => {
            setRefreshTick((n) => n + 1);
            reloadCounts();
          }}
        />
      )}
    </div>
  );
};

function filterTemplates(templates: VideoTemplate[], search: string): VideoTemplate[] {
  if (!search.trim()) return templates;
  const q = search.toLowerCase();
  return templates.filter((t) =>
    [t.label, t.description, ...t.recommended_for, ...t.example_briefs]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}

const LocalGrid = ({ templates }: { templates: VideoTemplate[] }) => {
  if (templates.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated/30 py-12 text-center text-sm text-fg-muted">
        Nada bateu com sua busca.
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((t) => (
        <motion.article
          key={t.id}
          whileHover={{ y: -2 }}
          className="surface-elevated rounded-2xl border border-border-subtle p-5 flex flex-col gap-3"
        >
          <header className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: `${t.badge_color}22`,
                border: `1px solid ${t.badge_color}55`,
              }}
            >
              <Film className="h-5 w-5" style={{ color: t.badge_color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-semibold text-sm">{t.label}</div>
              <div className="text-[10px] uppercase tracking-wider text-fg-muted font-mono">
                {t.id} · {t.aspect_ratio} · {t.default_duration_seconds}s · {t.fps}fps
              </div>
            </div>
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 border border-success/30"
              title="Renderizável agora"
            >
              <Check className="h-3 w-3 text-success" />
            </span>
          </header>
          <p className="text-xs text-fg-secondary line-clamp-3">{t.description}</p>
          <div className="flex flex-wrap gap-1">
            {t.recommended_for.slice(0, 5).map((tag) => (
              <Badge key={tag} size="sm">
                {tag}
              </Badge>
            ))}
          </div>
          {t.example_briefs.length > 0 && (
            <div className="rounded-lg border border-border-subtle bg-bg-base/40 px-3 py-2 text-[11px] text-fg-secondary italic">
              "{t.example_briefs[0]}"
            </div>
          )}
        </motion.article>
      ))}
    </div>
  );
};

const CommunityTab = ({
  kind,
  search,
  refreshTick,
  onDeactivate,
}: {
  kind: KnowledgeKind;
  search: string;
  refreshTick: number;
  onDeactivate: () => void;
}) => {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useAsyncResource<{
    records: KnowledgeRecord[];
    total: number;
  }>(() => listKnowledgeByKind(kind), [kind, refreshTick], { timeoutMs: 8000 });

  if (loading) return <LoadingGrid count={6} />;
  if (error) {
    return (
      <ErrorState
        detail={error}
        onRetry={refresh}
        hint="hermes_knowledge tá vazia? Rode `python -m scripts.seed_knowledge` no gateway pra popular."
      />
    );
  }
  const records = useFilter(data?.records ?? [], search);
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-elevated/30 py-12 text-center text-sm text-fg-muted">
        {data?.records.length === 0
          ? 'Nenhum record desse tipo na base ainda. Rode o seeder pra popular a biblioteca ou clica em "Adicionar" pra criar o primeiro pin.'
          : 'Nada bateu com sua busca.'}
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {records.map((r) => (
        <CommunityCard
          key={r.id}
          record={r}
          ownedByMe={Boolean(user && r.user_id === user.id)}
          onDeactivate={onDeactivate}
        />
      ))}
    </div>
  );
};

function useFilter(records: KnowledgeRecord[], search: string): KnowledgeRecord[] {
  return useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      [r.title, r.summary ?? '', r.content, ...(r.metadata.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [records, search]);
}

const CommunityCard = ({
  record,
  ownedByMe,
  onDeactivate,
}: {
  record: KnowledgeRecord;
  ownedByMe: boolean;
  onDeactivate: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const link = record.metadata.link;
  const install = record.metadata.install;
  const tags = record.metadata.tags ?? [];

  const copy = async () => {
    if (!install) return;
    try {
      await navigator.clipboard.writeText(install);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore — some browsers block clipboard in non-secure contexts
    }
  };

  const deactivate = async () => {
    if (!ownedByMe) return;
    if (!window.confirm(`Remover "${record.title}" da sua biblioteca? Pode reativar via SQL depois.`)) return;
    setDeactivating(true);
    try {
      await deactivateKnowledgePin(record.id);
      onDeactivate();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    } finally {
      setDeactivating(false);
    }
  };

  const isOficial = tags.includes('oficial');
  const isCommunity = tags.includes('community') || tags.includes('reference');

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="surface-elevated rounded-2xl border border-border-subtle p-5 flex flex-col gap-3"
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-sm truncate">{record.title}</div>
          <div className="text-[10px] uppercase tracking-wider text-fg-muted font-mono">
            {record.slug}
          </div>
        </div>
        {ownedByMe && (
          <Badge size="sm" variant="accent">
            seu
          </Badge>
        )}
        {isOficial && (
          <Badge size="sm" variant="brand">
            <Sparkles className="h-3 w-3" /> oficial
          </Badge>
        )}
        {!ownedByMe && !isOficial && isCommunity && (
          <Badge size="sm" variant="info">
            community
          </Badge>
        )}
      </header>
      <p className="text-xs text-fg-secondary line-clamp-3">{record.summary ?? record.content}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 6).map((tag) => (
            <Badge key={tag} size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {install && (
        <button
          onClick={copy}
          type="button"
          className="flex items-center justify-between gap-2 rounded-lg border border-border-subtle bg-bg-base/40 px-3 py-2 font-mono text-[11px] text-fg-secondary hover:border-brand/40 hover:text-fg-primary transition"
          aria-label="Copiar comando de install"
        >
          <span className="truncate">{install}</span>
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success shrink-0" />
          ) : (
            <Copy className="h-3.5 w-3.5 shrink-0" />
          )}
        </button>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {hostnameSafe(link)}
          </a>
        ) : (
          <span />
        )}
        {ownedByMe && (
          <button
            type="button"
            onClick={deactivate}
            disabled={deactivating}
            aria-label="Remover pin"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-fg-muted hover:text-danger hover:bg-danger/10 transition disabled:opacity-50"
            title="Remover este pin (soft delete)"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.article>
  );
};

function hostnameSafe(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.slice(0, 30);
  }
}
