import React from 'react';

interface Props {
  kind: 'loop' | 'invasion';
  multiplier: number;
}

const COPY: Record<Props['kind'], { label: string; explain: string }> = {
  loop: { label: 'Loop', explain: 'Fechou volta — bônus de loop aplicado.' },
  invasion: { label: 'Invasão', explain: 'Correu em zona inimiga — XP da invasão dobrado.' },
};

export const MultiplierChip: React.FC<Props> = ({ kind, multiplier }) => {
  if (multiplier === 1) return null;
  const { label, explain } = COPY[kind];
  return (
    <span className={`run-summary-multiplier-chip run-summary-multiplier-chip--${kind}`}>
      <strong className="run-summary-multiplier-chip-label">
        {label} ×{multiplier}
      </strong>
      <span className="run-summary-multiplier-chip-explain">{explain}</span>
    </span>
  );
};
