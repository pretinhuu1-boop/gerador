import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { getCrewBySlug } from '../../data/crews';
import { getRunnerTypeById } from '../../data/runnerTypes';
import { LaunchProgress } from '../../services/launchStorage';
import { getSavedCharacter } from '../../services/storage';
import { StreetBackdrop } from './StreetBackdrop';
import { RunnerPanel } from '../voce/RunnerPanel';
import { HomePanel } from './menu/HomePanel';
import { CrewsPanel } from './menu/CrewsPanel';
import { ConfigPanel } from './menu/ConfigPanel';
import { Passport } from './menu/Passport';
import { audio, type CrewSlug } from '../../services/audio';

type Props = {
  progress: LaunchProgress;
  selectedCrewSlug?: string;
  onSelectCrew: (slug: string) => void;
  onStartGuidedSetup: () => void;
  onReviewGuidedSetup: () => void;
  onOpenRunnerCreator: () => void;
  onReplayIntro: () => void;
  onOpenMap?: () => void;
};

type MenuPanel = 'home' | 'crews' | 'runner' | 'config';
type SectionMotionProps = Pick<HTMLMotionProps<'section'>, 'initial' | 'animate' | 'transition'>;
type PanelMotionProps = Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
>;

const launchEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const MainMenu: React.FC<Props> = ({
  progress,
  selectedCrewSlug,
  onSelectCrew,
  onStartGuidedSetup,
  onReviewGuidedSetup,
  onOpenRunnerCreator,
  onReplayIntro,
  onOpenMap,
}) => {
  const reducedMotion = useReducedMotion();
  const [panel, setPanel] = useState<MenuPanel>('home');
  const [activeCrewSlug, setActiveCrewSlug] = useState(
    () => getCrewBySlug(selectedCrewSlug).slug,
  );
  const [savedCharacter, setSavedCharacter] = useState(() => getSavedCharacter());
  const [runnerVersion, setRunnerVersion] = useState(0);

  useEffect(() => {
    setSavedCharacter(getSavedCharacter());
    setRunnerVersion((v) => v + 1);
  }, [progress.runnerCustomized]);

  const runnerName = savedCharacter?.profile?.name || 'Runner';

  const activeCrew = useMemo(
    () => getCrewBySlug(activeCrewSlug),
    [activeCrewSlug],
  );
  const savedCrew = useMemo(
    () => getCrewBySlug(savedCharacter?.crewSlug || activeCrew.slug),
    [activeCrew.slug, savedCharacter?.crewSlug],
  );
  const runnerType = useMemo(
    () => getRunnerTypeById(savedCharacter?.runnerTypeId),
    [savedCharacter?.runnerTypeId],
  );

  useEffect(() => {
    setActiveCrewSlug(getCrewBySlug(selectedCrewSlug).slug);
  }, [selectedCrewSlug]);

  useEffect(() => {
    void audio.crossfadeAmbient('hq-room');
    return () => audio.stopCrewMotif();
  }, []);

  useEffect(() => {
    audio.layerCrewMotif(activeCrewSlug as CrewSlug);
  }, [activeCrewSlug]);

  const selectPanel = (next: MenuPanel) => {
    if (next === panel) return;
    audio.playSfx('nav-slab');
    setPanel(next);
  };

  const handleSelectCrew = (slug: string) => {
    setActiveCrewSlug(slug);
    onSelectCrew(slug);
    audio.playSfx('nav-slab');
  };

  const panelButtonClass = (target: MenuPanel) =>
    `main-menu__nav-item ${panel === target ? 'is-active' : ''}`;
  const renderNavCursor = (target: MenuPanel) =>
    panel === target ? (
      <motion.span
        aria-hidden
        className="main-menu__nav-cursor"
        layoutId={reducedMotion ? undefined : 'main-menu-nav-cursor'}
        initial={reducedMotion ? false : { opacity: 0, x: -8 }}
        animate={reducedMotion ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.18, ease: launchEase }}
      />
    ) : null;
  const panelStyle = {
    '--crew-accent': activeCrew.accent,
    '--crew-secondary': activeCrew.secondary,
    backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.97), rgba(0,0,0,0.9)), url(${activeCrew.assets.missionCard})`,
  } as React.CSSProperties;
  const crewThemeStyle = {
    '--crew-accent': activeCrew.accent,
    '--crew-secondary': activeCrew.secondary,
  } as React.CSSProperties;
  const hasSavedCharacter = Boolean(savedCharacter?.imageDataUrl);
  const guideDone =
    progress.runnerCustomized || progress.guidedSetupComplete || progress.onboardingComplete;
  const runnerSaved = progress.runnerCustomized && hasSavedCharacter;
  const primaryAction = guideDone ? onOpenRunnerCreator : onStartGuidedSetup;
  const primaryLabel = !guideDone
    ? 'COMEÇAR'
    : runnerSaved
      ? 'AJUSTAR RUNNER'
      : 'MONTAR RUNNER';
  const guideStatusLabel = guideDone ? 'FEITO' : 'ABERTO';
  const runnerStatusLabel = runnerSaved ? 'READY' : guideDone ? 'EM MONTAGEM' : 'PENDENTE';
  const homeCopy = runnerSaved
    ? `${runnerName} pronto no QG da cidade.`
    : guideDone
      ? 'Guia completo. Falta montar teu runner antes da proxima fase.'
      : 'QG aberto. Comece pelo guia da crew antes de montar seu runner.';
  const enterMotion: SectionMotionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.48, ease: launchEase },
      };
  const panelMotion: PanelMotionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 22, filter: 'blur(10px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, x: -18, filter: 'blur(8px)' },
        transition: { duration: 0.28, ease: launchEase },
      };

  return (
    <motion.section className="launch-screen game-screen main-menu" style={crewThemeStyle} {...enterMotion}>
      <div className="main-menu__map" aria-hidden>
        <StreetBackdrop variant="hq" crewSlug={activeCrew.slug} />
      </div>

      <motion.div
        className="main-menu__brand"
        initial={reducedMotion ? false : { opacity: 0, y: -10 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: 'easeOut' }}
      >
        <img src="/brand/logo.png" alt="" aria-hidden />
        <div>
          <div className="brand-the-crew">THE CREW</div>
          <div className="brand-running">RUNNING</div>
        </div>
      </motion.div>

      <div className="main-menu__layout">
        <nav className="main-menu__nav" aria-label="Menu principal">
          <motion.button
            className="main-menu__primary game-command game-command--primary"
            type="button"
            onClick={primaryAction}
            whileHover={reducedMotion ? undefined : { x: -2, y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          >
            {primaryLabel}
          </motion.button>
          <motion.button
            className={panelButtonClass('home')}
            type="button"
            aria-pressed={panel === 'home'}
            onClick={() => selectPanel('home')}
            whileHover={reducedMotion ? undefined : { x: 5 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          >
            {renderNavCursor('home')}
            <span>INÍCIO</span>
          </motion.button>
          <motion.button
            className={panelButtonClass('crews')}
            type="button"
            aria-pressed={panel === 'crews'}
            onClick={() => selectPanel('crews')}
            whileHover={reducedMotion ? undefined : { x: 5 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          >
            {renderNavCursor('crews')}
            <span>CREWS PILOTO</span>
          </motion.button>
          <motion.button
            className={panelButtonClass('runner')}
            type="button"
            aria-pressed={panel === 'runner'}
            onClick={() => selectPanel('runner')}
            whileHover={reducedMotion ? undefined : { x: 5 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          >
            {renderNavCursor('runner')}
            <span>RUNNER</span>
          </motion.button>
          <motion.button
            className={panelButtonClass('config')}
            type="button"
            aria-pressed={panel === 'config'}
            onClick={() => selectPanel('config')}
            whileHover={reducedMotion ? undefined : { x: 5 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          >
            {renderNavCursor('config')}
            <span>CONFIG</span>
          </motion.button>
          <button className="main-menu__nav-link" type="button" onClick={onReplayIntro}>
            REVER INTRO
          </button>
          {onOpenMap && (
            <button className="main-menu__nav-link" type="button" onClick={onOpenMap}>
              ABRIR MAPA
            </button>
          )}
        </nav>

        <div className={`main-menu__hero ${panel === 'runner' || panel === 'config' ? 'main-menu__hero--focused' : ''}`}>
          {(panel === 'home' || panel === 'crews') && (
            <Passport
              activeCrew={activeCrew}
              savedCrew={savedCrew}
              savedCharacter={savedCharacter}
              runnerName={runnerName}
              runnerType={runnerType}
              runnerSaved={runnerSaved}
              guideDone={guideDone}
              primaryAction={primaryAction}
              onShowRunnerPanel={() => selectPanel('runner')}
              reducedMotion={reducedMotion}
            />
          )}

          <motion.div
            key={panel}
            className="main-menu__panel mission-ticket"
            style={panelStyle}
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            transition={panelMotion.transition}
          >
              {panel === 'home' && (
                <HomePanel
                  activeCrew={activeCrew}
                  homeCopy={homeCopy}
                  runnerSaved={runnerSaved}
                  savedCharacter={savedCharacter}
                  runnerName={runnerName}
                  progress={progress}
                  guideStatusLabel={guideStatusLabel}
                  runnerStatusLabel={runnerStatusLabel}
                  onShowRunnerPanel={() => selectPanel('runner')}
                  onShowCrewsPanel={() => selectPanel('crews')}
                />
              )}

              {panel === 'crews' && (
                <CrewsPanel
                  activeCrew={activeCrew}
                  runnerSaved={runnerSaved}
                  guideDone={guideDone}
                  onSelectCrew={handleSelectCrew}
                  onPrimaryAction={primaryAction}
                />
              )}

              {panel === 'runner' && (
                <RunnerPanel
                  crew={savedCrew}
                  savedCharacter={savedCharacter}
                  progress={progress}
                  runnerName={runnerName}
                  onAdjust={onOpenRunnerCreator}
                  onOpenMap={onOpenMap}
                  guideDone={guideDone}
                  version={runnerVersion}
                />
              )}

              {panel === 'config' && (
                <ConfigPanel
                  guideDone={guideDone}
                  primaryLabel={primaryLabel}
                  onReplayIntro={onReplayIntro}
                  onReviewGuidedSetup={onReviewGuidedSetup}
                  onStartGuidedSetup={onStartGuidedSetup}
                  onPrimaryAction={primaryAction}
                />
              )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
