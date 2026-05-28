import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildCrewRenderContext } from '../data/crewRenderContext';
import {
  BODY_REFERENCE,
  DEFAULT_RUNNER_PROFILE,
  RUNNER_SEX_OPTIONS,
  RunnerProfile,
  RunnerSex,
  normalizeRunnerProfile,
} from '../data/runnerProfile';
import { DEFAULT_RUNNER_TYPE, RunnerType } from '../data/runnerTypes';
import { WARDROBE, type SlotKey } from '../data/wardrobe';
import {
  GenerateResult,
  PhotoInput,
  SheetVariant,
  SlotSelection,
  generateCharacterSheet,
  generateDemoCharacterSheet,
} from '../services/crewService';
import type { SavedCharacter } from '../services/storage';
import { appendIdentityEvent, getApiKey, saveCharacter, setApiKey } from '../services/storage';
import { CartridgeButton } from './CartridgeButton';
import { CrewBadge } from './CrewBadge';
import { HandUnderline } from './SvgDefs';
import { PhotoUpload } from './PhotoUpload';
import { RunnerTypePicker } from './RunnerTypePicker';
import { SheetPreview } from './SheetPreview';
import { WardrobePicker } from './WardrobePicker';
import { audio } from '../services/audio';

type Photo = PhotoInput & { previewUrl: string };

const loadImage = (imageDataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler esse look.'));
    image.src = imageDataUrl;
  });

const cropVariantFromSheet = (imageDataUrl: string, variantIndex: SheetVariant['index']) =>
  new Promise<string>((resolve, reject) => {
    loadImage(imageDataUrl)
      .then((image) => {
        const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
        const cellSize = sourceSize / 2;
        const trim = cellSize * 0.035;
        const cropSize = cellSize - trim * 2;
        const column = variantIndex % 2;
        const row = Math.floor(variantIndex / 2);
        const sourceX = (image.naturalWidth - sourceSize) / 2 + column * cellSize + trim;
        const sourceY = (image.naturalHeight - sourceSize) / 2 + row * cellSize + trim;
        const outputSize = Math.floor(cellSize);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context || outputSize <= 0 || cropSize <= 0) {
          reject(new Error('Não foi possível salvar esse look.'));
          return;
        }

        canvas.width = outputSize;
        canvas.height = outputSize;
        context.drawImage(
          image,
          sourceX,
          sourceY,
          cropSize,
          cropSize,
          0,
          0,
          outputSize,
          outputSize,
        );
        resolve(canvas.toDataURL('image/png'));
      })
      .catch(reject);
  });

const getColorDistance = (
  data: Uint8ClampedArray,
  index: number,
  background: { r: number; g: number; b: number },
) => {
  const red = data[index] - background.r;
  const green = data[index + 1] - background.g;
  const blue = data[index + 2] - background.b;
  return Math.sqrt(red * red + green * green + blue * blue);
};

const sampleBackground = (data: Uint8ClampedArray, width: number, height: number) => {
  const sample = Math.max(4, Math.floor(Math.min(width, height) * 0.04));
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  const addPixel = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    count += 1;
  };

  for (let y = 0; y < sample; y += 1) {
    for (let x = 0; x < sample; x += 1) {
      addPixel(x, y);
      addPixel(width - 1 - x, y);
      addPixel(x, height - 1 - y);
      addPixel(width - 1 - x, height - 1 - y);
    }
  }

  return {
    r: red / count,
    g: green / count,
    b: blue / count,
  };
};

