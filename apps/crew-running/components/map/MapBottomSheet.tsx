import React, { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  accent?: string;
  children: React.ReactNode;
}

export const MapBottomSheet: React.FC<Props> = ({ open, onClose, title, accent, children }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="map-bottom-sheet-backdrop" onClick={onClose}>
      <div
        className="map-bottom-sheet"
        style={{ '--sheet-accent': accent ?? 'var(--bone)' } as React.CSSProperties}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="map-bottom-sheet__handle" />
        <header className="map-bottom-sheet__header">
          <h3 className="map-bottom-sheet__title">{title}</h3>
          <button
            ref={closeRef}
            type="button"
            className="map-bottom-sheet__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>
        <div className="map-bottom-sheet__body">{children}</div>
      </div>
    </div>
  );
};
