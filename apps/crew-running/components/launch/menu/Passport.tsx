import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CrewZone } from '../../../data/crews';
import type { RunnerType } from '../../../data/runnerTypes';
import type { SavedCharacter } from '../../../services/storage';
import { CrewBadge } from '../../CrewBadge';

type Props = {
  activeCrew: CrewZone;
  savedCrew: CrewZone;
  savedCharacter: SavedCharacter | null;
  runnerName: string;
  runnerType: RunnerType;
  runnerSaved: boolean;
  guideDone: boolean;
  primaryAction: () => void;
  onShowRunnerPanel: () => void;
  reducedMotion: boolean | null;
};

export const Passport: React.FC<Props> = ({
  activeCrew,
  savedCrew,
  savedCharacter,
  runnerName,
  runnerType,
  runnerSaved,
  guideDone,
  primaryAction,
  onShowRunnerPanel,
  reducedMotion,
}) => {
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

  return (
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
            onClick={runnerSaved ? onShowRunnerPanel : primaryAction}
          >
            {runnerSaved ? 'VER FICHA' : guideDone ? 'MONTAR' : 'ABRIR GUIA'}
          </button>
        </div>
      </div>
    </div>
  );
};
