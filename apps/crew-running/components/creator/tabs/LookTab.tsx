import React from 'react';
import { RunnerTypePicker } from '../../RunnerTypePicker';
import { WardrobePicker } from '../../WardrobePicker';
import { CartridgeButton } from '../../CartridgeButton';
import type { RunnerType } from '../../../data/runnerTypes';
import type { SlotSelection } from '../../../services/crewService';
import type { SlotKey } from '../../../data/wardrobe';

type Props = {
  runnerType: RunnerType;
  onSelectType: (type: RunnerType) => void;
  locked: SlotSelection;
  onToggleSlot: (slot: SlotKey, itemId: string) => void;
  mixCount: number;
  onRandomize: () => void;
  canCreate: boolean;
  loading: boolean;
  onCreate: () => void;
};

export const LookTab: React.FC<Props> = ({
  runnerType, onSelectType,
  locked, onToggleSlot,
  mixCount, onRandomize,
  canCreate, loading, onCreate,
}) => (
  <section
    id="creator-panel-look"
    role="tabpanel"
    aria-labelledby="creator-tab-look"
    className="runner-tab__section"
  >
    <RunnerTypePicker selected={runnerType} onSelect={onSelectType} />
    <WardrobePicker locked={locked} onToggle={onToggleSlot} />
    <div className="runner-tab__action-bar" aria-label="Comandos do runner">
      <div className="runner-tab__mix-control">
        <CartridgeButton
          variant="chalk"
          className="game-command"
          onClick={onRandomize}
          aria-label="Misturar equipamento"
        >
          MISTURAR LOOK
        </CartridgeButton>
        <div className="runner-tab__mix-stamp" aria-live="polite">
          {mixCount > 0
            ? `LOOK ${String(mixCount).padStart(2, '0')} MISTURADO`
            : 'TOQUE PARA VARIAR EQUIPAMENTO'}
        </div>
      </div>
      <CartridgeButton
        variant="solid"
        className={`game-command game-command--primary ${loading ? 'is-loading' : ''}`}
        onClick={onCreate}
        disabled={!canCreate}
        loading={loading}
      >
        {loading ? 'CRIANDO RUNNER...' : 'CRIAR RUNNER'}
      </CartridgeButton>
    </div>
  </section>
);
