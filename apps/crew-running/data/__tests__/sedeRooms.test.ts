import { describe, expect, it } from 'vitest';
import {
  SEDE_ROOMS,
  SEDE_ROOMS_BY_ID,
  type SedeRoomId,
} from '../sedeRooms';

describe('SEDE_ROOMS', () => {
  it('exposes exactly 7 rooms for the MVP', () => {
    expect(SEDE_ROOMS).toHaveLength(7);
  });

  it('has unique ids across the list', () => {
    const ids = SEDE_ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes the spec ids in display order', () => {
    expect(SEDE_ROOMS.map((r) => r.id)).toEqual<SedeRoomId[]>([
      'wall-of-sponsors',
      'sala-medalhas',
      'hall-patentes',
      'ranking-lendario',
      'trofeu-room',
      'mural-feed',
      'member-roster',
    ]);
  });

  it('maps every id via SEDE_ROOMS_BY_ID', () => {
    for (const room of SEDE_ROOMS) {
      expect(SEDE_ROOMS_BY_ID[room.id]).toBe(room);
    }
  });

  it('marks ranking and wall as sheets, others as screens', () => {
    const sheets = SEDE_ROOMS.filter((r) => r.surfaceType === 'sheet').map((r) => r.id);
    expect(sheets.sort()).toEqual(['ranking-lendario', 'wall-of-sponsors']);
  });

  it('keeps every room visible to visitors in MVP (gating is per-room content)', () => {
    expect(SEDE_ROOMS.every((r) => r.visitorVisible)).toBe(true);
  });
});
