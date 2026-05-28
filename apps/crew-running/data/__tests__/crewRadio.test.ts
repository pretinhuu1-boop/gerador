import { describe, expect, it } from 'vitest';
import {
  CREW_RADIO_MAX_LENGTH,
  buildCrewRadioId,
  isCrewRadioMessage,
  isExpired,
  sanitizeRadioText,
  type CrewRadioMessage,
} from '../crewRadio';

const baseMessage = (overrides: Partial<CrewRadioMessage> = {}): CrewRadioMessage => ({
  id: 'radio_a_100',
  authorUserId: 'a',
  authorName: 'Author',
  crewSlug: 'east-burners',
  text: 'hello',
  postedAt: 100,
  expiresAt: 200,
  ...overrides,
});

describe('crewRadio types', () => {
  it('buildCrewRadioId is deterministic for same author + ts', () => {
    expect(buildCrewRadioId('user-1', 12345)).toBe('radio_user-1_12345');
  });

  it('isCrewRadioMessage validates required fields', () => {
    expect(isCrewRadioMessage(baseMessage())).toBe(true);
    expect(isCrewRadioMessage(null)).toBe(false);
    expect(isCrewRadioMessage({})).toBe(false);
    expect(isCrewRadioMessage({ ...baseMessage(), text: 42 })).toBe(false);
  });

  it('isExpired flips at expiresAt boundary', () => {
    const msg = baseMessage({ expiresAt: 1000 });
    expect(isExpired(msg, 999)).toBe(false);
    expect(isExpired(msg, 1000)).toBe(true);
    expect(isExpired(msg, 1001)).toBe(true);
  });
});

describe('sanitizeRadioText', () => {
  it('trims whitespace then slices to max length', () => {
    expect(sanitizeRadioText('   hello   ')).toBe('hello');
  });

  it('caps at CREW_RADIO_MAX_LENGTH', () => {
    const oversize = 'a'.repeat(CREW_RADIO_MAX_LENGTH + 50);
    expect(sanitizeRadioText(oversize).length).toBe(CREW_RADIO_MAX_LENGTH);
  });

  it('returns empty when only whitespace', () => {
    expect(sanitizeRadioText('     ')).toBe('');
    expect(sanitizeRadioText('')).toBe('');
  });
});
