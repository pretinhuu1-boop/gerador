import React, { useEffect } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { CartridgeButton } from '../CartridgeButton';
import { audio } from '../../services/audio';

type Props = {
  onEnter: () => void;
  onSkipIntro: () => void;
};

type SectionMotionProps = Pick<HTMLMotionProps<'section'>, 'initial' | 'animate' | 'transition'>;

const launchEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const TitleScreen: React.FC<Props> = ({ onEnter, onSkipIntro }) => {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    void audio.crossfadeAmbient('title-pulse');
    const handle = window.setTimeout(() => {
      void audio.playVoice('boot/cidade-ouviu');
    }, 800);
    return () => window.clearTimeout(handle);
  }, []);

  const screenMotion: SectionMotionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.34, ease: 'easeOut' },
      };

  return (
    <motion.section className="launch-screen game-screen title-screen" {...screenMotion}>
      <CartridgeButton variant="link" className="launch-skip" onClick={() => onSkipIntro()}>
        PULAR INTRO
      </CartridgeButton>

      <div className="title-screen__splash" aria-hidden>
        <img src="/brand/splash.png" alt="" />
      </div>

      <motion.div
        className="title-screen__content"
        initial={reducedMotion ? false : { opacity: 0, y: 28 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.52, ease: launchEase }}
      >
        <img className="title-screen__logo" src="/brand/logo.png" alt="" aria-hidden />
        <p className="title-screen__kicker">CITY SIGNAL / ONLINE</p>
        <h1>
          THE CREW
          <span>RUNNING</span>
        </h1>
        <p className="title-screen__line">O app nao abre. A cidade liga.</p>
        <div className="title-screen__commands">
          <CartridgeButton
            variant="solid"
            className="game-command game-command--primary"
            onClick={onEnter}
            whileHover={reducedMotion ? undefined : { y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
          >
            ENTRAR
          </CartridgeButton>
        </div>
      </motion.div>

      <div className="title-screen__signal" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </motion.section>
  );
};
