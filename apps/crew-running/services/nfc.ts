type WebNdefWriter = {
  write: (payload: { records: Array<{ recordType: string; data: string }> }) => Promise<void>;
};

type WebNdefReader = {
  scan: () => Promise<void>;
  addEventListener: (
    type: 'reading',
    listener: (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer }> } }) => void,
  ) => void;
  removeEventListener: (type: 'reading', listener: (event: unknown) => void) => void;
};

declare global {
  interface Window {
    NDEFReader?: { new (): WebNdefReader & WebNdefWriter };
  }
}

export const isNfcSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return typeof window.NDEFReader === 'function';
};

export const writeNfcTag = async (payload: string): Promise<void> => {
  if (!isNfcSupported()) {
    throw new Error('Web NFC não suportado neste browser.');
  }
  const Reader = window.NDEFReader!;
  const writer = new Reader();
  await writer.write({
    records: [{ recordType: 'text', data: payload }],
  });
};

export const readNfcTag = async (
  signal?: AbortSignal,
): Promise<string> => {
  if (!isNfcSupported()) {
    throw new Error('Web NFC não suportado neste browser.');
  }
  const Reader = window.NDEFReader!;
  const reader = new Reader();
  await reader.scan();
  return new Promise<string>((resolve, reject) => {
    const handler = (event: { message: { records: Array<{ recordType: string; data: ArrayBuffer }> } }) => {
      const textRecord = event.message.records.find((r) => r.recordType === 'text');
      if (!textRecord) {
        reject(new Error('Tag NFC sem dados de identidade.'));
        return;
      }
      const decoder = new TextDecoder();
      resolve(decoder.decode(textRecord.data));
      reader.removeEventListener('reading', handler as (e: unknown) => void);
    };
    reader.addEventListener('reading', handler);
    if (signal) {
      signal.addEventListener('abort', () => {
        reader.removeEventListener('reading', handler as (e: unknown) => void);
        reject(new Error('NFC scan cancelado.'));
      });
    }
  });
};
