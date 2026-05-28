import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { isCameraAvailable, startQrScan, type QrScanController } from '../../services/qrScan';

type Props = {
  open: boolean;
  selfUserId: string;
  selfRunnerName: string;
  selfCrewSlug?: string;
  selfRunnerTypeId?: string;
  onClose: () => void;
  onAddFriend: (friend: FriendRecord) => void;
};

type Mode = 'menu' | 'share' | 'scan' | 'qr-scan' | 'handle';

const buildSelfPayload = (props: Props): FriendExchangePayload => ({
  v: FRIEND_EXCHANGE_VERSION,
  userId: props.selfUserId,
  runnerName: props.selfRunnerName,
  crewSlug: props.selfCrewSlug,
  runnerTypeId: props.selfRunnerTypeId,
});

export const AddFriendModal: React.FC<Props> = (props) => {
  const { open, selfUserId, onClose, onAddFriend } = props;
  const [mode, setMode] = useState<Mode>('menu');
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [handleInput, setHandleInput] = useState('');
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const nfcAbortRef = useRef<AbortController | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qrScanRef = useRef<QrScanController | null>(null);

  const selfPayloadJson = useMemo(
    () => encodeFriendPayload(buildSelfPayload(props)),
    [selfUserId, props.selfRunnerName, props.selfCrewSlug, props.selfRunnerTypeId],
  );
  const nfcSupported = useMemo(() => isNfcSupported(), []);
  const cameraAvailable = useMemo(() => isCameraAvailable(), []);

  useEffect(() => {
    if (!open) {
      setMode('menu');
      setFeedback(null);
      setBusy(false);
      setQrDataUrl(null);
      setHandleInput('');
      nfcAbortRef.current?.abort();
      nfcAbortRef.current = null;
      qrScanRef.current?.stop();
      qrScanRef.current = null;
    } else {
      closeBtnRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
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
  }, [open, onClose]);

  useEffect(() => {
    if (mode !== 'share') return;
    let cancelled = false;
    encodeQrDataUrl(selfPayloadJson).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    }).catch((e) => {
      if (!cancelled) setFeedback({ msg: e?.message || 'Falha gerando QR.', ok: false });
    });
    return () => {
      cancelled = true;
    };
  }, [mode, selfPayloadJson]);

  const acceptFriend = useCallback(
    (payload: FriendExchangePayload, method: FriendAddMethod) => {
      if (payload.userId === selfUserId) {
        setFeedback({ msg: 'Esse convite é teu. Pede o convite do outro runner.', ok: false });
        return;
      }
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
    [selfUserId, onAddFriend, onClose],
  );

  useEffect(() => {
    if (mode !== 'qr-scan') {
      qrScanRef.current?.stop();
      qrScanRef.current = null;
      return;
    }
    const vid = videoRef.current;
    if (!vid) return;
    setBusy(true);
    setFeedback(null);
    let handled = false;
    const ctrl = startQrScan(
      vid,
      (data) => {
        if (handled) return;
        handled = true;
        ctrl.stop();
        setBusy(false);
        const payload = decodeFriendPayload(data);
        if (payload) {
          acceptFriend(payload, 'qr');
        } else {
          setFeedback({ msg: 'QR inválido. Peça o convite do outro runner.', ok: false });
        }
      },
      (err) => {
        setBusy(false);
        setFeedback({ msg: err.message || 'Câmera indisponível.', ok: false });
      },
    );
    qrScanRef.current = ctrl;
    return () => ctrl.stop();
  }, [mode, acceptFriend]);

  const handleNfcWrite = useCallback(async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await writeNfcTag(selfPayloadJson);
      setFeedback({ msg: 'Escrito na tag. Aproxime para parear.', ok: true });
    } catch (e) {
      setFeedback({ msg: e instanceof Error ? e.message : 'Falha NFC.', ok: false });
    } finally {
      setBusy(false);
    }
  }, [selfPayloadJson]);

  const handleNfcRead = useCallback(async () => {
    nfcAbortRef.current?.abort();
    const controller = new AbortController();
    nfcAbortRef.current = controller;
    setBusy(true);
    setFeedback(null);
    try {
      const raw = await readNfcTag(controller.signal);
      const payload = decodeFriendPayload(raw);
      if (!payload) throw new Error('Tag NFC sem identidade válida.');
      acceptFriend(payload, 'nfc');
    } catch (e) {
      if (!controller.signal.aborted) {
        setFeedback({ msg: e instanceof Error ? e.message : 'Falha NFC.', ok: false });
      }
    } finally {
      setBusy(false);
      if (nfcAbortRef.current === controller) nfcAbortRef.current = null;
    }
  }, [acceptFriend]);

  const handleManualAdd = useCallback(() => {
    setFeedback(null);
    const trimmed = handleInput.trim();
    if (!trimmed) {
      setFeedback({ msg: 'Cole o convite ou handle.', ok: false });
      return;
    }
    const payload = decodeFriendPayload(trimmed);
    if (!payload) {
      setFeedback({ msg: 'Convite inválido. Cole o JSON completo do amigo.', ok: false });
      return;
    }
    acceptFriend(payload, 'handle');
  }, [handleInput, acceptFriend]);

  const handleCopySelf = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(selfPayloadJson);
        setFeedback({ msg: 'Convite copiado. Cole no outro dispositivo.', ok: true });
      } else {
        setFeedback({ msg: 'Clipboard indisponível. Selecione o texto manualmente.', ok: false });
      }
    } catch {
      setFeedback({ msg: 'Falha copiando.', ok: false });
    }
  }, [selfPayloadJson]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="add-friend-modal__backdrop"
      onClick={handleBackdropClick}
    >
      <div
        className="add-friend-modal mission-ticket"
        role="dialog"
        aria-modal="true"
        aria-label="Adicionar amigo"
        ref={dialogRef}
      >
        <header className="add-friend-modal__head">
          <span className="add-friend-modal__eyebrow">PAREAR RUNNERS</span>
          <button
            type="button"
            className="add-friend-modal__close"
            onClick={onClose}
            aria-label="Fechar"
            ref={closeBtnRef}
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
              onClick={() => setMode('qr-scan')}
              disabled={!cameraAvailable}
              aria-disabled={!cameraAvailable || undefined}
            >
              {cameraAvailable ? 'ESCANEAR QR' : 'CÂMERA INDISPONÍVEL'}
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
            <details className="add-friend-modal__fallback">
              <summary>Clipboard bloqueado? Selecionar manualmente</summary>
              <textarea
                className="add-friend-modal__input"
                readOnly
                value={selfPayloadJson}
                rows={3}
                aria-label="Convite copiável manualmente"
                onFocus={(e) => e.currentTarget.select()}
              />
            </details>
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

        {mode === 'qr-scan' && (
          <div className="add-friend-modal__qr-scan">
            <p className="add-friend-modal__hint">
              Aponte a câmera para o QR code do outro runner.
            </p>
            <video
              ref={videoRef}
              className="add-friend-modal__camera"
              playsInline
              muted
              aria-label="Câmera para escanear QR"
            />
            {busy && <span className="add-friend-modal__scan-status">Escaneando…</span>}
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

        <div aria-live="assertive" aria-atomic="true">
          {feedback && (
            <p className={`add-friend-modal__feedback ${feedback.ok ? 'is-ok' : ''}`} role="alert">
              {feedback.msg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
