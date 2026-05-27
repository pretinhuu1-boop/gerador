import React from 'react';
import { STYLES, CharacterStyle } from '../data/styles';

type Props = {
  selected: CharacterStyle;
  onSelect: (style: CharacterStyle) => void;
};

export const StylePicker: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div>
      <h3 className="brush text-2xl chalk-underline mb-3">ESTILO</h3>
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((s) => {
          const isSel = s.id === selected.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`slot p-3 text-left ${isSel ? 'selected' : ''}`}
            >
              <div className="chalk text-sm tracking-wide">{s.label}</div>
              <div className="text-[11px] text-[var(--cream-dim)] mt-1 leading-tight">
                {s.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
