import React, { useState } from 'react';
import { setApiKey } from '../services/storage';

export const ApiKeyGate: React.FC<{ onReady: (key: string) => void }> = ({ onReady }) => {
  const [value, setValue] = useState('');

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    onReady(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-board">
      <div className="max-w-md w-full bg-paper rounded-lg p-8 space-y-5 border-2 border-[var(--line)]">
        <div>
          <h1 className="logo-stamp text-5xl text-[var(--cream)]">
            THE CREW <span className="logo-running">RUNNING</span>
          </h1>
          <p className="chalk text-sm text-[var(--cream-dim)] mt-2 tracking-widest">
            — CUSTOMIZE
          </p>
        </div>
        <p className="text-sm text-[var(--cream-dim)] leading-relaxed">
          Cole sua Gemini API key pra começar. Ela fica salva só no seu navegador
          (localStorage).
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AIza..."
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="board-input w-full"
        />
        <button onClick={handleSave} disabled={!value.trim()} className="solid-btn w-full">
          ENTRAR
        </button>
        <p className="text-xs text-[var(--cream-dim)]">
          Pegue uma key grátis em{' '}
          <span className="underline">aistudio.google.com/apikey</span>
        </p>
      </div>
    </div>
  );
};
