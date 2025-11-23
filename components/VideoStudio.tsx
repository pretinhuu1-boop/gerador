// components/VideoStudio.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
    ImageFile, VideoAspectRatio, VideoResolution, VideoFormData,
    VideoStudioMode, TelaoCompositorFormData, TelaoSceneCategory, TelaoLightingStyle, 
    TelaoStylePreset, TelaoDuration, ScanProfile, VisualizerFormData, VisualizerStyle, 
    VisualizerCoreElement, VisualizerColorPalette, VisualizerDuration, TypographyStyle, AudioFile, MotionDesignerFormData, Scene
} from '../types';
import { 
    generateVideo, refineCreativeDirection, generateBackdropImage, animateTelaoLoop, 
    generateCreativeDirectionForTelao, generateVisualizer, generateMotionScriptForImage, 
    generateStoryboardScript, generateMoodboardImage, analyzeMusicForDNA, generateDirectionFromDNA
} from '../services/geminiService';
import { ApiKeyError } from '../services/errors';
import { FilmIcon, SparklesIcon, VideoIcon, WandIcon, GemIcon, UserIcon, PlusIcon, TrashIcon, LayersIcon, GridIcon, FrameIcon, PaletteIcon, BookOpenIcon, ClapperboardIcon } from './icons';
import DisplayArea from './DisplayArea';
import ImageInput from './ImageInput';
import ReferenceUploader from './ReferenceUploader';
import AudioInput from './AudioInput';
import PromptLibraryModal from './PromptLibraryModal';
import { promptLibrary } from '../data/prompt_library';
import VisualizerEngine from './studios/VisualizerEngine';
import IntelligentPipeline from './studios/IntelligentPipeline';
import ProductionPipeline from './studios/ProductionPipeline';
import BRollLibrary from './studios/BRollLibrary';
import CinemaStudio from './studios/CinemaStudio';
import MotionDesigner from './studios/MotionDesigner';


// These components are now part of other studios or have been superseded by the pipeline.
const DnaExtractor: React.FC = () => <div className="text-white/50 text-center p-8">This module is now integrated into the 'Production Pipeline'.</div>;
const ArtDirector: React.FC = () => <div className="text-white/50 text-center p-8">This module is now integrated into the 'Production Pipeline'.</div>;
const VideoCompositor: React.FC<{ apiKeyReady: boolean }> = ({ apiKeyReady }) => <div className="text-white/50 text-center p-8">This module is now integrated into the 'Production Pipeline'.</div>;


