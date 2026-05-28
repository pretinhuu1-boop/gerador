import React, { useState } from 'react';
import { getCrewBySlug } from './data/crews';
import { CrewLaunchExperience } from './components/launch/CrewLaunchExperience';
import { RunnerCreatorTabs } from './components/creator/RunnerCreatorTabs';
import { SvgDefs } from './components/SvgDefs';
import { getApiKey } from './services/storage';
import { useSupabaseSession } from './hooks/useSupabaseSession';
import { CloudSyncBadge } from './components/auth/CloudSyncBadge';
import { CloudSyncModal } from './components/auth/CloudSyncModal';

export const App: React.FC = () => {
  const [apiKey, setApiKeyState] = useState<string>(() => getApiKey());
  const session = useSupabaseSession();
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);

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
      <CloudSyncBadge session={session} onOpen={() => setSyncModalOpen(true)} />
      {syncModalOpen ? (
        <CloudSyncModal session={session} onClose={() => setSyncModalOpen(false)} />
      ) : null}
    </>
  );
};
