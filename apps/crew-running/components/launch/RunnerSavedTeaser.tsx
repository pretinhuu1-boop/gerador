import React, { useEffect, useMemo } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { getCrewBySlug } from '../../data/crews';
import { LaunchProgress } from '../../services/launchStorage';
import { getSavedCharacter } from '../../services/storage';
import { CartridgeButton } from '../CartridgeButton';
import { CrewBadge } from '../CrewBadge';
import { StreetBackdrop } from './StreetBackdrop';
import { audio } from '../../services/audio';

type Props = {
  progress: LaunchProgress;
  selectedCrewSlug?: string;
  onBackToMenu: () => void;
  onEditRunner: () => void;
  onEnterMap?: () => void;
};

type SectionMotionProps = Pick<HTMLMotionProps<'section'>, 'initial' | 'animate' | 'transition'>;

const launchEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const RunnerSavedTeaser: React.FC<Props> = ({
  progress,
  selectedCrewSlug,
  onBackToMenu,
  onEditRunner,
  onEnterMap,
}) => {
  const reducedMotion = useReducedMotion();
  const savedCharacter = useMemo(() => getSavedCharacter(), []);
  const crew = getCrewBySlug(selectedCrewSlug);
  const runnerName = savedCharacter?.profile?.name;

  useEffect(() => {
    audio.playSfx('stamp-save');
    void audio.crossfadeAmbient('saved-stamp-wash');
    const voiceHandle = window.setTimeout(() => {
      void audio.playVoice('saved/cidade-pronta');
    }, 600);
    const ambientHandle = window.setTimeout(() => {
      void audio.crossfadeAmbient('hq-room');
    }, 8000);
    return () => {
      window.clearTimeout(voiceHandle);
      window.clearTimeout(ambientHandle);
    };
  }, []);
  const screenMotion: SectionMotionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.32, ease: 'easeOut' },
      };

  return (
    <motion.section className="launch-screen game-screen runner-saved" {...screenMotion}>
      <div className="runner-saved__map" aria-hidden>
        <StreetBackdrop variant="saved" crewSlug={crew.slug} />
      </div>

      <CartridgeButton
        variant="chalk"
        className="guided-onboarding__back"
        onClick={onBackToMenu}
        sfx="nav-slab"
      >
        MENU
      </CartridgeButton>

      <motion.div
        className="runner-saved__panel mission-ticket"
        initial={reducedMotion ? false : { opacity: 0, y: 24 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: launchEase }}
      >
        <motion.div
          className="runner-saved__stamp sticker-stamp"
          initial={reducedMotion ? false : { opacity: 0, rotate: -6, scale: 1.14 }}
          animate={reducedMotion ? undefined : { opacity: 1, rotate: -1.5, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={`/crews/${crew.slug}/stickers/sticker_1.png`} alt="" aria-hidden />
          <span>RUNNER SALVO</span>
        </motion.div>

        <div className="runner-saved__body">
          <motion.div
            className="runner-saved__portrait"
            initial={reducedMotion ? false : { opacity: 0, y: 12, rotate: -2 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0, rotate: -0.8 }}
            transition={{ duration: 0.24, delay: 0.18, ease: launchEase }}
          >
            {savedCharacter ? (
              <img src={savedCharacter.imageDataUrl} alt="Runner ready" />
            ) : (
              <CrewBadge crew={crew} size="lg" />
            )}
          </motion.div>

          <div>
            <p className="runner-saved__kicker">CIDADE PRONTA</p>
            <h1>{runnerName ? `${runnerName} pronto.` : 'Runner pronto.'}</h1>
            <p>
              A cidade guarda teu sinal. Por agora, tua identidade fica pronta na HQ.
            </p>

            <div className="runner-saved__status">
              <span>BOOT</span>
              <strong>{progress.consoleBootSeen ? 'OK' : 'NOVO'}</strong>
              <span>SINAL</span>
              <strong>{progress.citySignalSeen ? 'OK' : 'ABERTO'}</strong>
              <span>RUNNER</span>
              <strong>READY</strong>
            </div>

            <div className="runner-saved__actions">
              {onEnterMap && (
                <CartridgeButton variant="solid" className="game-command game-command--primary" onClick={onEnterMap}>
                  ABRIR MAPA
                </CartridgeButton>
              )}
              <CartridgeButton variant={onEnterMap ? 'chalk' : 'solid'} className="game-command" onClick={onBackToMenu}>
                VOLTAR AO SINAL
              </CartridgeButton>
              <CartridgeButton variant="chalk" className="game-command" onClick={onEditRunner}>
                AJUSTAR RUNNER
              </CartridgeButton>
            </div>
          </div>
        </div>

        <motion.img
          className="runner-saved__reward"
          src={`/crews/${crew.slug}/achievements/achievement_1.png`}
          alt=""
          aria-hidden
          initial={reducedMotion ? false : { opacity: 0, rotate: 1, y: -8 }}
          animate={reducedMotion ? undefined : { opacity: 1, rotate: 7, y: 0 }}
          transition={{ duration: 0.24, delay: 0.22, ease: launchEase }}
        />
      </motion.div>
    </motion.section>
  );
};
