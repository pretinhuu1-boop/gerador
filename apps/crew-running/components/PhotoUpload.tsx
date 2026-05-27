import React, { useRef } from 'react';
import { PhotoInput } from '../services/crewService';

type Props = {
  photo: (PhotoInput & { previewUrl: string }) | null;
  onChange: (p: (PhotoInput & { previewUrl: string }) | null) => void;
};

export const PhotoUpload: React.FC<Props> = ({ photo, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      onChange({ base64, mimeType: file.type, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <h3 className="section-label">SUA FOTO</h3>
        {photo && (
          <button onClick={() => onChange(null)} className="btn-link">
            REMOVER
          </button>
        )}
      </div>
      {photo ? (
        <img
          src={photo.previewUrl}
          alt="upload"
          className="w-full aspect-square object-cover rounded-md border-[3px] border-[var(--white)]"
        />
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="tile w-full aspect-square flex flex-col items-center justify-center text-[var(--bone-soft)]"
          style={{ borderStyle: 'dashed', borderWidth: 3, borderColor: 'var(--gray-line)' }}
        >
          <span className="text-5xl mb-2 t-bowlby text-[var(--white)]">+</span>
          <span className="t-brush text-sm tracking-widest text-[var(--bone-soft)]">
            ENVIAR SELFIE
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
};
