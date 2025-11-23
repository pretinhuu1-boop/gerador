// components/studios/VisualizerEngine.tsx
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { VisualizerEngineFormData, VisualizerTemplate, ImageFile, AudioFile, VisualizerEnginePreset } from '../../types';
import { generateVisualizerFromEngine, buildVisualizerEnginePrompt, refineCreativeDirection } from '../../services/geminiService';
import { ApiKeyError } from '../../services/errors';

import ImageInput from '../ImageInput';
import ReferenceUploader from '../ReferenceUploader';
import AudioInput from '../AudioInput';
import DisplayArea from '../DisplayArea';
import Slider from '../Slider';
import { UserIcon, GemIcon, SparklesIcon, FilmIcon, ImageIcon, LayersIcon, FrameIcon, GridIcon, WandIcon, SaveIcon, TrashIcon } from '../icons';
import PromptLibraryModal from '../PromptLibraryModal';

interface VisualizerEngineProps {
    apiKeyReady: boolean;
}

const templates: { id: VisualizerTemplate, name: string, description: string, icon: React.FC<any> }[] = [
    { id: 'photo_loop_core', name: 'Photo Loop Core', description: 'Foto do sujeito principal centralizada com fundo abstrato reativo.', icon: ImageIcon },
    { id: 'logo_pulse', name: 'Logo Pulse', description: 'Logo no centro com ondas, partículas ou barras seguindo a música.', icon: GemIcon },
    { id: 'dual_layer', name: 'Dual Layer', description: 'Foto do sujeito com opacidade baixa e logo em primeiro plano.', icon: LayersIcon },
    { id: 'motion_frame', name: 'Motion Frame', description: 'Quadro flutuante com a foto dentro e fundo em movimento.', icon: FrameIcon },
    { id: 'abstract_reactive', name: 'Abstract Reactive', description: 'Cena abstrata gerada a partir da música, sem assets obrigatórios.', icon: SparklesIcon },
    { id: 'story_splash', name: 'Story Splash', description: 'Loop rápido de "poses" da foto com flashes, estilo colagem.', icon: GridIcon },
];

// --- BPM Analysis Helpers ---
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

async function analyzeBPM(audioFile: AudioFile): Promise<number> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffer = await audioContext.decodeAudioData(base64ToArrayBuffer(audioFile.base64));

    const offlineContext = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = buffer;

    const filter = offlineContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150, 0);
    filter.Q.setValueAtTime(1, 0);

    source.connect(filter);
    filter.connect(offlineContext.destination);
    source.start(0);

    const filteredBuffer = await offlineContext.startRendering();
    const data = filteredBuffer.getChannelData(0);

    const peaks: number[] = [];
    let maxVal = 0;
    for (let i = 0; i < data.length; i++) {
        if (Math.abs(data[i]) > maxVal) maxVal = Math.abs(data[i]);
    }
    const threshold = maxVal * 0.9;

    for (let i = 1; i < data.length - 1; i++) {
        if (data[i] > threshold && data[i] > data[i - 1] && data[i] > data[i + 1]) {
            peaks.push(i);
        }
    }

    if (peaks.length < 2) throw new Error("Não foram detectados picos suficientes.");

    const intervals = [];
    for (let i = 1; i < peaks.length; i++) {
        intervals.push(peaks[i] - peaks[i-1]);
    }

    const tempoCounts: { [key: number]: number } = {};
    intervals.forEach(interval => {
        const tempo = 60 / (interval / buffer.sampleRate);
        if (tempo > 400) return; // Ignore outliers
        const roundedTempo = Math.round(tempo / 5) * 5;
        tempoCounts[roundedTempo] = (tempoCounts[roundedTempo] || 0) + 1;
    });

    let maxCount = 0;
    let guessedBPM = 120;
    for (const tempo in tempoCounts) {
        if (tempoCounts[tempo] > maxCount) {
            maxCount = tempoCounts[tempo];
            guessedBPM = parseInt(tempo, 10);
        }
    }

    while (guessedBPM < 80) guessedBPM *= 2;
    while (guessedBPM > 160) guessedBPM /= 2;
    
    return Math.round(guessedBPM);
}


