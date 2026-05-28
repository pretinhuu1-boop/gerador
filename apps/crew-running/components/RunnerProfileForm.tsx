import React from 'react';
import {
  BODY_REFERENCE,
  DEFAULT_RUNNER_PROFILE,
  RUNNER_SEX_OPTIONS,
  type RunnerProfile,
  type RunnerSex,
} from '../data/runnerProfile';
import { HandUnderline } from './SvgDefs';

type Props = {
  profile: RunnerProfile;
  onChange: (profile: RunnerProfile) => void;
};

export const RunnerProfileForm: React.FC<Props> = ({ profile, onChange }) => {
  const updateProfile = <Key extends keyof RunnerProfile>(key: Key, value: RunnerProfile[Key]) => {
    onChange({ ...profile, [key]: value });
  };
  const updateNumber = (key: 'heightCm' | 'weightKg', value: string) => {
    const parsed = Number.parseInt(value, 10);
    updateProfile(key, Number.isFinite(parsed) ? parsed : DEFAULT_RUNNER_PROFILE[key]);
  };

  return (
    <div className="runner-tab__form">
      <div className="runner-tab__section-head">
        <h3 className="section-label">FICHA DO RUNNER</h3>
        <span>base {BODY_REFERENCE.heightCm}cm / {BODY_REFERENCE.weightKg}kg</span>
      </div>
      <HandUnderline width={190} className="mb-4 mt-1" />

      <label className="runner-tab__field">
        <span>NOME</span>
        <input
          autoComplete="off"
          maxLength={24}
          onChange={(event) => updateProfile('name', event.currentTarget.value)}
          placeholder="nome do runner"
          type="text"
          value={profile.name}
        />
      </label>

      <div className="runner-tab__field">
        <span>SEXO</span>
        <div className="runner-tab__sex-options" role="group" aria-label="Sexo do runner">
          {RUNNER_SEX_OPTIONS.map((option) => (
            <button
              className={profile.sex === option.value ? 'is-selected' : ''}
              key={option.value}
              onClick={() => updateProfile('sex', option.value as RunnerSex)}
              aria-pressed={profile.sex === option.value}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="runner-tab__measure-grid">
        <label className="runner-tab__field">
          <span>ALTURA</span>
          <input
            inputMode="numeric"
            max={230}
            min={120}
            onChange={(event) => updateNumber('heightCm', event.currentTarget.value)}
            type="number"
            value={profile.heightCm}
          />
          <small>CM</small>
        </label>
        <label className="runner-tab__field">
          <span>PESO</span>
          <input
            inputMode="numeric"
            max={220}
            min={35}
            onChange={(event) => updateNumber('weightKg', event.currentTarget.value)}
            type="number"
            value={profile.weightKg}
          />
          <small>KG</small>
        </label>
      </div>

      <label className="runner-tab__field">
        <span>PERSONALIDADE</span>
        <textarea
          maxLength={120}
          onChange={(event) => updateProfile('personality', event.currentTarget.value)}
          placeholder="calmo, competitivo, caótico..."
          rows={3}
          value={profile.personality}
        />
      </label>
    </div>
  );
};
