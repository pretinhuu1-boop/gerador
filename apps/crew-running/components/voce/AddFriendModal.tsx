import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CartridgeButton } from '../CartridgeButton';
import {
  FRIEND_EXCHANGE_VERSION,
  decodeFriendPayload,
  encodeFriendPayload,
  type FriendAddMethod,
  type FriendExchangePayload,
  type FriendRecord,
} from '../../data/friends';
import { isNfcSupported, readNfcTag, writeNfcTag } from '../../services/nfc';
import { encodeQrDataUrl } from '../../services/qrcode';

type Props = {
  open: boolean;
  selfUserId: string;
  selfRunnerName: string;
  selfCrewSlug?: string;
  selfRunnerTypeId?: string;
  onClose: () => void;
  onAddFriend: (friend: FriendRecord) => void;
};

type Mode = 'menu' | 'share' | 'scan' | 'handle';

const buildSelfPayload = (props: Props): FriendExchangePayload => ({
  v: FRIEND_EXCHANGE_VERSION,
  userId: props.selfUserId,
  runnerName: props.selfRunnerName,
  crewSlug: props.selfCrewSlug,
  runnerTypeId: props.selfRunnerTypeId,
});

export const AddFriendModal: React.FC<Props> = (props) => {
  const { open, onClose, onAddFriend } = props;
  const [mode, setMode] = useState<Mode>('menu');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [handleInput, setHandleInput] = useState('');

  const selfPayloadJson = useMemo(() => encodeFriendPayload(buildSelfPayload(props)), [props]);
  const nfcSupported = useMemo(() => isNfcSupported(), []);

  useEffect(() => {
    if (!open) {
      setMode('menu');
      setError(null);
      setBusy(false);
      setQrDataUrl(null);
      setHandleInput('');
    }
  }, [open]);

  useEffect(() => {
    if (mode !== 'share') return;
    let cancelled = false;
    encodeQrDataUrl(selfPayloadJson).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    }).catch((e) => {
      if (!cancelled) setError(e?.message || 'Falha gerando QR.');
    });
    return () => {
      cancelled = true;
    };
  }, [mode, selfPayloadJson]);

  const acceptFriend = useCallback(
    (payload: FriendExchangePayload, method: FriendAddMethod) => {
      const friend: FriendRecord = {
        userId: payload.userId,
        runnerName: payload.runnerName,
        crewSlug: payload.crewSlug,
        runnerTypeId: payload.runnerTypeId,
        addedAt: Date.now(),
        addMethod: method,
      };
      onAddFriend(friend);
      onClose();
    },
    [onAddFriend, onClose],
  );

  const handleNfcWrite = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await writeNfcTag(selfPayloadJson);
      setError('Escrito na tag. Aproxime para parear.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha NFC.');
    } finally {
      setBusy(false);
    }
  }, [selfPayloadJson]);

  const handleNfcRead = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const raw = await readNfcTag();
      const payload = decodeFriendPayload(raw);
      if (!payload) throw new Error('Tag NFC sem identidade válida.');
      acceptFriend(payload, 'nfc');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha NFC.');
    } finally {
      setBusy(false);
    }
  }, [acceptFriend]);

  const handleManualAdd = useCallback(() => {
    setError(null);
    const trimmed = handleInput.trim();
    if (!trimmed) {
      setError('Cole o convite ou handle.');
      return;
    }
    const payload = decodeFriendPayload(trimmed);
    if (!payload) {
      setError('Convite inválido. Cole o JSON completo do amigo.');
      return;
    }
    acceptFriend(payload, 'handle');
  }, [handleInput, acceptFriend]);

  const handleCopySelf = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(selfPayloadJson);
        setError('Convite copiado. Cole no outro dispositivo.');
      } else {
        setError('Clipboard indisponível. Selecione o texto manualmente.');
      }
    } catch {
      setError('Falha copiando.');
    }
  }, [selfPayloadJson]);

  if (!open) return null;

  return (
    <div className="add-friend-modal__backdrop" role="dialog" aria-modal="true" aria-label="Adicionar amigo">
      <div className="add-friend-modal mission-ticket">
        <header className="add-friend-modal__head">
          <span className="add-friend-modal__eyebrow">PAREAR RUNNERS</span>
          <button
            type="button"
            className="add-friend-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        {mode === 'menu' && (
          <div className="add-friend-modal__menu">
            <CartridgeButton
              variant="solid"
              className="game-command game-command--primary"
              onClick={() => setMode('share')}
            >
              MOSTRAR MEU CONVITE
            </CartridgeButton>
            <CartridgeButton
              variant="chalk"
              className="game-command"
              onClick={() => setMode('scan')}
              disabled={!nfcSupported}
              aria-disabled={!nfcSupported || undefined}
            >
              {nfcSupported ? 'ENCOSTAR NFC' : 'NFC NÃO SUPORTADO'}
            </CartridgeButton>
            <CartridgeButton
              variant="chalk"
              className="game-command"
              onClick={() => setMode('handle')}
            >
              COLAR CONVITE
            </CartridgeButton>
          </div>
        )}

        {mode === 'share' && (
          <div className="add-friend-modal__share">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR code de identidade do runner"
                className="add-friend-modal__qr"
              />
            )}
            <p className="add-friend-modal__hint">
              Aponte a câmera do outro runner aqui. Ou copie o convite.
            </p>
            <CartridgeButton variant="chalk" className="game-command" onClick={handleCopySelf}>
              COPIAR CONVITE
            </CartridgeButton>
            {nfcSupported && (
              <CartridgeButton
                variant="chalk"
                className="game-command"
                onClick={handleNfcWrite}
                loading={busy}
              >
                ESCREVER NA TAG
              </CartridgeButton>
            )}
            <CartridgeButton variant="link" onClick={() => setMode('menu')}>
              VOLTAR
            </CartridgeButton>
          </div>
        )}

        {mode === 'scan' && (
          <div className="add-friend-modal__scan">
            <p className="add-friend-modal__hint">
              Encoste sua tag/celular no outro runner.
            </p>
            <CartridgeButton
              variant="solid"
              className="game-command game-command--primary"
              onClick={handleNfcRead}
              loading={busy}
            >
              INICIAR LEITURA
            </CartridgeButton>
            <CartridgeButton variant="link" onClick={() => setMode('menu')}>
              VOLTAR
            </CartridgeButton>
          </div>
        )}

        {mode === 'handle' && (
          <div className="add-friend-modal__handle">
            <label className="add-friend-modal__label" htmlFor="add-friend-input">
              CONVITE DO AMIGO
            </label>
            <textarea
              id="add-friend-input"
              className="add-friend-modal__input"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              rows={5}
              placeholder='{"v":1,"userId":"...","runnerName":"..."}'
            />
            <CartridgeButton
              variant="solid"
              className="game-command game-command--primary"
              onClick={handleManualAdd}
            >
              ADICIONAR AMIGO
            </CartridgeButton>
            <CartridgeButton variant="link" onClick={() => setMode('menu')}>
              VOLTAR
            </CartridgeButton>
          </div>
        )}

        {error && (
          <p className="add-friend-modal__error" role="status">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
