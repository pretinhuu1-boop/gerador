import { describe, expect, it } from 'vitest';
import {
  DIARY_MOODS,
  DIARY_NOTE_MAX_LENGTH,
  buildDiaryEntry,
  isDiaryEntry,
  isDiaryMood,
  sanitizeDiaryNote,
  type DiaryEntry,
} from '../diary';
import type { RunSnapshot } from '../../services/runTracker';

const baseSnapshot = (overrides: Partial<RunSnapshot> = {}): RunSnapshot => ({
  state: 'ended',
  startedAt: 1000,
  elapsedMs: 60_000,
  totalMeters: 5000,
  metersInTerritory: 3000,
  points: [],
  touchedSpotIds: ['spot-vale', 'spot-republica'],
  crewSlug: 'downtown-rush',
  homeZoneId: 'centro',
  closedLoop: false,
  permissionDenied: false,
  ...overrides,
});

describe('buildDiaryEntry', () => {
  it('creates a valid entry with all fields mapped from the snapshot', () => {
    const snap = baseSnapshot();
    const entry = buildDiaryEntry({
      snapshot: snap,
      xpEarned: 120,
      missionsCompleted: ['m-spot-hunt-centro'],
      note: 'Boa corrida!',
      mood: 'fire',
    });

    expect(entry.id).toBeTruthy();
    expect(entry.createdAt).toBeGreaterThan(0);
    expect(entry.distanceKm).toBe(5);
    expect(entry.durationMs).toBe(60_000);
    expect(entry.crewSlug).toBe('downtown-rush');
    expect(entry.zoneId).toBe('centro');
    expect(entry.spotsVisited).toEqual(['spot-vale', 'spot-republica']);
    expect(entry.xpEarned).toBe(120);
    expect(entry.missionsCompleted).toEqual(['m-spot-hunt-centro']);
    expect(entry.note).toBe('Boa corrida!');
    expect(entry.mood).toBe('fire');
    expect(isDiaryEntry(entry)).toBe(true);
  });

  it('omits optional fields when not provided', () => {
    const snap = baseSnapshot({ crewSlug: undefined, homeZoneId: undefined, touchedSpotIds: [] });
    const entry = buildDiaryEntry({
      snapshot: snap,
      xpEarned: 0,
      missionsCompleted: [],
    });

    expect(entry.crewSlug).toBeUndefined();
    expect(entry.zoneId).toBeUndefined();
    expect(entry.spotsVisited).toEqual([]);
    expect(entry.note).toBeUndefined();
    expect(entry.mood).toBeUndefined();
    expect(isDiaryEntry(entry)).toBe(true);
  });

  it('sanitizes note text', () => {
    const longNote = 'a'.repeat(400);
    const entry = buildDiaryEntry({
      snapshot: baseSnapshot(),
      xpEarned: 10,
      missionsCompleted: [],
      note: longNote,
    });

    expect(entry.note).toHaveLength(DIARY_NOTE_MAX_LENGTH);
  });

  it('does not share array references with the snapshot', () => {
    const snap = baseSnapshot();
    const entry = buildDiaryEntry({
      snapshot: snap,
      xpEarned: 0,
      missionsCompleted: ['m-1'],
    });

    expect(entry.spotsVisited).not.toBe(snap.touchedSpotIds);
    expect(entry.missionsCompleted).toEqual(['m-1']);
  });
});

describe('sanitizeDiaryNote', () => {
  it('trims whitespace', () => {
    expect(sanitizeDiaryNote('  hello  ')).toBe('hello');
  });

  it('caps at DIARY_NOTE_MAX_LENGTH', () => {
    const long = 'x'.repeat(500);
    const result = sanitizeDiaryNote(long);
    expect(result).toHaveLength(DIARY_NOTE_MAX_LENGTH);
    expect(result).toBe('x'.repeat(DIARY_NOTE_MAX_LENGTH));
  });

  it('returns empty string for whitespace-only input', () => {
    expect(sanitizeDiaryNote('   ')).toBe('');
  });

  it('does not alter short text', () => {
    expect(sanitizeDiaryNote('corrida leve')).toBe('corrida leve');
  });
});

describe('isDiaryMood', () => {
  it('accepts all four valid moods', () => {
    for (const mood of DIARY_MOODS) {
      expect(isDiaryMood(mood)).toBe(true);
    }
  });

  it('rejects invalid strings', () => {
    expect(isDiaryMood('happy')).toBe(false);
    expect(isDiaryMood('')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isDiaryMood(null)).toBe(false);
    expect(isDiaryMood(undefined)).toBe(false);
    expect(isDiaryMood(42)).toBe(false);
    expect(isDiaryMood(true)).toBe(false);
  });
});

describe('isDiaryEntry', () => {
  const validEntry: DiaryEntry = {
    id: 'test-id',
    createdAt: Date.now(),
    distanceKm: 5,
    durationMs: 60_000,
    spotsVisited: ['spot-vale'],
    xpEarned: 100,
    missionsCompleted: ['m-1'],
    crewSlug: 'downtown-rush',
    zoneId: 'centro',
    note: 'nice',
    mood: 'fire',
  };

  it('validates a complete entry', () => {
    expect(isDiaryEntry(validEntry)).toBe(true);
  });

  it('validates a minimal entry (no optional fields)', () => {
    const minimal: DiaryEntry = {
      id: 'x',
      createdAt: 1,
      distanceKm: 0,
      durationMs: 0,
      spotsVisited: [],
      xpEarned: 0,
      missionsCompleted: [],
    };
    expect(isDiaryEntry(minimal)).toBe(true);
  });

  it('rejects null and non-objects', () => {
    expect(isDiaryEntry(null)).toBe(false);
    expect(isDiaryEntry(undefined)).toBe(false);
    expect(isDiaryEntry('string')).toBe(false);
    expect(isDiaryEntry(42)).toBe(false);
  });

  it('rejects when required fields are wrong type', () => {
    expect(isDiaryEntry({ ...validEntry, id: 123 })).toBe(false);
    expect(isDiaryEntry({ ...validEntry, createdAt: 'not-a-number' })).toBe(false);
    expect(isDiaryEntry({ ...validEntry, distanceKm: '5' })).toBe(false);
    expect(isDiaryEntry({ ...validEntry, durationMs: null })).toBe(false);
    expect(isDiaryEntry({ ...validEntry, xpEarned: false })).toBe(false);
  });

  it('rejects when arrays contain non-strings', () => {
    expect(isDiaryEntry({ ...validEntry, spotsVisited: [1, 2] })).toBe(false);
    expect(isDiaryEntry({ ...validEntry, missionsCompleted: [null] })).toBe(false);
  });

  it('rejects invalid mood', () => {
    expect(isDiaryEntry({ ...validEntry, mood: 'happy' })).toBe(false);
  });

  it('accepts undefined optional fields', () => {
    const { note, mood, crewSlug, zoneId, ...rest } = validEntry;
    expect(isDiaryEntry(rest)).toBe(true);
  });
});
