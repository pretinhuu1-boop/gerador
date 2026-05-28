import { useCallback, useEffect, useMemo, useState } from 'react';
import { addFriend, getFriends, removeFriend } from '../services/storage';
import type { FriendRecord } from '../data/friends';

/**
 * Reactive friends list. Two re-read triggers:
 * - `version` prop (external): caller bumps to force re-sync (e.g., after a
 *   save flow elsewhere in the tree wrote to crew.friends).
 * - internal `tick`: incremented by `add`/`remove`/`refresh` so the same
 *   hook instance reflects its own mutations without requiring the parent
 *   to coordinate.
 * Both targets the same storage key, so the effect just re-reads.
 */
export const useFriends = (version: number = 0): {
  friends: FriendRecord[];
  add: (friend: FriendRecord) => void;
  remove: (userId: string) => void;
  refresh: () => void;
} => {
  const [list, setList] = useState<FriendRecord[]>(getFriends);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setList(getFriends());
  }, [version, tick]);

  const add = useCallback((friend: FriendRecord) => {
    addFriend(friend);
    setTick((t) => t + 1);
  }, []);

  const remove = useCallback((userId: string) => {
    removeFriend(userId);
    setTick((t) => t + 1);
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  return useMemo(() => ({ friends: list, add, remove, refresh }), [list, add, remove, refresh]);
};
