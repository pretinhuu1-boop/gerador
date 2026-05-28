import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GenerateResult, SheetVariant } from '../services/crewService';
import { CrewBadge } from './CrewBadge';
import { HandUnderline } from './SvgDefs';
import { audio } from '../services/audio';

type PartialPreview = {
  photo?: string;
  name?: string;
  crewSlug?: string;
  runnerTypeLabel?: string;
};

type Props = {
  result: GenerateResult | null;
  loading: boolean;
  error: string | null;
  savingVariantIndex?: SheetVariant['index'] | null;
  onSave: (variant: SheetVariant) => void | Promise<void>;
  partial?: PartialPreview;
};

const cellRect: Record<0 | 1 | 2 | 3, React.CSSProperties> = {
  0: { top: 0, left: 0 },
  1: { top: 0, right: 0 },
  2: { bottom: 0, left: 0 },
  3: { bottom: 0, right: 0 },
};

export const SheetPreview: React.FC<Props> = ({
  result,
  loading,
  error,
  savingVariantIndex = null,
  onSave,
  partial,
}) => {
  const reducedMotion = useReducedMotion();
  const hasPartial = Boolean(
    partial && (partial.photo || partial.name || partial.runnerTypeLabel),
  );

  return (
    <div className="runner-creator__preview-shell">
      <h3 className="section-label">RUNNER ID</h3>
      <HandUnderline width={100} className="mb-3 mt-1" />

      <div className="runner-creator__preview mission-ticket">
        {loading && (
          <div className="runner-creator__preview-state">
            <div className="runner-creator__preview-message is-loading">
              CREW STUDIO MONTANDO LOOK...
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="runner-creator__preview-state">
            <div className="runner-creator__preview-message is-error">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && !result && hasPartial && partial && (
          <div className="runner-creator__preview-state runner-creator__preview--partial">
            {partial.photo && (
              <div className="runner-creator__preview-photo" aria-hidden>
                <img src={partial.photo} alt="" />
              </div>
            )}
            <div className="runner-creator__preview-meta">
              {partial.crewSlug && <CrewBadge crew={partial.crewSlug} size="sm" />}
              {partial.name && (
                <strong className="runner-creator__preview-name">{partial.name}</strong>
              )}
              {partial.runnerTypeLabel && (
                <span className="runner-creator__preview-type">{partial.runnerTypeLabel}</span>
              )}
            </div>
            <small className="runner-creator__preview-hint">
              prévia parcial — falta foto+ficha pra liberar CRIAR RUNNER
            </small>
          </div>
        )}

        {!loading && !error && !result && !hasPartial && (
          <div className="runner-creator__preview-state">
            <div className="runner-creator__preview-message">
              foto + ficha + crew liberam o{' '}
              <span>CRIAR RUNNER</span>
            </div>
          </div>
        )}

        {result && !loading && (
          <motion.div
            className="runner-creator__sheet-wrap"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="runner-creator__sheet">
              <img
                src={result.imageDataUrl}
                alt="Runner criado"
              />
              {result.variants.map((v) => (
                <button
                  key={v.index}
                  onClick={() => {
                    audio.playSfx('equip-snap');
                    onSave(v);
                  }}
                  className={`runner-creator__variant-zone group ${
                    savingVariantIndex === v.index ? 'is-saving' : ''
                  }`}
                  disabled={savingVariantIndex !== null}
                  style={cellRect[v.index]}
                  title={`Equipar look ${v.index + 1}`}
                  aria-label={`Equipar look ${v.index + 1}`}
                  aria-busy={savingVariantIndex === v.index}
                  type="button"
                >
                  <div className="runner-creator__variant-hit" />
                  <div className="runner-creator__variant-label">
                    LOOK {String(v.index + 1).padStart(2, '0')}
                  </div>
                  <div className="runner-creator__variant-callout">
                    <span className="game-command game-command--mini">
                      {savingVariantIndex === v.index ? 'SALVANDO' : 'EQUIPAR'}
                    </span>
                  </div>
                  <AnimatePresence>
                    {savingVariantIndex === v.index && (
                      <motion.span
                        aria-hidden
                        className="runner-creator__save-stamp"
                        initial={reducedMotion ? false : { opacity: 0, scale: 1.18, rotate: -8 }}
                        animate={reducedMotion ? undefined : { opacity: 1, scale: 1, rotate: -3 }}
                        exit={reducedMotion ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      >
                        RUNNER SALVO
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
            <p className="runner-creator__sheet-hint">
              toque no look favorito para salvar a identidade
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
