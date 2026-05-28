import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFriendNotes, saveFriendNote, removeFriendNote } from '../services/storage';
import { buildFriendNote, type FriendNote, type FriendTag } from '../data/friendNotes';

export const useFriendNotes = (version: number = 0) => {
  const [notes, setNotes] = useState<FriendNote[]>(getFriendNotes);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setNotes(getFriendNotes());
  }, [version, tick]);

  const save = useCallback((friendUserId: string, text: string, tag?: FriendTag): FriendNote => {
    const note = buildFriendNote(friendUserId, text, tag);
    saveFriendNote(note);
    setTick((t) => t + 1);
    return note;
  }, []);

  const remove = useCallback((friendUserId: string): void => {
    removeFriendNote(friendUserId);
    setTick((t) => t + 1);
  }, []);

  const getNote = useCallback(
    (friendUserId: string): FriendNote | undefined =>
      notes.find((n) => n.friendUserId === friendUserId),
    [notes],
  );

  return useMemo(
    () => ({ notes, save, remove, getNote }),
    [notes, save, remove, getNote],
  );
};
