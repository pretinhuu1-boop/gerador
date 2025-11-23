// components/studios/ProductionPipeline.tsx
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { 
    ImageFile, AudioFile, VideoFormData, VibePreset, SequencedShot
} from '../../types';
import { 
    analyzeMusicForDNA, generateDirectionFromDNA, generateStoryboardScript, 
    generateMoodboardImage, generateVideo
} from '../../services/geminiService';
import { ApiKeyError } from '../../services/errors';

import { vibePresets } from '../../data/vibe_presets';

import ImageInput from '../ImageInput';
import ReferenceUploader from '../ReferenceUploader';
import AudioInput from '../AudioInput';
import DisplayArea from '../DisplayArea';
import { UserIcon, FilmIcon, SparklesIcon, VideoIcon, WandIcon, ChevronDownIcon, LayersIcon, PlusIcon, TrashIcon } from '../icons';

interface ProductionPipelineProps {
    apiKeyReady: boolean;
    onSelectKey: () => Promise<void>;
}

const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-panel-light p-5 rounded-lg border border-border w-full">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h2 className="font-bold text-lg text-primary">{title}</h2>
                <ChevronDownIcon className={`w-6 h-6 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="mt-4 animate-creation">{children}</div>}
        </div>
    );
};

const ProductionPipeline: React.FC<ProductionPipelineProps> = ({ apiKeyReady, onSelectKey }) => {
    const [formData, setFormData] = useState<VideoFormData>({
        artistName: 'Nome do Artista',
        artistLogo: null,
        referencePhotos: [],
        masterFrame: null,
        motionEvents: [{ id: uuidv4(), description: 'Cena inicial' }],
        finalScript: '',
        cameraBehavior: '',
        atmosphere: '',
        transition: '',
        aspectRatio: '9:16',
        resolution: '720p',
        useFaceLock: true,
        endFrame: null,
    });
    
    const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
    const [selectedVibe, setSelectedVibe] = useState<VibePreset>(vibePresets[0]);
    const [musicDna, setMusicDna] = useState<any | null>(null);
    const [storyboard, setStoryboard] = useState<SequencedShot[]>([]);
    const [moodboardUrl, setMoodboardUrl] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<string | null>(null); // 'dna', 'storyboard', 'moodboard', 'video'
    const [error, setError] = useState<string | null>(null);

    const handleFormChange = <T extends keyof VideoFormData>(field: T, value: VideoFormData[T]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSceneChange = (id: string, description: string) => {
        setFormData(prev => ({
            ...prev,
            motionEvents: prev.motionEvents.map(scene => 
                scene.id === id ? { ...scene, description } : scene
            )
        }));
    };

    const handleAddScene = () => {
        setFormData(prev => ({
            ...prev,
            motionEvents: [...prev.motionEvents, { id: uuidv4(), description: '' }]
        }));
    };

    const handleRemoveScene = (id: string) => {
        setFormData(prev => ({
            ...prev,
            motionEvents: prev.motionEvents.filter(scene => scene.id !== id)
        }));
    };
    
    const handleAnalyzeMusic = async () => {
        if (!audioFile) {
            setError("Por favor, carregue um arquivo de áudio primeiro.");
            return;
        }
        setIsLoading('dna');
        setError(null);
        try {
            const dna = await analyzeMusicForDNA(audioFile);
            setMusicDna(dna);
        } catch (e: any) {
            setError(e.message || "Falha ao analisar o DNA da música.");
        } finally {
            setIsLoading(null);
        }
    };
    
    const handleGenerateStoryboard = async () => {
        if (!musicDna) {
            setError("Analise a música antes de gerar o storyboard.");
            return;
        }
        setIsLoading('storyboard');
        setError(null);
        try {
            const creativeDirection = await generateDirectionFromDNA(musicDna, selectedVibe.settings);
            const generatedStoryboard = await generateStoryboardScript(creativeDirection);
            setStoryboard(generatedStoryboard);
            // Optionally, create a moodboard prompt from the direction
            const moodboardPrompt = `Crie um moodboard cinematográfico para um videoclipe com a seguinte direção: ${creativeDirection}. O moodboard deve ser uma imagem única 16:9 que captura o tom, a paleta de cores e a estética geral.`;
            handleFormChange('finalScript', moodboardPrompt); // Store for moodboard generation
        } catch (e: any) {
            setError(e.message || "Falha ao gerar o storyboard.");
        } finally {
            setIsLoading(null);
        }
    };
    
    const handleGenerateMoodboard = async () => {
        if (!formData.finalScript) {
            setError("Gere o storyboard primeiro para criar a direção do moodboard.");
            return;
        }
        setIsLoading('moodboard');
        setError(null);
        try {
            const imageUrl = await generateMoodboardImage(formData.finalScript);
            setMoodboardUrl(imageUrl);
        } catch (e: any) {
            setError(e.message || "Falha ao gerar a imagem do moodboard.");
        } finally {
            setIsLoading(null);
        }
    };

    const handleGenerateVideo = async () => {
        if (storyboard.length === 0) {
            setError("Gere um storyboard antes de criar o vídeo.");
            return;
        }

        if (!apiKeyReady) {
            onSelectKey();
            const hasKey = await (window.aistudio?.hasSelectedApiKey() ?? Promise.resolve(false));
            if (!hasKey) {
                 setError("É necessário selecionar uma chave de API para gerar o vídeo.");
                return;
            }
        }

        setIsLoading('video');
        setError(null);
        try {
            // For simplicity, we generate one scene. A real implementation would loop through the storyboard.
            const firstScenePrompt = storyboard[0].description;
            const videoFormData: VideoFormData = {
                ...formData,
                finalScript: firstScenePrompt,
                resolution: '720p',
                aspectRatio: '9:16',
            };
            const url = await generateVideo(videoFormData);
            setVideoUrl(url);
        } catch (e: any) {
             if (e instanceof ApiKeyError) {
                setError(e.message);
            } else {
                setError(e.message || "Falha ao gerar o vídeo.");
            }
        } finally {
            setIsLoading(null);
        }
    };


    const displayMediaUrl = videoUrl || moodboardUrl;
    const displayMediaType = videoUrl ? 'video' : 'image';

    return (
         <div className="studio-grid">
            <div className="controls-panel">
                <CollapsibleSection title="1. Vibe & Música" defaultOpen>
                    <div className="space-y-4">
                        <AudioInput label="Arquivo de Áudio (MP3/WAV)" audio={audioFile} onAudioSelect={setAudioFile} />
                        <button onClick={handleAnalyzeMusic} disabled={!!isLoading} className="secondary-action-button w-full">
                            {isLoading === 'dna' ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <><SparklesIcon className="w-5 h-5 mr-2"/>Analisar DNA da Música</>}
                        </button>
                         {musicDna && (
                            <div className="bg-black/30 p-3 rounded-md text-xs text-accent">
                                <p><strong>DNA Detectado:</strong> {musicDna.bpm} BPM, {musicDna.mood}, {musicDna.genre}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Selecione a Vibe</label>
                            <div className="space-y-2">
                                {vibePresets.map(preset => (
                                    <button key={preset.id} onClick={() => setSelectedVibe(preset)} className={`preset-card ${selectedVibe.id === preset.id ? 'active' : ''}`}>
                                        <p className="font-bold text-sm">{preset.name}</p>
                                        <p className="text-xs text-white/70">{preset.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                 <CollapsibleSection title="2. Artista & Referências">
                    <div className="space-y-4">
                         <input type="text" value={formData.artistName} onChange={e => handleFormChange('artistName', e.target.value)} placeholder="Nome do Artista" className="form-textarea !resize-none" />
                        <ImageInput label="Logo do Artista (Opcional)" image={formData.artistLogo} onImageSelect={f => handleFormChange('artistLogo', f)} />
                        <ReferenceUploader label="Fotos de Referência" files={formData.referencePhotos} onFilesChange={f => handleFormChange('referencePhotos', f)} maxFiles={3} />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="3. Roteiro de Cenas (Storyboard)">
                    <button onClick={handleGenerateStoryboard} disabled={!!isLoading || !musicDna} className="secondary-action-button w-full mb-4">
                         {isLoading === 'storyboard' ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <><WandIcon className="w-5 h-5 mr-2"/>Gerar Storyboard com IA</>}
                    </button>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {storyboard.map((shot, index) => (
                            <div key={index} className="bg-panel p-3 rounded-lg">
                                <p className="font-bold text-sm mb-1 text-primary">Cena {shot.shot_number} ({shot.duration_seconds}s)</p>
                                <p className="text-xs text-white/80">{shot.description}</p>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
                
                <div className="mt-auto pt-6 space-y-4">
                    <button onClick={handleGenerateMoodboard} disabled={!!isLoading || storyboard.length === 0} className="action-button !bg-accent">
                         {isLoading === 'moodboard' ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-background"></div> : "1. Gerar Moodboard"}
                    </button>
                    <button onClick={handleGenerateVideo} disabled={!!isLoading || storyboard.length === 0 || !apiKeyReady} className="action-button">
                        {isLoading === 'video' ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-background"></div> : "2. Gerar Vídeo Final"}
                    </button>
                    {!apiKeyReady && <p className="text-amber-400 text-xs mt-2 text-center">Selecione uma chave de API para gerar vídeos.</p>}
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </div>

            </div>
            <div className="display-panel-container">
                <DisplayArea 
                    mediaType={displayMediaType}
                    mediaUrl={displayMediaUrl}
                    isLoading={!!isLoading}
                    prompt={isLoading === 'video' ? 'Gerando seu vídeo, isso pode levar alguns minutos...' : 'Pipeline de Produção IA'}
                    isAnimationDisabled={true}
                />
            </div>
        </div>
    );
};

export default ProductionPipeline;
