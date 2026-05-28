import React from 'react';
import type { MissionDef, MissionType } from '../../data/gamification';
import type { ActiveMission, CompletedMission } from '../../data/missions';
import { isComplete, isExpired } from '../../data/missions';

type Props = {
  def: MissionDef;
  activeMission?: ActiveMission;
  completed?: CompletedMission;
  onAccept?: (def: MissionDef) => void;
  onAbandon?: (missionId: string) => void;
};

const TYPE_LABELS: Record<MissionType, string> = {
  'spot-hunt': 'CACA',
  'invasion': 'INVASAO',
  'crew-pinned': 'CREW',
  'night-drift': 'NOTURNO',
  'heritage': 'HERANCA',
};

const formatTimeRemaining = (expiresAt: number): string => {
  const remaining = Math.max(0, expiresAt - Date.now());
  const hours = remaining / 3_600_000;
  if (hours >= 1) {
    return `${Math.floor(hours)}h restante`;
  }
  const minutes = Math.max(1, Math.ceil(remaining / 60_000));
  return `${minutes}min restante`;
};

const progressLabel = (progress: ActiveMission['progress']): string => {
  switch (progress.type) {
    case 'spot-hunt':
      return `${progress.visited.length}/${progress.required.length} spots`;
    case 'heritage':
      return `${progress.visited.length}/${progress.required.length} spots`;
    case 'invasion':
      return `${(progress.metersRun / 1000).toFixed(1)}/${(progress.requiredMeters / 1000).toFixed(1)} km`;
    case 'crew-pinned':
      return `${progress.kmRun.toFixed(1)}/${progress.requiredKm.toFixed(1)} km`;
    case 'night-drift':
      return `${(progress.metersRun / 1000).toFixed(1)}/${(progress.requiredMeters / 1000).toFixed(1)} km ${progress.nightRun ? '(noturno ✓)' : '(precisa ser noturno)'}`;
  }
};

const progressFraction = (progress: ActiveMission['progress']): number => {
  switch (progress.type) {
    case 'spot-hunt':
      return progress.required.length > 0
        ? progress.visited.length / progress.required.length
        : 0;
    case 'heritage':
      return progress.required.length > 0
        ? progress.visited.length / progress.required.length
        : 0;
    case 'invasion':
      return progress.requiredMeters > 0
        ? Math.min(1, progress.metersRun / progress.requiredMeters)
        : 0;
    case 'crew-pinned':
      return progress.requiredKm > 0
        ? Math.min(1, progress.kmRun / progress.requiredKm)
        : 0;
    case 'night-drift':
      return progress.requiredMeters > 0
        ? Math.min(1, progress.metersRun / progress.requiredMeters)
        : 0;
  }
};

export const MissionCard: React.FC<Props> = ({
  def,
  activeMission,
  completed,
  onAccept,
  onAbandon,
}) => {
  const isActive = !!activeMission && !completed;
  const isDone = !!completed;

  let modifier = '';
  if (isDone) modifier = ' mission-card--completed';
  else if (isActive) modifier = ' mission-card--active';

  // Available state: not accepted, not completed
  if (!isActive && !isDone) {
    return (
      <article className={`mission-card${modifier}`} aria-label={`Missao: ${def.title}`}>
        <div className="mission-card__header">
          <span className={`mission-card__type-badge mission-card__type-badge--${def.type}`}>
            {TYPE_LABELS[def.type]}
          </span>
          <span className="mission-card__title">{def.title}</span>
        </div>
        <p className="mission-card__desc">{def.description}</p>
        <div className="mission-card__footer">
          <span className="mission-card__reward">
            +{def.rewardXp} XP &middot; {def.windowHours}h
          </span>
          <div className="mission-card__actions">
            <button
              type="button"
              className="mission-card__accept-btn"
              onClick={() => onAccept?.(def)}
              disabled={!onAccept}
              aria-label={`Aceitar missao ${def.title}`}
            >
              ACEITAR
            </button>
          </div>
        </div>
      </article>
    );
  }

  // Completed state
  if (isDone) {
    return (
      <article className={`mission-card${modifier}`} aria-label={`Missao completa: ${def.title}`}>
        <div className="mission-card__header">
          <span className={`mission-card__type-badge mission-card__type-badge--${def.type}`}>
            {TYPE_LABELS[def.type]}
          </span>
          <span className="mission-card__title">
            {def.title} &#10003;
          </span>
        </div>
        <p className="mission-card__reward mission-card__reward--earned">
          +{completed.xpEarned} XP ganhos
        </p>
      </article>
    );
  }

  // Active state (in progress) -- activeMission is guaranteed defined here
  // because the early returns above handle !isActive and isDone cases.
  const active = activeMission!;
  const expired = isExpired(active);
  const missionComplete = isComplete(active.progress);
  const pct = Math.round(progressFraction(active.progress) * 100);

  return (
    <article className={`mission-card${modifier}`} aria-label={`Missao ativa: ${def.title}`}>
      <div className="mission-card__header">
        <span className={`mission-card__type-badge mission-card__type-badge--${def.type}`}>
          {TYPE_LABELS[def.type]}
        </span>
        <span className="mission-card__title">{def.title}</span>
      </div>
      <div className="mission-card__progress">
        <div className="mission-card__progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="mission-card__progress-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="mission-card__progress-label">
          {progressLabel(active.progress)}
        </span>
      </div>
      <div className="mission-card__footer">
        <span className="mission-card__time">
          {expired
            ? 'Expirada'
            : missionComplete
              ? 'Completa!'
              : `Tempo: ${formatTimeRemaining(active.expiresAt)}`}
        </span>
        <div className="mission-card__actions">
          <button
            type="button"
            className="mission-card__abandon-btn"
            onClick={() => onAbandon?.(def.id)}
            disabled={!onAbandon}
            aria-label={`Abandonar missao ${def.title}`}
          >
            ABANDONAR
          </button>
        </div>
      </div>
    </article>
  );
};
