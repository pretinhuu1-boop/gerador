import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SLOT_KEYS, SLOT_LABELS, WARDROBE, SlotKey, WardrobeItem } from '../data/wardrobe';
import { SlotSelection } from '../services/crewService';
import { HandUnderline } from './SvgDefs';
import { audio } from '../services/audio';

type Props = {
  locked: SlotSelection;
  onToggle: (slot: SlotKey, itemId: string) => void;
};

const ItemTile: React.FC<{
  item: WardrobeItem;
  isLocked: boolean;
  slot: SlotKey;
  slotLabel: string;
  onClick: () => void;
}> = ({ item, isLocked, slot, slotLabel, onClick }) => {
  const reducedMotion = useReducedMotion();
  const [imgFailed, setImgFailed] = useState(false);
  const hasIcon = !!item.iconUrl && !imgFailed;

  return (
    <motion.button
      onClick={onClick}
      className={`tile runner-creator__wardrobe-tile ${
        isLocked ? 'is-selected' : ''
      }`}
      title={item.prompt}
      aria-label={`${isLocked ? 'Remover trava' : 'Fixar'} ${item.label} em ${slotLabel}`}
      aria-pressed={isLocked}
      type="button"
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
    >
      {isLocked && (
        <motion.span
          aria-hidden
          className="runner-creator__slot-snap"
          layoutId={reducedMotion ? undefined : `runner-wardrobe-lock-${slot}`}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.82, rotate: 4 }}
          animate={reducedMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      {hasIcon ? (
        <img
          src={item.iconUrl}
          alt={item.label}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="tile-placeholder runner-creator__wardrobe-placeholder">
          <span>{item.label}</span>
        </div>
      )}
      <span className="runner-creator__wardrobe-name">{item.label}</span>
      <span className="runner-creator__lock-state">{isLocked ? 'FIXO' : 'FIXAR'}</span>
    </motion.button>
  );
};

export const WardrobePicker: React.FC<Props> = ({ locked, onToggle }) => {
  return (
    <div className="runner-creator__block">
      <div className="runner-creator__block-head">
        <h3 className="section-label"><span className="section-label__index">05 /</span> GUARDA-ROUPA</h3>
        <span>
          trave o que quiser fixar
        </span>
      </div>
      <HandUnderline width={180} className="mb-4 mt-1" />
      <div className="runner-creator__wardrobe">
        {SLOT_KEYS.map((slot) => (
          <div className="runner-creator__wardrobe-slot" key={slot}>
            <div className="runner-creator__slot-label">
              {SLOT_LABELS[slot]}
            </div>
            <div className="runner-creator__wardrobe-grid tile-row">
              {WARDROBE[slot].map((item) => (
                <ItemTile
                  key={item.id}
                  item={item}
                  isLocked={locked[slot] === item.id}
                  slot={slot}
                  slotLabel={SLOT_LABELS[slot]}
                  onClick={() => {
                    const willLock = locked[slot] !== item.id;
                    audio.playSfx(willLock ? 'lock-on' : 'remove-x');
                    onToggle(slot, item.id);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
