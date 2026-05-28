import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Plus, Trash2, ExternalLink, Loader2, AlertCircle, Youtube } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  deleteConnection,
  listConnections,
  startGoogleConnect,
  type OAuthConnection,
} from '../../../services/channelOS/oauthService';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';

const PLATFORM_META = {
  youtube: { label: 'YouTube', color: '#ff0000', icon: Youtube },
  tiktok: { label: 'TikTok', color: '#000', icon: Link2 },
  instagram: { label: 'Instagram', color: '#e1306c', icon: Link2 },
} as const;

export const OAuthConnections = () => {
  const [conns, setConns] = useState<OAuthConnection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setConns(await listConnections());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    load();
    // Reload if the OAuth callback bumped the URL with ?connected=
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      const url = await startGoogleConnect();
      // Pop a new tab — user does consent there, callback persists, on tab
      // close + focus on this one we re-load.
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setConnecting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Desconectar este canal? Vai precisar refazer OAuth pra publicar de novo.')) return;
    try {
      await deleteConnection(id);
      setConns((prev) => prev?.filter((c) => c.id !== id) ?? null);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <section className="rounded-2xl border border-border-subtle bg-bg-elevated/40 p-4 space-y-3">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4 text-brand" />
            Canais conectados (publicar)
          </h2>
          <p className="text-[11px] text-fg-muted mt-0.5">
            OAuth permite o Hermes publicar direto na sua conta — token guardado no Supabase,
            scopes só pra upload.
          </p>
        </div>
        <Button variant="secondary" size="sm" loading={connecting} onClick={connect}>
          {!connecting && <Plus className="h-3.5 w-3.5" />}
          Conectar YouTube
        </Button>
      </header>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      {conns === null ? (
        <div className="flex items-center gap-2 text-xs text-fg-muted py-4">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      ) : conns.length === 0 ? (
        <div className="rounded-lg border border-border-subtle bg-bg-base/40 py-6 text-center text-xs text-fg-muted">
          Nenhum canal conectado. Clica em <strong className="text-fg-secondary">Conectar YouTube</strong>{' '}
          pra autorizar uploads.
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {conns.map((c) => {
            const meta = PLATFORM_META[c.platform] ?? PLATFORM_META.youtube;
            const Icon = meta.icon;
            return (
              <motion.article
                key={c.id}
                whileHover={{ y: -1 }}
                className="flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-base/60 p-3"
              >
                {c.avatar_url ? (
                  <img
                    src={c.avatar_url}
                    alt={c.display_name ?? ''}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: `${meta.color}22`, color: meta.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge size="sm" variant="brand">
                      {meta.label}
                    </Badge>
                    <span className="text-sm font-semibold truncate">{c.display_name}</span>
                  </div>
                  <div className="text-[10px] text-fg-muted mt-0.5">
                    {c.handle ?? c.external_account_id} · conectado há{' '}
                    {formatDistanceToNow(new Date(c.connected_at), { locale: ptBR })}
                  </div>
                </div>
                <a
                  href={
                    c.platform === 'youtube'
                      ? `https://youtube.com/channel/${c.external_account_id}`
                      : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-fg-primary hover:bg-bg-elevated"
                  title="Abrir canal"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-fg-muted hover:text-danger hover:bg-danger/10"
                  title="Desconectar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
};
