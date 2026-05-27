import React from 'react';
import { WARDROBE, SLOT_LABELS, SlotKey } from '../data/wardrobe';
import { SlotSelection } from '../services/crewService';

type Props = {
  locked: SlotSelection;
  onToggle: (slot: SlotKey, itemId: string) => void;
};

export const WardrobePicker: React.FC<Props> = ({ locked, onToggle }) => {
  const slots: SlotKey[] = ['hair', 'top', 'bottom', 'shoes'];

  return (
    <div className="slot-card p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="display-font text-xl tracking-wider text-[var(--accent)]">GUARDA-ROUPA</h3>
        <span className="text-xs text-[var(--muted)]">trave o que quiser fixar</span>
      </div>
      <div className="space-y-4">
        {slots.map((slot) => (
          <div key={slot}>
            <div className="text-xs uppercase tracking-wider text-[var(--muted)] mb-2">
              {SLOT_LABELS[slot]}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {WARDROBE[slot].map((item) => {
                const isLocked = locked[slot] === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggle(slot, item.id)}
                    className={`slot-card px-2 py-2 text-xs ${isLocked ? 'selected' : ''}`}
                    title={item.prompt}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
