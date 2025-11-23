import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageFile, ScanProfile, CreativeDNA } from '../types';
import { UploadIcon } from './icons';

interface ReferenceUploaderProps {
  onFilesChange: (files: ImageFile[]) => void;
  files: ImageFile[];
  maxFiles: number;
  label: string;
  onScansChange?: (profiles: (ScanProfile | null)[]) => void;
  creativeDNA?: CreativeDNA | null;
}

interface AnalysisState {
    status: 'pending' | 'analyzing' | 'complete';
    text: string;
    result: ScanProfile | null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
}

function selectBestScanProfile(profiles: ScanProfile[], dna: CreativeDNA | null | undefined): ScanProfile | null {
    if (profiles.length === 0) return null;

    if (!dna || !dna.keywords || dna.keywords.length === 0) {
        return profiles[Math.floor(Math.random() * profiles.length)];
    }

    let bestMatch: ScanProfile | null = null;
    let maxScore = -1;

    profiles.forEach(profile => {
        const profileKeywords = profile.keywords || [];
        const score = profileKeywords.reduce((acc, keyword) => {
            return acc + (dna.keywords.includes(keyword) ? 1 : 0);
        }, 0);

        if (score > maxScore) {
            maxScore = score;
            bestMatch = profile;
        }
    });

    return bestMatch || profiles[Math.floor(Math.random() * profiles.length)];
}

const ReferenceUploader: React.FC<ReferenceUploaderProps> = ({ onFilesChange, files, maxFiles, label, onScansChange, creativeDNA }) => {
  const [scanProfiles, setScanProfiles] = useState<ScanProfile[]>([]);
  const [analysisStates, setAnalysisStates] = useState<Map<string, AnalysisState>>(new Map());

  useEffect(() => {
    fetch('./data/scanProfiles.json')
      .then(res => res.json())
      .then(data => setScanProfiles(data.scan_profiles))
      .catch(err => console.error("Failed to load scan profiles", err));
  }, []);
  
  // Propagate scan results changes to parent
  useEffect(() => {
      if (onScansChange) {
          const profiles = files.map(file => analysisStates.get(file.preview)?.result || null);
          onScansChange(profiles);
      }
  }, [analysisStates, files, onScansChange]);

  const startAnalysis = useCallback((filePreviewUrl: string) => {
    if (scanProfiles.length === 0) {
      setAnalysisStates(prev => new Map(prev).set(filePreviewUrl, { status: 'complete', text: '', result: null }));
      return;
    }
    
    const steps = ["Analisando...", "Fotogrametria...", "Nuvem de pontos...", "Malha 3D..."];
    let stepIndex = 0;
    
    const interval = window.setInterval(() => {
      setAnalysisStates(prev => {
        const newStates = new Map<string, AnalysisState>(prev);
        const currentState = newStates.get(filePreviewUrl);
        if(currentState && currentState.status === 'analyzing') {
            newStates.set(filePreviewUrl, { ...currentState, text: steps[stepIndex % steps.length] });
        }
        return newStates;
      });
      stepIndex++;
    }, 500);

    setTimeout(() => {
        clearInterval(interval);
        const bestProfile = selectBestScanProfile(scanProfiles, creativeDNA);
        setAnalysisStates(prev => {
            const newStates = new Map<string, AnalysisState>(prev);
            const existingState = newStates.get(filePreviewUrl);
            if (existingState?.status === 'analyzing') {
              newStates.set(filePreviewUrl, { status: 'complete', text: '', result: bestProfile });
            }
            return newStates;
        });
    }, 2800);
  }, [scanProfiles, creativeDNA]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const supportedFiles = acceptedFiles.filter(file => 
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (acceptedFiles.length > 0 && supportedFiles.length < acceptedFiles.length) {
        alert('Alguns arquivos não são suportados (use JPG, PNG, WEBP) e foram ignorados.');
    }

    const filesToProcess = supportedFiles.slice(0, maxFiles - files.length);
    if(filesToProcess.length === 0) return;

    const newFilesPromises = filesToProcess.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
        preview: URL.createObjectURL(file),
      };
    });

    const newFiles = await Promise.all(newFilesPromises);

    setAnalysisStates(prev => {
      const newStates = new Map(prev);
      newFiles.forEach(file => {
          newStates.set(file.preview, { status: 'analyzing', text: 'Iniciando...', result: null });
          startAnalysis(file.preview);
      });
      return newStates;
    });

    onFilesChange([...files, ...newFiles]);

  }, [files, maxFiles, onFilesChange, startAnalysis]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/png': ['.png'],
        'image/webp': ['.webp']
    },
    multiple: true,
  });
  
  const removeFile = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newFiles = [...files];
    const removedFile = newFiles.splice(index, 1)[0];
    
    setAnalysisStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(removedFile.preview);
      return newStates;
    });

    URL.revokeObjectURL(removedFile.preview);
    onFilesChange(newFiles);
  };

  return (
    <div className="w-full">
      <div {...getRootProps()} className={`relative w-full min-h-32 p-4 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-[#7D4FFF] bg-white/10' : 'border-white/20 hover:border-white/40'} ${files.length >= maxFiles ? 'cursor-not-allowed opacity-60' : ''}`}>
        <input {...getInputProps()} disabled={files.length >= maxFiles} />
        <div className="flex flex-col items-center text-white/60">
            <UploadIcon className="w-8 h-8 mb-2" />
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs">Clique ou arraste ({files.length}/{maxFiles})</p>
        </div>
      </div>
      {files.length > 0 && (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {files.map((file, index) => {
                  const state = analysisStates.get(file.preview);
                  const isAnalyzing = state?.status === 'analyzing';
                  const result = state?.result;

                  return (
                    <div key={index} className="relative aspect-square">
                        <img src={file.preview} alt={`Preview ${index}`} className={`w-full h-full object-cover rounded-md transition-all duration-300 ${isAnalyzing ? 'filter blur-sm brightness-75' : ''}`} />
                        
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs p-1 rounded-md transition-opacity duration-300">
                             <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white mb-1"></div>
                             <p className="font-semibold text-center">{state.text}</p>
                          </div>
                        )}

                        {result && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[10px] p-0.5 text-center rounded-b-md">
                              <p className="font-bold truncate" title={result.description}>Scan: {result.name}</p>
                          </div>
                        )}

                        <button onClick={(e) => removeFile(e, index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10">&times;</button>
                    </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};

export default ReferenceUploader;