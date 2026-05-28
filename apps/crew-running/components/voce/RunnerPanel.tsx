import React, { useMemo } from 'react';
import type { CrewZone } from '../../data/crews';
import {
  buildIdentityEventId,
  type IdentityEvent,
} from '../../data/identityEvents';
import { getRunnerTypeById } from '../../data/runnerTypes';
import type { LaunchProgress } from '../../services/launchStorage';
import type { SavedCharacter } from '../../services/storage';
import { useIdentityFeed } from '../../hooks/useIdentityFeed';
import { FeedHeader } from './FeedHeader';
import { FeedPost } from './FeedPost';
import { FriendsStripPlaceholder } from './FriendsStripPlaceholder';
import { MapSocialHookButton } from './MapSocialHookButton';

type Props = {
  crew: CrewZone;
  savedCharacter: SavedCharacter | null;
  progress: LaunchProgress;
  runnerName: string;
  onAdjust: () => void;
  guideDone: boolean;
  version?: number;
};

export const RunnerPanel: React.FC<Props> = ({
  crew,
  savedCharacter,
  progress,
  runnerName,
  onAdjust,
  guideDone,
  version = 0,
}) => {
  const events = useIdentityFeed({
    version,
    progress,
    savedCharacter,
  });
  const runnerType = useMemo(
    () => getRunnerTypeById(savedCharacter?.runnerTypeId),
    [savedCharacter?.runnerTypeId],
  );
  const status: 'pending' | 'editing' | 'ready' = savedCharacter
    ? 'ready'
    : guideDone
      ? 'editing'
      : 'pending';
  const lookCount = events.filter((e) => e.kind === 'LOOK_SAVED').length;
  const stickerCount = events.filter((e) => e.kind === 'STICKER_DROPPED').length;
  const hasEvents = events.length > 0;
  const emptyEvent: IdentityEvent | null = useMemo(() => {
    if (hasEvents || !progress?.selectedCrewSlug) return null;
    const stableTs = 0;
    return {
      id: buildIdentityEventId('CREW_JOINED', stableTs),
      kind: 'CREW_JOINED',
      payload: { crewSlug: progress.selectedCrewSlug },
      timestamp: stableTs,
    };
  }, [hasEvents, progress?.selectedCrewSlug]);
  return (
    <div className="voce-panel">
      <FeedHeader
        runnerName={runnerName}
        crew={crew}
        savedCharacter={savedCharacter}
        runnerType={runnerType}
        status={status}
        onAdjust={onAdjust}
        lookCount={lookCount}
        stickerCount={stickerCount}
      />
      <FriendsStripPlaceholder crew={crew} />
      <ol className="voce-panel__feed" aria-label="Linha do tempo de identidade">
        {hasEvents
          ? events.map((event) => (
              <FeedPost key={event.id} event={event} savedCharacter={savedCharacter} />
            ))
          : emptyEvent && (
              <FeedPost event={emptyEvent} savedCharacter={savedCharacter} />
            )}
      </ol>
      <div className="voce-panel__actions">
        <MapSocialHookButton />
      </div>
    </div>
  );
};
