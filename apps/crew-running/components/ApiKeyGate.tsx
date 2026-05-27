import React, { useState } from 'react';
import { setApiKey } from '../services/storage';
import { HandUnderline } from './SvgDefs';

export const ApiKeyGate: React.FC<{ onReady: (key: string) => void }> = ({ onReady }) => {
  const [value, setValue] = useState('');

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    onReady(trimmed);
  };

  return (
    <div className="app-shell min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="brand-the-crew">THE CREW</div>
          <div className="brand-running">RUNNING</div>
          <h1 className="title-customize mt-3">CUSTOMIZE</h1>
          <div className="flex justify-center mt-2">
            <HandUnderline width={320} thickness={5} />
          </div>
        </div>

        <p className="t-brush text-base text-[var(--bone-soft)] text-center leading-relaxed pt-4">
          cole sua gemini api key pra começar.<br />
          fica salva só no seu navegador.
        </p>

        <div className="input-wrap">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="AIza..."
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="input-board"
          />
        </div>

        <button onClick={handleSave} disabled={!value.trim()} className="btn-solid w-full">
          ENTRAR
        </button>

        <p className="t-brush text-xs text-[var(--gray-text)] text-center">
          pegue uma key grátis em{' '}
          <span className="text-[var(--spray-cyan-bright)] underline">
            aistudio.google.com/apikey
          </span>
        </p>
      </div>
    </div>
  );
};
