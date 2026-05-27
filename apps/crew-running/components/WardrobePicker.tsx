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
      className={`tile aspect-square flex flex-col items-center justify-center text-center ${
        isLocked ? 'is-selected' : ''
      }`}
      title={item.prompt}
    >
      {hasIcon ? (
        <img
          src={item.iconUrl}
          alt={item.label}
          className="w-full h-full object-contain p-1"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="tile-placeholder w-full h-full flex items-center justify-center px-1">
          <span className="t-brush text-[11px] leading-tight text-[var(--bone)]">
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
        <h3 className="section-label">GUARDA-ROUPA</h3>
        <span className="t-brush text-[11px] text-[var(--gray-text)]">
          trave o que quiser fixar
        </span>
      </div>
      <div className="space-y-4">
        {slots.map((slot) => (
          <div key={slot}>
            <div className="t-anton text-sm text-[var(--bone-soft)] mb-2">
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