const removeNeutralBackground = (imageDataUrl: string) =>
  new Promise<string>((resolve, reject) => {
    loadImage(imageDataUrl)
      .then((image) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          reject(new Error('Não foi possível limpar o fundo.'));
          return;
        }

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);

        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = frame;
        const background = sampleBackground(data, width, height);
        const threshold = 54;
        const featherThreshold = 86;
        const visited = new Uint8Array(width * height);
        const queue = new Uint32Array(width * height);
        let head = 0;
        let tail = 0;

        const enqueue = (x: number, y: number) => {
          if (x < 0 || x >= width || y < 0 || y >= height) return;

          const pixelIndex = y * width + x;
          if (visited[pixelIndex]) return;
          visited[pixelIndex] = 1;

          const dataIndex = pixelIndex * 4;
          if (data[dataIndex + 3] > 0 && getColorDistance(data, dataIndex, background) <= threshold) {
            queue[tail] = pixelIndex;
            tail += 1;
          }
        };

        for (let x = 0; x < width; x += 1) {
          enqueue(x, 0);
          enqueue(x, height - 1);
        }

        for (let y = 0; y < height; y += 1) {
          enqueue(0, y);
          enqueue(width - 1, y);
        }

        while (head < tail) {
          const pixelIndex = queue[head];
          head += 1;
          const dataIndex = pixelIndex * 4;
          const x = pixelIndex % width;
          const y = Math.floor(pixelIndex / width);

          data[dataIndex + 3] = 0;
          enqueue(x + 1, y);
          enqueue(x - 1, y);
          enqueue(x, y + 1);
          enqueue(x, y - 1);
        }

        for (let y = 1; y < height - 1; y += 1) {
          for (let x = 1; x < width - 1; x += 1) {
            const pixelIndex = y * width + x;
            const dataIndex = pixelIndex * 4;
            if (data[dataIndex + 3] === 0) continue;

            const hasTransparentNeighbor =
              data[((y - 1) * width + x) * 4 + 3] === 0 ||
              data[((y + 1) * width + x) * 4 + 3] === 0 ||
              data[(y * width + x - 1) * 4 + 3] === 0 ||
              data[(y * width + x + 1) * 4 + 3] === 0;

            if (!hasTransparentNeighbor) continue;

            const distance = getColorDistance(data, dataIndex, background);
            if (distance <= featherThreshold) {
              const alphaRatio = Math.max(0, (distance - threshold) / (featherThreshold - threshold));
              data[dataIndex + 3] = Math.round(data[dataIndex + 3] * alphaRatio);
            }
          }
        }

        context.putImageData(frame, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      })
      .catch(reject);
  });

type Props = {
  apiKey: string;
  selectedCrewSlug: string;
  onApiKeyReady: (key: string) => void;
  onBackToMenu: () => void;
  onRunnerCustomized: () => void;
};

const ApiKeyModal: React.FC<{
  onCancel: () => void;
  onDemo: () => void;
  onReady: (key: string) => void;
}> = ({ onCancel, onDemo, onReady }) => {
  const [value, setValue] = useState('');

  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setApiKey(trimmed);
    onReady(trimmed);
  };

  return (
    <div className="api-key-modal" role="dialog" aria-modal="true" aria-label="Ajuste do estúdio">
      <div className="api-key-modal__panel">
        <span>ESTÚDIO INTERNO</span>
        <h2>Credencial local</h2>
        <p>Use a chave real ou rode uma sheet local para QA do fluxo.</p>
        <div className="input-wrap">
          <input
            autoFocus
            className="input-board"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSave()}
            placeholder="credencial"
            type="password"
            value={value}
          />
        </div>
        <div className="api-key-modal__actions">
          <CartridgeButton variant="chalk" onClick={onCancel}>
            VOLTAR
          </CartridgeButton>
          <CartridgeButton variant="chalk" onClick={onDemo}>
            TESTAR LOCAL
          </CartridgeButton>
          <CartridgeButton variant="solid" disabled={!value.trim()} onClick={handleSave}>
            SALVAR
          </CartridgeButton>
        </div>
        <small className="api-key-modal__hint">TESTE LOCAL NAO CHAMA GEMINI</small>
      </div>
    </div>
  );
};

const randomFrom = <Value,>(items: Value[]): Value =>
  items[Math.floor(Math.random() * items.length)];

