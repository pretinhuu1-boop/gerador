import React, { useState } from 'react';
import { PhotoInput } from '../services/crewService';
import { CartridgeButton } from './CartridgeButton';
import { HandUnderline } from './SvgDefs';
import { audio } from '../services/audio';

type Props = {
  photo: (PhotoInput & { previewUrl: string }) | null;
  onChange: (p: (PhotoInput & { previewUrl: string }) | null) => void;
};

const IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const getFileExtension = (fileName: string) => {
  const match = /\.([a-z0-9]+)$/i.exec(fileName);
  return match?.[1]?.toLowerCase() ?? null;
};

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const isImageFileCandidate = (file: File) => {
  if (file.size > MAX_PHOTO_BYTES) return false;
  if (file.type) return file.type.startsWith('image/');
  const extension = getFileExtension(file.name);
  return Boolean(extension && IMAGE_MIME_BY_EXTENSION[extension]);
};

const inferImageMimeType = (file: File, dataUrl: string) => {
  if (file.type.startsWith('image/')) return file.type;

  const dataUrlMime = /^data:([^;,]+)/.exec(dataUrl)?.[1];
  if (dataUrlMime?.startsWith('image/')) return dataUrlMime;

  const extension = getFileExtension(file.name);
  return extension ? IMAGE_MIME_BY_EXTENSION[extension] ?? 'image/jpeg' : 'image/jpeg';
};

const COMPRESS_MAX_DIM = 1024;
const COMPRESS_QUALITY = 0.85;

// Resize + re-encode uploaded photos to keep React state under ~400KB.
// 10MB raw uploads become ~13MB base64 dataURLs otherwise — GC pressure
// on low-RAM mobile. Gemini still receives sufficient fidelity at 1024px.
const compressImage = (dataUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w0, naturalHeight: h0 } = img;
      const ratio = Math.min(COMPRESS_MAX_DIM / w0, COMPRESS_MAX_DIM / h0, 1);
      const w = Math.round(w0 * ratio);
      const h = Math.round(h0 * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', COMPRESS_QUALITY));
    };
    img.onerror = () => reject(new Error('image decode failed'));
    img.src = dataUrl;
  });

export const PhotoUpload: React.FC<Props> = ({ photo, onChange }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!isImageFileCandidate(file)) {
      setError('Use uma imagem do rosto em JPG, PNG ou HEIC (ate 10MB).');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setError('Nao foi possivel ler essa foto. Tente outro arquivo.');
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const compressed = await compressImage(dataUrl);
        const base64 = compressed.split(',')[1];
        if (!base64) {
          setError('Nao foi possivel preparar essa foto.');
          return;
        }
        setError(null);
        audio.playSfx('photo-shutter');
        onChange({ base64, mimeType: 'image/jpeg', previewUrl: compressed });
      } catch {
        setError('Nao foi possivel processar essa foto.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(event.currentTarget.files?.[0]);
    event.currentTarget.value = '';
  };

  const clearPhoto = () => {
    setError(null);
    audio.playSfx('remove-x');
    onChange(null);
  };

  return (
    <div className="runner-creator__block runner-creator__photo-block">
      <div className="runner-creator__block-head">
        <h3 className="section-label"><span className="section-label__index">01 /</span> IDENTIDADE DO RUNNER</h3>
        {photo && (
          <CartridgeButton variant="link" onClick={clearPhoto}>
            REMOVER
          </CartridgeButton>
        )}
      </div>
      <HandUnderline width={110} className="mb-3 mt-1" />

      {photo ? (
        <label className="runner-creator__selfie runner-creator__selfie-action" aria-label="Trocar selfie pelo preview">
          <img src={photo.previewUrl} alt="Selfie enviada" />
          <span>TROCAR SELFIE</span>
          <input accept="image/*" aria-label="Trocar selfie pelo preview" onChange={handleInputChange} type="file" />
        </label>
      ) : (
        <label className="upload-zone runner-creator__selfie-empty" aria-label="Subir foto do rosto pelo card">
          <span>+</span>
          <strong>ROSTO DO RUNNER</strong>
          <input accept="image/*" aria-label="Subir foto do rosto pelo card" onChange={handleInputChange} type="file" />
        </label>
      )}

      <div className="runner-creator__photo-actions" aria-label="Entrada de foto">
        <label className="runner-creator__file-action btn-solid">
          <span>{photo ? 'TIRAR NOVA' : 'TIRAR FOTO'}</span>
          <input accept="image/*" aria-label={photo ? 'Tirar nova foto do rosto' : 'Tirar foto do rosto'} capture="user" onChange={handleInputChange} type="file" />
        </label>
        <label className="runner-creator__file-action btn-chalk">
          <span>{photo ? 'TROCAR ARQUIVO' : 'SUBIR FOTO'}</span>
          <input accept="image/*" aria-label={photo ? 'Trocar arquivo da selfie' : 'Subir foto do rosto'} onChange={handleInputChange} type="file" />
        </label>
      </div>
      {error && <small className="runner-creator__photo-error">{error}</small>}
    </div>
  );
};
