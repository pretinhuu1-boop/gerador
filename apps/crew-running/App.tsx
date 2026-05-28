import React, { useState } from 'react';
import { getCrewBySlug } from './data/crews';
import { CrewLaunchExperience } from './components/launch/CrewLaunchExperience';
import { RunnerCreatorTabs } from './components/creator/RunnerCreatorTabs';
import { SvgDefs } from './components/SvgDefs';
import { getApiKey } from './services/storage';

export const App: React.FC = () => {
  const [apiKey, setApiKeyState] = useState<string>(() => getApiKey());

  return (
    <>
      <SvgDefs />
      <CrewLaunchExperience
        renderRunnerCreator={({ creatorKey, onRunnerSaved, selectedCrewSlug }) => (
          <RunnerCreatorTabs
            key={creatorKey}
            crew={getCrewBySlug(selectedCrewSlug)}
            apiKey={apiKey}
            onApiKeyReady={setApiKeyState}
            onSaved={onRunnerSaved}
          />
        )}
      />
    </>
  );
};
