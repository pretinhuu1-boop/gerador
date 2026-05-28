import React from 'react';
import { audio } from '../../services/audio';

export type CreatorTabDef<Id extends string> = {
  id: Id;
  label: string;
};

type Props<Id extends string> = {
  tabs: ReadonlyArray<CreatorTabDef<Id>>;
  active: Id;
  onSelect: (id: Id) => void;
};

export function CreatorTabNav<Id extends string>({ tabs, active, onSelect }: Props<Id>) {
  const handleKey = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const idx = tabs.findIndex((t) => t.id === active);
    if (idx < 0) return;
    const next = event.key === 'ArrowRight'
      ? tabs[(idx + 1) % tabs.length]
      : tabs[(idx - 1 + tabs.length) % tabs.length];
    audio.playSfx('nav-slab');
    onSelect(next.id);
  };

  const handleClick = (id: Id) => {
    if (id === active) return;
    audio.playSfx('nav-slab');
    onSelect(id);
  };

  return (
    <div className="runner-tab__nav" role="tablist" aria-label="Etapas do criador">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`creator-tab-${tab.id}`}
          role="tab"
          type="button"
          aria-selected={tab.id === active}
          aria-controls={`creator-panel-${tab.id}`}
          tabIndex={tab.id === active ? 0 : -1}
          className={`runner-tab__nav-item ${tab.id === active ? 'is-active' : ''}`}
          onClick={() => handleClick(tab.id)}
          onKeyDown={handleKey}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
