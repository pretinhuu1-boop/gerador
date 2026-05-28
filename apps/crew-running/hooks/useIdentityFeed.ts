import { useEffect, useMemo, useState } from 'react';
import {
  buildIdentityEventId,
  type IdentityEvent,
} from '../data/identityEvents';
import { LaunchProgress } from '../services/launchStorage';
import {
  SavedCharacter,
  appendIdentityEvent,
  getIdentityEvents,
} from '../services/storage';

export type UseIdentityFeedOptions = {
  version?: number;
  progress?: LaunchProgress;
  savedCharacter?: SavedCharacter | null;
};

const synthesizeBackfill = (
  existing: IdentityEvent[],
  progress?: LaunchProgress,
  savedCharacter?: SavedCharacter | null,
): IdentityEvent[] => {
  const hasKind = (kind: IdentityEvent['kind']) =>
    existing.some((e) => e.kind === kind);
  const synthetic: IdentityEvent[] = [];

  if (progress?.citySignalSeen && !hasKind('CREW_JOINED') && progress.selectedCrewSlug) {
    const ts = Date.now() - 1000 * 60 * 60 * 2;
    synthetic.push({
      id: buildIdentityEventId('CREW_JOINED', ts),
      kind: 'CREW_JOINED',
      payload: { crewSlug: progress.selectedCrewSlug },
      timestamp: ts,
    });
  }

  if (progress?.guidedSetupComplete && !hasKind('GUIDE_COMPLETED')) {
    const ts = Date.now() - 1000 * 60 * 60;
    synthetic.push({
      id: buildIdentityEventId('GUIDE_COMPLETED', ts),
      kind: 'GUIDE_COMPLETED',
      payload: { crewSlug: progress.selectedCrewSlug },
      timestamp: ts,
    });
  }

  if (savedCharacter && !hasKind('LOOK_SAVED')) {
    synthetic.push({
      id: buildIdentityEventId('LOOK_SAVED', savedCharacter.savedAt),
      kind: 'LOOK_SAVED',
      payload: {
        crewSlug: savedCharacter.crewSlug,
        runnerTypeId: savedCharacter.runnerTypeId,
        runnerName: savedCharacter.profile?.name,
        slots: savedCharacter.slots,
        savedAt: savedCharacter.savedAt,
      },
      timestamp: savedCharacter.savedAt,
    });
  }

  synthetic.forEach((ev) => appendIdentityEvent(ev));
  return synthetic;
};

const sortNewestFirst = (events: IdentityEvent[]): IdentityEvent[] =>
  [...events].sort((a, b) => b.timestamp - a.timestamp);

export const useIdentityFeed = (options: UseIdentityFeedOptions = {}): IdentityEvent[] => {
  const { version = 0, progress, savedCharacter } = options;
  const [events, setEvents] = useState<IdentityEvent[]>([]);

  useEffect(() => {
    const existing = getIdentityEvents();
    if (existing.length === 0 && (progress || savedCharacter)) {
      synthesizeBackfill(existing, progress, savedCharacter);
    }
    setEvents(getIdentityEvents());
  }, [version, progress, savedCharacter]);

  return useMemo(() => sortNewestFirst(events), [events]);
};
