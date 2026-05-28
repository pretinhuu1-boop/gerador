import React, { useState } from 'react';
import { CartridgeButton } from '../CartridgeButton';
import type { SupabaseSessionState } from '../../hooks/useSupabaseSession';

type Props = {
  session: SupabaseSessionState;
  onClose: () => void;
};

export const CloudSyncModal: React.FC<Props> = ({ session, onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!session.configured) {
    return (
      <div className="api-key-modal" role="dialog" aria-modal="true" aria-label="Sync nuvem">
        <div className="api-key-modal__panel">
          <span>SYNC NUVEM</span>
          <h2>Indisponivel</h2>
          <p>Supabase nao configurado neste ambiente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env e reinicie o servidor.</p>
          <div className="api-key-modal__actions">
            <CartridgeButton variant="solid" onClick={onClose}>
              FECHAR
            </CartridgeButton>
          </div>
        </div>
      </div>
    );
  }

  if (session.userId) {
    return (
      <div className="api-key-modal" role="dialog" aria-modal="true" aria-label="Sync nuvem">
        <div className="api-key-modal__panel">
          <span>SYNC NUVEM</span>
          <h2>Conectado</h2>
          <p>Sessao ativa como {session.session?.user?.email ?? session.userId}. Suas corridas sao salvas na nuvem.</p>
          <div className="api-key-modal__actions">
            <CartridgeButton variant="chalk" onClick={onClose}>
              VOLTAR
            </CartridgeButton>
            <CartridgeButton
              variant="solid"
              onClick={async () => {
                await session.signOut();
                onClose();
              }}
            >
              DESCONECTAR
            </CartridgeButton>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    setError(null);
    setIsSubmitting(true);
    const result = await session.signIn(email, password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  };

  return (
    <div className="api-key-modal" role="dialog" aria-modal="true" aria-label="Sync nuvem">
      <div className="api-key-modal__panel">
        <span>SYNC NUVEM</span>
        <h2>Entrar</h2>
        <p>Salva suas corridas e progresso na nuvem. Pega credencial de teste no Supabase dashboard.</p>
        <div className="input-wrap">
          <input
            autoFocus
            className="input-board"
            onChange={(event) => setEmail(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
            placeholder="email"
            type="email"
            value={email}
          />
        </div>
        <div className="input-wrap">
          <input
            className="input-board"
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
            placeholder="senha"
            type="password"
            value={password}
          />
        </div>
        {error ? <small className="api-key-modal__hint">{error.toUpperCase()}</small> : null}
        <div className="api-key-modal__actions">
          <CartridgeButton variant="chalk" onClick={onClose}>
            VOLTAR
          </CartridgeButton>
          <CartridgeButton
            variant="solid"
            disabled={!email.trim() || !password || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? '...' : 'ENTRAR'}
          </CartridgeButton>
        </div>
        <small className="api-key-modal__hint">USO LOCAL CONTINUA SEM LOGIN</small>
      </div>
    </div>
  );
};
