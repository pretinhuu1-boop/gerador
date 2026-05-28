import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, X, ExternalLink, Loader2, Check, AlertCircle } from 'lucide-react';
import {
  listConnections,
  publishToYouTube,
  type OAuthConnection,
  type PublishYouTubeResult,
} from '../../../services/channelOS/oauthService';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

interface Props {
  renderId: string;
  defaultTitle: string;
  defaultDescription?: string;
  defaultTags?: string[];
}

export const PublishYouTubeButton = ({
  renderId,
  defaultTitle,
  defaultDescription = '',
  defaultTags = [],
}: Props) => {
  const [open, setOpen] = useState(false);
  const [conns, setConns] = useState<OAuthConnection[] | null>(null);
  const [connectionId, setConnectionId] = useState<string>('');
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [tagsInput, setTagsInput] = useState(defaultTags.join(', '));
  const [privacy, setPrivacy] = useState<'private' | 'unlisted' | 'public'>('private');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PublishYouTubeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    listConnections()
      .then((cs) => {
        const yts = cs.filter((c) => c.platform === 'youtube');
        setConns(yts);
        if (yts.length && !connectionId) setConnectionId(yts[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [open]);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      const r = await publishToYouTube({
        renderId,
        connectionId,
        title,
        description,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        privacyStatus: privacy,
      });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Youtube className="h-3.5 w-3.5 text-[#ff0000]" /> Publicar no YouTube
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-bg-overlay/80 backdrop-blur-sm"
              onClick={() => !busy && setOpen(false)}
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
                    <Youtube className="h-4 w-4 text-[#ff0000]" />
                    <span className="font-display font-semibold text-sm">Publicar no YouTube</span>
                  </div>
                  <button
                    onClick={() => !busy && setOpen(false)}
                    aria-label="Fechar"
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {result ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-success/15 border border-success/30">
                        <Check className="h-6 w-6 text-success" />
                      </div>
                      <h3 className="font-display font-semibold">Publicado!</h3>
                      <p className="text-xs text-fg-muted">
                        Vídeo subiu como {privacy}. {privacy === 'private' && 'Mude visibilidade no Studio quando quiser tornar público.'}
                      </p>
                      {result.url && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" /> Abrir no YouTube
                        </a>
                      )}
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            reset();
                            setOpen(false);
                          }}
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  ) : conns === null ? (
                    <div className="flex items-center gap-2 text-sm text-fg-muted py-6 justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando conexões…
                    </div>
                  ) : conns.length === 0 ? (
                    <div className="rounded-lg border border-warn/30 bg-warn/10 px-3 py-4 text-xs text-warn">
                      Nenhuma conexão YouTube ainda. Vai pro workspace{' '}
                      <strong>Canais</strong> e clica em <strong>Conectar YouTube</strong>.
                    </div>
                  ) : (
                    <>
                      <Field label="Canal">
                        <select
                          value={connectionId}
                          onChange={(e) => setConnectionId(e.target.value)}
                          className={inputCls}
                        >
                          {conns.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.display_name} ({c.handle ?? c.external_account_id})
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Título" required>
                        <input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          maxLength={100}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Descrição">
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          maxLength={5000}
                          className={`${inputCls} resize-none`}
                        />
                      </Field>
                      <Field label="Tags (csv)">
                        <input
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Visibilidade">
                        <div className="grid grid-cols-3 gap-1">
                          {(['private', 'unlisted', 'public'] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPrivacy(p)}
                              className={[
                                'rounded-lg px-2 py-2 text-xs border transition',
                                privacy === p
                                  ? 'bg-brand/15 border-brand/40 text-fg-primary'
                                  : 'border-border-subtle text-fg-secondary hover:bg-bg-elevated',
                              ].join(' ')}
                            >
                              {p === 'private' ? 'Privado' : p === 'unlisted' ? 'Não-listado' : 'Público'}
                            </button>
                          ))}
                        </div>
                      </Field>

                      {error && (
                        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger flex items-center gap-2">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
                        </div>
                      )}

                      <div className="text-[11px] text-fg-muted">
                        Upload pode levar 1-3min dependendo do tamanho. Mantém esta janela aberta.
                      </div>
                    </>
                  )}
                </div>

                {!result && conns?.length ? (
                  <footer className="shrink-0 px-5 py-3 border-t border-border-subtle flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => !busy && setOpen(false)}>
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      loading={busy}
                      onClick={submit}
                      disabled={!title.trim() || !connectionId}
                    >
                      {!busy && <Youtube className="h-4 w-4" />}
                      Publicar
                    </Button>
                  </footer>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const inputCls =
  'w-full rounded-lg border border-border-subtle bg-bg-elevated px-3 py-2 text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none focus:border-brand/50';

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className="text-xs font-medium text-fg-secondary mb-1.5 flex items-center gap-1">
      {label}
      {required && <span className="text-danger">*</span>}
    </span>
    {children}
  </label>
);
