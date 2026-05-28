import { describe, expect, it } from 'vitest';
import {
  decodeFriendPayload,
  encodeFriendPayload,
  isFriendAddMethod,
  type FriendExchangePayload,
} from '../friends';

describe('friends payload encode/decode', () => {
  const valid: FriendExchangePayload = {
    v: 1,
    userId: 'usr_abc',
    runnerName: 'Nina',
    crewSlug: 'east-burners',
    runnerTypeId: 'crew-pace',
  };

  it('roundtrips a valid v1 payload', () => {
    const json = encodeFriendPayload(valid);
    const decoded = decodeFriendPayload(json);
    expect(decoded).toEqual(valid);
  });

  it('returns null on invalid JSON', () => {
    expect(decodeFriendPayload('not json')).toBeNull();
    expect(decodeFriendPayload('')).toBeNull();
  });

  it('rejects payload missing required fields', () => {
    expect(decodeFriendPayload('{}')).toBeNull();
    expect(decodeFriendPayload(JSON.stringify({ v: 1 }))).toBeNull();
    expect(decodeFriendPayload(JSON.stringify({ v: 1, userId: 'x' }))).toBeNull();
  });

  it('rejects payload from a future schema version', () => {
    expect(decodeFriendPayload(JSON.stringify({ ...valid, v: 2 }))).toBeNull();
  });

  it('rejects payload with non-string runnerName/userId', () => {
    expect(decodeFriendPayload(JSON.stringify({ ...valid, userId: 123 }))).toBeNull();
    expect(decodeFriendPayload(JSON.stringify({ ...valid, runnerName: null }))).toBeNull();
  });
});

describe('isFriendAddMethod', () => {
  it('accepts nfc/qr/handle', () => {
    expect(isFriendAddMethod('nfc')).toBe(true);
    expect(isFriendAddMethod('qr')).toBe(true);
    expect(isFriendAddMethod('handle')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isFriendAddMethod('manual')).toBe(false);
    expect(isFriendAddMethod(undefined)).toBe(false);
    expect(isFriendAddMethod(42)).toBe(false);
  });
});
