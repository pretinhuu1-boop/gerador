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

  const handleRandom = () => {
    setLocked({});
  };

  const handleGenerate = async () => {
    if (!photo) {
      setError('Envie uma foto primeiro.');
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
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="display-font text-3xl md:text-4xl tracking-wider">
            THE CREW <span className="text-[var(--accent)]">RUNNING</span>
          </h1>
          <p className="text-xs text-[var(--muted)] uppercase tracking-widest">Customize</p>
        </div>
        <button onClick={handleSignOut} className="text-xs text-[var(--muted)] hover:text-white">
          trocar API key
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4">
        <div className="space-y-4">
          <PhotoUpload photo={photo} onChange={setPhoto} />
          <StylePicker selected={style} onSelect={setStyle} />
          <WardrobePicker locked={locked} onToggle={handleToggle} />

          <div className="flex gap-2">
            <button onClick={handleRandom} className="btn-ghost flex-1 py-3 rounded-md text-sm">
              RANDOM
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || !photo}
              className="btn-primary flex-[2] py-3 rounded-md"
            >
              {loading ? 'GERANDO…' : 'GERAR SHEET 2×2'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <SheetPreview
            result={result}
            loading={loading}
            error={error}
            onSave={handleSaveVariant}
          />

          {saved && (
            <div className="slot-card p-4">
              <h3 className="display-font text-xl tracking-wider text-[var(--accent)] mb-3">
                SEU PERSONAGEM
              </h3>
              <div className="flex gap-3">
                <img
                  src={saved.imageDataUrl}
                  alt="saved"
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-[var(--muted)]">estilo: </span>
                    {STYLES.find((s) => s.id === saved.styleId)?.label}
                  </div>
                  {(Object.keys(saved.slots) as SlotKey[]).map((slot) => (
                    <div key={slot}>
                      <span className="text-[var(--muted)]">{slot}: </span>
                      {WARDROBE[slot].find((it) => it.id === saved.slots[slot])?.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
