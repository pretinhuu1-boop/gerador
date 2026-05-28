import React from 'react';
import { RunnerProfileForm } from '../../RunnerProfileForm';
import type { RunnerProfile } from '../../../data/runnerProfile';

type Props = {
  profile: RunnerProfile;
  onChange: (profile: RunnerProfile) => void;
};

export const PerfilTab: React.FC<Props> = ({ profile, onChange }) => (
  <section
    id="creator-panel-perfil"
    role="tabpanel"
    aria-labelledby="creator-tab-perfil"
    className="runner-tab__section"
  >
    <RunnerProfileForm profile={profile} onChange={onChange} />
  </section>
);
