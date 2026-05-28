import { useCallback, useEffect, useMemo, useState } from 'react';
import { appendDiaryEntry, getDiaryEntries } from '../services/storage';
import { buildDiaryEntry, type DiaryEntry, type DiaryMood } from '../data/diary';
import type { RunSnapshot } from '../services/runTracker';

export const useDiary = (version: number = 0) => {
  const [entries, setEntries] = useState<DiaryEntry[]>(getDiaryEntries);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setEntries(getDiaryEntries());
  }, [version, tick]);

  const append = useCallback(
    (opts: {
      snapshot: RunSnapshot;
      xpEarned: number;
      missionsCompleted: string[];
      note?: string;
      mood?: DiaryMood;
    }): DiaryEntry => {
      const entry = buildDiaryEntry(opts);
      appendDiaryEntry(entry);
      setTick((t) => t + 1);
      return entry;
    },
    [],
  );

  return useMemo(() => ({ entries, append }), [entries, append]);
};
