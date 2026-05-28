import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getCrewBySlug } from '../../data/crews';
import { setOnboardingStep } from '../../services/launchStorage';
import { CartridgeButton } from '../CartridgeButton';
import { audio, type VoiceCue } from '../../services/audio';

type Props = {
  initialStep: number;
  selectedCrewSlug?: string;
  onComplete: () => void;
  onBackToMenu: () => void;
};

const steps = [
  {
    kicker: 'CHECKPOINT 01',
    title: 'A cidade ouviu teu sinal.',
    body: 'O mapa acende por presença coletiva. Chega perto, respira e escolhe teu lugar.',
  },
  {
    kicker: 'CHECKPOINT 02',
    title: 'Crew veste o mapa.',
    body: 'Cada zona tem cor, patch e missão leve. Primeiro vem identidade, depois vem rua.',
  },
  {
    kicker: 'CHECKPOINT 03',
    title: 'Teu caminho fica teu.',
    body: 'A crew recebe pulso coletivo. O sinal nao abre teu caminho individual.',
  },
  {
    kicker: 'CHECKPOINT 04',
    title: 'Monte teu runner.',
    body: 'Foto do rosto, perfil e equipamento viram tua primeira marca na cidade.',
  },
];

export const GuidedOnboarding: React.FC<Props> = ({
  initialStep,
  selectedCrewSlug,
  onComplete,
  onBackToMenu,
}) => {
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(() => Math.min(Math.max(initialStep, 0), steps.length - 1));
  const guideCrew = getCrewBySlug(selectedCrewSlug);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  useEffect(() => {
    setOnboardingStep(step);
    // Debounce 200ms per 04_VOICE_MAP spec — prevents voice overlap when
    // user rapid-clicks PRÓXIMO. Latest step wins.
    const cue = `guided/step-${step}` as VoiceCue;
    const handle = window.setTimeout(() => {
      void audio.playVoice(cue);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [step]);

  useEffect(() => {
    void audio.crossfadeAmbient('guided-attention');
  }, []);

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setStep((currentStep) => Math.min(steps.length - 1, currentStep + 1));
  };

  return (
    <motion.section
      className="launch-screen game-screen guided-onboarding"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={reducedMotion ? undefined : { opacity: 1 }}
      transition={{ duration: 0.28 }}
    >
      <CartridgeButton variant="link" className="launch-skip" onClick={onComplete}>
        PULAR TUTORIAL
      </CartridgeButton>

      <CartridgeButton
        variant="chalk"
        className="guided-onboarding__back"
        onClick={onBackToMenu}
        sfx="nav-slab"
      >
        MENU
      </CartridgeButton>

      <motion.div
        className="guided-onboarding__leader"
        initial={reducedMotion ? false : { opacity: 0, x: -24, scale: 0.98 }}
        animate={reducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={guideCrew.assets.leader} alt="" aria-hidden />
        <motion.div
          className="guided-onboarding__members"
          aria-hidden
          initial={reducedMotion ? false : { opacity: 0, y: 12 }}
          animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.18 }}
        >
          {guideCrew.assets.members.map((member) => (
            <img key={member} src={member} alt="" />
          ))}
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="guided-onboarding__dialog mission-ticket"
          initial={reducedMotion ? false : { opacity: 0, x: 24, filter: 'blur(8px)' }}
          animate={reducedMotion ? undefined : { opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -18, filter: 'blur(8px)' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>{current.kicker}</span>
          <h1>{current.title}</h1>
          <p>{current.body}</p>

          <div className="guided-onboarding__meter" aria-label={`Passo ${step + 1} de ${steps.length}`}>
            {steps.map((item, index) => (
              <button
                key={item.kicker}
                className={index === step ? 'is-active' : ''}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`Ir para ${item.kicker}`}
                aria-pressed={index === step}
              >
                {index === step && (
                  <motion.span
                    aria-hidden
                    className="guided-onboarding__meter-cursor"
                    layoutId={reducedMotion ? undefined : 'guided-onboarding-meter-cursor'}
                    initial={reducedMotion ? false : { opacity: 0, scaleX: 0.76 }}
                    animate={reducedMotion ? undefined : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span className="guided-onboarding__meter-label">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>

          <div className="guided-onboarding__actions">
            <CartridgeButton
              variant="chalk"
              className="game-command"
              onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
              disabled={step === 0}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            >
              VOLTAR
            </CartridgeButton>
            <CartridgeButton
              variant="solid"
              className="game-command game-command--primary"
              onClick={goNext}
              whileHover={reducedMotion ? undefined : { y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            >
              {isLast ? 'CRIAR RUNNER' : 'PRÓXIMO'}
            </CartridgeButton>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
};
