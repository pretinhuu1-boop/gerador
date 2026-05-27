import React from 'react';
import { GenerateResult, SheetVariant } from '../services/crewService';
import { HandUnderline } from './SvgDefs';

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
    <div className="h-full flex flex-col">
      <h3 className="section-label">PREVIEW</h3>
      <HandUnderline width={100} className="mb-3 mt-1" />

      <div className="flex-1 tile p-3 min-h-[420px] flex flex-col">
        {loading && (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="t-brush text-xl text-[var(--bone-soft)] tracking-widest animate-pulse">
              GERANDO SHEET 2×2…
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex-1 flex items-center justify-center relative z-10">
            <div className="t-brush text-base text-[var(--spray-orange-bright)] text-center px-4 max-w-md">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && !result && (
          <div className="flex-1 flex items-center justify-center text-center px-6 relative z-10">
            <div className="t-brush text-base text-[var(--bone-soft)] leading-relaxed">
              envie sua foto, escolha o estilo<br />e clique{' '}
              <span className="text-[var(--spray-orange-bright)]">GERAR</span>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="flex-1 flex flex-col gap-3 relative z-10">
            <div className="relative w-full aspect-square" style={{ transform: 'rotate(-0.5deg)' }}>
              <img
                src={result.imageDataUrl}
                alt="character sheet"
                className="w-full h-full object-cover rounded-md"
              />
              <div
                className="absolute inset-0 rounded-md pointer-events-none"
                style={{ border: '3px solid #fff', filter: 'url(#rough-mid)' }}
              />
              {result.variants.map((v) => (
                <button
                  key={v.index}
                  onClick={() => onSave(v)}
                  className="absolute w-1/2 h-1/2 group"
                  style={cellRect[v.index]}
                  title={`Equipar look ${v.index + 1}`}
                >
                  <div
                    className="absolute inset-0 m-2 rounded-md border-[3px] border-transparent group-hover:border-[var(--spray-orange-bright)] transition"
                    style={{ filter: 'url(#rough-mid)' }}
                  />
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
                    <span className="btn-solid" style={{ fontSize: 14, padding: '8px 14px' }}>
                      EQUIP
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="t-brush text-xs text-[var(--bone-soft)] text-center tracking-widest">
              clique no look favorito pra salvar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
