import React from 'react';
import { MOOD_LABELS, type DiaryEntry } from '../../data/diary';

type Props = {
  entry: DiaryEntry;
};

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const formatDuration = (ms: number): string => {
  const totalMinutes = Math.round(ms / 60_000);
  if (totalMinutes < 60) return `${totalMinutes}min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
};

const DiaryEntryCardBase: React.FC<Props> = ({ entry }) => {
  const dateStr = dateFmt.format(entry.createdAt);
  const distanceStr = entry.distanceKm.toFixed(1);
  const durationStr = formatDuration(entry.durationMs);
  const spotsCount = entry.spotsVisited.length;
  const missionsCount = entry.missionsCompleted.length;

  return (
    <li className="diary-card mission-ticket" aria-label={`Corrida de ${distanceStr} km em ${dateStr}`}>
      <div className="diary-card__head">
        <span className="diary-card__title">{'🏃 CORRIDA'}</span>
        <time className="diary-card__date" dateTime={new Date(entry.createdAt).toISOString()}>
          {dateStr}
        </time>
      </div>

      <div className="diary-card__stats">
        <span>{distanceStr} km</span>
        <span aria-hidden="true">{' · '}</span>
        <span>{durationStr}</span>
        <span aria-hidden="true">{' · '}</span>
        <span>+{entry.xpEarned} XP</span>
      </div>

      {entry.mood && (
        <p className="diary-card__mood">{MOOD_LABELS[entry.mood]}</p>
      )}

      {entry.note && (
        <blockquote className="diary-card__note">{entry.note}</blockquote>
      )}

      {(spotsCount > 0 || missionsCount > 0) && (
        <div className="diary-card__footer">
          {spotsCount > 0 && (
            <span>{spotsCount} {spotsCount === 1 ? 'spot' : 'spots'}</span>
          )}
          {spotsCount > 0 && missionsCount > 0 && (
            <span aria-hidden="true">{' · '}</span>
          )}
          {missionsCount > 0 && (
            <span>
              {missionsCount} {missionsCount === 1 ? 'missão' : 'missões'}
            </span>
          )}
        </div>
      )}
    </li>
  );
};

export const DiaryEntryCard = React.memo(DiaryEntryCardBase, (prev, next) =>
  prev.entry.id === next.entry.id &&
  prev.entry.note === next.entry.note &&
  prev.entry.mood === next.entry.mood,
);
