import React, { useState } from 'react';
import { WARDROBE, SLOT_LABELS, SlotKey, WardrobeItem } from '../data/wardrobe';
import { SlotSelection } from '../services/crewService';

type Props = {
  locked: SlotSelection;
  onToggle: (slot: SlotKey, itemId: string) => void;
};

const ItemTile: React.FC<{
  item: WardrobeItem;
  isLocked: boolean;
  onClick: () => void;
}> = ({ item, isLocked, onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const hasIcon = !!item.iconUrl && !imgFailed;

  return (
    <button
      onClick={onClick}
      className={`slot aspect-square flex flex-col items-center justify-center text-center p-1 ${
        isLocked ? 'selected' : ''
      }`}
      title={item.prompt}
    >
      {hasIcon ? (
        <img
          src={item.iconUrl}
          alt={item.label}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="icon-placeholder w-full h-full flex items-center justify-center px-1">
          <span className="chalk text-[10px] leading-tight tracking-wide text-[var(--cream)]">
            {item.label}
          </span>
        </div>
      )}
    </button>
  );
};

export const WardrobePicker: React.FC<Props> = ({ locked, onToggle }) => {
  const slots: SlotKey[] = ['hair', 'top', 'bottom', 'shoes'];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="brush text-2xl chalk-underline">GUARDA-ROUPA</h3>
        <span className="text-[11px] text-[var(--cream-dim)] italic">
          trave o que quiser fixar
        </span>
      </div>
      <div className="space-y-3">
        {slots.map((slot) => (
          <div key={slot}>
            <div className="chalk text-xs tracking-[0.2em] text-[var(--cream-dim)] mb-1 uppercase">
              {SLOT_LABELS[slot]}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {WARDROBE[slot].map((item) => (
                <ItemTile
                  key={item.id}
                  item={item}
                  isLocked={locked[slot] === item.id}
                  onClick={() => onToggle(slot, item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
