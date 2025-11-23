import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageFile, ScanProfile, CreativeDNA } from '../types';
import { UploadIcon } from './icons';

interface ImageInputProps {
  onImageSelect: (image: ImageFile | null) => void;
  image: ImageFile | null;
  label: string;
  onScanComplete?: (profile: ScanProfile | null) => void;
  creativeDNA?: CreativeDNA | null;
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


const ImageInput: React.FC<ImageInputProps> = ({ onImageSelect, image, label, onScanComplete, creativeDNA }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<ScanProfile | null>(null);
  const [scanProfiles, setScanProfiles] = useState<ScanProfile[]>([]);
  const analysisInterval = useRef<number | null>(null);

  useEffect(() => {
    fetch('./data/scanProfiles.json')
      .then(res => res.json())
      .then(data => setScanProfiles(data.scan_profiles))
      .catch(err => console.error("Failed to load scan profiles", err));
  }, []);

  const startAnalysis = useCallback(() => {
    if (scanProfiles.length === 0) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    const steps = ["Analisando topologia...", "Escaneamento a laser...", "Calculando nuvem de pontos...", "Gerando malha 3D...", "Luz estruturada...", "Fotogrametria..."];
    let stepIndex = 0;
    
    setAnalysisText(steps[0]);
    analysisInterval.current = window.setInterval(() => {
        stepIndex++;
        setAnalysisText(steps[stepIndex % steps.length]);
    }, 400);

    setTimeout(() => {
        if (analysisInterval.current) clearInterval(analysisInterval.current);
        const bestProfile = selectBestScanProfile(scanProfiles, creativeDNA);
        setAnalysisResult(bestProfile);
        setIsAnalyzing(false);
        if (onScanComplete) {
            onScanComplete(bestProfile);
        }
    }, 2500);

  }, [scanProfiles, creativeDNA, onScanComplete]);
  
  useEffect(() => {
    if (image && !analysisResult && !isAnalyzing) {
        startAnalysis();
    }
    if (!image) {
        setAnalysisResult(null);
        if (analysisInterval.current) clearInterval(analysisInterval.current);
        setIsAnalyzing(false);
    }
  }, [image, analysisResult, isAnalyzing, startAnalysis]);


  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const supportedFiles = acceptedFiles.filter(file => 
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (supportedFiles.length > 0) {
      const file = supportedFiles[0];
      const base64 = await fileToBase64(file);
      const newImage = {
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
        preview: URL.createObjectURL(file),
      };
      onImageSelect(newImage);
    } else if (acceptedFiles.length > 0) {
        alert('Tipo de arquivo não suportado. Por favor, use arquivos JPG, PNG ou WEBP.');
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'image/jpeg': ['.jpeg', '.jpg'],
        'image/png': ['.png'],
        'image/webp': ['.webp']
    },
    multiple: false,
  });

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(image) {
        URL.revokeObjectURL(image.preview);
    }
    onImageSelect(null);
  }

  return (
    <div {...getRootProps()} className={`relative w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-[#7D4FFF] bg-white/10' : 'border-white/20 hover:border-white/40'}`}>
      <input {...getInputProps()} />
      {image ? (
        <>
            <img src={image.preview} alt="Preview" className={`w-full h-full object-contain rounded-lg p-1 transition-all duration-300 ${isAnalyzing ? 'filter blur-sm brightness-75' : ''}`} />
             {isAnalyzing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-2 rounded-lg transition-opacity duration-300">
                    <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-white mb-2"></div>
                    <p className="text-sm font-semibold">{analysisText}</p>
                </div>
            )}
            {analysisResult && !isAnalyzing && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs p-1 text-center rounded-b-lg">
                    <p className="font-bold truncate" title={analysisResult.description}>Scan: {analysisResult.name}</p>
                </div>
            )}
            <button onClick={removeImage} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10">&times;</button>
        </>
      ) : (
        <div className="flex flex-col items-center text-white/60">
          <UploadIcon className="w-8 h-8 mb-2" />
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs">Clique ou arraste a imagem</p>
        </div>
      )}
    </div>
  );
};

export default ImageInput;