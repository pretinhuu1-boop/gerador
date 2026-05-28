import React from 'react';
import type { BadgeId, RunXpBreakdown } from '../../data/gamification';
import type { RunSnapshot } from '../../services/runTracker';
import { MultiplierChip } from './MultiplierChip';
import { BadgeUnlockToast } from './BadgeUnlockToast';

interface Props {
  snapshot: RunSnapshot;
  breakdown: RunXpBreakdown;
  streakBumped: boolean;
  streakBroken: boolean;
  freezeUsed: boolean;
  newlyUnlocked: BadgeId[];
  onSave: () => void;
  onDiscard: () => void;
  onDismissUnlocks: () => void;
}

const formatTime = (ms: number): string => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
};

export const RunSummary: React.FC<Props> = ({
  snapshot,
  breakdown,
  streakBumped,
  streakBroken,
  freezeUsed,
  newlyUnlocked,
  onSave,
  onDiscard,
  onDismissUnlocks,
}) => (
  <>
    <div className="run-summary-backdrop" role="dialog" aria-modal="true" aria-label="Resumo da corrida">
      <div className="run-summary-card">
        <h2 className="run-summary-title">Corrida fechada</h2>
        <dl className="run-summary-stats">
          <div>
            <dt>Distância</dt>
            <dd>{(snapshot.totalMeters / 1000).toFixed(2)} km</dd>
          </div>
          <div>
            <dt>Tempo ativo</dt>
            <dd>{formatTime(snapshot.elapsedMs)}</dd>
          </div>
          <div>
            <dt>Em território</dt>
            <dd>{(snapshot.metersInTerritory / 1000).toFixed(2)} km</dd>
          </div>
          <div>
            <dt>Spots tocados</dt>
            <dd>{snapshot.touchedSpotIds.length}</dd>
          </div>
          <div>
            <dt>Loop fechado</dt>
            <dd>{snapshot.closedLoop ? 'Sim' : 'Não'}</dd>
          </div>
        </dl>
        <div className="run-summary-xp">
          <div className="run-summary-xp-total">+{breakdown.total} XP</div>
          <ul className="run-summary-xp-breakdown">
            <li>Base: {breakdown.baseXp}</li>
            <li>Território: {breakdown.territoryXp}</li>
            <li>Spots: {breakdown.spotXp}</li>
          </ul>
          <div className="run-summary-xp-multipliers">
            <MultiplierChip kind="loop" multiplier={breakdown.loopMult} />
            <MultiplierChip kind="invasion" multiplier={breakdown.invasionMult} />
          </div>
        </div>
        {streakBumped && <p className="run-summary-notice run-summary-notice--good">Streak +1!</p>}
        {freezeUsed && <p className="run-summary-notice">Freeze usado pra preservar streak.</p>}
        {streakBroken && <p className="run-summary-notice run-summary-notice--bad">Streak quebrado.</p>}
        <div className="run-summary-actions">
          <button type="button" className="run-summary-button run-summary-button--save" onClick={onSave}>
            SALVAR CORRIDA
          </button>
          <button type="button" className="run-summary-button run-summary-button--discard" onClick={onDiscard}>
            DESCARTAR
          </button>
        </div>
      </div>
    </div>
    <BadgeUnlockToast unlocked={newlyUnlocked} onDismiss={onDismissUnlocks} />
  </>
);
