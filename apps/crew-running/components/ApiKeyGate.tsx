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
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full slot-card p-6 space-y-4">
        <h1 className="display-font text-3xl text-white">THE CREW RUNNING</h1>
        <p className="text-sm text-[var(--muted)]">
          Cole sua Gemini API key pra começar. Ela fica salva só no seu navegador (localStorage).
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="AIza..."
          className="w-full bg-[var(--panel-2)] border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className="btn-primary w-full py-2 rounded-md"
        >
          ENTRAR
        </button>
        <p className="text-xs text-[var(--muted)]">
          Pegue uma key grátis em <span className="underline">aistudio.google.com/apikey</span>
        </p>
      </div>
    </div>
  );
};
