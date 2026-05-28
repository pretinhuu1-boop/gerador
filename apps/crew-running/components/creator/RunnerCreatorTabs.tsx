// apps/crew-running/components/creator/RunnerCreatorTabs.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildCrewRenderContext } from '../../data/crewRenderContext';
import {
  DEFAULT_RUNNER_PROFILE,
  type RunnerProfile,
  normalizeRunnerProfile,
} from '../../data/runnerProfile';
import { DEFAULT_RUNNER_TYPE, type RunnerType, getRunnerTypeById } from '../../data/runnerTypes';
import { WARDROBE, type SlotKey } from '../../data/wardrobe';
import {
  type GenerateResult,
  type PhotoInput,
  type SheetVariant,
  type SlotSelection,
  generateCharacterSheet,
  generateDemoCharacterSheet,
} from '../../services/crewService';
import type { SavedCharacter } from '../../services/storage';
import { appendIdentityEvent, getApiKey, getSavedCharacter, saveCharacter } from '../../services/storage';
import {
  clearCreatorDraft,
  getCreatorDraft,
  getCreatorTab,
  saveCreatorDraft,
  setCreatorTab,
  type CreatorTabId,
} from '../../services/launchStorage';
import { audio } from '../../services/audio';
import { getCrewBySlug, type CrewZone } from '../../data/crews';
import { cropVariantFromSheet, removeNeutralBackground } from '../../utils/imageProcessing';
import { ApiKeyModal } from '../ApiKeyModal';
import { CrewBadge } from '../CrewBadge';
import { CreatorTabNav, type CreatorTabDef } from './CreatorTabNav';
import { FotoTab } from './tabs/FotoTab';
import { PerfilTab } from './tabs/PerfilTab';
import { LookTab } from './tabs/LookTab';
import { FichaTab } from './tabs/FichaTab';

type Photo = PhotoInput & { previewUrl: string };

type Props = {
  crew: CrewZone;
  apiKey: string;
  onApiKeyReady: (key: string) => void;
  onSaved: () => void;
};

const TABS: ReadonlyArray<CreatorTabDef<CreatorTabId>> = [
  { id: 'foto', label: 'FOTO' },
  { id: 'perfil', label: 'PERFIL' },
  { id: 'look', label: 'LOOK' },
  { id: 'ficha', label: 'FICHA' },
];

const randomFrom = <Value,>(items: Value[]): Value =>
  items[Math.floor(Math.random() * items.length)];

const hasProfileDraft = (profile: RunnerProfile) =>
  profile.name !== DEFAULT_RUNNER_PROFILE.name ||
  profile.sex !== DEFAULT_RUNNER_PROFILE.sex ||
  profile.heightCm !== DEFAULT_RUNNER_PROFILE.heightCm ||
  profile.weightKg !== DEFAULT_RUNNER_PROFILE.weightKg ||
  profile.personality !== DEFAULT_RUNNER_PROFILE.personality;

