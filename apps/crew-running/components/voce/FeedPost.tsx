import React from 'react';
import {
  IDENTITY_EVENT_VARIANTS,
  type IdentityEvent,
} from '../../data/identityEvents';
import { getRunnerTypeById } from '../../data/runnerTypes';
import type { SavedCharacter } from '../../services/storage';
import { RunnerLookCard } from '../RunnerLookCard';

type Props = {
  event: IdentityEvent;
  savedCharacter?: SavedCharacter | null;
};

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const FeedPostBase: React.FC<Props> = ({ event, savedCharacter }) => {
  const spec = IDENTITY_EVENT_VARIANTS[event.kind];
  const style = {
    ['--rail-color' as string]: spec.railToken,
    ['--swatch-color' as string]: spec.swatchToken,
  } as React.CSSProperties;
  const runnerType = getRunnerTypeById(event.payload.runnerTypeId);
  // Render the look card whenever the variant wants it AND we have at least
  // an image OR a crew slug to anchor it. Without either, skip silently so
  // the headline + body still surface the event.
  const showLook = spec.showLookCard && Boolean(
    savedCharacter?.imageDataUrl || event.payload.crewSlug,
  );
  const ariaLabel = event.timestamp > 0
    ? `${spec.headline} em ${dateFmt.format(event.timestamp)}`
    : spec.headline;
  return (
    <li className="voce-feed-post mission-ticket" style={style} aria-label={ariaLabel}>
      <span className="voce-feed-post__swatch" aria-hidden />
      <div className="voce-feed-post__head">
        <span className="voce-feed-post__headline">{spec.headline}</span>
        {event.timestamp > 0 && (
          <time className="voce-feed-post__date" dateTime={new Date(event.timestamp).toISOString()}>
            {dateFmt.format(event.timestamp)}
          </time>
        )}
      </div>
      <p className="voce-feed-post__body">{spec.bodyTemplate(event.payload)}</p>
      {showLook && (
        <RunnerLookCard
          imageDataUrl={savedCharacter?.imageDataUrl ?? undefined}
          name={event.payload.runnerName ?? savedCharacter?.profile?.name}
          crewSlug={event.payload.crewSlug ?? savedCharacter?.crewSlug}
          runnerTypeLabel={runnerType.label}
          size="sm"
          className="voce-feed-post__look"
        />
      )}
    </li>
  );
};

// Feed items are immutable per id; memo skips re-render when parent rebuilds
// the events array but the entry itself didn't change.
export const FeedPost = React.memo(FeedPostBase, (prev, next) =>
  prev.event.id === next.event.id &&
  prev.event.timestamp === next.event.timestamp &&
  prev.savedCharacter?.imageDataUrl === next.savedCharacter?.imageDataUrl &&
  prev.savedCharacter?.profile?.name === next.savedCharacter?.profile?.name,
);
