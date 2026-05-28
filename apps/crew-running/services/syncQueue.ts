import { canUseStorage } from './storageBase';

const KEY_PREFIX = 'crewSync_';

export interface QueueItem<T = unknown> {
  id: string;
  channel: string;
  payload: T;
  createdAt: number;
}

const getKey = (channel: string) => `${KEY_PREFIX}${channel}`;

export const enqueue = <T>(channel: string, payload: T): void => {
  if (!canUseStorage()) return;
  const key = getKey(channel);
  const items = peekQueue(channel);
  const item: QueueItem<T> = {
    id: crypto.randomUUID(),
    channel,
    payload,
    createdAt: Date.now(),
  };
  items.push(item as QueueItem);
  window.localStorage.setItem(key, JSON.stringify(items));
};

export const peekQueue = <T = unknown>(channel: string): QueueItem<T>[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(getKey(channel));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const dequeue = (channel: string, id: string): void => {
  if (!canUseStorage()) return;
  const items = peekQueue(channel);
  const filtered = items.filter((item) => item.id !== id);
  window.localStorage.setItem(getKey(channel), JSON.stringify(filtered));
};

export const flushQueue = async (
  channel: string,
  sender: (payload: unknown) => Promise<boolean>,
): Promise<number> => {
  const items = peekQueue(channel);
  let sent = 0;
  for (const item of items) {
    const ok = await sender(item.payload);
    if (ok) {
      dequeue(channel, item.id);
      sent++;
    }
  }
  return sent;
};
