import React, { useState } from 'react';
import {
  getLaunchProgress,
  LaunchProgress,
  markCitySignalSeen,
  markConsoleBootSeen,
  markGuidedSetupComplete,
  markMainMenuSeen,
  markRunnerCustomized,
  markTitleSeen,
  setSelectedCrewSlug,
} from '../../services/launchStorage';
import { CitySignalEntry } from './CitySignalEntry';
import { ConsoleBoot } from './ConsoleBoot';
import { GuidedOnboarding } from './GuidedOnboarding';
import { MainMenu } from './MainMenu';
import { RunnerSavedTeaser } from './RunnerSavedTeaser';
import { TitleScreen } from './TitleScreen';

type LaunchScreen =
  | 'consoleBoot'
  | 'title'
  | 'citySignal'
  | 'mainMenu'
  | 'guidedSetup'
  | 'runnerCreator'
  | 'runnerSaved';

type Props = {
  renderRunnerCreator: (props: {
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

  const goToMainMenu = () => {
    persistSelectedCrew();
    markMainMenuSeen();
    syncProgress();
    setScreen('mainMenu');
  };

  const goToRunnerCreator = () => {
    persistSelectedCrew();
    syncProgress();
    setScreen('runnerCreator');
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
    goToRunnerCreator();
  };

  const handleRunnerSaved = () => {
    markRunnerCustomized();
    syncProgress();
    setScreen('runnerSaved');
  };

  const handleStartGuidedSetup = () => {
    persistSelectedCrew();
    const next = syncProgress();
    setScreen(next.guidedSetupComplete ? 'runnerCreator' : 'guidedSetup');
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
        onBackToMenu={goToMainMenu}
        onComplete={handleGuidedSetupComplete}
      />
    );
  }

  if (screen === 'runnerCreator') {
    return renderRunnerCreator({
      onBackToMenu: goToMainMenu,
      onRunnerSaved: handleRunnerSaved,
      selectedCrewSlug: progress.selectedCrewSlug || DEFAULT_CREW_SLUG,
    });
  }

  if (screen === 'runnerSaved') {
    return (
      <RunnerSavedTeaser
        progress={progress}
        selectedCrewSlug={progress.selectedCrewSlug}
        onBackToMenu={goToMainMenu}
        onEditRunner={goToRunnerCreator}
      />
    );
  }

  return (
    <MainMenu
      progress={progress}
      selectedCrewSlug={progress.selectedCrewSlug}
      onSelectCrew={handleSelectCrew}
      onOpenRunnerCreator={goToRunnerCreator}
      onReplayIntro={() => setScreen('title')}
      onReviewGuidedSetup={handleReviewGuidedSetup}
      onStartGuidedSetup={handleStartGuidedSetup}
    />
  );
};
