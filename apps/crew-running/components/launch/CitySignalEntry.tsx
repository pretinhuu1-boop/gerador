import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { getCrewBySlug } from '../../data/crews';
import { CartridgeButton } from '../CartridgeButton';
import { CrewBadge } from '../CrewBadge';
import { CrewPilotPreview } from './CrewPilotPreview';
import { StreetBackdrop } from './StreetBackdrop';
import { audio, type CrewSlug } from '../../services/audio';

type Props = {
  selectedCrewSlug?: string;
  onEnterHQ: (slug: string) => void;
  onSkipIntro: (slug?: string) => void;
  onSelectCrew: (slug: string) => void;
};

type SectionMotionProps = Pick<HTMLMotionProps<'section'>, 'initial' | 'animate' | 'transition'>;
type PanelMotionProps = Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
>;

const launchEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const CitySignalEntry: React.FC<Props> = ({
  selectedCrewSlug,
  onEnterHQ,
  onSkipIntro,
  onSelectCrew,
}) => {
  const reducedMotion = useReducedMotion();
  const [activeCrewSlug, setActiveCrewSlug] = useState(
    () => getCrewBySlug(selectedCrewSlug).slug,
  );
  const activeCrew = useMemo(
    () => getCrewBySlug(activeCrewSlug),
    [activeCrewSlug],
  );

  useEffect(() => {
    void audio.crossfadeAmbient('city-signal');
  }, []);

  const handleSelectCrew = (slug: string) => {
    setActiveCrewSlug(slug);
    onSelectCrew(slug);
    audio.playSfx('nav-slab');
    audio.playCrewIntroVoice(slug as CrewSlug);
  };

  const screenMotion: SectionMotionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.32, ease: 'easeOut' },
      };
  const panelMotion: PanelMotionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 24, filter: 'blur(8px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, x: -18, filter: 'blur(8px)' },
        transition: { duration: 0.24, ease: launchEase },
      };
  const ticketStyle = {
    '--crew-accent': activeCrew.accent,
    '--crew-secondary': activeCrew.secondary,
    backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.9), rgba(0,0,0,0.64)), url(${activeCrew.assets.missionCard})`,
  } as React.CSSProperties;
  const patternStyle = {
    backgroundImage: `url(${activeCrew.assets.pattern})`,
  } as React.CSSProperties;

  return (
    <motion.section className="launch-screen game-screen city-signal-entry city-signal-entry--map-bg" {...screenMotion}>
      <StreetBackdrop variant="city" crewSlug={activeCrew.slug} />

      <CartridgeButton
        variant="link"
        className="launch-skip"
        onClick={() => onSkipIntro(activeCrew.slug)}
      >
        PULAR INTRO
      </CartridgeButton>

      <div className="city-signal-entry__pattern" style={patternStyle} aria-hidden />

      <div className="city-signal-entry__brand">
        <img src="/brand/logo.png" alt="" aria-hidden />
        <div>
          <div className="brand-the-crew">THE CREW</div>
          <div className="brand-running">RUNNING</div>
        </div>
      </div>

      <div className="city-signal-entry__layout">
        <div className="city-signal-entry__side">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCrew.slug}
              className="city-signal-entry__ticket mission-ticket"
              style={ticketStyle}
              {...panelMotion}
            >
              <div className="city-signal-entry__ticket-head">
                <CrewBadge crew={activeCrew} size="md" />
                <div>
                  <span>SINAL ONLINE</span>
                  <strong>{activeCrew.zone}</strong>
                </div>
              </div>
              <h1>{activeCrew.name}</h1>
              <p>{activeCrew.introLine}</p>
              <div className="city-signal-entry__chips" aria-label="Estado do sinal">
                <span className="signal-chip">ROTA PRIVADA</span>
                <span className="signal-chip">5 CREWS</span>
                <span className="signal-chip">SINAL DA CIDADE</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="city-signal-entry__commands">
            <CartridgeButton
              variant="solid"
              className="game-command game-command--primary"
              onClick={() => onEnterHQ(activeCrew.slug)}
              whileHover={reducedMotion ? undefined : { y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            >
              COMEÇAR
            </CartridgeButton>
          </div>

          <div className="city-signal-entry__crew-list">
            <span>CREWS DA CIDADE</span>
            <CrewPilotPreview activeSlug={activeCrew.slug} onSelect={handleSelectCrew} />
          </div>
        </div>
      </div>
    </motion.section>
  );
};
