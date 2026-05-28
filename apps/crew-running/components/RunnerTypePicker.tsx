import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { RUNNER_TYPES, RunnerType } from '../data/runnerTypes';
import { HandUnderline } from './SvgDefs';
import { audio } from '../services/audio';

type Props = {
  selected: RunnerType;
  onSelect: (type: RunnerType) => void;
};

export const RunnerTypePicker: React.FC<Props> = ({ selected, onSelect }) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="runner-creator__block">
      <div className="runner-creator__block-head">
        <h3 className="section-label"><span className="section-label__index">04 /</span> TIPO DO RUNNER</h3>
        <span>perfil de treino</span>
      </div>
      <HandUnderline width={180} className="mb-4 mt-1" />

      <div className="runner-creator__type-grid" role="group" aria-label="Tipo do runner">
        {RUNNER_TYPES.map((type) => {
          const isSelected = selected.id === type.id;

          return (
            <motion.button
              key={type.id}
              className={`runner-creator__type-card ${isSelected ? 'is-selected' : ''}`}
              type="button"
              onClick={() => {
                audio.playRunnerTypeStinger(type.id);
                onSelect(type);
              }}
              aria-pressed={isSelected}
              whileHover={reducedMotion ? undefined : { y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            >
              <strong>{type.label}</strong>
              <span>{type.description}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