const VisualizerEngine: React.FC<VisualizerEngineProps> = ({ apiKeyReady }) => {
    const [formData, setFormData] = useState<VisualizerEngineFormData>({
        artistName: 'Nome do Artista',
        logo: null,
        photos: [],
        audio: null,
        bpm: 120,
        template: 'photo_loop_core',
        primaryColor: '#7D4FFF',
        secondaryColor: '#39FF14',
        pulseIntensity: 75,
        duration: 8,
        photoUsage: 'foreground',
        logoUsage: 'corner',
        grain: 'low',
        glow: 'low',
    });

    const [finalPrompt, setFinalPrompt] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzingBPM, setIsAnalyzingBPM] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [customPresets, setCustomPresets] = useState<VisualizerEnginePreset[]>([]);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    
    // --- Phase 3: Preset Manager Logic ---
    useEffect(() => {
        try {
            const saved = localStorage.getItem('visualizerEnginePresets_v1');
            if (saved) setCustomPresets(JSON.parse(saved));
        } catch (e) { console.error("Failed to load presets", e); }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('visualizerEnginePresets_v1', JSON.stringify(customPresets));
        } catch (e) { console.error("Failed to save presets", e); }
    }, [customPresets]);

    const handleSavePreset = () => {
        const name = prompt("Digite um nome para o seu preset:");
        if (name && name.trim()) {
            const newPreset: VisualizerEnginePreset = {
                id: uuidv4(),
                name: name.trim(),
                settings: formData,
            };
            setCustomPresets(prev => [...prev, newPreset]);
        }
    };

    const handleLoadPreset = (presetId: string) => {
        const preset = customPresets.find(p => p.id === presetId);
        if (preset) {
            const { logo, photos, audio, ...settingsToLoad } = preset.settings;
            setFormData(prev => ({ ...prev, ...settingsToLoad }));
        }
    };

    const handleDeletePreset = (e: React.MouseEvent, presetId: string) => {
        e.stopPropagation();
        if (window.confirm("Tem certeza que deseja apagar este preset?")) {
            setCustomPresets(prev => prev.filter(p => p.id !== presetId));
        }
    };
    
    // --- End Preset Manager ---

    useEffect(() => {
        const prompt = buildVisualizerEnginePrompt(formData);
        setFinalPrompt(prompt);
    }, [formData]);

    const handleFormChange = <T extends keyof VisualizerEngineFormData>(field: T, value: VisualizerEngineFormData[T]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAudioSelect = async (audio: AudioFile | null) => {
        handleFormChange('audio', audio);
        if (audio) {
            setIsAnalyzingBPM(true);
            setError(null);
            try {
                const detectedBPM = await analyzeBPM(audio);
                handleFormChange('bpm', detectedBPM);
            } catch (e: any) {
                setError("Não foi possível detectar o BPM automaticamente.");
                console.error("BPM detection failed:", e);
            } finally {
                setIsAnalyzingBPM(false);
            }
        }
    };

    const handleRefinePrompt = async () => {
        if (isRefining || !finalPrompt) return;
        setIsRefining(true);
        setError(null);
        try {
            const allImages: ImageFile[] = [...formData.photos];
            if (formData.logo) allImages.push(formData.logo);
            const refined = await refineCreativeDirection(finalPrompt, allImages);
            setFinalPrompt(refined);
        } catch (e: any) {
            setError(e.message || "Falha ao refinar o prompt.");
        } finally {
            setIsRefining(false);
        }
    };

    const handleGenerate = async () => {
        if (isLoading || !apiKeyReady) return;
        
        let validationError = null;
        if (['photo_loop_core', 'dual_layer', 'motion_frame', 'story_splash'].includes(formData.template) && formData.photos.length === 0) {
            validationError = "Este template requer pelo menos uma foto.";
        }
        if (['logo_pulse', 'dual_layer'].includes(formData.template) && !formData.logo) {
            validationError = "Este template requer uma logo.";
        }

        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError(null);
        setResultUrl(null);

        try {
            const videoUrl = await generateVisualizerFromEngine(finalPrompt, formData);
            setResultUrl(videoUrl);
        } catch (e: any) {
            if (e instanceof ApiKeyError) {
                setError(e.message);
            } else {
                setError(`Falha ao gerar o visualizer: ${e.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PromptLibraryModal
                isOpen={isPromptModalOpen}
                onClose={() => setIsPromptModalOpen(false)}
                onSelectPrompt={(prompt) => {
                    setFinalPrompt(prompt);
                    setIsPromptModalOpen(false);
                }}
            />
            <div className="studio-grid">
                <div className="controls-panel">
                    <section>
                        <h2 className="section-title"><UserIcon className="icon" /> 1. Assets e Música</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="vis-artist-name" className="block text-sm font-medium text-white/80 mb-2">Nome do Tema / Artista</label>
                                <input
                                    id="vis-artist-name"
                                    type="text"
                                    value={formData.artistName}
                                    onChange={e => handleFormChange('artistName', e.target.value)}
                                    className="form-textarea !resize-none"
                                    placeholder="Ex: DJ Krypton"
                                />
                            </div>
                            <ImageInput
                                label="Logo (Opcional)"
                                image={formData.logo}
                                onImageSelect={img => handleFormChange('logo', img)}
                            />
                            <ReferenceUploader
                                label="Fotos de Referência (1-3)"
                                files={formData.photos}
                                onFilesChange={files => handleFormChange('photos', files)}
                                maxFiles={3}
                            />
                            <AudioInput
                                label="Música (para análise de BPM)"
                                audio={formData.audio}
                                onAudioSelect={handleAudioSelect}
                            />
                            <div>
                                <label htmlFor="bpm" className="block text-sm font-medium text-white/80 mb-2">BPM da Música {isAnalyzingBPM && '(Analisando...)'}</label>
                                {isAnalyzingBPM ? (
                                    <div className="flex items-center justify-center h-10">
                                        <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-accent"></div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <input
                                        id="bpm-slider"
                                        type="range"
                                        min="60"
                                        max="180"
                                        step="1"
                                        value={formData.bpm}
                                        onChange={(e) => handleFormChange('bpm', Number(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${((formData.bpm - 60) / 120) * 100}%, #4A5568 ${((formData.bpm - 60) / 120) * 100}%, #4A5568 100%)`
                                        }}
                                        />
                                        <span className="text-sm font-semibold text-white bg-white/10 px-2 py-1 rounded-md w-16 text-center">
                                        {formData.bpm}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="section-title"><GemIcon className="icon" /> 2. Template do Visualizer</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {templates.map(template => (
                                <button key={template.id} onClick={() => handleFormChange('template', template.id)} className={`p-3 rounded-lg border-2 transition-all ${formData.template === template.id ? 'bg-primary/20 border-primary' : 'bg-panel-light border-transparent hover:border-border'}`}>
                                    <template.icon className="w-6 h-6 mb-2 mx-auto text-primary" />
                                    <p className="font-bold text-sm text-center">{template.name}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="section-title"><SaveIcon className="icon" /> 3. Presets Salvos</h2>
                        {customPresets.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {customPresets.map((preset) => (
                                    <div key={preset.id} className="relative group flex items-center gap-2">
                                        <button onClick={() => handleLoadPreset(preset.id)} className="flex-grow text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <p className="font-semibold text-sm text-white/90 truncate">{preset.name}</p>
                                        </button>
                                        <button onClick={(e) => handleDeletePreset(e, preset.id)} className="p-2 text-white/50 hover:text-red-500 rounded-full" title="Apagar Preset">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-white/60 text-center py-4">Você ainda não salvou nenhum preset.</p>
                        )}
                        <button onClick={handleSavePreset} className="secondary-action-button mt-4">
                            <SaveIcon className="w-4 h-4 mr-2" /> Salvar Preset Atual
                        </button>
                    </section>


                    <section>
                        <h2 className="section-title"><SparklesIcon className="icon" /> 4. Customização</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-white/80 mb-2">Uso da Foto</h3>
                                <div className="button-grid">
                                    <button onClick={() => handleFormChange('photoUsage', 'off')} className={`form-button ${formData.photoUsage === 'off' ? 'active' : ''}`}>Off</button>
                                    <button onClick={() => handleFormChange('photoUsage', 'foreground')} className={`form-button ${formData.photoUsage === 'foreground' ? 'active' : ''}`}>Primeiro Plano</button>
                                    <button onClick={() => handleFormChange('photoUsage', 'texture')} className={`form-button ${formData.photoUsage === 'texture' ? 'active' : ''}`}>Textura</button>
                                    <button onClick={() => handleFormChange('photoUsage', 'sequence')} className={`form-button ${formData.photoUsage === 'sequence' ? 'active' : ''}`}>Sequência</button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white/80 mb-2">Uso da Logo</h3>
                                <div className="button-grid">
                                    <button onClick={() => handleFormChange('logoUsage', 'off')} className={`form-button ${formData.logoUsage === 'off' ? 'active' : ''}`}>Off</button>
                                    <button onClick={() => handleFormChange('logoUsage', 'center')} className={`form-button ${formData.logoUsage === 'center' ? 'active' : ''}`}>Centro</button>
                                    <button onClick={() => handleFormChange('logoUsage', 'corner')} className={`form-button ${formData.logoUsage === 'corner' ? 'active' : ''}`}>Canto</button>
                                    <button onClick={() => handleFormChange('logoUsage', 'watermark')} className={`form-button ${formData.logoUsage === 'watermark' ? 'active' : ''}`}>Marca D'água</button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Paleta de Cores</label>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="vis_primary_color" className="text-xs text-white/60">Primária</label>
                                        <input type="color" id="vis_primary_color" value={formData.primaryColor} onChange={(e) => handleFormChange('primaryColor', e.target.value)} className="w-full h-10 p-1 bg-white/10 rounded-md border-white/20" />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="vis_secondary_color" className="text-xs text-white/60">Secundária</label>
                                        <input type="color" id="vis_secondary_color" value={formData.secondaryColor} onChange={(e) => handleFormChange('secondaryColor', e.target.value)} className="w-full h-10 p-1 bg-white/10 rounded-md border-white/20" />
                                    </div>
                                </div>
                            </div>
                            <Slider
                                label="Intensidade do Movimento"
                                value={formData.pulseIntensity}
                                onChange={v => handleFormChange('pulseIntensity', v)}
                                min={0}
                                max={100}
                                step={5}
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="section-title"><WandIcon className="icon" /> 5. Roteiro Final (Prompt)</h2>
                        <div className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="final-prompt" className="block text-sm font-medium text-white/80">Roteiro para IA</label>
                                <div className="flex items-center gap-4">
                                     <button onClick={() => setIsPromptModalOpen(true)} className="text-xs font-semibold text-primary hover:text-white">
                                        Biblioteca
                                    </button>
                                    <button onClick={handleRefinePrompt} disabled={isRefining} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-white disabled:opacity-50">
                                        {isRefining ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-current"></div> : <SparklesIcon className="w-4 h-4" />}
                                        Refinar com IA
                                    </button>
                                </div>
                            </div>
                            <textarea
                                id="final-prompt"
                                rows={10}
                                value={finalPrompt}
                                onChange={e => setFinalPrompt(e.target.value)}
                                className="form-textarea"
                                placeholder="O roteiro do visualizer será gerado aqui com base nas suas seleções..."
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="section-title"><FilmIcon className="icon" /> 6. Efeitos e Formato</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-white/80 mb-2">Granulação de Filme</h3>
                                <div className="button-grid-3">
                                    <button onClick={() => handleFormChange('grain', 'off')} className={`form-button ${formData.grain === 'off' ? 'active' : ''}`}>Off</button>
                                    <button onClick={() => handleFormChange('grain', 'low')} className={`form-button ${formData.grain === 'low' ? 'active' : ''}`}>Baixo</button>
                                    <button onClick={() => handleFormChange('grain', 'high')} className={`form-button ${formData.grain === 'high' ? 'active' : ''}`}>Alto</button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white/80 mb-2">Brilho (Glow)</h3>
                                <div className="button-grid-3">
                                    <button onClick={() => handleFormChange('glow', 'off')} className={`form-button ${formData.glow === 'off' ? 'active' : ''}`}>Off</button>
                                    <button onClick={() => handleFormChange('glow', 'low')} className={`form-button ${formData.glow === 'low' ? 'active' : ''}`}>Baixo</button>
                                    <button onClick={() => handleFormChange('glow', 'high')} className={`form-button ${formData.glow === 'high' ? 'active' : ''}`}>Alto</button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white/80 mb-2">Duração e Formato</h3>
                                <div className="button-grid-3">
                                    <button onClick={() => handleFormChange('duration', 8)} className={`form-button ${formData.duration === 8 ? 'active' : ''}`}>8s (9:16)</button>
                                    <button onClick={() => handleFormChange('duration', 15)} className={`form-button ${formData.duration === 15 ? 'active' : ''}`}>15s (9:16)</button>
                                    <button onClick={() => handleFormChange('duration', 30)} className={`form-button ${formData.duration === 30 ? 'active' : ''}`}>30s (16:9)</button>
                                </div>
                                <p className="text-xs text-white/60 mt-2 text-center">Duração de 30s usa o formato horizontal (16:9).</p>
                            </div>
                        </div>
                    </section>

                    <div className="mt-auto pt-6">
                        <button onClick={handleGenerate} disabled={isLoading || !apiKeyReady} className="action-button">
                            {isLoading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-background"></div> : 'Gerar Visualizer'}
                        </button>
                        {!apiKeyReady && <p className="text-amber-400 text-sm mt-4 text-center">Selecione uma chave de API para gerar vídeos.</p>}
                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    </div>
                </div>

                <div className="display-panel-container">
                    <DisplayArea
                        mediaType="video"
                        mediaUrl={resultUrl}
                        isLoading={isLoading}
                        prompt="Gerando seu visualizer..."
                        isAnimationDisabled={true}
                    />
                </div>
            </div>
        </>
    );
};

export default VisualizerEngine;
