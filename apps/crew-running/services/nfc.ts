type WebNdefRecord = {
  recordType: string;
  data: ArrayBuffer;
};

type WebNdefReadingEvent = {
  message: { records: WebNdefRecord[] };
};

type WebNdefReader = {
  scan: (options?: { signal?: AbortSignal }) => Promise<void>;
  write: (
    payload: { records: Array<{ recordType: string; data: string }> },
    options?: { signal?: AbortSignal },
  ) => Promise<void>;
  addEventListener: (
    type: 'reading',
    listener: (event: WebNdefReadingEvent) => void,
  ) => void;
  removeEventListener: (
    type: 'reading',
    listener: (event: WebNdefReadingEvent) => void,
  ) => void;
};

declare global {
  interface Window {
    NDEFReader?: { new (): WebNdefReader };
  }
}

export const isNfcSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.NDEFReader === 'function';
};

export const writeNfcTag = async (
  payload: string,
  signal?: AbortSignal,
): Promise<void> => {
  if (!isNfcSupported()) {
    throw new Error('Web NFC não suportado neste browser.');
  }
  const Reader = window.NDEFReader!;
  const writer = new Reader();
  await writer.write(
    { records: [{ recordType: 'text', data: payload }] },
    signal ? { signal } : undefined,
  );
};

export const readNfcTag = async (signal?: AbortSignal): Promise<string> => {
  if (!isNfcSupported()) {
    throw new Error('Web NFC não suportado neste browser.');
  }
  const Reader = window.NDEFReader!;
  const reader = new Reader();
  const localController = new AbortController();
  const composed = new AbortController();
  const abortHandler = () => composed.abort();
  if (signal) {
    if (signal.aborted) composed.abort();
    else signal.addEventListener('abort', abortHandler, { once: true });
  }
  await reader.scan({ signal: composed.signal });
  return new Promise<string>((resolve, reject) => {
    let settled = false;
    const finish = (resolveValue: string | null, error: Error | null) => {
      if (settled) return;
      settled = true;
      reader.removeEventListener('reading', listener);
      composed.signal.removeEventListener('abort', onAbort);
      signal?.removeEventListener('abort', abortHandler);
      localController.abort();
      if (error) reject(error);
      else if (resolveValue !== null) resolve(resolveValue);
    };
    const onAbort = () => finish(null, new Error('NFC scan cancelado.'));
    const listener = (event: WebNdefReadingEvent) => {
      const textRecord = event.message.records.find((r) => r.recordType === 'text');
      if (!textRecord) {
        finish(null, new Error('Tag NFC sem dados de identidade.'));
        return;
      }
      const decoder = new TextDecoder();
      finish(decoder.decode(textRecord.data), null);
    };
    composed.signal.addEventListener('abort', onAbort, { once: true });
    reader.addEventListener('reading', listener);
  });
};
