import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, FileText, Megaphone, Tag, Save, Film, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Input, Textarea } from '../../ui/Input';
import type { ContentBeat, ContentDraft } from '../../../types/database';
import { updateDraft } from '../../../services/channelOS/contentService';
import { DraftPreview } from './DraftPreview';
import { cn } from '../../../lib/cn';

interface Props {
  draft: ContentDraft;
  onClose: () => void;
  onSaved: (next: ContentDraft) => void;
}

export const DraftDetail = ({ draft, onClose, onSaved }: Props) => {
  const [title, setTitle] = useState(draft.title);
  const [hook, setHook] = useState(draft.hook ?? '');
  const [thesis, setThesis] = useState(draft.thesis ?? '');
  const [cta, setCta] = useState(draft.cta ?? '');
  const [hashtags, setHashtags] = useState(draft.hashtags.join(' '));
  const [beats, setBeats] = useState<ContentBeat[]>(draft.beats);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    setTitle(draft.title);
    setHook(draft.hook ?? '');
    setThesis(draft.thesis ?? '');
    setCta(draft.cta ?? '');
    setHashtags(draft.hashtags.join(' '));
    setBeats(draft.beats);
    setDirty(false);
  }, [draft.id]);

  const markDirty = () => setDirty(true);

  const onBeatChange = (idx: number, patch: Partial<ContentBeat>) => {
    setBeats((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
    markDirty();
  };

  const onAddBeat = () => {
    setBeats((prev) => [...prev, { text: '' }]);
    markDirty();
  };

  const onRemoveBeat = (idx: number) => {
    setBeats((prev) => prev.filter((_, i) => i !== idx));
    markDirty();
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const next = await updateDraft(draft.id, {
        title: title.trim() || 'Sem título',
        hook: hook.trim() || null,
        thesis: thesis.trim() || null,
        cta: cta.trim() || null,
        hashtags: hashtags
          .split(/\s+/)
          .map((h) => h.replace(/^#/, '').trim())
          .filter(Boolean),
        beats: beats.filter((b) => b.text.trim().length > 0),
      });
      onSaved(next);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-stretch justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-bg-overlay/70 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: 560 }}
        animate={{ x: 0 }}
        exit={{ x: 560 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-xl h-full bg-bg-panel border-l border-border-subtle shadow-elevated flex flex-col"
      >
        <div className="h-14 shrink-0 px-5 border-b border-border-subtle flex items-center justify-between gap-3 bg-bg-panel/95 backdrop-blur">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-brand shrink-0" />
            <span className="text-xs font-mono text-fg-muted uppercase tracking-wider">draft</span>
            <Badge variant="default" size="sm" className="capitalize">
              {draft.format}
            </Badge>
            <Badge variant="brand" size="sm">{draft.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" loading={saving} disabled={!dirty || saving} onClick={save}>
              {!saving && <Save className="h-3.5 w-3.5" />}
              {dirty ? 'Salvar' : 'Salvo'}
            </Button>
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="shrink-0 px-5 pt-3 border-b border-border-subtle/60 bg-bg-panel/95 backdrop-blur">
          <div className="inline-flex p-0.5 rounded-lg bg-bg-elevated border border-border-subtle">
            <TabButton active={tab === 'editor'} onClick={() => setTab('editor')} icon={Pencil}>
              Editor
            </TabButton>
            <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={Film}>
              Preview
            </TabButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === 'preview' && (
            <DraftPreview
              draft={{
                ...draft,
                title: title.trim() || draft.title,
                hook: hook.trim() || draft.hook,
                cta: cta.trim() || draft.cta,
                beats: beats.filter((b) => b.text.trim().length > 0),
              }}
            />
          )}
          {tab !== 'editor' ? null : (
          <>
          <Field label="Título">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
            />
          </Field>

          <Field label="Hook" hint="Primeiros 3 segundos: a promessa que segura o viewer.">
            <Textarea
              value={hook}
              rows={2}
              onChange={(e) => {
                setHook(e.target.value);
                markDirty();
              }}
              placeholder="Ex: Você acha que sabe a história do Egito? Espera só ver o que acharam debaixo de Saqqara."
            />
          </Field>

          <Field label="Tese / argumento central">
            <Textarea
              value={thesis}
              rows={2}
              onChange={(e) => {
                setThesis(e.target.value);
                markDirty();
              }}
              placeholder="O que o vídeo está afirmando, em 1-2 frases."
            />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                Beats ({beats.length})
              </h3>
              <Button size="xs" variant="ghost" onClick={onAddBeat}>
                + Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {beats.length === 0 ? (
                <div className="text-xs text-fg-muted text-center py-6 surface-panel rounded-lg">
                  Sem beats. Use o Hermes Chat pra gerar ou clique "Adicionar".
                </div>
              ) : (
                beats.map((beat, idx) => (
                  <BeatRow
                    key={idx}
                    index={idx}
                    beat={beat}
                    onChange={(p) => onBeatChange(idx, p)}
                    onRemove={() => onRemoveBeat(idx)}
                  />
                ))
              )}
            </div>
          </div>

          <Field label="CTA" hint="Última fala / overlay final.">
            <Input
              value={cta}
              onChange={(e) => {
                setCta(e.target.value);
                markDirty();
              }}
              placeholder="Segue pra parte 2 amanhã"
            />
          </Field>

          <Field label="Hashtags" hint="Separadas por espaço. Pode incluir ou omitir o #.">
            <Input
              value={hashtags}
              onChange={(e) => {
                setHashtags(e.target.value);
                markDirty();
              }}
              placeholder="#mistery #ancient #egypt"
            />
          </Field>

          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </div>
          )}

          <Metadata draft={draft} />
          </>
          )}
        </div>
      </motion.aside>
    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
      active ? 'bg-bg-base text-fg-primary shadow-card' : 'text-fg-muted hover:text-fg-primary',
    )}
  >
    <Icon className="h-3.5 w-3.5" />
    {children}
  </button>
);

