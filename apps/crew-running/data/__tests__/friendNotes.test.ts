import { describe, expect, it } from 'vitest';
import {
  FRIEND_NOTE_MAX_LENGTH,
  FRIEND_TAGS,
  buildFriendNote,
  isFriendNote,
  isFriendTag,
  sanitizeFriendNote,
} from '../friendNotes';

describe('isFriendTag', () => {
  it('accepts all 4 tags', () => {
    for (const tag of FRIEND_TAGS) {
      expect(isFriendTag(tag)).toBe(true);
    }
  });

  it('rejects invalid values', () => {
    expect(isFriendTag('amigo')).toBe(false);
    expect(isFriendTag('')).toBe(false);
    expect(isFriendTag(undefined)).toBe(false);
    expect(isFriendTag(42)).toBe(false);
    expect(isFriendTag(null)).toBe(false);
  });
});

describe('sanitizeFriendNote', () => {
  it('trims whitespace', () => {
    expect(sanitizeFriendNote('  oi  ')).toBe('oi');
  });

  it('caps at 140 characters', () => {
    const long = 'a'.repeat(200);
    const result = sanitizeFriendNote(long);
    expect(result.length).toBe(FRIEND_NOTE_MAX_LENGTH);
  });

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeFriendNote('   ')).toBe('');
  });

  it('trims before capping', () => {
    const padded = '  ' + 'b'.repeat(150) + '  ';
    const result = sanitizeFriendNote(padded);
    expect(result.length).toBe(FRIEND_NOTE_MAX_LENGTH);
    expect(result[0]).toBe('b');
  });
});

describe('isFriendNote', () => {
  const valid = {
    friendUserId: 'usr_abc',
    text: 'bora correr',
    updatedAt: Date.now(),
  };

  it('accepts a valid note without tag', () => {
    expect(isFriendNote(valid)).toBe(true);
  });

  it('accepts a valid note with tag', () => {
    expect(isFriendNote({ ...valid, tag: 'rival' })).toBe(true);
  });

  it('rejects null and primitives', () => {
    expect(isFriendNote(null)).toBe(false);
    expect(isFriendNote(undefined)).toBe(false);
    expect(isFriendNote('string')).toBe(false);
    expect(isFriendNote(42)).toBe(false);
  });

  it('rejects missing required fields', () => {
    expect(isFriendNote({})).toBe(false);
    expect(isFriendNote({ friendUserId: 'x' })).toBe(false);
    expect(isFriendNote({ friendUserId: 'x', text: 'y' })).toBe(false);
  });

  it('rejects wrong field types', () => {
    expect(isFriendNote({ ...valid, friendUserId: 123 })).toBe(false);
    expect(isFriendNote({ ...valid, text: null })).toBe(false);
    expect(isFriendNote({ ...valid, updatedAt: '2026' })).toBe(false);
  });

  it('rejects invalid tag value', () => {
    expect(isFriendNote({ ...valid, tag: 'amigo' })).toBe(false);
  });
});

describe('buildFriendNote', () => {
  it('creates a note with updatedAt', () => {
    const before = Date.now();
    const note = buildFriendNote('usr_123', 'corre comigo');
    expect(note.friendUserId).toBe('usr_123');
    expect(note.text).toBe('corre comigo');
    expect(note.tag).toBeUndefined();
    expect(note.updatedAt).toBeGreaterThanOrEqual(before);
    expect(note.updatedAt).toBeLessThanOrEqual(Date.now());
  });

  it('applies tag when provided', () => {
    const note = buildFriendNote('usr_456', 'meu mentor', 'mentor');
    expect(note.tag).toBe('mentor');
  });

  it('sanitizes the text', () => {
    const note = buildFriendNote('usr_789', '  ' + 'x'.repeat(200) + '  ');
    expect(note.text.length).toBe(FRIEND_NOTE_MAX_LENGTH);
    expect(note.text[0]).toBe('x');
  });
});
