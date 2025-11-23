// components/DisplayArea.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DownloadIcon, FilmIcon, SparklesIcon, VideoIcon } from './icons';

interface DisplayAreaProps {
  mediaType: 'image' | 'video' | 'loop' | 'text';
  mediaUrl: string | null;
  loopUrls?: string[] | null;
  textContent?: string | null;
  isLoading: boolean;
  loadingStep?: number; // For multi-step loading
  prompt: string;
  onAnimate?: () => void;
  onExpand?: () => void;
  isSecondaryLoading?: {
    animate: boolean;
    expand: boolean;
  };
  isAnimationDisabled?: boolean;
}

const DisplayArea: React.FC<DisplayAreaProps> = ({ 
    mediaType, mediaUrl, loopUrls = null, textContent, isLoading, loadingStep = 0, prompt, onAnimate, onExpand, 
    isSecondaryLoading = { animate: false, expand: false }, isAnimationDisabled = false 
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setCurrentVideoIndex(0);
  }, [loopUrls]);
  
  const handleVideoEnded = () => {
    if (mediaType === 'loop' && loopUrls && loopUrls.length > 0) {
      setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % loopUrls.length);
    }
  };

  const currentMediaUrl = mediaType === 'loop' && loopUrls && loopUrls.length > 0 ? loopUrls[currentVideoIndex] : mediaUrl;

  const LoadingState = () => (
    <div className="text-center text-white/80 p-4">
      <div className="animate-pulse">
        {mediaType === 'image' ? <SparklesIcon className="w-16 h-16 mx-auto mb-4" /> : <FilmIcon className="w-16 h-16 mx-auto mb-4" />}
      </div>
      <p className="font-semibold">
          {loadingStep > 0 ? `Animando Telão... (Etapa ${loadingStep} de 2)` : 
           (mediaType === 'image' || mediaType === 'text') ? 'Gerando sua arte...' : prompt
          }
      </p>
      <p className="text-sm text-white/60 mt-1">
        {(mediaType === 'image' || mediaType === 'text') ? 'O Diretor de Arte Digital está trabalhando...' : 'Isso pode levar alguns minutos. Agradecemos a sua paciência!'}
      </p>
    </div>
  );

  const InitialState = () => (
    <div className="text-center text-white/60 p-4">
      {mediaType === 'image' ? <SparklesIcon className="w-16 h-16 mx-auto mb-4" /> : <FilmIcon className="w-16 h-16 mx-auto mb-4" />}
      <p className="font-semibold">
        {mediaType === 'image' && 'Sua arte aparecerá aqui'}
        {mediaType === 'video' && 'Seu vídeo aparecerá aqui'}
        {mediaType === 'loop' && 'Seu vídeo aparecerá aqui'}
        {mediaType === 'text' && 'O resultado da análise aparecerá aqui'}
      </p>
      <p className="text-sm">Configure as opções e inicie o processo</p>
    </div>
  );

  const MediaContent = () => {
    if (mediaType === 'text') {
        return (
            <div className="w-full h-full p-4 overflow-y-auto bg-black animate-creation">
                <pre className="text-sm text-left text-green-300 whitespace-pre-wrap break-words">
                    <code>{textContent}</code>
                </pre>
            </div>
        )
    }
    if (!currentMediaUrl) return null;
    if (mediaType === 'image') {
      return <img key={currentMediaUrl} src={currentMediaUrl} alt={prompt} className="w-full h-full object-contain animate-creation" />;
    }
    return (
      <video
        ref={videoRef}
        key={currentMediaUrl} // Force re-render on URL change to trigger animation
        src={currentMediaUrl}
        controls={mediaType !== 'loop'}
        autoPlay
        muted // Autoplay often requires muted
        loop={mediaType === 'video' || (mediaType === 'loop' && loopUrls?.length === 1)}
        onEnded={handleVideoEnded}
        className="w-full h-full object-contain animate-creation"
      />
    );
  };

  const canAnimate = mediaType === 'image' && onAnimate;
  const canExpand = mediaType === 'image' && onExpand;
  const canDownload = (mediaType === 'image' && currentMediaUrl) || (mediaType === 'text' && textContent);


  return (
    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center relative overflow-hidden border border-white/10 shadow-lg">
      {isLoading ? <LoadingState /> : (currentMediaUrl || textContent) ? <MediaContent /> : <InitialState />}
      
      {!isLoading && (
        <div className="absolute bottom-4 right-4 flex gap-3">
            {canAnimate && (
                <button 
                    onClick={onAnimate} 
                    disabled={isSecondaryLoading.animate || isAnimationDisabled} 
                    className="bg-[#1E1F22]/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-[#7D4FFF] transition-colors shadow-md flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAnimationDisabled ? "Animação não disponível para esta proporção" : "Animar"}
                >
                    {isSecondaryLoading.animate ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <VideoIcon className="w-6 h-6" />}
                    <span className="hidden sm:inline">Animar</span>
                </button>
            )}
            {canExpand && (
                 <button onClick={onExpand} disabled={isSecondaryLoading.expand} className="bg-[#1E1F22]/80 backdrop-blur-sm text-white p-3 rounded-full hover:bg-[#7D4FFF] transition-colors shadow-md flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-wait">
                    {isSecondaryLoading.expand ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <SparklesIcon className="w-6 h-6" />}
                     <span className="hidden sm:inline">Expandir</span>
                </button>
            )}
             {canDownload && (
                <a
                    href={mediaType === 'text' ? `data:application/json;charset=utf-8,${encodeURIComponent(textContent || '')}` : currentMediaUrl || ''}
                    download={mediaType === 'text' ? "analise.json" : (mediaType === 'image' ? "imagem.png" : "video.mp4")}
                    className="bg-[#7D4FFF] text-white p-3 rounded-full hover:bg-[#6b3fef] transition-colors shadow-md"
                    aria-label="Download"
                >
                    <DownloadIcon className="w-6 h-6" />
                </a>
             )}
        </div>
      )}
    </div>
  );
};

export default DisplayArea;