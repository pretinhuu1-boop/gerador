import { useEffect, useState } from 'react';
import { runTracker, type RunSnapshot } from '../services/runTracker';

export const useRunTracker = (): RunSnapshot => {
  const [snapshot, setSnapshot] = useState<RunSnapshot>(() => runTracker.getSnapshot());
  useEffect(() => runTracker.subscribe(setSnapshot), []);
  return snapshot;
};
