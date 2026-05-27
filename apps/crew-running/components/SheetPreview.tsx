import React from 'react';
import { GenerateResult, SheetVariant } from '../services/crewService';

type Props = {
  result: GenerateResult | null;
  loading: boolean;
  error: string | null;
  onSave: (variant: SheetVariant) => void;
};

const cellRect: Record<0 | 1 | 2 | 3, React.CSSProperties> = {
  0: { top: 0, left: 0 },
  1: { top: 0, right: 0 },
  2: { bottom: 0, left: 0 },
  3: { bottom: 0, right: 0 },
};

export const SheetPreview: React.FC<Props> = ({ result, loading, error, onSave }) => {
  return (
    <div className="slot-card p-4 h-full flex flex-col">
      <h3 className="display-font text-xl tracking-wider text-[var(--accent)] mb-3">PREVIEW</h3>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
          gerando sheet 2×2…
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex items-center justify-center text-red-400 text-sm px-4 text-center">
          {error}
        </div>
      )}

      {!loading && !error && !result && (
        <div className="flex-1 flex items-center justify-center text-[var(--muted)] text-sm text-center px-6">
          envie sua foto, escolha o estilo e clique GERAR
        </div>
      )}

      {result && !loading && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative w-full aspect-square">
            <img
              src={result.imageDataUrl}
              alt="character sheet"
              className="w-full h-full object-cover rounded-md"
            />
            {result.variants.map((v) => (
              <button
                key={v.index}
                onClick={() => onSave(v)}
                className="absolute w-1/2 h-1/2 group"
                style={cellRect[v.index]}
                title={`Salvar look ${v.index + 1}`}
              >
                <div className="absolute inset-0 m-1 rounded-md border-2 border-transparent group-hover:border-[var(--accent)] transition" />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-[var(--accent)] text-black text-[10px] font-bold px-2 py-1 rounded transition">
                  SALVAR
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] text-center">
            clique no look favorito pra salvar
          </p>
        </div>
      )}
    </div>
  );
};
