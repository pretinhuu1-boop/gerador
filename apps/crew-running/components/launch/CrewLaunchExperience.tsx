import React, { useState } from 'react';
import {
  getLaunchProgress,
  getRunnerProgress,
  LaunchProgress,
  markCitySignalSeen,
  markConsoleBootSeen,
  markGuidedSetupComplete,
  markMainMenuSeen,
  markRunnerCustomized,
  markTitleSeen,
  saveRunnerProgress,
  setSelectedCrewSlug,
} from '../../services/launchStorage';
import {
  type RunnerProgress,
  computeRunXp,
} from '../../data/gamification';
import { getZoneByCrewSlug } from '../../data/spLiveMap';
import { CitySignalEntry } from './CitySignalEntry';
import { ConsoleBoot } from './ConsoleBoot';
import { GuidedOnboarding } from './GuidedOnboarding';
import { MainMenu } from './MainMenu';
import { RunnerSavedTeaser } from './RunnerSavedTeaser';
import { TitleScreen } from './TitleScreen';
import { MapStage } from '../map/MapStage';

type LaunchScreen =
  | 'consoleBoot'
  | 'title'
  | 'citySignal'
  | 'mainMenu'
  | 'guidedSetup'
  | 'runnerCreator'
  | 'runnerSaved'
  | 'mapHome';

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
  const [runnerProgress, setRunnerProgress] = useState<RunnerProgress>(() => getRunnerProgress());

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
        onEnterMap={() => setScreen('mapHome')}
      />
    );
  }

  if (screen === 'mapHome') {
    // Demo run stub — exercises the storage round-trip and gives the player a
    // visible XP nudge until real GPS tracking lands. Does NOT increment streak
    // (intentional: streaks come from weekly aggregates, not one-off taps).
    const handleStartDemoRun = () => {
      const zone = getZoneByCrewSlug(progress.selectedCrewSlug);
      const earned = computeRunXp({
        distanceKm: 1,
        kmInTerritory: zone ? 1 : 0,
        spotsTouched: 0,
        closedLoop: false,
        isInvasion: false,
      });
      const now = Date.now();
      setRunnerProgress((prev) => {
        const next: RunnerProgress = {
          ...prev,
          xp: prev.xp + earned,
          lastRunAt: now,
          inkPerZone: zone
            ? { ...prev.inkPerZone, [zone.id]: (prev.inkPerZone[zone.id] ?? 0) + earned }
            : prev.inkPerZone,
          inkUpdatedAt: now,
        };
        saveRunnerProgress(next);
        return next;
      });
    };
    return (
      <MapStage
        runnerProgress={runnerProgress}
        selectedCrewSlug={progress.selectedCrewSlug}
        onStartRun={handleStartDemoRun}
        onBackToMenu={goToMainMenu}
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
      onOpenMap={progress.runnerCustomized ? () => setScreen('mapHome') : undefined}
    />
  );
};
