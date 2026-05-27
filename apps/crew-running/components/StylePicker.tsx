import React from 'react';
import { STYLES, CharacterStyle } from '../data/styles';

type Props = {
  selected: CharacterStyle;
  onSelect: (style: CharacterStyle) => void;
};

export const StylePicker: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div>
      <h3 className="section-label mb-3">ESTILO</h3>
      <div className="grid grid-cols-2 gap-3">
        {STYLES.map((s) => {
          const isSel = s.id === selected.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`tile p-3 text-left ${isSel ? 'is-selected' : ''}`}
            >
              <div className="t-brush text-base text-[var(--white)]">{s.label}</div>
              <div className="t-brush text-[11px] text-[var(--bone-soft)] mt-1 leading-tight">
                {s.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
