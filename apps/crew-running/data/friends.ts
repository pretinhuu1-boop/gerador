export type FriendAddMethod = 'nfc' | 'qr' | 'handle';

export type FriendRecord = {
  userId: string;
  runnerName: string;
  crewSlug?: string;
  runnerTypeId?: string;
  addedAt: number;
  addMethod: FriendAddMethod;
  /** Optional avatar dataUrl shared at exchange time (may be omitted to save space). */
  avatarDataUrl?: string;
};

export type FriendExchangePayload = {
  /** v1 of the friend exchange wire format. Bump on breaking changes. */
  v: 1;
  userId: string;
  runnerName: string;
  crewSlug?: string;
  runnerTypeId?: string;
};

export const FRIEND_EXCHANGE_VERSION = 1;

export const encodeFriendPayload = (payload: FriendExchangePayload): string =>
  JSON.stringify(payload);

export const decodeFriendPayload = (raw: string): FriendExchangePayload | null => {
  try {
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      parsed.v !== FRIEND_EXCHANGE_VERSION ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.runnerName !== 'string'
    ) {
      return null;
    }
    return parsed as FriendExchangePayload;
  } catch {
    return null;
  }
};

export const isFriendAddMethod = (value: unknown): value is FriendAddMethod =>
  value === 'nfc' || value === 'qr' || value === 'handle';
