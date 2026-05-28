import React from 'react';
import type { SupabaseSessionState } from '../../hooks/useSupabaseSession';

type Props = {
  session: SupabaseSessionState;
  onOpen: () => void;
};

export const CloudSyncBadge: React.FC<Props> = ({ session, onOpen }) => {
  if (!session.configured) return null;
  const isOnline = Boolean(session.userId);
  const label = isOnline ? 'NUVEM ON' : 'NUVEM OFF';
  const className = `cloud-sync-badge${isOnline ? ' cloud-sync-badge--on' : ''}`;
  return (
    <button
      type="button"
      className={className}
      onClick={onOpen}
      aria-label={isOnline ? 'Sessao de nuvem ativa, abrir gerenciador' : 'Conectar a nuvem'}
    >
      <span className="cloud-sync-badge__dot" aria-hidden="true" />
      {label}
    </button>
  );
};
