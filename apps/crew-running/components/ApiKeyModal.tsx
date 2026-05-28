import React, { useState } from 'react';
import { setApiKey } from '../services/storage';
import { CartridgeButton } from './CartridgeButton';

type Props = {
  onCancel: () => void;
  onDemo: () => void;
  onReady: (key: string) => void;
};

export const ApiKeyModal: React.FC<Props> = ({ onCancel, onDemo, onReady }) => {
  const [value, setValue] = useState('');

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    onReady(trimmed);
  };

  return (
    <div className="api-key-modal" role="dialog" aria-modal="true" aria-label="Ajuste do estúdio">
      <div className="api-key-modal__panel">
        <span>ESTÚDIO INTERNO</span>
        <h2>Credencial local</h2>
        <p>Use a chave real ou rode uma sheet local para QA do fluxo.</p>
        <div className="input-wrap">
          <input
            autoFocus
            className="input-board"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSave()}
            placeholder="credencial"
            type="password"
            value={value}
          />
        </div>
        <div className="api-key-modal__actions">
          <CartridgeButton variant="chalk" onClick={onCancel}>
            VOLTAR
          </CartridgeButton>
          <CartridgeButton variant="chalk" onClick={onDemo}>
            TESTAR LOCAL
          </CartridgeButton>
          <CartridgeButton variant="solid" disabled={!value.trim()} onClick={handleSave}>
            SALVAR
          </CartridgeButton>
        </div>
        <small className="api-key-modal__hint">TESTE LOCAL NAO CHAMA GEMINI</small>
      </div>
    </div>
  );
};
