import React, { useMemo, useState } from 'react';
import type { CrewZone } from '../../data/crews';
import {
  buildIdentityEventId,
  type IdentityEvent,
} from '../../data/identityEvents';
import { getRunnerTypeById } from '../../data/runnerTypes';
import type { LaunchProgress } from '../../services/launchStorage';
import type { SavedCharacter } from '../../services/storage';
import { getSelfUserId } from '../../services/storage';
import { useIdentityFeed } from '../../hooks/useIdentityFeed';
import { useFriends } from '../../hooks/useFriends';
import { AddFriendModal } from './AddFriendModal';
import { FeedHeader } from './FeedHeader';
import { FeedPost } from './FeedPost';
import { FriendsStrip } from './FriendsStrip';
import { MapSocialHookButton } from './MapSocialHookButton';

type Props = {
  crew: CrewZone;
  savedCharacter: SavedCharacter | null;
  progress: LaunchProgress;
  runnerName: string;
  onAdjust: () => void;
  onOpenMap?: () => void;
  guideDone: boolean;
  version?: number;
};

export const RunnerPanel: React.FC<Props> = ({
  crew,
  savedCharacter,
  progress,
  runnerName,
  onAdjust,
  onOpenMap,
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
  const [addFriendOpen, setAddFriendOpen] = useState(false);
  const { friends, add: addFriendToList } = useFriends(version);
  const selfUserId = useMemo(() => getSelfUserId(), []);
  // Single pass over events instead of two filters; memoize because the
  // filtered counts only change when events array identity changes.
  const { lookCount, stickerCount } = useMemo(() => {
    let look = 0;
    let sticker = 0;
    for (const ev of events) {
      if (ev.kind === 'LOOK_SAVED') look++;
      else if (ev.kind === 'STICKER_DROPPED') sticker++;
    }
    return { lookCount: look, stickerCount: sticker };
  }, [events]);
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
    <section className="voce-panel" aria-label="Aba VOCÊ — perfil e linha do tempo de identidade">
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
      <FriendsStrip friends={friends} onAdd={() => setAddFriendOpen(true)} />
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
        <MapSocialHookButton onClick={onOpenMap} />
      </div>
      <AddFriendModal
        open={addFriendOpen}
        selfUserId={selfUserId}
        selfRunnerName={runnerName}
        selfCrewSlug={savedCharacter?.crewSlug ?? crew.slug}
        selfRunnerTypeId={savedCharacter?.runnerTypeId}
        onClose={() => setAddFriendOpen(false)}
        onAddFriend={(friend) => addFriendToList(friend)}
      />
    </section>
  );
};