const RunnerProfileForm: React.FC<{
  profile: RunnerProfile;
  onChange: (profile: RunnerProfile) => void;
}> = ({ profile, onChange }) => {
  const updateProfile = <Key extends keyof RunnerProfile>(key: Key, value: RunnerProfile[Key]) => {
    onChange({ ...profile, [key]: value });
  };
  const updateNumber = (key: 'heightCm' | 'weightKg', value: string) => {
    const parsed = Number.parseInt(value, 10);
    updateProfile(key, Number.isFinite(parsed) ? parsed : DEFAULT_RUNNER_PROFILE[key]);
  };

  return (
    <div className="runner-creator__block runner-creator__profile">
      <div className="runner-creator__block-head">
        <h3 className="section-label"><span className="section-label__index">02 /</span> FICHA DO RUNNER</h3>
        <span>base {BODY_REFERENCE.heightCm}cm / {BODY_REFERENCE.weightKg}kg</span>
      </div>
      <HandUnderline width={190} className="mb-4 mt-1" />

      <label className="runner-creator__field">
        <span>NOME</span>
        <input
          autoComplete="off"
          maxLength={24}
          onChange={(event) => updateProfile('name', event.currentTarget.value)}
          placeholder="nome do runner"
          type="text"
          value={profile.name}
        />
      </label>

      <div className="runner-creator__field">
        <span>SEXO</span>
        <div className="runner-creator__sex-options" role="group" aria-label="Sexo do runner">
          {RUNNER_SEX_OPTIONS.map((option) => (
            <button
              className={profile.sex === option.value ? 'is-selected' : ''}
              key={option.value}
              onClick={() => updateProfile('sex', option.value as RunnerSex)}
              aria-pressed={profile.sex === option.value}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="runner-creator__measure-grid">
        <label className="runner-creator__field">
          <span>ALTURA</span>
          <input
            inputMode="numeric"
            max={230}
            min={120}
            onChange={(event) => updateNumber('heightCm', event.currentTarget.value)}
            type="number"
            value={profile.heightCm}
          />
          <small>CM</small>
        </label>
        <label className="runner-creator__field">
          <span>PESO</span>
          <input
            inputMode="numeric"
            max={220}
            min={35}
            onChange={(event) => updateNumber('weightKg', event.currentTarget.value)}
            type="number"
            value={profile.weightKg}
          />
          <small>KG</small>
        </label>
      </div>

      <label className="runner-creator__field">
        <span>PERSONALIDADE</span>
        <textarea
          maxLength={120}
          onChange={(event) => updateProfile('personality', event.currentTarget.value)}
          placeholder="calmo, competitivo, caótico..."
          rows={3}
          value={profile.personality}
        />
      </label>

      <div className="runner-creator__body-reference" aria-label="Referência de escala">
        <div>
          <span>BASE</span>
          <strong>{BODY_REFERENCE.heightCm}CM / {BODY_REFERENCE.weightKg}KG</strong>
        </div>
        <div>
          <span>RUNNER</span>
          <strong>{profile.heightCm || BODY_REFERENCE.heightCm}CM / {profile.weightKg || BODY_REFERENCE.weightKg}KG</strong>
        </div>
      </div>
    </div>
  );
};

const CrewLockPanel: React.FC<{
  crewContext: ReturnType<typeof buildCrewRenderContext>;
}> = ({ crewContext }) => (
  <div className="runner-creator__block runner-creator__crew-lock">
    <div className="runner-creator__block-head">
      <h3 className="section-label"><span className="section-label__index">03 /</span> CREW VISUAL</h3>
      <span>travado pelo onboarding</span>
    </div>
    <HandUnderline width={180} className="mb-4 mt-1" />

    <div className="runner-creator__crew-card">
      <CrewBadge crew={crewContext.slug} size="md" />
      <div>
        <span>{crewContext.zone}</span>
        <strong>{crewContext.name}</strong>
        <p>{crewContext.mission}</p>
      </div>
    </div>
    <div className="runner-creator__crew-swatches" aria-label="Paleta da crew">
      <span style={{ background: crewContext.accent }} />
      <span style={{ background: crewContext.secondary }} />
      <small>street-v2 fixo</small>
    </div>
  </div>
);

export const CustomizeScreen: React.FC<Props> = ({
  apiKey,
  selectedCrewSlug,
  onApiKeyReady,
  onBackToMenu,
  onRunnerCustomized,
}) => {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [profile, setProfile] = useState<RunnerProfile>(DEFAULT_RUNNER_PROFILE);
  const [runnerType, setRunnerType] = useState<RunnerType>(DEFAULT_RUNNER_TYPE);
  const [locked, setLocked] = useState<SlotSelection>({});
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
  const crewContext = useMemo(
    () => buildCrewRenderContext(selectedCrewSlug),
    [selectedCrewSlug],
  );

  useEffect(() => {
    void audio.crossfadeAmbient('locker-room');
  }, []);

  const clearGeneratedResult = () => {
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
    setLocked({});
    setMixCount(0);
    clearGeneratedResult();
  }, [crewContext.slug]);

  const handlePhotoChange = (nextPhoto: Photo | null) => {
    setPhoto(nextPhoto);
    clearGeneratedResult();
  };

  const handleProfileChange = (nextProfile: RunnerProfile) => {
    setProfile(nextProfile);
    clearGeneratedResult();
  };

  const handleRunnerTypeSelect = (nextType: RunnerType) => {
    setRunnerType(nextType);
    clearGeneratedResult();
  };

  const handleToggle = (slot: SlotKey, itemId: string) => {
    setLocked((prev) => {
      const next = { ...prev };
      if (next[slot] === itemId) delete next[slot];
      else next[slot] = itemId;
      return next;
    });
    clearGeneratedResult();
  };

  const handleRandom = () => {
    const nextLocked: SlotSelection = {
      top: randomFrom(WARDROBE.top).id,
      bottom: randomFrom(WARDROBE.bottom).id,
      shoes: randomFrom(WARDROBE.shoes).id,
      accessory: randomFrom(WARDROBE.accessory).id,
    };
    audio.playSfx('randomize-roll');
    setLocked(nextLocked);
    setMixCount((count) => count + 1);
    clearGeneratedResult();
  };

  const handleGenerate = async () => {
    const normalizedProfile = normalizeRunnerProfile(profile);

    if (!photo) {
      setError('Envie uma foto do rosto do runner.');
      return;
    }

    if (!normalizedProfile.name) {
      setError('Dê um nome ao runner.');
      return;
    }

    if (!apiKey) {
      setError(null);
      setNeedsApiKey(true);
      return;
    }

    const requestId = generationRequestRef.current + 1;
    generationRequestRef.current = requestId;
    setLoading(true);
    setError(null);
    setResult(null);
    setGeneratedProfile(null);
    setGeneratedRunnerType(null);
    setGeneratedCrewSlug(null);
    try {
      const res = await generateCharacterSheet({
        apiKey,
        photo: { base64: photo.base64, mimeType: photo.mimeType },
        profile: normalizedProfile,
        runnerType,
        crewContext,
        locked,
      });
      if (generationRequestRef.current !== requestId) return;
      setResult(res);
      setGeneratedProfile(normalizedProfile);
      setGeneratedRunnerType(runnerType);
      setGeneratedCrewSlug(crewContext.slug);
    } catch (error) {
      if (generationRequestRef.current !== requestId) return;
      audio.playSfx('error-buzz');
      setError(error instanceof Error ? error.message : 'Falha ao criar runner.');
    } finally {
      if (generationRequestRef.current === requestId) setLoading(false);
    }
  };

  const handleGenerateDemo = async () => {
    const normalizedProfile = normalizeRunnerProfile(profile);

    setNeedsApiKey(false);

    if (!photo) {
      setError('Envie uma foto do rosto do runner.');
      return;
    }

    if (!normalizedProfile.name) {
      setError('Dê um nome ao runner.');
      return;
    }

    const requestId = generationRequestRef.current + 1;
    generationRequestRef.current = requestId;
    setLoading(true);
    setError(null);
    setResult(null);
    setGeneratedProfile(null);
    setGeneratedRunnerType(null);
    setGeneratedCrewSlug(null);

    try {
      const res = await generateDemoCharacterSheet({
        photo: { base64: photo.base64, mimeType: photo.mimeType },
        profile: normalizedProfile,
        runnerType,
        crewContext,
        locked,
      });
      if (generationRequestRef.current !== requestId) return;
      setResult(res);
      setGeneratedProfile(normalizedProfile);
      setGeneratedRunnerType(runnerType);
      setGeneratedCrewSlug(crewContext.slug);
    } catch (error) {
      if (generationRequestRef.current !== requestId) return;
      audio.playSfx('error-buzz');
      setError(error instanceof Error ? error.message : 'Falha ao criar runner local.');
    } finally {
      if (generationRequestRef.current === requestId) setLoading(false);
    }
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
        profile: generatedProfile ?? normalizeRunnerProfile(profile),
        crewSlug: generatedCrewSlug ?? crewContext.slug,
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
      saveCharacter(next);
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
      audio.playSfx('equip-snap');
      onRunnerCustomized();
    } catch (error) {
      audio.playSfx('error-buzz');
      setError(error instanceof Error ? error.message : 'Não foi possível salvar esse look.');
      setSavingVariantIndex(null);
    }
  };

  const handleApiKeyReady = (key: string) => {
    onApiKeyReady(key);
    setNeedsApiKey(false);
  };

  const handleApiKeyCancel = () => {
    onApiKeyReady(getApiKey());
    setNeedsApiKey(false);
  };

  const handleOpenStudioSettings = () => {
    setNeedsApiKey(true);
  };

  const normalizedCurrentProfile = normalizeRunnerProfile(profile);
  const hasIdentityReference = Boolean(photo);
  const canCreateRunner = hasIdentityReference && Boolean(normalizedCurrentProfile.name);
  const sectionsTotal = 4;
  const sectionsComplete = [
    hasIdentityReference,
    Boolean(normalizedCurrentProfile.name),
    Boolean(selectedCrewSlug),
    Boolean(runnerType),
  ].filter(Boolean).length;
  const createRunnerLabel = loading
    ? 'CREW STUDIO...'
    : canCreateRunner
      ? 'CRIAR RUNNER'
      : `CRIAR RUNNER · ${sectionsComplete}/${sectionsTotal}`;

  return (
    <div className="app-shell customize-screen runner-creator game-screen min-h-screen">
      <div className="runner-creator__shell">
        <header className="runner-creator__header">
          <CartridgeButton variant="link" className="runner-creator__back" onClick={onBackToMenu}>
            VOLTAR AO SINAL
          </CartridgeButton>
          <div className="runner-creator__masthead">
            <div className="brand-the-crew">THE CREW</div>
            <div className="brand-running">RUNNING</div>
            <h1 className="title-customize mt-3">CRIE SEU RUNNER</h1>
            <HandUnderline width={520} thickness={6} className="mt-2" />
            <div className="runner-creator__status-strip" aria-label="Estado do runner">
              <span className="signal-chip">RUNNER ID</span>
              <span className="signal-chip">{crewContext.name}</span>
              <span className="signal-chip">IDENTIDADE</span>
            </div>
          </div>
          <CartridgeButton
            variant="link"
            className="runner-creator__dev"
            onClick={handleOpenStudioSettings}
            aria-label="Abrir ajuste do estúdio"
          >
            {apiKey ? 'AJUSTE' : 'ESTÚDIO'}
          </CartridgeButton>
        </header>

        <main className="runner-creator__layout">
          <section className="runner-creator__controls mission-ticket" aria-label="Equipamentos">
            <PhotoUpload
              photo={photo}
              onChange={handlePhotoChange}
            />
            <RunnerProfileForm profile={profile} onChange={handleProfileChange} />
            <CrewLockPanel crewContext={crewContext} />
            <RunnerTypePicker selected={runnerType} onSelect={handleRunnerTypeSelect} />
            <WardrobePicker locked={locked} onToggle={handleToggle} />
          </section>

          <section className="runner-creator__stage" aria-label="Runner">
            <div className="runner-creator__action-bar" aria-label="Comandos do runner">
              <div className="runner-creator__mix-control">
                <CartridgeButton
                  variant="chalk"
                  className="game-command"
                  onClick={handleRandom}
                  aria-label="Misturar equipamento"
                >
                  MISTURAR LOOK
                </CartridgeButton>
                <div className="runner-creator__mix-stamp" aria-live="polite">
                  {mixCount > 0 ? `LOOK ${String(mixCount).padStart(2, '0')} MISTURADO` : 'TOQUE PARA VARIAR EQUIPAMENTO'}
                </div>
              </div>
              <CartridgeButton
                variant="solid"
                className={`game-command game-command--primary ${loading ? 'is-loading' : ''}`}
                onClick={handleGenerate}
                disabled={!canCreateRunner}
                loading={loading}
              >
                {createRunnerLabel}
              </CartridgeButton>
            </div>
            <SheetPreview
              error={error}
              loading={loading}
              onSave={handleSaveVariant}
              result={result}
              savingVariantIndex={savingVariantIndex}
              partial={{
                photo: photo?.previewUrl,
                name: profile.name.trim() || undefined,
                crewSlug: selectedCrewSlug,
                runnerTypeLabel: runnerType.label,
              }}
            />
          </section>
        </main>
      </div>

      {needsApiKey && (
        <ApiKeyModal
          onCancel={handleApiKeyCancel}
          onDemo={handleGenerateDemo}
          onReady={handleApiKeyReady}
        />
      )}
    </div>
  );
};
