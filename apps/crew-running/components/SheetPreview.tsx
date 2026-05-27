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
    <div className="bg-paper rounded-lg border-2 border-[var(--line)] p-5 h-full flex flex-col">
      <h3 className="brush text-3xl chalk-underline mb-4">PREVIEW</h3>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="chalk text-lg text-[var(--cream-dim)] tracking-widest animate-pulse">
            GERANDO SHEET 2×2…
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="chalk text-base text-[var(--accent)] tracking-wide text-center px-4 max-w-md">
            {error}
          </div>
        </div>
      )}

      {!loading && !error && !result && (
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div className="chalk text-base text-[var(--cream-dim)] tracking-wide leading-relaxed">
            envie sua foto, escolha o estilo<br />e clique <span className="text-[var(--accent)]">GERAR</span>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative w-full aspect-square">
            <img
              src={result.imageDataUrl}
              alt="character sheet"
              className="w-full h-full object-cover rounded-md border-2 border-[var(--line-strong)]"
            />
            {result.variants.map((v) => (
              <button
                key={v.index}
                onClick={() => onSave(v)}
                className="absolute w-1/2 h-1/2 group"
                style={cellRect[v.index]}
                title={`Equipar look ${v.index + 1}`}
              >
                <div className="absolute inset-0 m-2 rounded-md border-2 border-transparent group-hover:border-[var(--accent)] transition" />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
                  <span className="solid-btn text-xs px-3 py-2">EQUIP</span>
                </div>
              </button>
            ))}
          </div>
          <p className="chalk text-xs text-[var(--cream-dim)] text-center tracking-widest">
            CLIQUE NO LOOK FAVORITO PRA SALVAR
          </p>
        </div>
      )}
    </div>
  );
};
