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
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="brush text-2xl chalk-underline">SUA FOTO</h3>
        {photo && (
          <button
            onClick={() => onChange(null)}
            className="chalk text-xs text-[var(--cream-dim)] hover:text-[var(--cream)] tracking-widest"
          >
            REMOVER
          </button>
        )}
      </div>
      {photo ? (
        <img
          src={photo.previewUrl}
          alt="upload"
          className="w-full aspect-square object-cover rounded-md border-2 border-[var(--line-strong)]"
        />
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square rounded-md border-2 border-dashed border-[var(--line)] flex flex-col items-center justify-center text-[var(--cream-dim)] hover:border-[var(--accent)] hover:text-[var(--cream)] transition"
        >
          <span className="text-4xl mb-1">+</span>
          <span className="chalk text-xs tracking-widest">ENVIAR SELFIE</span>
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
