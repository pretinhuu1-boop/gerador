import React, { useEffect, useState } from 'react';
import { WARDROBE, SlotKey } from './data/wardrobe';
import { STYLES } from './data/styles';
import {
  GenerateResult,
  PhotoInput,
  SheetVariant,
  SlotSelection,
  generateCharacterSheet,
} from './services/crewService';
import {
  getApiKey,
  clearApiKey,
  saveCharacter,
  getSavedCharacter,
  SavedCharacter,
} from './services/storage';
import { ApiKeyGate } from './components/ApiKeyGate';
import { PhotoUpload } from './components/PhotoUpload';
import { StylePicker } from './components/StylePicker';
import { WardrobePicker } from './components/WardrobePicker';
import { SheetPreview } from './components/SheetPreview';
import { SvgDefs, HandUnderline } from './components/SvgDefs';

type Photo = PhotoInput & { previewUrl: string };

export const App: React.FC = () => {
  const [apiKey, setApiKeyState] = useState<string>(() => getApiKey());
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [style, setStyle] = useState(STYLES[0]);
  const [locked, setLocked] = useState<SlotSelection>({});
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedCharacter | null>(() => getSavedCharacter());

  useEffect(() => {
    if (!apiKey) setApiKeyState(getApiKey());
  }, [apiKey]);

  if (!apiKey) {
    return (
      <>
        <SvgDefs />
        <ApiKeyGate onReady={setApiKeyState} />
      </>
    );
  }

  const handleToggle = (slot: SlotKey, itemId: string) => {
    setLocked((prev) => {
      const next = { ...prev };
      if (next[slot] === itemId) delete next[slot];
      else next[slot] = itemId;
      return next;
    });
  };

  const handleRandom = () => setLocked({});

  const handleGenerate = async () => {
    if (!photo) {
      setError('Envie uma selfie primeiro.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateCharacterSheet({
        apiKey,
        photo: { base64: photo.base64, mimeType: photo.mimeType },
        style,
        locked,
      });
      setResult(res);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao gerar.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVariant = (variant: SheetVariant) => {
    if (!result) return;
    const next: SavedCharacter = {
      imageDataUrl: result.imageDataUrl,
      styleId: style.id,
      slots: {
        hair: variant.slots.hair.id,
        top: variant.slots.top.id,
        bottom: variant.slots.bottom.id,
        shoes: variant.slots.shoes.id,
      },
      savedAt: Date.now(),
    };
    saveCharacter(next);
    setSaved(next);
  };

  const handleSignOut = () => {
    clearApiKey();
    setApiKeyState('');
  };

  return (
    <div className="app-shell min-h-screen">
      <SvgDefs />
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-10">
        <header className="flex items-start justify-between mb-6">
          <div>
            <div className="brand-the-crew">THE CREW</div>
            <div className="brand-running">RUNNING</div>
            <h1 className="title-customize mt-3">CUSTOMIZE</h1>
            <HandUnderline width={420} thickness={6} className="mt-2" />
          </div>
          <button onClick={handleSignOut} className="btn-link">
            TROCAR API KEY
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 mt-8">
          {/* LEFT — controls */}
          <div className="space-y-7">
            <PhotoUpload photo={photo} onChange={setPhoto} />
            <StylePicker selected={style} onSelect={setStyle} />
            <WardrobePicker locked={locked} onToggle={handleToggle} />
          </div>

          {/* RIGHT — preview */}
          <div className="space-y-6">
            <SheetPreview
              result={result}
              loading={loading}
              error={error}
              onSave={handleSaveVariant}
            />

            {saved && (
              <div className="tile p-5">
                <h3 className="section-label mb-4">SEU PERSONAGEM</h3>
                <div className="flex gap-4">
                  <img
                    src={saved.imageDataUrl}
                    alt="saved"
                    className="w-28 h-28 object-cover rounded-md border-[3px] border-[var(--white)]"
                  />
                  <div className="t-brush text-sm space-y-1 text-[var(--bone)]">
                    <div>
                      <span className="text-[var(--gray-text)]">ESTILO: </span>
                      {STYLES.find((s) => s.id === saved.styleId)?.label}
                    </div>
                    {(Object.keys(saved.slots) as SlotKey[]).map((slot) => (
                      <div key={slot}>
                        <span className="text-[var(--gray-text)]">
                          {slot.toUpperCase()}:{' '}
                        </span>
                        {WARDROBE[slot].find((it) => it.id === saved.slots[slot])?.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button onClick={handleRandom} className="btn-chalk flex-1">
            RANDOM
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !photo}
            className="btn-solid flex-[2]"
          >
            {loading ? 'GERANDO…' : 'GERAR'}
          </button>
        </div>
      </div>
    </div>
  );
};
