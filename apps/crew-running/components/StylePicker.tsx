import React from 'react';
import { STYLES, CharacterStyle } from '../data/styles';

type Props = {
  selected: CharacterStyle;
  onSelect: (style: CharacterStyle) => void;
};

export const StylePicker: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="slot-card p-4">
      <h3 className="display-font text-xl tracking-wider text-[var(--accent)] mb-3">ESTILO</h3>
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((s) => {
          const isSel = s.id === selected.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`slot-card p-3 text-left ${isSel ? 'selected' : ''}`}
            >
              <div className="text-sm font-bold">{s.label}</div>
              <div className="text-xs text-[var(--muted)] mt-1">{s.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
