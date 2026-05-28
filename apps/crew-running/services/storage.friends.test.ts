import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FriendRecord } from '../data/friends';

class MemoryStorage {
  private map = new Map<string, string>();
  getItem = (k: string) => (this.map.has(k) ? this.map.get(k)! : null);
  setItem = (k: string, v: string) => {
    this.map.set(k, v);
  };
  removeItem = (k: string) => {
    this.map.delete(k);
  };
  clear = () => {
    this.map.clear();
  };
}

let mem: MemoryStorage;

beforeEach(() => {
  mem = new MemoryStorage();
  vi.stubGlobal('window', { localStorage: mem });
  vi.stubGlobal('crypto', { randomUUID: () => 'self-test-uuid' });
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const loadStorage = async () => await import('./storage');

const sampleFriend = (overrides: Partial<FriendRecord> = {}): FriendRecord => ({
  userId: 'friend-1',
  runnerName: 'Bia',
  crewSlug: 'east-burners',
  runnerTypeId: 'sprint',
  addedAt: 1_000,
  addMethod: 'qr',
  ...overrides,
});

describe('storage — self user id', () => {
  it('creates and persists a UUID on first call', async () => {
    const s = await loadStorage();
    const id = s.getSelfUserId();
    expect(id).toBe('self-test-uuid');
    expect(s.getSelfUserId()).toBe(id);
  });

  it('clearSelfUserId removes the persisted id', async () => {
    const s = await loadStorage();
    s.getSelfUserId();
    s.clearSelfUserId();
    expect(mem.getItem('crew.self_user_id')).toBeNull();
  });
});

describe('storage — friends', () => {
  it('returns empty array when nothing stored', async () => {
    const s = await loadStorage();
    expect(s.getFriends()).toEqual([]);
  });

  it('adds a friend and persists it', async () => {
    const s = await loadStorage();
    const friend = sampleFriend();
    s.addFriend(friend);
    expect(s.getFriends()).toEqual([friend]);
  });

  it('dedupes on userId, keeps the newest record', async () => {
    const s = await loadStorage();
    s.addFriend(sampleFriend({ runnerName: 'Old' }));
    s.addFriend(sampleFriend({ runnerName: 'New' }));
    const list = s.getFriends();
    expect(list.length).toBe(1);
    expect(list[0].runnerName).toBe('New');
  });

  it('rejects self-add (matches getSelfUserId)', async () => {
    const s = await loadStorage();
    const selfId = s.getSelfUserId();
    s.addFriend(sampleFriend({ userId: selfId }));
    expect(s.getFriends()).toEqual([]);
  });

  it('removeFriend deletes by userId', async () => {
    const s = await loadStorage();
    s.addFriend(sampleFriend({ userId: 'a' }));
    s.addFriend(sampleFriend({ userId: 'b' }));
    s.removeFriend('a');
    expect(s.getFriends().map((f) => f.userId)).toEqual(['b']);
  });

  it('clearFriends wipes all', async () => {
    const s = await loadStorage();
    s.addFriend(sampleFriend());
    s.clearFriends();
    expect(s.getFriends()).toEqual([]);
  });

  it('drops malformed entries on read', async () => {
    mem.setItem('crew.friends', JSON.stringify([sampleFriend(), { bogus: true }]));
    const s = await loadStorage();
    const list = s.getFriends();
    expect(list.length).toBe(1);
    expect(list[0].userId).toBe('friend-1');
  });
});

describe('storage — crew radio', () => {
  const NOW = 5_000_000_000_000;
  const baseMsg = (overrides: Partial<{ id: string; authorUserId: string; authorName: string; crewSlug: string; text: string; postedAt: number; expiresAt: number }> = {}) => ({
    authorUserId: 'a',
    authorName: 'Author',
    crewSlug: 'east-burners',
    text: 'hi',
    postedAt: NOW - 1_000,
    expiresAt: NOW + 60_000,
    ...overrides,
  });

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('postCrewRadio writes a fresh message', async () => {
    const s = await loadStorage();
    const msg = s.postCrewRadio(baseMsg());
    expect(msg.id).toBe(`radio_a_${NOW - 1_000}`);
    expect(s.getCrewRadio()).toEqual([msg]);
  });

  it('getCrewRadio filters expired messages', async () => {
    const s = await loadStorage();
    s.postCrewRadio(baseMsg({ postedAt: NOW - 100_000, expiresAt: NOW - 5_000 }));
    s.postCrewRadio(baseMsg({ authorUserId: 'b', postedAt: NOW - 500, expiresAt: NOW + 30_000 }));
    const valid = s.getCrewRadio();
    expect(valid.length).toBe(1);
    expect(valid[0].authorUserId).toBe('b');
  });

  it('getCrewRadio(crewSlug) narrows to one crew', async () => {
    const s = await loadStorage();
    s.postCrewRadio(baseMsg({ crewSlug: 'east-burners' }));
    s.postCrewRadio(baseMsg({ authorUserId: 'b', crewSlug: 'west-flow' }));
    expect(s.getCrewRadio('east-burners').length).toBe(1);
    expect(s.getCrewRadio('west-flow').length).toBe(1);
  });

  it('postCrewRadio is idempotent on duplicate id', async () => {
    const s = await loadStorage();
    s.postCrewRadio(baseMsg());
    s.postCrewRadio(baseMsg());
    expect(s.getCrewRadio().length).toBe(1);
  });

  it('pruneCrewRadio returns count of removed messages', async () => {
    const expired = {
      id: 'radio_a_old',
      authorUserId: 'a',
      authorName: 'Author',
      crewSlug: 'east-burners',
      text: 'old',
      postedAt: NOW - 100_000,
      expiresAt: NOW - 50_000,
    };
    const valid = {
      id: 'radio_b_now',
      authorUserId: 'b',
      authorName: 'Author',
      crewSlug: 'east-burners',
      text: 'hi',
      postedAt: NOW - 500,
      expiresAt: NOW + 25_000,
    };
    mem.setItem('crew.crew_radio', JSON.stringify([valid, expired]));
    const s = await loadStorage();
    expect(s.pruneCrewRadio()).toBe(1);
    expect(s.getCrewRadio().length).toBe(1);
  });
});
