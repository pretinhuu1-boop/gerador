import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { getCrewBySlug } from '../../data/crews';
import { getRunnerTypeById } from '../../data/runnerTypes';
import { LaunchProgress } from '../../services/launchStorage';
import { getSavedCharacter } from '../../services/storage';
import { CartridgeButton } from '../CartridgeButton';
import { CrewBadge } from '../CrewBadge';
import { CrewPilotPreview } from './CrewPilotPreview';
import { StreetBackdrop } from './StreetBackdrop';
import { RunnerPanel } from '../voce/RunnerPanel';
import { audio, type CrewSlug } from '../../services/audio';

const AudioMuteToggle: React.FC = () => {
  const [muted, setMuted] = useState(() => audio.isMuted());
  useEffect(() => audio.onMuteChange(setMuted), []);
  return (
    <CartridgeButton
      variant="chalk"
      className="game-command"
      onClick={() => audio.setMuted(!muted)}
      aria-pressed={!muted}
      sfx="none"
    >
      {muted ? 'SOM: MUDO' : 'SOM: ATIVO'}
    </CartridgeButton>
  );
};

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
  const passportCrew = runnerSaved ? savedCrew : activeCrew;
  const passportImage =
    runnerSaved && savedCharacter?.imageDataUrl
      ? savedCharacter.imageDataUrl
      : activeCrew.assets.leader;
  const savedAtLabel = savedCharacter?.savedAt
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(
        savedCharacter.savedAt,
      )
    : 'PENDENTE';
  const passportStatusLabel = runnerSaved
    ? 'IDENTIDADE SALVA'
    : guideDone
      ? 'IDENTIDADE ABERTA'
      : 'IDENTIDADE PENDENTE';
  const passportTitle = runnerSaved ? runnerName : guideDone ? 'Monte seu runner' : 'Runner pendente';
  const passportCopy = runnerSaved
    ? `Perfil ligado a ${passportCrew.name}. O QG da crew fica ao lado; aqui fica tua ficha individual.`
    : guideDone
      ? `O QG de ${activeCrew.name} liberou teu slot. Monte look, selfie e equipamento para salvar a identidade.`
      : `${activeCrew.name} abriu o sinal. Complete o guia para liberar tua ficha de corredor.`;
  const passportStyle = {
    '--crew-accent': passportCrew.accent,
    '--crew-secondary': passportCrew.secondary,
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.82)), url(${passportCrew.assets.banner})`,
  } as React.CSSProperties;
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
          <div
            className={`main-menu__leader main-menu__passport ${
              runnerSaved ? 'is-saved' : 'is-pending'
            }`}
            style={passportStyle}
          >
            <div
              className="main-menu__passport-pattern"
              style={{ backgroundImage: `url(${passportCrew.assets.pattern})` }}
              aria-hidden
            />

            <div className="main-menu__passport-head">
              <div>
                <span>{passportStatusLabel}</span>
                <strong>{passportTitle}</strong>
              </div>
              <CrewBadge crew={passportCrew} size="md" />
            </div>

            <div className="main-menu__passport-stage">
              <AnimatePresence mode="wait">
                <motion.img
                  className="main-menu__passport-figure"
                  key={runnerSaved ? `runner-${savedCharacter?.savedAt}` : activeCrew.slug}
                  src={passportImage}
                  alt={runnerSaved ? `Runner ${runnerName}` : ''}
                  aria-hidden={!runnerSaved}
                  initial={reducedMotion ? false : { opacity: 0, x: -24, scale: 0.98 }}
                  animate={reducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
                  exit={reducedMotion ? undefined : { opacity: 0, x: 18, scale: 0.99 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                />
              </AnimatePresence>

              <div className="main-menu__passport-mentor" aria-hidden>
                <img src={activeCrew.assets.leader} alt="" />
                <span>{activeCrew.zone}</span>
              </div>
            </div>

            <div className="main-menu__passport-sheet">
              <p>{passportCopy}</p>
              <div className="main-menu__passport-grid" aria-label="Ficha do runner">
                <span>CREW</span>
                <strong>{passportCrew.zone}</strong>
                <span>TIPO</span>
                <strong>{runnerSaved ? runnerType.label : 'A DEFINIR'}</strong>
                <span>LOOK</span>
                <strong>{runnerSaved ? 'READY' : 'PENDENTE'}</strong>
                <span>ID</span>
                <strong>{runnerSaved ? savedAtLabel : 'PENDENTE'}</strong>
              </div>
              <div className="main-menu__passport-footer">
                <div className="main-menu__passport-members" aria-hidden>
                  {passportCrew.assets.members.map((member) => (
                    <img key={member} src={member} alt="" />
                  ))}
                </div>
                <button
                  className="main-menu__passport-action game-command"
                  type="button"
                  onClick={runnerSaved ? () => setPanel('runner') : primaryAction}
                >
                  {runnerSaved ? 'VER FICHA' : guideDone ? 'MONTAR' : 'ABRIR GUIA'}
                </button>
              </div>
            </div>
          </div>
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
                <>
                  <div className="main-menu__panel-head">
                    <CrewBadge crew={activeCrew} size="md" />
                    <div>
                      <span className="main-menu__eyebrow">{activeCrew.zone} ONLINE</span>
                      <strong>QG DE MISSÃO</strong>
                    </div>
                    <img src={activeCrew.assets.marker} alt="" aria-hidden />
                  </div>
                  <h1>{activeCrew.name}</h1>
                  <p>{homeCopy}</p>
                  {runnerSaved && (
                    <div className="main-menu__runner-pass">
                      <div className="main-menu__runner-portrait">
                        {savedCharacter ? (
                          <img src={savedCharacter.imageDataUrl} alt="Runner ready" />
                        ) : (
                          <CrewBadge crew={activeCrew} size="lg" />
                        )}
                      </div>
                      <div>
                        <span>RUNNER SALVO</span>
                        <strong>{runnerName}</strong>
                        <p>Identidade salva para a proxima fase. O caminho individual fica fechado nesta entrada.</p>
                      </div>
                    </div>
                  )}
                  <div className="main-menu__status">
                    <span>SINAL</span>
                    <strong>{progress.citySignalSeen ? 'OK' : 'ABERTO'}</strong>
                    <span>GUIA</span>
                    <strong>{guideStatusLabel}</strong>
                    <span>RUNNER</span>
                    <strong>{runnerStatusLabel}</strong>
                  </div>
                  <div className="main-menu__panel-actions main-menu__panel-actions--secondary">
                    {runnerSaved && (
                      <CartridgeButton variant="chalk" className="game-command" onClick={() => selectPanel('runner')}>
                        VER RUNNER
                      </CartridgeButton>
                    )}
                    <CartridgeButton variant="chalk" className="game-command" onClick={() => selectPanel('crews')}>
                      TROCAR CREW
                    </CartridgeButton>
                  </div>
                </>
              )}

              {panel === 'crews' && (
                <>
                  <span className="main-menu__eyebrow">CREWS PILOTO</span>
                  <h1>5 sinais no mapa</h1>
                  <CrewPilotPreview activeSlug={activeCrew.slug} onSelect={handleSelectCrew} />
                  <div
                    className="main-menu__crew-dossier"
                    style={{
                      '--crew-accent': activeCrew.accent,
                      backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,0,0,0.56)), url(${activeCrew.assets.shareCard})`,
                    } as React.CSSProperties}
                  >
                    <div>
                      <span>{activeCrew.zone} / {activeCrew.mission}</span>
                      <strong>{activeCrew.name}</strong>
                      <p>{activeCrew.introLine}</p>
                    </div>
                    <div className="main-menu__crew-members" aria-hidden>
                      {activeCrew.assets.members.map((member) => (
                        <img key={member} src={member} alt="" />
                      ))}
                    </div>
                  </div>
                  <div className="main-menu__panel-actions">
                    <CartridgeButton variant="solid" className="game-command game-command--primary" onClick={primaryAction}>
                      {runnerSaved ? 'AJUSTAR RUNNER' : guideDone ? 'MONTAR RUNNER' : 'ABRIR GUIA'}
                    </CartridgeButton>
                  </div>
                </>
              )}

              {panel === 'runner' && (
                <RunnerPanel
                  crew={savedCrew}
                  savedCharacter={savedCharacter}
                  progress={progress}
                  runnerName={runnerName}
                  onAdjust={onOpenRunnerCreator}
                  guideDone={guideDone}
                  version={runnerVersion}
                />
              )}

              {panel === 'config' && (
                <>
                  <span className="main-menu__eyebrow">CONFIG</span>
                  <h1>Ritmo seguro</h1>
                  <ul className="main-menu__rules">
                    <li>O mapa inicial mostra sinal coletivo.</li>
                    <li>Seu caminho individual nao aparece nesta entrada.</li>
                    <li>Sem pressao de ritmo. Entra no teu tempo.</li>
                  </ul>
                  <div className="main-menu__panel-actions">
                    <AudioMuteToggle />
                    <CartridgeButton variant="chalk" className="game-command" onClick={onReplayIntro}>
                      REVER INTRO
                    </CartridgeButton>
                    <CartridgeButton
                      variant="chalk"
                      className="game-command"
                      onClick={guideDone ? onReviewGuidedSetup : onStartGuidedSetup}
                    >
                      {guideDone ? 'REVER GUIA' : 'ABRIR GUIA'}
                    </CartridgeButton>
                    <CartridgeButton variant="solid" className="game-command game-command--primary" onClick={primaryAction}>
                      {primaryLabel}
                    </CartridgeButton>
                  </div>
                </>
              )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
