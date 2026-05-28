import React, { useEffect, useRef, useState } from 'react';
import { CartridgeButton } from '../CartridgeButton';
import { CrewBadge } from '../CrewBadge';
import { CREW_RADIO_MAX_LENGTH } from '../../data/crewRadio';
import { useCrewRadio } from '../../hooks/useCrewRadio';

type Props = {
  crewSlug?: string;
  selfUserId: string;
  selfRunnerName?: string;
};

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
});

export const CrewRadioOverlay: React.FC<Props> = ({
  crewSlug,
  selfUserId,
  selfRunnerName,
}) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { messages, post } = useCrewRadio({
    crewSlug,
    selfUserId,
    selfRunnerName,
  });

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const result = post(trimmed);
    if (result) setText('');
  };

  if (!crewSlug) return null;

  return (
    <div
      className={`crew-radio-overlay ${open ? 'is-open' : 'is-closed'}`}
      aria-label="Rádio da crew"
    >
      <header className="crew-radio-overlay__head">
        <CrewBadge crew={crewSlug} size="sm" />
        <span className="crew-radio-overlay__title">RÁDIO DA CREW</span>
        <button
          type="button"
          className="crew-radio-overlay__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="crew-radio-overlay-body"
        >
          {open ? '×' : `${messages.length}↑`}
        </button>
      </header>
      {open && (
        <div id="crew-radio-overlay-body" className="crew-radio-overlay__body">
          <ul className="crew-radio-overlay__feed" aria-label="Mensagens recentes da rádio">
            {messages.length === 0 && (
              <li className="crew-radio-overlay__empty">
                Nenhum sinal nos últimos 24h. Manda o primeiro grito.
              </li>
            )}
            {messages.map((msg) => (
              <li key={msg.id} className="crew-radio-overlay__msg">
                <div className="crew-radio-overlay__msg-head">
                  <strong>{msg.authorName}</strong>
                  <time dateTime={new Date(msg.postedAt).toISOString()}>
                    {dateFmt.format(msg.postedAt)}
                  </time>
                </div>
                <p className="crew-radio-overlay__msg-text">{msg.text}</p>
              </li>
            ))}
          </ul>
          <form className="crew-radio-overlay__form" onSubmit={handleSubmit}>
            <label className="crew-radio-overlay__label" htmlFor="crew-radio-input">
              MANDA UM SINAL
            </label>
            <input
              id="crew-radio-input"
              ref={inputRef}
              className="crew-radio-overlay__input"
              value={text}
              maxLength={CREW_RADIO_MAX_LENGTH}
              onChange={(e) => setText(e.target.value)}
              placeholder="Fala pra crew (24h)"
              type="text"
            />
            <CartridgeButton
              variant="solid"
              type="submit"
              className="game-command game-command--primary crew-radio-overlay__send"
              disabled={text.trim().length === 0}
            >
              ENVIAR
            </CartridgeButton>
          </form>
        </div>
      )}
    </div>
  );
};
