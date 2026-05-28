import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import {
  createKnowledgePin,
  type KnowledgeKind,
  type KnowledgeRecord,
} from '../../../services/channelOS/knowledgeService';

interface Props {
  kind: KnowledgeKind;
  open: boolean;
  onClose: () => void;
  onCreated: (record: KnowledgeRecord) => void;
}

const KIND_LABELS: Partial<Record<KnowledgeKind, string>> = {
  remotion_template: 'Template Remotion',
  remotion_library: 'Library / pacote npm',
  remotion_skill: 'Skill / utility / hook',
  remotion_workflow: 'Workflow / pipeline completo',
};

const PLACEHOLDERS: Partial<Record<KnowledgeKind, { title: string; summary: string; link: string; install: string }>> = {
  remotion_template: {
    title: 'template-tiktok (official)',
    summary: 'Base 9:16 com captions Whisper word-level.',
    link: 'https://github.com/remotion-dev/template-tiktok',
    install: 'npx create-video --template=remotion-dev/template-tiktok',
  },
  remotion_library: {
    title: '@remotion/captions',
    summary: 'Tipo Caption + parse/serialize SRT.',
    link: 'https://www.remotion.dev/docs/captions/api',
    install: 'npm i @remotion/captions',
  },
  remotion_skill: {
    title: 'getAudioDurationInSeconds',
    summary: 'Lê MP3 e retorna duração exata.',
    link: 'https://www.remotion.dev/docs/get-audio-duration-in-seconds',
    install: '',
  },
  remotion_workflow: {
    title: 'gyoridavid/short-video-maker',
    summary: 'Pipeline completo TTS→Whisper→Remotion.',
    link: 'https://github.com/gyoridavid/short-video-maker',
    install: '',
  },
};

export const AddKnowledgePinModal = ({ kind, open, onClose, onCreated }: Props) => {
  const ph = PLACEHOLDERS[kind] ?? { title: '', summary: '', link: '', install: '' };
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [install, setInstall] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setSummary('');
    setContent('');
    setLink('');
    setInstall('');
    setTagsInput('');
    setError(null);
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const submit = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Título é obrigatório.');
      return;
    }
    if (!content.trim() && !summary.trim()) {
      setError('Precisa de summary ou content — algo descritivo pro recall fazer sentido.');
      return;
    }
    setBusy(true);
    try {
      const record = await createKnowledgePin({
        kind,
        title,
        summary: summary || null,
        content: content || summary,
        link: link || null,
        install: install || null,
        tags: tags.length ? tags : undefined,
      });
      onCreated(record);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-bg-overlay/80 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="surface-elevated w-full max-w-lg pointer-events-auto rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <header className="h-14 shrink-0 px-5 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-brand" />
                  <span className="font-display font-semibold text-sm">
                    Adicionar {KIND_LABELS[kind] ?? kind}
                  </span>
                  <Badge size="sm" variant="brand">
                    {kind}
                  </Badge>
                </div>
                <button
                  onClick={close}
                  aria-label="Fechar"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <Field label="Título" required>
                  <input
                    autoFocus
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={ph.title}
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Resumo curto"
                  hint="1-2 frases — vira o snippet exibido pelo recall_knowledge."
                >
                  <input
                    type="text"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder={ph.summary}
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Descrição completa"
                  hint="Texto que será embedado — quanto mais contexto, melhor o recall acha."
                >
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    placeholder="Por que isso vale conhecer? Casos de uso? Limitações?"
                    className={`${inputClass} resize-none`}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Link" hint="GitHub / docs / npm">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder={ph.link}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Comando install" hint="npm i / npx / git clone">
                    <input
                      type="text"
                      value={install}
                      onChange={(e) => setInstall(e.target.value)}
                      placeholder={ph.install}
                      className={`${inputClass} font-mono text-[12px]`}
                    />
                  </Field>
                </div>
                <Field label="Tags" hint="Separe por vírgula. Ex: 9:16, captions, oficial">
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="9:16, tiktok, captions, oficial"
                    className={inputClass}
                  />
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <Badge key={t} size="sm">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Field>

                {error && (
                  <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                    {error}
                  </div>
                )}

                <div className="text-[11px] text-fg-muted">
                  Pin fica scoped a você — outros usuários não vêem. Pra publicar globalmente,
                  abre PR no <code className="font-mono">data/remotion_catalog.ts</code>.
                </div>
              </div>

              <footer className="shrink-0 px-5 py-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={close}>
                  Cancelar
                </Button>
                <Button variant="primary" size="md" loading={busy} onClick={submit}>
                  {!busy && <Plus className="h-4 w-4" />}
                  Criar pin
                </Button>
              </footer>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const inputClass =
  'w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-brand/50';

const Field = ({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-xs font-medium text-fg-secondary mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-danger">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-fg-muted">{hint}</span>}
  </label>
);
