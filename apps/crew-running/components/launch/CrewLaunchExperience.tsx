import React, { useState } from 'react';
import {
  getLaunchProgress,
  getRunnerProgress,
  type CreatorTabId,
  LaunchProgress,
  markCitySignalSeen,
  markConsoleBootSeen,
  markGuidedSetupComplete,
  markMainMenuSeen,
  markRunnerCustomized,
  markTitleSeen,
  saveRunnerProgress,
  setCreatorTab,
  setSelectedCrewSlug,
} from '../../services/launchStorage';
import { type RunnerProgress } from '../../data/gamification';
import { CitySignalEntry } from './CitySignalEntry';
import { ConsoleBoot } from './ConsoleBoot';
import { GuidedOnboarding } from './GuidedOnboarding';
import { MainMenu } from './MainMenu';
import { TitleScreen } from './TitleScreen';
import { MapStage } from '../map/MapStage';

type LaunchScreen =
  | 'consoleBoot'
  | 'title'
  | 'citySignal'
  | 'mainMenu'
  | 'guidedSetup'
  | 'mapHome';

type MainMenuPanel = 'home' | 'crews' | 'crewHome' | 'runner' | 'config';
type RunnerPanelMode = 'profile' | 'creator';

type Props = {
  renderRunnerCreator: (props: {
    creatorKey: number;
    onBackToMenu: () => void;
    onRunnerSaved: () => void;
    selectedCrewSlug: string;
  }) => React.ReactNode;
};

const DEFAULT_CREW_SLUG = 'downtown-rush';

const getInitialScreen = (progress: LaunchProgress): LaunchScreen => {
  if (progress.runnerCustomized) return 'mainMenu';
  if (!progress.consoleBootSeen) return 'consoleBoot';
  if (!progress.titleSeen) return 'title';
  if (!progress.citySignalSeen) return 'citySignal';
  return 'mainMenu';
};

const getNextIntroScreen = (progress: LaunchProgress): LaunchScreen => {
  if (!progress.titleSeen) return 'title';
  if (!progress.citySignalSeen) return 'citySignal';
  return 'mainMenu';
};

