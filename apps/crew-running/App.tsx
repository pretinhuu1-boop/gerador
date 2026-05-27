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
    return <ApiKeyGate onReady={setApiKeyState} />;
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
    <div className="min-h-screen bg-board">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-8">
        <header className="flex items-start justify-between mb-6 md:mb-8">
          <div>
            <h1 className="logo-stamp text-4xl md:text-6xl text-[var(--cream)] leading-none">
              THE CREW <span className="logo-running">RUNNING</span>
            </h1>
            <p className="chalk text-sm text-[var(--cream-dim)] tracking-[0.35em] mt-2">
              — CUSTOMIZE
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="chalk text-xs text-[var(--cream-dim)] hover:text-[var(--cream)] tracking-widest"
          >
            TROCAR API KEY
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5">
          {/* SIDEBAR ESQUERDO */}
          <div className="bg-paper rounded-lg border-2 border-[var(--line)] p-5 space-y-5">
            <PhotoUpload photo={photo} onChange={setPhoto} />
            <StylePicker selected={style} onSelect={setStyle} />
            <WardrobePicker locked={locked} onToggle={handleToggle} />
          </div>

          {/* PREVIEW DIREITO */}
          <div className="space-y-5">
            <SheetPreview
              result={result}
              loading={loading}
              error={error}
              onSave={handleSaveVariant}
            />

            {saved && (
              <div className="bg-paper rounded-lg border-2 border-[var(--line)] p-5">
                <h3 className="brush text-2xl chalk-underline mb-4">SEU PERSONAGEM</h3>
                <div className="flex gap-4">
                  <img
                    src={saved.imageDataUrl}
                    alt="saved"
                    className="w-28 h-28 object-cover rounded-md border-2 border-[var(--line-strong)]"
                  />
                  <div className="chalk text-xs tracking-wide space-y-1 text-[var(--cream)]">
                    <div>
                      <span className="text-[var(--cream-dim)]">ESTILO: </span>
                      {STYLES.find((s) => s.id === saved.styleId)?.label}
                    </div>
                    {(Object.keys(saved.slots) as SlotKey[]).map((slot) => (
                      <div key={slot}>
                        <span className="text-[var(--cream-dim)]">
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
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <button onClick={handleRandom} className="chalk-btn flex-1">
            RANDOM
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !photo}
            className="solid-btn flex-[2]"
          >
            {loading ? 'GERANDO…' : 'GERAR SHEET 2×2'}
          </button>
        </div>
      </div>
    </div>
  );
};