export const RunnerCreatorTabs: React.FC<Props> = ({
  crew,
  apiKey,
  onApiKeyReady,
  onSaved,
}) => {
  const [initialDraft] = useState(() => getCreatorDraft());
  const [activeTab, setActiveTab] = useState<CreatorTabId>(() => getCreatorTab() ?? 'look');
  const [photo, setPhoto] = useState<Photo | null>(() => initialDraft?.photo ?? null);
  const [profile, setProfile] = useState<RunnerProfile>(() =>
    initialDraft?.profile ?? DEFAULT_RUNNER_PROFILE,
  );
  const [runnerType, setRunnerType] = useState<RunnerType>(() =>
    getRunnerTypeById(initialDraft?.runnerTypeId),
  );
  const [locked, setLocked] = useState<SlotSelection>(() => initialDraft?.locked ?? {});
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [generatedProfile, setGeneratedProfile] = useState<RunnerProfile | null>(null);
  const [generatedRunnerType, setGeneratedRunnerType] = useState<RunnerType | null>(null);
  const [generatedCrewSlug, setGeneratedCrewSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingVariantIndex, setSavingVariantIndex] = useState<SheetVariant['index'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [mixCount, setMixCount] = useState(0);
  const generationRequestRef = useRef(0);
  const previousCrewSlugRef = useRef(crew.slug);

  const [savedCharacter, setSavedCharacter] = useState<SavedCharacter | null>(() => getSavedCharacter());
  const runnerSaved = Boolean(savedCharacter?.imageDataUrl);
  const crewContext = useMemo(() => buildCrewRenderContext(crew.slug), [crew.slug]);
  const displayCrew = runnerSaved && savedCharacter?.crewSlug
    ? getCrewBySlug(savedCharacter.crewSlug)
    : crew;
  const runnerTypeLabel = getRunnerTypeById(savedCharacter?.runnerTypeId).label;
  const savedAtLabel = savedCharacter?.savedAt
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(savedCharacter.savedAt)
    : 'PENDENTE';
  const passportStyle: React.CSSProperties = {
    '--crew-accent': displayCrew.accent,
    '--crew-secondary': displayCrew.secondary,
    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.82)), url(${displayCrew.assets.banner})`,
  } as React.CSSProperties;

  const normalizedProfile = useMemo(() => normalizeRunnerProfile(profile), [profile]);
  const hasName = Boolean(normalizedProfile.name);
  const hasPhoto = Boolean(photo);
  const canCreate = hasPhoto && hasName;

  const clearResult = () => {
    generationRequestRef.current += 1;
    setResult(null);
    setGeneratedProfile(null);
    setGeneratedRunnerType(null);
    setGeneratedCrewSlug(null);
    setError(null);
    setLoading(false);
    setSavingVariantIndex(null);
  };

  useEffect(() => {
    if (previousCrewSlugRef.current === crew.slug) return;
    previousCrewSlugRef.current = crew.slug;
    setLocked({});
    setMixCount(0);
    clearResult();
  }, [crew.slug]);

  useEffect(() => {
    setSavedCharacter(getSavedCharacter());
  }, [result]);

  useEffect(() => {
    const hasDraft =
      Boolean(photo) ||
      hasProfileDraft(profile) ||
      runnerType.id !== DEFAULT_RUNNER_TYPE.id ||
      Object.keys(locked).length > 0;

    if (!hasDraft) {
      clearCreatorDraft();
      return;
    }

    saveCreatorDraft({
      photo,
      profile,
      runnerTypeId: runnerType.id,
      locked,
    });
  }, [photo, profile, runnerType.id, locked]);

  const switchTab = (next: CreatorTabId) => {
    if (next === activeTab) return;
    setActiveTab(next);
    setCreatorTab(next);
  };

  const handlePhotoChange = (next: Photo | null) => {
    setPhoto(next);
    clearResult();
  };

  const handleProfileChange = (next: RunnerProfile) => {
    setProfile(next);
    clearResult();
  };

  const handleTypeSelect = (next: RunnerType) => {
    setRunnerType(next);
    clearResult();
  };

  const handleToggleSlot = (slot: SlotKey, itemId: string) => {
    setLocked((prev) => {
      const update = { ...prev };
      if (update[slot] === itemId) delete update[slot];
      else update[slot] = itemId;
      return update;
    });
    clearResult();
  };

  const handleRandomize = () => {
    const next: SlotSelection = {
      top: randomFrom(WARDROBE.top).id,
      bottom: randomFrom(WARDROBE.bottom).id,
      shoes: randomFrom(WARDROBE.shoes).id,
      accessory: randomFrom(WARDROBE.accessory).id,
    };
    audio.playSfx('randomize-roll');
    setLocked(next);
    setMixCount((c) => c + 1);
    clearResult();
  };

  const runGen = async (fn: () => Promise<GenerateResult>) => {
    if (!hasPhoto) { setError('Envie uma foto do rosto do runner.'); return; }
    if (!hasName) { setError('Dê um nome ao runner.'); return; }
    const requestId = generationRequestRef.current + 1;
    generationRequestRef.current = requestId;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fn();
      if (generationRequestRef.current !== requestId) return;
      setResult(res);
      setGeneratedProfile(normalizedProfile);
      setGeneratedRunnerType(runnerType);
      setGeneratedCrewSlug(crew.slug);
      switchTab('ficha');
    } catch (err) {
      if (generationRequestRef.current !== requestId) return;
      audio.playSfx('error-buzz');
      setError(err instanceof Error ? err.message : 'Falha ao criar runner.');
    } finally {
      if (generationRequestRef.current === requestId) setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!apiKey) { setNeedsApiKey(true); return; }
    if (!photo) return;
    void runGen(() => generateCharacterSheet({
      apiKey,
      photo: { base64: photo.base64, mimeType: photo.mimeType },
      profile: normalizedProfile,
      runnerType,
      crewContext,
      locked,
    }));
  };

  const handleCreateDemo = () => {
    setNeedsApiKey(false);
    if (!photo) return;
    void runGen(() => generateDemoCharacterSheet({
      photo: { base64: photo.base64, mimeType: photo.mimeType },
      profile: normalizedProfile,
      runnerType,
      crewContext,
      locked,
    }));
  };

  const handleSaveVariant = async (variant: SheetVariant) => {
    if (!result) return;
    setSavingVariantIndex(variant.index);
    setError(null);
    try {
      const croppedImageDataUrl = await cropVariantFromSheet(result.imageDataUrl, variant.index);
      const imageDataUrl = await removeNeutralBackground(croppedImageDataUrl);
      const next: SavedCharacter = {
        imageDataUrl,
        profile: generatedProfile ?? normalizedProfile,
        crewSlug: generatedCrewSlug ?? crew.slug,
        runnerTypeId: (generatedRunnerType ?? runnerType).id,
        renderStyleId: 'street-v2',
        slots: {
          top: variant.slots.top.id,
          bottom: variant.slots.bottom.id,
          shoes: variant.slots.shoes.id,
          accessory: variant.slots.accessory.id,
        },
        savedAt: Date.now(),
        backgroundRemoved: true,
      };
      const saved = saveCharacter(next);
      if (!saved) {
        throw new Error('Sem espaço de armazenamento — libere algum espaço e tente de novo.');
      }
      try {
        appendIdentityEvent({
          kind: 'LOOK_SAVED',
          payload: {
            crewSlug: next.crewSlug,
            runnerTypeId: next.runnerTypeId,
            runnerName: next.profile?.name,
            slots: next.slots,
            savedAt: next.savedAt,
            lookIndex: variant.index,
          },
          timestamp: next.savedAt,
        });
      } catch (eventErr) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[RunnerCreatorTabs] appendIdentityEvent failed:', eventErr);
        }
      }
      audio.playSfx('equip-snap');
      setSavedCharacter(next);
      setResult(null);
      setGeneratedProfile(null);
      setGeneratedRunnerType(null);
      setGeneratedCrewSlug(null);
      setLoading(false);
      setSavingVariantIndex(null);
      clearCreatorDraft();
      switchTab('ficha');
      onSaved();
    } catch (err) {
      audio.playSfx('error-buzz');
      setError(err instanceof Error ? err.message : 'Não foi possível salvar esse look.');
      setSavingVariantIndex(null);
    }
  };

  const handleAdjust = () => {
    switchTab('look');
  };

  return (
    <div
      className="runner-tab"
      style={{
        '--crew-accent': crew.accent,
        '--crew-secondary': crew.secondary,
      } as React.CSSProperties}
    >
      <div className="runner-tab__header">
        <CreatorTabNav tabs={TABS} active={activeTab} onSelect={switchTab} />
        <div className="runner-tab__crew-chip" aria-label={`Crew ${crew.name}`}>
          <CrewBadge crew={crew} size="sm" />
          <span>{crew.zone}</span>
        </div>
      </div>

      {activeTab === 'foto' && (
        <FotoTab photo={photo} onChange={handlePhotoChange} />
      )}
      {activeTab === 'perfil' && (
        <PerfilTab profile={profile} onChange={handleProfileChange} />
      )}
      {activeTab === 'look' && (
        <LookTab
          runnerType={runnerType}
          onSelectType={handleTypeSelect}
          locked={locked}
          onToggleSlot={handleToggleSlot}
          mixCount={mixCount}
          onRandomize={handleRandomize}
          canCreate={canCreate}
          loading={loading}
          onCreate={handleCreate}
        />
      )}
      {activeTab === 'ficha' && (
        <FichaTab
          crew={displayCrew}
          hasPhoto={hasPhoto}
          hasName={hasName}
          runnerSaved={runnerSaved}
          savedCharacter={savedCharacter}
          savedAtLabel={savedAtLabel}
          runnerName={savedCharacter?.profile?.name || 'Runner'}
          runnerTypeLabel={runnerTypeLabel}
          passportStyle={passportStyle}
          result={result}
          loading={loading}
          error={error}
          savingVariantIndex={savingVariantIndex}
          onSaveVariant={handleSaveVariant}
          onAdjust={handleAdjust}
        />
      )}

      {needsApiKey && (
        <ApiKeyModal
          onCancel={() => { onApiKeyReady(getApiKey()); setNeedsApiKey(false); }}
          onDemo={handleCreateDemo}
          onReady={(k) => { onApiKeyReady(k); setNeedsApiKey(false); }}
        />
      )}
    </div>
  );
};
