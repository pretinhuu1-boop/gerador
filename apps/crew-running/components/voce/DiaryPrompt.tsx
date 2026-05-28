import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DIARY_MOODS,
  DIARY_NOTE_MAX_LENGTH,
  MOOD_LABELS,
  sanitizeDiaryNote,
  type DiaryMood,
} from '../../data/diary';
import { CartridgeButton } from '../CartridgeButton';

type Props = {
  open: boolean;
  onSave: (mood?: DiaryMood, note?: string) => void;
  onSkip: () => void;
};

export const DiaryPrompt: React.FC<Props> = ({ open, onSave, onSkip }) => {
  const [selectedMood, setSelectedMood] = useState<DiaryMood | undefined>();
  const [noteText, setNoteText] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedMood(undefined);
      setNoteText('');
    } else {
      closeBtnRef.current?.focus();
    }
  }, [open]);

  // Escape key closes
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onSkip();
        return;
      }
      // Focus trap
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onSkip]);

  const handleMoodToggle = useCallback((mood: DiaryMood) => {
    setSelectedMood((prev) => (prev === mood ? undefined : mood));
  }, []);

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNoteText(e.target.value.slice(0, DIARY_NOTE_MAX_LENGTH));
    },
    [],
  );

  const handleSave = useCallback(() => {
    const sanitized = noteText.trim() ? sanitizeDiaryNote(noteText) : undefined;
    onSave(selectedMood, sanitized);
  }, [selectedMood, noteText, onSave]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onSkip();
    },
    [onSkip],
  );

  if (!open) return null;

  return (
    <div className="diary-prompt__backdrop" onClick={handleBackdropClick}>
      <div
        className="diary-prompt__card mission-ticket"
        role="dialog"
        aria-modal="true"
        aria-label="Diário de corrida"
        ref={dialogRef}
      >
        <header className="diary-prompt__head">
          <span className="diary-prompt__eyebrow">DIÁRIO DE CORRIDA</span>
          <button
            type="button"
            className="diary-prompt__close"
            onClick={onSkip}
            aria-label="Fechar"
            ref={closeBtnRef}
          >
            ×
          </button>
        </header>

        <p className="diary-prompt__question">Como foi?</p>

        <div className="diary-prompt__mood-row" role="radiogroup" aria-label="Humor da corrida">
          {DIARY_MOODS.map((mood) => {
            const isSelected = selectedMood === mood;
            return (
              <button
                key={mood}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`diary-prompt__mood-btn${isSelected ? ' diary-prompt__mood-btn--selected' : ''}`}
                onClick={() => handleMoodToggle(mood)}
              >
                {MOOD_LABELS[mood]}
              </button>
            );
          })}
        </div>

        <label className="diary-prompt__label" htmlFor="diary-note">
          Nota rápida
        </label>
        <textarea
          id="diary-note"
          className="diary-prompt__textarea"
          placeholder="Nota rápida sobre a corrida..."
          maxLength={DIARY_NOTE_MAX_LENGTH}
          rows={3}
          value={noteText}
          onChange={handleNoteChange}
        />
        <span className="diary-prompt__counter" aria-live="polite">
          {noteText.length}/{DIARY_NOTE_MAX_LENGTH}
        </span>

        <div className="diary-prompt__actions">
          <CartridgeButton
            variant="solid"
            className="game-command game-command--primary"
            onClick={handleSave}
          >
            SALVAR NO DIÁRIO
          </CartridgeButton>
          <CartridgeButton variant="link" onClick={onSkip}>
            PULAR
          </CartridgeButton>
        </div>
      </div>
    </div>
  );
};
