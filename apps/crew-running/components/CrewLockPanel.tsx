import React from 'react';
import type { buildCrewRenderContext } from '../data/crewRenderContext';
import { CrewBadge } from './CrewBadge';
import { HandUnderline } from './SvgDefs';

type Props = {
  crewContext: ReturnType<typeof buildCrewRenderContext>;
};

export const CrewLockPanel: React.FC<Props> = ({ crewContext }) => (
  <div className="runner-creator__block runner-creator__crew-lock">
    <div className="runner-creator__block-head">
      <h3 className="section-label">
        <span className="section-label__index">03 /</span> CREW VISUAL
      </h3>
      <span>travado pelo onboarding</span>
    </div>
    <HandUnderline width={180} className="mb-4 mt-1" />

    <div className="runner-creator__crew-card">
      <CrewBadge crew={crewContext.slug} size="md" />
      <div>
        <span>{crewContext.zone}</span>
        <strong>{crewContext.name}</strong>
        <p>{crewContext.mission}</p>
      </div>
    </div>
    <div className="runner-creator__crew-swatches" aria-label="Paleta da crew">
      <span style={{ background: crewContext.accent }} />
      <span style={{ background: crewContext.secondary }} />
      <small>street-v2 fixo</small>
    </div>
  </div>
);
