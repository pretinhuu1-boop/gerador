import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { CREWS, getCrewBySlug } from '../../data/crews';
import { CrewBadge } from '../CrewBadge';
import { StreetBackdrop } from './StreetBackdrop';
import { audio } from '../../services/audio';

type Props = {
  onComplete: (skipped: boolean) => void;
};

const streetStory = [
  {
    crew: getCrewBySlug('downtown-rush'),
    line: 'Centro abriu. Quem chega no sinal?',
  },
  {
    crew: getCrewBySlug('north-breakers'),
    line: 'Norte na subida. Hoje ninguem corre sozinho.',
  },
  {
    crew: getCrewBySlug('east-burners'),
    line: 'Leste aceso. Quero ver esse pulso cruzar a cidade.',
  },
  {
    crew: getCrewBySlug('south-striders'),
    line: 'Sul mantem constante. Ritmo e presenca, nao pressa.',
  },
  {
    crew: getCrewBySlug('west-flow'),
    line: 'Oeste flui. Marca o mapa sem expor tua rota.',
  },
  {
    crew: getCrewBySlug('downtown-rush'),
    line: 'Fechado. Novo runner escolhe crew e entra no QG.',
  },
];

export const ConsoleBoot: React.FC<Props> = ({ onComplete }) => {
  const reducedMotion = useReducedMotion();
  const [visibleLines, setVisibleLines] = useState(1);
  const [leaving, setLeaving] = useState(false);
  const finishedRef = useRef(false);

  const finish = useCallback((skipped = false) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    audio.unlock();
    if (skipped) {
      audio.playSfx('skip-cut');
    } else {
      void audio.playVoice('boot/sinal-ativo');
    }
    setLeaving(true);
    window.setTimeout(() => onComplete(skipped), reducedMotion ? 80 : 360);
  }, [onComplete, reducedMotion]);

  useEffect(() => {
    void audio.crossfadeAmbient('boot-cold');
    audio.preloadSfx(['tap', 'tap-alt', 'skip-cut', 'nav-slab']);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleLines(streetStory.length);
      const timer = window.setTimeout(() => finish(false), 2200);
      return () => window.clearTimeout(timer);
    }

    const lineTimer = window.setInterval(() => {
      setVisibleLines((current) => Math.min(streetStory.length, current + 1));
    }, 520);
    const completeTimer = window.setTimeout(() => finish(false), 4300);

    return () => {
      window.clearInterval(lineTimer);
      window.clearTimeout(completeTimer);
    };
  }, [finish, reducedMotion]);

  return (
    <section className={`launch-screen console-boot ${leaving ? 'is-leaving' : ''}`}>
      <StreetBackdrop variant="boot" />

      <button
        className="launch-skip"
        type="button"
        onClick={() => {
          audio.unlock();
          finish(true);
        }}
      >
        PULAR
      </button>

      <div className="console-boot__panel console-boot__panel--story" aria-live="polite">
        <div className="console-boot__mark">
          <img src="/brand/logo.png" alt="" aria-hidden />
          <div>
            <span>SINAL DA RUA</span>
            <strong>CREWS NO AR</strong>
          </div>
        </div>

        <div className="console-boot__street">
          <div className="console-boot__crew-wall" aria-hidden>
            {CREWS.map((crew) => (
              <div
                className="console-boot__crew-card"
                key={crew.slug}
                style={{
                  '--crew-accent': crew.accent,
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.88)), url(${crew.assets.pattern})`,
                } as React.CSSProperties}
              >
                <CrewBadge crew={crew} className="console-boot__crew-badge" />
                <img className="console-boot__crew-leader" src={crew.assets.leader} alt="" />
                <span>{crew.zone}</span>
              </div>
            ))}
          </div>

          <div className="console-boot__radio" aria-label="Radio das crews">
            {streetStory.slice(0, visibleLines).map((beat, index) => (
              <div
                className="console-boot__message"
                key={`${beat.crew.slug}-${index}`}
                style={{ '--crew-accent': beat.crew.accent } as React.CSSProperties}
              >
                <CrewBadge crew={beat.crew} size="sm" />
                <div>
                  <span>{beat.crew.zone} / {beat.crew.name}</span>
                  <p>{beat.line}</p>
                </div>
              </div>
            ))}
            {visibleLines < streetStory.length ? (
              <div className="console-boot__cursor" aria-hidden />
            ) : (
              <div className="console-boot__ready">QG LIBERADO</div>
            )}
          </div>
        </div>

        <div className="console-boot__callout">
          {CREWS.map((crew) => (
            <img key={crew.slug} src={crew.assets.ping} alt="" aria-hidden />
          ))}
        </div>

        <p>O APP NÃO ABRE. A RUA CHAMA.</p>
      </div>
    </section>
  );
};
