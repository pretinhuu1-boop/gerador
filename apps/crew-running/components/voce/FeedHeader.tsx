import React from 'react';
import type { CrewZone } from '../../data/crews';
import type { RunnerType } from '../../data/runnerTypes';
import type { SavedCharacter } from '../../services/storage';
import { CartridgeButton } from '../CartridgeButton';
import { CrewBadge } from '../CrewBadge';

type Status = 'pending' | 'editing' | 'ready';

type Props = {
  runnerName: string;
  crew: CrewZone;
  savedCharacter: SavedCharacter | null;
  runnerType: RunnerType;
  status: Status;
  onAdjust: () => void;
  lookCount: number;
  stickerCount?: number;
};

export const FeedHeader: React.FC<Props> = ({
  runnerName,
  crew,
  savedCharacter,
  runnerType,
  status,
  onAdjust,
  lookCount,
  stickerCount = 0,
}) => {
  const style = {
    ['--crew-accent' as string]: crew.accent,
    ['--crew-secondary' as string]: crew.secondary,
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.82)), url(${crew.assets.banner})`,
  } as React.CSSProperties;
  const portrait = savedCharacter?.imageDataUrl;
  return (
    <header className="voce-feed-header" style={style}>
      <div className="voce-feed-header__portrait">
        {portrait ? (
          <img src={portrait} alt={`Retrato do runner ${runnerName}`} />
        ) : (
          <CrewBadge crew={crew} size="lg" alt={`Distintivo da crew ${crew.name}`} />
        )}
        {status === 'ready' && (
          <span className="voce-feed-header__stamp" aria-hidden="true">
            RUNNER PRONTO
          </span>
        )}
      </div>
      <div className="voce-feed-header__meta">
        <span className="voce-feed-header__eyebrow">{crew.zone}</span>
        <strong className="voce-feed-header__name">{runnerName}</strong>
        <span className="voce-feed-header__type">{runnerType.label}</span>
      </div>
      <ul className="voce-feed-header__stats" aria-label="Estado do runner">
        <li>
          <span>LOOKS</span>
          <strong>{lookCount}</strong>
        </li>
        <li>
          <span>STICKERS</span>
          <strong>{stickerCount}</strong>
        </li>
        <li>
          <span>CREW</span>
          <strong>1</strong>
        </li>
      </ul>
      <div className="voce-feed-header__actions">
        <CartridgeButton variant="link" onClick={onAdjust}>
          AJUSTAR
        </CartridgeButton>
        <span
          className="voce-feed-header__dm-placeholder"
          aria-hidden="true"
        >
          MENSAGENS · F3
        </span>
      </div>
    </header>
  );
};
