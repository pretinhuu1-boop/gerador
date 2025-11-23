// components/AudioInput.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AudioFile } from '../types';
import { UploadIcon } from './icons'; // Assuming you have a generic upload icon

interface AudioInputProps {
  onAudioSelect: (audio: AudioFile | null) => void;
  audio: AudioFile | null;
  label: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
}

const AudioInput: React.FC<AudioInputProps> = ({ onAudioSelect, audio, label }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const supportedFiles = acceptedFiles.filter(file => 
        ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'].includes(file.type)
    );

    if (supportedFiles.length > 0) {
      const file = supportedFiles[0];
      const base64 = await fileToBase64(file);
      const newAudio: AudioFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
      };
      onAudioSelect(newAudio);
    } else if (acceptedFiles.length > 0) {
        alert('Tipo de arquivo não suportado. Por favor, use arquivos MP3, WAV ou OGG.');
    }
  }, [onAudioSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'audio/mpeg': ['.mp3'],
        'audio/wav': ['.wav'],
        'audio/ogg': ['.ogg'],
    },
    multiple: false,
  });

  const removeAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAudioSelect(null);
  }

  return (
    <div {...getRootProps()} className={`relative w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-[#7D4FFF] bg-white/10' : 'border-white/20 hover:border-white/40'}`}>
      <input {...getInputProps()} />
      {audio ? (
        <div className="p-2 text-center">
            <p className="text-sm font-semibold text-white truncate" title={audio.name}>{audio.name}</p>
            <p className="text-xs text-white/60">{(audio.size / (1024 * 1024)).toFixed(2)} MB</p>
            <button onClick={removeAudio} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10">&times;</button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-white/60">
          <UploadIcon className="w-6 h-6 mb-1" />
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs">Clique ou arraste o áudio</p>
        </div>
      )}
    </div>
  );
};

export default AudioInput;
