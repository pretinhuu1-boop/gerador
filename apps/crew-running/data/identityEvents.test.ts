import { describe, expect, it } from 'vitest';
import {
  IDENTITY_EVENT_VARIANTS,
  buildIdentityEventId,
  isIdentityEventKind,
  type IdentityEventKind,
} from './identityEvents';

const ALL_KINDS: IdentityEventKind[] = [
  'CREW_JOINED',
  'GUIDE_COMPLETED',
  'LOOK_SAVED',
  'RUNNER_TYPE_CHANGED',
  'BADGE_EARNED',
  'STICKER_DROPPED',
  'VISUAL_CREATED',
];

describe('IDENTITY_EVENT_VARIANTS', () => {
  it('covers every IdentityEventKind', () => {
    for (const kind of ALL_KINDS) {
      expect(IDENTITY_EVENT_VARIANTS[kind]).toBeDefined();
    }
    expect(Object.keys(IDENTITY_EVENT_VARIANTS).sort()).toEqual([...ALL_KINDS].sort());
  });

  it('uses CSS custom-property syntax for railToken + swatchToken', () => {
    const cssVarPattern = /^var\(--[a-z][a-z0-9-]*(?:\s*,\s*[^)]+)?\)$/i;
    for (const kind of ALL_KINDS) {
      const spec = IDENTITY_EVENT_VARIANTS[kind];
      expect(spec.railToken, `${kind} railToken`).toMatch(cssVarPattern);
      expect(spec.swatchToken, `${kind} swatchToken`).toMatch(cssVarPattern);
    }
  });

  it('shows look card only for LOOK_SAVED + VISUAL_CREATED', () => {
    for (const kind of ALL_KINDS) {
      const expected = kind === 'LOOK_SAVED' || kind === 'VISUAL_CREATED';
      expect(IDENTITY_EVENT_VARIANTS[kind].showLookCard).toBe(expected);
    }
  });

  it('has non-empty uppercase headline per variant', () => {
    for (const kind of ALL_KINDS) {
      const h = IDENTITY_EVENT_VARIANTS[kind].headline;
      expect(h.length).toBeGreaterThan(0);
      expect(h).toBe(h.toUpperCase());
    }
  });

  it('bodyTemplate returns a string for empty payload', () => {
    for (const kind of ALL_KINDS) {
      const body = IDENTITY_EVENT_VARIANTS[kind].bodyTemplate({});
      expect(typeof body).toBe('string');
      expect(body.length).toBeGreaterThan(0);
    }
  });

  it('LOOK_SAVED body formats slot tokens joined by separator', () => {
    const body = IDENTITY_EVENT_VARIANTS.LOOK_SAVED.bodyTemplate({
      slots: { top: 'jersey_black', bottom: 'shorts_grey', shoes: 'kicks_white', accessory: 'cap_red' },
    });
    expect(body).toContain('JERSEY BLACK');
    expect(body).toContain('SHORTS GREY');
    expect(body).toContain('KICKS WHITE');
    expect(body).toContain('CAP RED');
    expect(body).toContain(' · ');
  });

  it('RUNNER_TYPE_CHANGED body upper-cases canonical runnerTypeId', () => {
    const body = IDENTITY_EVENT_VARIANTS.RUNNER_TYPE_CHANGED.bodyTemplate({ runnerTypeId: 'crew-pace' });
    expect(body).toBe('CREW PACE');
  });

  it('BADGE_EARNED + STICKER_DROPPED body surface id when present', () => {
    expect(
      IDENTITY_EVENT_VARIANTS.BADGE_EARNED.bodyTemplate({ badgeId: 'first-loop' }),
    ).toBe('FIRST-LOOP');
    expect(
      IDENTITY_EVENT_VARIANTS.STICKER_DROPPED.bodyTemplate({ stickerId: 'tag-01' }),
    ).toBe('TAG-01');
  });
});

describe('isIdentityEventKind', () => {
  it('accepts every canonical kind', () => {
    for (const kind of ALL_KINDS) {
      expect(isIdentityEventKind(kind)).toBe(true);
    }
  });

  it('rejects unknown strings + non-strings', () => {
    expect(isIdentityEventKind('look_saved')).toBe(false);
    expect(isIdentityEventKind('CREW_FLOW')).toBe(false);
    expect(isIdentityEventKind('')).toBe(false);
    expect(isIdentityEventKind(null)).toBe(false);
    expect(isIdentityEventKind(undefined)).toBe(false);
    expect(isIdentityEventKind(42)).toBe(false);
    expect(isIdentityEventKind({})).toBe(false);
  });
});

describe('buildIdentityEventId', () => {
  it('joins lowercased kind + timestamp with underscore', () => {
    expect(buildIdentityEventId('LOOK_SAVED', 1700000000000)).toBe('look_saved_1700000000000');
    expect(buildIdentityEventId('CREW_JOINED', 0)).toBe('crew_joined_0');
  });

  it('is deterministic for same inputs', () => {
    const a = buildIdentityEventId('BADGE_EARNED', 12345);
    const b = buildIdentityEventId('BADGE_EARNED', 12345);
    expect(a).toBe(b);
  });

  it('differs for different timestamps with same kind', () => {
    expect(buildIdentityEventId('LOOK_SAVED', 1)).not.toBe(buildIdentityEventId('LOOK_SAVED', 2));
  });
});