const TelaoCompositor: React.FC<{ apiKeyReady: boolean }> = ({ apiKeyReady }) => {
    const [formData, setFormData] = useState<TelaoCompositorFormData>({
        artistName: 'Show de Rock',
        artistLogo: null,
        artistLogoScanProfile: null,
        artistPhoto: null,
        artistPhotoScanProfile: null,
        audioFile: null,
        creativePrompt: 'Uma paisagem vulcânica com rios de lava e um céu estrelado, com uma paleta de cores laranja, vermelho e preto.',
        sceneCategory: 'stage_energy',
        lightingStyle: 'luz_volumetrica',
        stylePreset: 'bass_orange',
        duration: 16,
        finalPrompt: ''
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [staticImageUrl, setStaticImageUrl] = useState<string | null>(null);
    const [loopUrls, setLoopUrls] = useState<string[] | null>(null);
    const [loadingStep, setLoadingStep] = useState(0);

    const handleFormChange = <T extends keyof TelaoCompositorFormData>(field: T, value: TelaoCompositorFormData[T]) => {
        setFormData(prev => ({...prev, [field]: value, finalPrompt: ''})); // Reset final prompt on change
    };
    
    const handleSelectPreset = (presetId: TelaoStylePreset) => {
        let updates: Partial<TelaoCompositorFormData> = { stylePreset: presetId };
        
        if (presetId === 'urban_glitch_reveal') {
            updates = {
                ...updates,
                sceneCategory: 'typography_pulse',
                lightingStyle: 'neon_lateral',
                creativePrompt: `O nome do artista surge do escuro em uma animação de glitch rápida e energética. O fundo é uma parede urbana texturizada. A tipografia é estilo graffiti, com cores vibrantes como roxo e magenta.`,
            };
        }
        
        setFormData(prev => ({ ...prev, ...updates, finalPrompt: '' }));
    };

    const convertUrlToImageFile = async (url: string): Promise<ImageFile> => {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "backdrop.png", { type: blob.type });
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve({ name: file.name, type: file.type, size: file.size, base64, preview: url });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    
    const handleGenerateDirection = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setLoadingMessage('IA está criando o roteiro da cena...');
        setError(null);
        try {
            const direction = await generateCreativeDirectionForTelao(formData);
            setFormData(prev => ({...prev, finalPrompt: direction}));
        } catch (e: any) {
            setError(e.message || "Falha ao gerar direção criativa.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }

    const handleGenerateStaticScene = async () => {
        if(isLoading || !formData.finalPrompt) return;
        setIsLoading(true);
        setLoadingMessage('Gerando cena estática...');
        setError(null);
        setStaticImageUrl(null);
        setLoopUrls(null);
        try {
            const imageUrl = await generateBackdropImage(formData);
            setStaticImageUrl(imageUrl);
        } catch (e: any) {
            setError(e.message || "Falha ao gerar a cena estática.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleAnimateScene = async () => {
        if(isLoading || !staticImageUrl) return;
        setIsLoading(true);
        setError(null);
        try {
            const imageFile = await convertUrlToImageFile(staticImageUrl);
            setLoadingStep(1);
            setLoadingMessage('Animando Cena...');
            const videoUrls = await animateTelaoLoop(imageFile, formData);
            setLoadingStep(2);
            setLoopUrls(videoUrls);
        } catch(e: any) {
             if (e instanceof ApiKeyError) {
                setError(e.message);
            } else {
                setError(e.message || "Falha ao animar a cena.");
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
            setLoadingStep(0);
        }
    };
    
    const mediaUrl = staticImageUrl;
    const mediaType = loopUrls ? 'loop' : 'image';

    return (
        <div className="studio-grid">
            <div className="controls-panel">
                <section>
                    <h2 className="section-title"><GemIcon className="icon" /> 1. Conteúdo do Telão</h2>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="telao-artist" className="block text-sm font-medium text-white/80 mb-2">Artista / Tema Principal</label>
                            <input id="telao-artist" type="text" value={formData.artistName} onChange={e => handleFormChange('artistName', e.target.value)} className="form-textarea !resize-none" />
                        </div>
                         <ImageInput label="Foto de Referência (Opcional)" image={formData.artistPhoto} onImageSelect={f => handleFormChange('artistPhoto', f)} onScanComplete={p => handleFormChange('artistPhotoScanProfile', p)} />
                         <ImageInput label="Logo (Opcional)" image={formData.artistLogo} onImageSelect={f => handleFormChange('artistLogo', f)} onScanComplete={p => handleFormChange('artistLogoScanProfile', p)} />
                         <AudioInput label="Áudio de Referência (Opcional)" audio={formData.audioFile} onAudioSelect={f => handleFormChange('audioFile', f)} />
                    </div>
                </section>
                <section>
                    <h2 className="section-title"><SparklesIcon className="icon" /> 2. Estilo Visual</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Preset de Estilo</label>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                               {(['neon_urban', 'trap_tech', 'bass_orange', 'romantic_pink', 'futuristic_metal', 'urban_glitch_reveal'] as TelaoStylePreset[]).map(opt => (
                                   <button key={opt} onClick={() => handleSelectPreset(opt)} className={`form-button ${formData.stylePreset === opt ? 'active' : ''}`}>{opt.replace(/_/g, ' ')}</button>
                               ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Categoria de Cena</label>
                            <select value={formData.sceneCategory} onChange={e => handleFormChange('sceneCategory', e.target.value as TelaoSceneCategory)} className="form-textarea !resize-none">
                                {(['stage_energy', 'typography_pulse', 'visual_burst', 'artist_loop', 'mood_loop', 'abstract_geometry', 'story_pulse', 'logo_motion'] as TelaoSceneCategory[]).map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Iluminação</label>
                             <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                               {(['neon_lateral', 'backlight_difuso', 'strobe_suave', 'luz_volumetrica', 'gradiente_giratorio'] as TelaoLightingStyle[]).map(opt => (
                                   <button key={opt} onClick={() => handleFormChange('lightingStyle', opt)} className={`form-button ${formData.lightingStyle === opt ? 'active' : ''}`}>{opt.replace(/_/g, ' ')}</button>
                               ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="telao-prompt" className="block text-sm font-medium text-white/80 mb-2">Direção Criativa (Ideia Base)</label>
                            <textarea id="telao-prompt" rows={3} value={formData.creativePrompt} onChange={e => handleFormChange('creativePrompt', e.target.value)} className="form-textarea" />
                        </div>
                    </div>
                </section>
                <section className="mt-auto space-y-4 pt-6">
                    <div className="space-y-3">
                         <button onClick={handleGenerateDirection} disabled={isLoading} className="secondary-action-button">
                             {isLoading && loadingMessage.includes('roteiro') ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <><SparklesIcon className="w-5 h-5 mr-2" />Gerar Roteiro com IA</>}
                         </button>
                         <textarea rows={4} value={formData.finalPrompt} onChange={e => handleFormChange('finalPrompt', e.target.value)} className="form-textarea" placeholder="O roteiro da IA para a cena aparecerá aqui."/>
                    </div>
                     <div className="border-t border-white/10 pt-4 space-y-3">
                        <button onClick={handleGenerateStaticScene} disabled={isLoading || !formData.finalPrompt} className="action-button !bg-primary !text-white">
                             {isLoading && loadingMessage.includes('cena') ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : '1. Gerar Cena Estática'}
                        </button>
                        <button onClick={handleAnimateScene} disabled={!staticImageUrl || isLoading || !apiKeyReady} className="action-button">
                             {isLoading && loadingMessage.includes('Animando') ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-background"></div> : '2. Animar Loop de Telão'}
                        </button>
                     </div>
                      {!apiKeyReady && <p className="text-amber-400 text-xs mt-2 text-center">Selecione uma chave de API para animar.</p>}
                      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </section>
            </div>
            <div className="display-panel-container">
                 <DisplayArea 
                    mediaType={mediaType} 
                    mediaUrl={mediaUrl} 
                    loopUrls={loopUrls}
                    isLoading={isLoading} 
                    loadingStep={loadingStep}
                    prompt={loadingMessage || "Compositor de Telão"} 
                    isAnimationDisabled={true}
                 />
            </div>
        </div>
    );
};

interface VideoStudioProps {
    apiKeyReady: boolean;
    onSelectKey: () => Promise<void>;
}

const VideoStudio: React.FC<VideoStudioProps> = ({ apiKeyReady, onSelectKey }) => {
    const [mode, setMode] = useState<VideoStudioMode>('motion_designer');

    const renderStudio = () => {
        switch (mode) {
            case 'cinema':
                return <CinemaStudio apiKeyReady={apiKeyReady} onSelectKey={onSelectKey} />;
            case 'production_pipeline':
                return <ProductionPipeline apiKeyReady={apiKeyReady} onSelectKey={onSelectKey} />;
            case 'compositor':
                return <TelaoCompositor apiKeyReady={apiKeyReady} />;
            case 'visualizer_engine':
                return <VisualizerEngine apiKeyReady={apiKeyReady} />;
            case 'motion_designer':
                return <MotionDesigner apiKeyReady={apiKeyReady} onSelectKey={onSelectKey} />;
            case 'intelligent_pipeline':
                return <IntelligentPipeline />;
            case 'b_roll_library':
                return <BRollLibrary />;
            // Deprecated studios are removed from here
            default:
                return <CinemaStudio apiKeyReady={apiKeyReady} onSelectKey={onSelectKey} />;
        }
    };

    const TabButton = ({ targetMode, label, icon }: { targetMode: VideoStudioMode, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setMode(targetMode)}
            className={`flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-semibold transition flex flex-col items-center justify-center gap-1 ${mode === targetMode ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20'}`}
        >
            {icon}
            <span className="text-center">{label}</span>
        </button>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
                <div className="bg-panel p-2 rounded-lg max-w-4xl mx-auto">
                    <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
                        <TabButton targetMode="cinema" label="Cinema" icon={<ClapperboardIcon className="w-5 h-5"/>} />
                        <TabButton targetMode="production_pipeline" label="Pipeline IA" icon={<LayersIcon className="w-5 h-5"/>} />
                        <TabButton targetMode="compositor" label="Compositor Telão" icon={<GridIcon className="w-5 h-5"/>} />
                        <TabButton targetMode="visualizer_engine" label="Motor Visualizer" icon={<SparklesIcon className="w-5 h-5"/>} />
                        <TabButton targetMode="motion_designer" label="Motion Designer" icon={<FilmIcon className="w-5 h-5"/>} />
                        <TabButton targetMode="intelligent_pipeline" label="Doc. Pipeline" icon={<WandIcon className="w-5 h-5"/>} />
                        <TabButton targetMode="b_roll_library" label="Biblioteca (IA)" icon={<BookOpenIcon className="w-5 h-5"/>} />
                    </div>
                </div>
            </div>

            {!apiKeyReady && ['production_pipeline', 'compositor', 'visualizer_engine', 'motion_designer', 'cinema'].includes(mode) && (
                <div className="flex-shrink-0 mb-4 max-w-2xl mx-auto w-full text-center p-4 bg-amber-900/50 border border-amber-500 rounded-lg">
                    <p className="font-semibold mb-2">Chave de API necessária para geração de vídeo.</p>
                    <p className="text-sm text-white/80 mb-3">O uso do modelo de vídeo VEO pode incorrer em custos. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Saiba mais sobre preços</a>.</p>
                    <button onClick={onSelectKey} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors">
                        Selecionar Chave de API
                    </button>
                </div>
            )}
            
            <div className="flex-grow h-[calc(100%-4rem)]">
                {renderStudio()}
            </div>
        </div>
    );
};

export default VideoStudio;