const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-xs font-medium text-fg-secondary mb-1 block">{label}</span>
    {children}
    {hint && <span className="block mt-1 text-[10px] text-fg-muted">{hint}</span>}
  </label>
);

const BeatRow = ({
  index,
  beat,
  onChange,
  onRemove,
}: {
  index: number;
  beat: ContentBeat;
  onChange: (patch: Partial<ContentBeat>) => void;
  onRemove: () => void;
}) => (
  <div className="surface-panel rounded-lg p-3 space-y-2">
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] text-fg-muted w-6 shrink-0">#{index + 1}</span>
      <Input
        type="number"
        value={beat.t ?? ''}
        onChange={(e) => onChange({ t: e.target.value ? Number(e.target.value) : undefined })}
        placeholder="seg"
        className="w-20 text-xs"
      />
      <Input
        value={beat.caption ?? ''}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="caption (opcional)"
        className="text-xs flex-1"
      />
      <button
        onClick={onRemove}
        aria-label="Remover beat"
        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-danger hover:bg-bg-elevated shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
    <Textarea
      value={beat.text}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Fala do beat (será TTS-ado pelo ElevenLabs na render)"
      rows={2}
      className="text-sm"
    />
    {beat.b_roll !== undefined && (
      <Input
        value={beat.b_roll ?? ''}
        onChange={(e) => onChange({ b_roll: e.target.value })}
        placeholder="b-roll (descrição visual)"
        className="text-xs"
      />
    )}
  </div>
);

const Metadata = ({ draft }: { draft: ContentDraft }) => {
  const created = format(new Date(draft.created_at), 'dd MMM yyyy HH:mm');
  const updated = format(new Date(draft.updated_at), 'dd MMM yyyy HH:mm');
  return (
    <div className="border-t border-border-subtle pt-3 text-[10px] font-mono text-fg-muted space-y-1">
      <div className="flex items-center gap-1.5">
        <Tag className="h-3 w-3" /> id <span className="text-fg-secondary">{draft.id.slice(0, 8)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Megaphone className="h-3 w-3" /> generated_by{' '}
        <span className="text-fg-secondary">{draft.generated_by ?? 'human'}</span>
        {draft.model && <span className="text-fg-secondary">· {draft.model.split('/').pop()}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3" /> criado {created}
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3" /> atualizado {updated}
      </div>
    </div>
  );
};
