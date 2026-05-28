import React from 'react';
import { CrewBadge } from './CrewBadge';

type Size = 'sm' | 'lg';

type Props = {
  imageDataUrl?: string | null;
  name?: string;
  crewSlug?: string;
  runnerTypeLabel?: string;
  size?: Size;
  className?: string;
};

export const RunnerLookCard: React.FC<Props> = ({
  imageDataUrl,
  name,
  crewSlug,
  runnerTypeLabel,
  size = 'sm',
  className,
}) => {
  const classes = ['runner-look-card', `runner-look-card--${size}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes}>
      {imageDataUrl && (
        <div className="runner-look-card__photo" aria-hidden>
          <img src={imageDataUrl} alt="" />
        </div>
      )}
      <div className="runner-look-card__meta">
        {crewSlug && <CrewBadge crew={crewSlug} size="sm" />}
        {name && <strong className="runner-look-card__name">{name}</strong>}
        {runnerTypeLabel && (
          <span className="runner-look-card__type">{runnerTypeLabel}</span>
        )}
      </div>
    </div>
  );
};
