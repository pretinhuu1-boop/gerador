import React, { useEffect, useState } from 'react';
import { getCrewBySlug } from '../../data/crews';
import { CartridgeButton } from '../CartridgeButton';
import { MapBottomSheet } from './MapBottomSheet';
import type { FriendRecord } from '../../data/friends';
import {
  FRIEND_NOTE_MAX_LENGTH,
  FRIEND_TAGS,
  TAG_EMOJI,
  TAG_LABELS,
  type FriendNote,
  type FriendTag,
} from '../../data/friendNotes';

interface Props {
  friend: FriendRecord;
  open: boolean;
  onClose: () => void;
  note?: FriendNote;
  onSaveNote?: (friendUserId: string, text: string, tag?: FriendTag) => void;
}

export const RunnerCard: React.FC<Props> = ({ friend, open, onClose, note, onSaveNote }) => {
  const crew = friend.crewSlug ? getCrewBySlug(friend.crewSlug) : undefined;
  const d = new Date(friend.addedAt);
  const addedDate = Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');

  const [noteText, setNoteText] = useState(note?.text ?? '');
  const [selectedTag, setSelectedTag] = useState<FriendTag | undefined>(note?.tag);

  useEffect(() => {
    setNoteText(note?.text ?? '');
    setSelectedTag(note?.tag);
  }, [friend.userId, note]);

  const isDirty =
    noteText !== (note?.text ?? '') || selectedTag !== note?.tag;

  const handleSave = () => {
    onSaveNote?.(friend.userId, noteText, selectedTag);
  };

  return (
    <MapBottomSheet
      open={open}
      onClose={onClose}
      title={friend.runnerName}
      accent={crew?.accent}
    >
      <div className="runner-card">
        <div className="runner-card__hero">
          {friend.avatarDataUrl ? (
            <img src={friend.avatarDataUrl} alt="" className="runner-card__avatar" />
          ) : (
            <div className="runner-card__avatar-placeholder" style={{ borderColor: crew?.accent }}>
              {friend.runnerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="runner-card__info">
            <span className="runner-card__name">{friend.runnerName}</span>
            {crew && (
              <span className="runner-card__crew" style={{ color: crew.accent }}>
                {crew.name} · {crew.zone}
              </span>
            )}
            {friend.runnerTypeId && (
              <span className="runner-card__type">{friend.runnerTypeId}</span>
            )}
          </div>
        </div>

        <div className="runner-card__meta">
          <div className="runner-card__meta-item">
            <span className="runner-card__meta-label">Adicionado</span>
            <span className="runner-card__meta-value">{addedDate}</span>
          </div>
          <div className="runner-card__meta-item">
            <span className="runner-card__meta-label">Via</span>
            <span className="runner-card__meta-value">{friend.addMethod.toUpperCase()}</span>
          </div>
        </div>

        <hr className="runner-card__divider" />

        <div className="runner-card__note-section">
          <span className="runner-card__section-label">NOTA</span>
          <textarea
            className="runner-card__note-input"
            placeholder="Adicionar nota..."
            maxLength={FRIEND_NOTE_MAX_LENGTH}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={2}
          />
          <span className="runner-card__note-counter">
            {noteText.length}/{FRIEND_NOTE_MAX_LENGTH}
          </span>
        </div>

        <div className="runner-card__tag-section">
          <span className="runner-card__section-label">TAG</span>
          <div className="runner-card__tag-buttons">
            {FRIEND_TAGS.map((tag) => (
              <CartridgeButton
                key={tag}
                variant={selectedTag === tag ? 'solid' : 'chalk'}
                className="game-command runner-card__tag-btn"
                onClick={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
              >
                {TAG_EMOJI[tag]} {TAG_LABELS[tag]}
              </CartridgeButton>
            ))}
          </div>
        </div>

        {isDirty && (
          <CartridgeButton
            variant="solid"
            className="game-command runner-card__save-btn"
            onClick={handleSave}
          >
            SALVAR NOTA
          </CartridgeButton>
        )}
      </div>
    </MapBottomSheet>
  );
};