export const CrewLaunchExperience: React.FC<Props> = ({ renderRunnerCreator }) => {
  const [progress, setProgress] = useState<LaunchProgress>(() => getLaunchProgress());
  const [screen, setScreen] = useState<LaunchScreen>(() =>
    getInitialScreen(getLaunchProgress()),
  );
  const [runnerProgress, setRunnerProgress] = useState<RunnerProgress>(() => getRunnerProgress());
  const [preferredMainPanel, setPreferredMainPanel] = useState<MainMenuPanel>('home');
  const [preferredRunnerMode, setPreferredRunnerMode] = useState<RunnerPanelMode>('profile');
  const [creatorEntryNonce, setCreatorEntryNonce] = useState(0);

  const syncProgress = () => {
    const next = getLaunchProgress();
    setProgress(next);
    return next;
  };

  const persistSelectedCrew = (slug?: string) => {
    const nextSlug = slug || getLaunchProgress().selectedCrewSlug || DEFAULT_CREW_SLUG;
    setSelectedCrewSlug(nextSlug);
    return nextSlug;
  };

  const goToMainMenu = (
    panel: MainMenuPanel = 'home',
    runnerMode: RunnerPanelMode = 'profile',
  ) => {
    persistSelectedCrew();
    markMainMenuSeen();
    setPreferredMainPanel(panel);
    setPreferredRunnerMode(runnerMode);
    syncProgress();
    setScreen('mainMenu');
  };

  const openCreatorAt = (tab: CreatorTabId) => {
    setCreatorTab(tab);
    setCreatorEntryNonce((nonce) => nonce + 1);
  };

  const goToWardrobe = () => {
    openCreatorAt('look');
    goToMainMenu('home', 'profile');
  };

  const goToCrewHome = () => {
    goToMainMenu('crewHome', 'profile');
  };

  const goToRunnerCreator = (tab: CreatorTabId = 'foto') => {
    openCreatorAt(tab);
    persistSelectedCrew();
    markMainMenuSeen();
    setPreferredMainPanel('runner');
    setPreferredRunnerMode('creator');
    syncProgress();
    setScreen('mainMenu');
  };

  const handleSelectCrew = (slug: string) => {
    setSelectedCrewSlug(slug);
    syncProgress();
  };

  const handleConsoleBootComplete = () => {
    markConsoleBootSeen();
    const next = syncProgress();
    setScreen(getNextIntroScreen(next));
  };

  const handleTitleEnter = () => {
    markTitleSeen();
    syncProgress();
    setScreen('citySignal');
  };

  const handleCitySignalEnter = (slug: string) => {
    persistSelectedCrew(slug);
    markCitySignalSeen();
    goToMainMenu();
  };

  const handleSkipIntro = (slug?: string) => {
    persistSelectedCrew(slug);
    markTitleSeen();
    markCitySignalSeen();
    goToMainMenu();
  };

  const handleGuidedSetupComplete = () => {
    persistSelectedCrew();
    markGuidedSetupComplete();
    syncProgress();
    goToRunnerCreator('foto');
  };

  const handleRunnerSaved = () => {
    markRunnerCustomized();
    goToMainMenu('runner', 'profile');
  };

  const handleStartGuidedSetup = () => {
    persistSelectedCrew();
    const next = syncProgress();
    if (next.guidedSetupComplete) {
      goToRunnerCreator('foto');
      return;
    }
    setScreen('guidedSetup');
  };

  const handleReviewGuidedSetup = () => {
    persistSelectedCrew();
    syncProgress();
    setScreen('guidedSetup');
  };

  if (screen === 'consoleBoot') {
    return <ConsoleBoot onComplete={handleConsoleBootComplete} />;
  }

  if (screen === 'title') {
    return <TitleScreen onEnter={handleTitleEnter} onSkipIntro={handleSkipIntro} />;
  }

  if (screen === 'citySignal') {
    return (
      <CitySignalEntry
        selectedCrewSlug={progress.selectedCrewSlug}
        onEnterHQ={handleCitySignalEnter}
        onSkipIntro={handleSkipIntro}
        onSelectCrew={handleSelectCrew}
      />
    );
  }

  if (screen === 'guidedSetup') {
    return (
      <GuidedOnboarding
        initialStep={progress.onboardingStep}
        selectedCrewSlug={progress.selectedCrewSlug}
        onBackToMenu={() => goToMainMenu('home')}
        onComplete={handleGuidedSetupComplete}
      />
    );
  }

  if (screen === 'mapHome') {
    const handleRunCompleted = (next: RunnerProgress) => {
      saveRunnerProgress(next);
      setRunnerProgress(next);
    };
    return (
      <MapStage
        runnerProgress={runnerProgress}
        selectedCrewSlug={progress.selectedCrewSlug}
        onRunCompleted={handleRunCompleted}
        onBackToMenu={goToCrewHome}
      />
    );
  }

  return (
    <MainMenu
      progress={progress}
      initialPanel={preferredMainPanel}
      initialRunnerMode={preferredRunnerMode}
      runnerCreatorPanel={renderRunnerCreator({
        creatorKey: creatorEntryNonce,
        onBackToMenu: () => goToMainMenu('home'),
        onRunnerSaved: handleRunnerSaved,
        selectedCrewSlug: progress.selectedCrewSlug || DEFAULT_CREW_SLUG,
      })}
      selectedCrewSlug={progress.selectedCrewSlug}
      onSelectCrew={handleSelectCrew}
      onOpenWardrobe={goToWardrobe}
      onOpenCrewHome={goToCrewHome}
      onOpenRunnerCreator={() => goToRunnerCreator('look')}
      onReplayIntro={() => setScreen('title')}
      onReviewGuidedSetup={handleReviewGuidedSetup}
      onStartGuidedSetup={handleStartGuidedSetup}
      onOpenMap={() => setScreen('mapHome')}
    />
  );
};
