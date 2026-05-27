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
    <div className="slot-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="display-font text-xl tracking-wider text-[var(--accent)]">SUA FOTO</h3>
        {photo && (
          <button
            onClick={() => onChange(null)}
            className="text-xs text-[var(--muted)] hover:text-white"
          >
            remover
          </button>
        )}
      </div>
      {photo ? (
        <img
          src={photo.previewUrl}
          alt="upload"
          className="w-full aspect-square object-cover rounded-md"
        />
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-square rounded-md border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--muted)] hover:border-[var(--accent)] hover:text-white transition"
        >
          <span className="text-3xl mb-2">+</span>
          <span className="text-sm">enviar selfie</span>
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
