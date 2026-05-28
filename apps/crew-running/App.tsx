import React, { Suspense, lazy, useState } from 'react';
import { CrewLaunchExperience } from './components/launch/CrewLaunchExperience';
import { SvgDefs } from './components/SvgDefs';
import { getApiKey } from './services/storage';

const CustomizeScreen = lazy(() =>
  import('./components/CustomizeScreen').then((module) => ({
    default: module.CustomizeScreen,
  })),
);

export const App: React.FC = () => {
  const [apiKey, setApiKeyState] = useState<string>(() => getApiKey());

  return (
    <>
      <SvgDefs />
      <CrewLaunchExperience
        renderRunnerCreator={({ onBackToMenu, onRunnerSaved, selectedCrewSlug }) => (
          <Suspense fallback={<div className="launch-loading">CARREGANDO RUNNER...</div>}>
            <CustomizeScreen
              apiKey={apiKey}
              selectedCrewSlug={selectedCrewSlug}
              onApiKeyReady={setApiKeyState}
              onBackToMenu={onBackToMenu}
              onRunnerCustomized={onRunnerSaved}
            />
          </Suspense>
        )}
      />
    </>
  );
};
