import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CREWS } from '../../data/crews';
import { CrewBadge } from '../CrewBadge';

type Props = {
  activeSlug?: string;
  onSelect?: (slug: string) => void;
  onOpenActive?: (slug: string) => void;
  disabled?: boolean;
};

export const CrewPilotPreview: React.FC<Props> = ({
  activeSlug,
  onSelect,
  onOpenActive,
  disabled = false,
}) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="crew-pilot-preview">
      {CREWS.map((crew, index) => {
        const active = crew.slug === activeSlug;
        const itemDisabled = disabled && !active;
        const style = {
          '--crew-accent': crew.accent,
          '--crew-secondary': crew.secondary,
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.88), rgba(0,0,0,0.54)), url(${crew.assets.banner})`,
        } as React.CSSProperties;

        return (
          <motion.button
            key={crew.slug}
            className={`crew-pilot-preview__item crew-patch ${active ? 'is-active' : ''}`}
            style={style}
            type="button"
            aria-label={`${itemDisabled ? 'Crew bloqueada' : active && disabled ? 'Abrir sede da crew' : active ? 'Crew ativa' : 'Selecionar crew'} ${crew.zone} ${crew.name}`}
            aria-pressed={active}
            aria-disabled={itemDisabled}
            disabled={itemDisabled}
            onClick={() => {
              if (disabled && active) {
                onOpenActive?.(crew.slug);
                return;
              }
              if (disabled) return;
              onSelect?.(crew.slug);
            }}
            initial={reducedMotion ? false : { opacity: 0, x: 14 }}
            animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: index * 0.035 }}
            whileHover={itemDisabled || reducedMotion ? undefined : { x: 5 }}
            whileTap={itemDisabled || reducedMotion ? undefined : { scale: 0.98 }}
          >
            {active && (
              <motion.span
                aria-hidden
                className="crew-pilot-preview__cursor"
                layoutId={reducedMotion ? undefined : 'crew-pilot-preview-cursor'}
                initial={reducedMotion ? false : { opacity: 0, scaleX: 0.82 }}
                animate={reducedMotion ? undefined : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <CrewBadge crew={crew} size="md" />
            <span>{crew.zone}</span>
            <strong>{crew.name}</strong>
          </motion.button>
        );
      })}
    </div>
  );
};
