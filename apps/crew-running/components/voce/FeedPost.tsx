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

export const FeedPost: React.FC<Props> = ({ event, savedCharacter }) => {
  const spec = IDENTITY_EVENT_VARIANTS[event.kind];
  const style = {
    ['--rail-color' as string]: spec.railToken,
    ['--swatch-color' as string]: spec.swatchToken,
  } as React.CSSProperties;
  const runnerType = getRunnerTypeById(event.payload.runnerTypeId);
  const showLook = spec.showLookCard && savedCharacter?.imageDataUrl;
  return (
    <li className="voce-feed-post mission-ticket" style={style}>
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
          imageDataUrl={savedCharacter.imageDataUrl}
          name={event.payload.runnerName ?? savedCharacter.profile?.name}
          crewSlug={event.payload.crewSlug ?? savedCharacter.crewSlug}
          runnerTypeLabel={runnerType.label}
          size="sm"
          className="voce-feed-post__look"
        />
      )}
    </li>
  );
};
