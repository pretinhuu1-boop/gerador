// components/studios/CinemaStudio.tsx
import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';

import { ImageFile, CinemaGenre, FilmmakerFormData, GeneratedScene } from '../../types';
import { CINEMA_GENRES } from '../../data/cinema_data';
import { refineScriptWithAI, runFilmmakerPipeline, generateCinemaSceneVideo, generateCinemaMasterFrame, editImageWithFlash } from '../../services/geminiService';
import { ApiKeyError } from '../../services/errors';

import ReferenceUploader from '../ReferenceUploader';
import { ChevronDownIcon, ClapperboardIcon, DownloadIcon, FilmIcon, ImageIcon, RefreshCwIcon, SparklesIcon, UserIcon, VideoIcon, WandIcon, EditIcon, LayersIcon, ZapIcon, BookOpenIcon } from '../icons';

interface CinemaStudioProps {
    apiKeyReady: boolean;
    onSelectKey: () => Promise<void>;
}

// Cinema System Modules Definition
const cinemaSystemModules = [
    { id: "ASSISTANT_DIR", name: "AI Assistant Director", type: "AGENT", status: "ONLINE", description: "Refina ideias brutas em roteiros estruturados com começo, meio e fim." },
    { id: "MASTER_FILMMAKER", name: "Master Filmmaker Core", type: "AGENT", status: "ONLINE", description: "Diretor de Fotografia IA. Decupa roteiros em shot lists técnicos (16:9, 8s) com alto rigor estético." },
    { id: "KB_CINEMA_V2", name: "Cinematic Knowledge Base", type: "LIBRARY", status: "ACTIVE", description: "Bíblia de lentes (Primes/Anamorphic), iluminação (Key/Fill/Rim), grão 35mm e composição." },
    { id: "GENRE_ENGINE", name: "Dynamic Genre Adapter", type: "ENGINE", status: "ACTIVE", description: "Ajusta estética e regras de física baseada no gênero (Sci-Fi, Noir, Neorealismo)." },
    { id: "PCC_CONTEXT", name: "Cultural Context Injection", type: "CONTEXT", status: "STANDBY", description: "Injeta nuances culturais locais (ex: Neorrealismo Brasileiro) quando ativado." },
    { id: "VEO_VID_GEN", name: "Veo Video Generator", type: "ENGINE", status: "ONLINE", description: "Renderizador de vídeo generativo de alta fidelidade (1080p)." },
    { id: "FACE_LOCK_SYS", name: "Consistency Keeper", type: "ENGINE", status: "ACTIVE", description: "Mantém a identidade do ator (Face-Lock) e consistência de cenário entre frames." },
];

// Re-using CollapsibleSection for consistent UI
const CollapsibleSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean, subtitle?: string }> = ({ title, icon, children, defaultOpen = false, subtitle }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-panel-light p-5 rounded-lg border border-border w-full transition-all duration-300">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <div className="flex items-center gap-3">
                    {icon}
                    <div>
                        <h2 className="font-bold text-lg text-primary">{title}</h2>
                        {subtitle && <p className="text-xs text-white/60 -mt-1">{subtitle}</p>}
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="mt-6 animate-creation">{children}</div>}
        </div>
    );
};

const CinemaStudio: React.FC<CinemaStudioProps> = ({ apiKeyReady, onSelectKey }) => {
    const [formData, setFormData] = useState<FilmmakerFormData>({
        scriptIdea: 'Um jovem da periferia sonha em ser um grande cineasta. Ele usa sua criatividade para transformar a dura realidade ao seu redor em arte, provando que o talento não tem CEP.',
        scriptText: '',
        genreId: CINEMA_GENRES[0].id,
        castingPhotos: [],
        locationPhotos: [],
    });
    const [storyboard, setStoryboard] = useState<GeneratedScene[]>([]);
    const [loadingState, setLoadingState] = useState<{
        isRefiningScript: boolean;
        isGeneratingPlan: boolean;
    }>({ isRefiningScript: false, isGeneratingPlan: false });
    const [error, setError] = useState<string | null>(null);
    const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

    const handleFormChange = <T extends keyof FilmmakerFormData>(field: T, value: FilmmakerFormData[T]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const convertUrlToImageFile = async (url: string): Promise<ImageFile> => {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "master_frame.png", { type: blob.type });
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

    const handleRefineScript = async () => {
        if (!formData.scriptIdea) {
            setError("Por favor, insira uma ideia para o roteiro.");
            return;
        }
        setLoadingState(prev => ({ ...prev, isRefiningScript: true }));
        setError(null);
        try {
            const selectedGenre = CINEMA_GENRES.find(g => g.id === formData.genreId);
            const refinedScript = await refineScriptWithAI(formData.scriptIdea, selectedGenre?.name || 'Drama');
            handleFormChange('scriptText', refinedScript);
        } catch (e: any) {
            setError(e.message || "Falha ao refinar o roteiro.");
        } finally {
            setLoadingState(prev => ({ ...prev, isRefiningScript: false }));
        }
    };

    const handleGeneratePlan = async () => {
        if (!formData.scriptText) {
            setError("É necessário um roteiro. Use o 'Diretor Assistente' ou escreva um.");
            return;
        }
        setLoadingState(prev => ({ ...prev, isGeneratingPlan: true }));
        setError(null);
        setStoryboard([]);
        try {
            const selectedGenre = CINEMA_GENRES.find(g => g.id === formData.genreId);
            if (!selectedGenre) throw new Error("Gênero selecionado inválido.");
            
            const shots = await runFilmmakerPipeline(formData.scriptText, selectedGenre, formData.castingPhotos, formData.locationPhotos);
            const initialScenes: GeneratedScene[] = shots.map(shot => ({ ...shot, id: uuidv4(), isGeneratingMasterFrame: false, isGeneratingVideo: false, editPrompt: '' }));
            setStoryboard(initialScenes);
        } catch (e: any) {
            setError(e.message || "Falha ao gerar o plano de filmagem.");
        } finally {
            setLoadingState(prev => ({ ...prev, isGeneratingPlan: false }));
        }
    };

    const handleGenerateMasterFrame = async (sceneId: string, useAux?: number) => {
        setStoryboard(produce(draft => {
            const scene = draft.find(s => s.id === sceneId);
            if (scene) scene.isGeneratingMasterFrame = true;
        }));
        setError(null);
        try {
            const scene = storyboard.find(s => s.id === sceneId);
            let prompt = scene?.master_frame_description;
            if (useAux === 1) prompt = scene?.aux_frame_1_description;
            if (useAux === 2) prompt = scene?.aux_frame_2_description;

            if (!prompt) throw new Error("Descrição do Master Frame não encontrada.");

            const imageUrl = await generateCinemaMasterFrame(prompt, formData.castingPhotos, formData.locationPhotos);
            setStoryboard(produce(draft => {
                const scene = draft.find(s => s.id === sceneId);
                if (scene) {
                    scene.masterFrameUrl = imageUrl;
                }
            }));
        } catch(e: any) {
            setError(e.message || `Falha ao gerar Master Frame para a cena ${sceneId}.`);
        } finally {
            setStoryboard(produce(draft => {
                const scene = draft.find(s => s.id === sceneId);
                if (scene) scene.isGeneratingMasterFrame = false;
            }));
        }
    };

    const handleEditMasterFrame = async (sceneId: string) => {
        const sceneToEdit = storyboard.find(s => s.id === sceneId);
        if (!sceneToEdit || !sceneToEdit.masterFrameUrl || !sceneToEdit.editPrompt) {
            setError("Escreva uma instrução de edição para o frame.");
            return;
        }
        setStoryboard(produce(draft => {
            const scene = draft.find(s => s.id === sceneId);
            if (scene) scene.isGeneratingMasterFrame = true;
        }));
        setError(null);
        try {
            const imageFile = await convertUrlToImageFile(sceneToEdit.masterFrameUrl);
            const newImageUrl = await editImageWithFlash(imageFile, sceneToEdit.editPrompt, formData.castingPhotos);
            setStoryboard(produce(draft => {
                const scene = draft.find(s => s.id === sceneId);
                if (scene) {
                    scene.masterFrameUrl = newImageUrl;
                    scene.editPrompt = ''; // Clear prompt after use
                }
            }));
        } catch (e: any) {
             setError(e.message || `Falha ao editar o frame.`);
        } finally {
             setStoryboard(produce(draft => {
                const scene = draft.find(s => s.id === sceneId);
                if (scene) scene.isGeneratingMasterFrame = false;
            }));
        }
    };


    const handleFilmScene = useCallback(async (sceneId: string) => {
        if (!apiKeyReady) {
            await onSelectKey();
            const hasKey = window.aistudio && await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                 setError("É necessário selecionar uma chave de API para filmar as cenas.");
                return;
            }
        }
        
        const sceneToFilm = storyboard.find(s => s.id === sceneId);
        if (!sceneToFilm || !sceneToFilm.masterFrameUrl) {
             setError("Gere um Master Frame antes de animar a cena.");
            return;
        }

        setStoryboard(produce(draft => {
            const scene = draft.find(s => s.id === sceneId);
            if (scene) scene.isGeneratingVideo = true;
        }));
        setError(null);

        try {
            const masterFrameFile = await convertUrlToImageFile(sceneToFilm.masterFrameUrl);
            const videoUrl = await generateCinemaSceneVideo(sceneToFilm.description, masterFrameFile, formData.castingPhotos, formData.locationPhotos);

            setStoryboard(produce(draft => {
                const scene = draft.find(s => s.id === sceneId);
                if (scene) {
                    scene.videoUrl = videoUrl;
                }
            }));
        } catch (e: any) {
            setError(e.message || `Falha ao filmar a cena ${sceneToFilm.shot_number}.`);
        } finally {
            setStoryboard(produce(draft => {
                const scene = draft.find(s => s.id === sceneId);
                if (scene) scene.isGeneratingVideo = false;
            }));
        }
    }, [apiKeyReady, onSelectKey, storyboard, formData.castingPhotos, formData.locationPhotos]);


    return (
        <div className="studio-grid">
            {/* System Modules Modal */}
            {isSystemModalOpen && (
                <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4" onClick={() => setIsSystemModalOpen(false)}>
                    <div className="bg-[#1E1F22] rounded-lg shadow-xl max-w-4xl w-full h-[80vh] flex flex-col border border-white/10 modal-fade" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/30 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <ClapperboardIcon className="w-6 h-6 text-primary" />
                                <div>
                                    <h3 className="text-xl font-bold text-white">Cinema Core & Pipeline Modules</h3>
                                    <p className="text-xs text-white/50">Arquitetura de Inteligência do Estúdio de Cinema</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSystemModalOpen(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-grow bg-[#131314]">
                            <div className="grid grid-cols-1 gap-4">
                                {cinemaSystemModules.map((mod) => (
                                    <div key={mod.id} className="bg-panel border border-border p-4 rounded-lg flex items-center gap-4 hover:border-primary/50 transition-colors">
                                        <div className={`p-3 rounded-md ${mod.status === 'ONLINE' || mod.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {mod.type === 'AGENT' && <UserIcon className="w-6 h-6" />}
                                            {mod.type === 'ENGINE' && <ZapIcon className="w-6 h-6" />}
                                            {mod.type === 'LIBRARY' && <BookOpenIcon className="w-6 h-6" />}
                                            {mod.type === 'CONTEXT' && <SparklesIcon className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-white text-sm">{mod.name} <span className="text-xs font-mono text-white/40 ml-2">[{mod.id}]</span></h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mod.status === 'ONLINE' || mod.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                    {mod.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/60">{mod.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-black/30 border-t border-white/10 text-center text-[10px] text-white/40 font-mono">
                            PIPELINE STATUS: OPTIMIZED | RENDER ENGINE: VEO 3.1 | CONTEXT: 128K
                        </div>
                    </div>
                </div>
            )}

            <div className="controls-panel">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white hidden">Estúdio de Cinema</h2> {/* Hidden for layout alignment */}
                    <button 
                        onClick={() => setIsSystemModalOpen(true)}
                        className="w-full text-[10px] font-mono bg-white/5 hover:bg-white/10 text-white/60 hover:text-primary px-3 py-1.5 rounded border border-white/10 transition-colors flex items-center justify-center gap-2 mb-2"
                    >
                        <LayersIcon className="w-3 h-3" />
                        SYSTEM CORE
                    </button>
                </div>

                <div className="space-y-4">
                    <CollapsibleSection title="Fase 1: Pré-Produção" subtitle="Prepare seus assets" icon={<UserIcon className="w-6 h-6 text-primary" />} defaultOpen>
                        <div className="space-y-4">
                            <ReferenceUploader label="Fotos do Elenco (Casting)" files={formData.castingPhotos} onFilesChange={f => handleFormChange('castingPhotos', f)} maxFiles={3} />
                            <ReferenceUploader label="Fotos das Locações (Scouting)" files={formData.locationPhotos} onFilesChange={f => handleFormChange('locationPhotos', f)} maxFiles={3} />
                            <div className="bg-black/30 p-3 rounded-md text-xs text-white/70">
                                <strong>Nota:</strong> Para garantir a diretriz cinematográfica, gere os assets de casting e locação no **Estúdio de Ferramentas** com a **proporção 16:9** e estética ultra-realista.
                            </div>
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Fase 2: Direção" subtitle="Crie o plano de filmagem" icon={<WandIcon className="w-6 h-6 text-primary" />} defaultOpen>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Gênero Cinematográfico</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CINEMA_GENRES.map(genre => (
                                        <button key={genre.id} onClick={() => handleFormChange('genreId', genre.id)} className={`form-button ${formData.genreId === genre.id ? 'active' : ''}`}>{genre.name}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="scriptIdea" className="block text-sm font-medium text-white/80 mb-2">Sua Ideia Inicial</label>
                                <textarea id="scriptIdea" rows={4} value={formData.scriptIdea} onChange={e => handleFormChange('scriptIdea', e.target.value)} className="form-textarea" />
                                <button onClick={handleRefineScript} disabled={loadingState.isRefiningScript} className="secondary-action-button w-full mt-2">
                                    {loadingState.isRefiningScript ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : 'IA: Diretor Assistente (Refinar Roteiro)'}
                                </button>
                            </div>
                            <div>
                                <label htmlFor="scriptText" className="block text-sm font-medium text-white/80 mb-2">Roteiro para Decupagem</label>
                                <textarea id="scriptText" rows={6} value={formData.scriptText} onChange={e => handleFormChange('scriptText', e.target.value)} className="form-textarea" placeholder="O roteiro refinado pela IA aparecerá aqui, ou escreva o seu." />
                            </div>
                            <button onClick={handleGeneratePlan} disabled={loadingState.isGeneratingPlan || !formData.scriptText} className="action-button">
                                {loadingState.isGeneratingPlan ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-background"></div> : 'IA: Cineasta Mestre (Gerar Plano de Filmagem)'}
                            </button>
                        </div>
                    </CollapsibleSection>
                </div>
            </div>
            
            <div className="display-panel-container !block !p-0 overflow-y-auto">
                <div className="p-6 space-y-6">
                    <CollapsibleSection title="Fase 3: Filmagem" subtitle="Produza cada cena" icon={<ClapperboardIcon className="w-6 h-6 text-primary" />} defaultOpen>
                        {storyboard.length === 0 && !loadingState.isGeneratingPlan && (
                            <div className="text-center text-white/60 py-8">
                                <FilmIcon className="w-12 h-12 mx-auto mb-3" />
                                <p className="font-semibold">O plano de filmagem aparecerá aqui.</p>
                                <p className="text-sm">Complete a Fase 2 para gerar o storyboard.</p>
                            </div>
                        )}
                        {loadingState.isGeneratingPlan && (
                             <div className="text-center text-white/80 py-8">
                                <div className="animate-pulse">
                                    <SparklesIcon className="w-12 h-12 mx-auto mb-4" />
                                </div>
                                <p className="font-semibold">O Cineasta Mestre está trabalhando...</p>
                                <p className="text-sm text-white/60 mt-1">Decupando o roteiro e criando as descrições de cena.</p>
                            </div>
                        )}
                        <div className="space-y-4">
                            {storyboard.map((scene) => (
                                <div key={scene.id} className="bg-panel p-4 rounded-lg border border-border">
                                    <h4 className="font-bold text-md mb-2 text-primary">Cena {scene.shot_number} ({scene.duration_seconds}s)</h4>
                                    <p className="text-xs text-white/80 mb-4">{scene.description}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                        {/* Master Frame Display Area */}
                                        <div className="aspect-video bg-black rounded-md flex items-center justify-center relative overflow-hidden">
                                            {scene.isGeneratingMasterFrame && (
                                                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center text-white/80 p-2 z-20">
                                                    <div className="animate-pulse"><ImageIcon className="w-8 h-8 mx-auto mb-2" /></div>
                                                    <p className="font-semibold text-xs">Gerando Master Frame...</p>
                                                </div>
                                            )}
                                            {scene.isGeneratingVideo && (
                                                 <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center text-white/80 p-2 z-20">
                                                    <div className="animate-pulse"><FilmIcon className="w-8 h-8 mx-auto mb-2" /></div>
                                                    <p className="font-semibold text-xs">Filmando... pode levar alguns minutos.</p>
                                                </div>
                                            )}
                                            {scene.videoUrl ? (
                                                <div className="relative w-full h-full group">
                                                    <video key={scene.videoUrl} src={scene.videoUrl} controls loop muted className="w-full h-full object-cover rounded-md" />
                                                    <a href={scene.videoUrl} download={`cena_${scene.shot_number}.mp4`} className="absolute bottom-2 right-2 z-10 bg-primary text-white p-2 rounded-full hover:bg-secondary transition-colors shadow-md opacity-0 group-hover:opacity-100">
                                                        <DownloadIcon className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            ) : scene.masterFrameUrl ? (
                                                <img src={scene.masterFrameUrl} alt={`Master Frame Cena ${scene.shot_number}`} className="w-full h-full object-cover rounded-md"/>
                                            ) : (
                                                 <div className="text-center text-white/60 p-2">
                                                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                                    <p className="font-semibold text-xs">Master Frame aparecerá aqui</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Controls Area */}
                                        <div className="space-y-3">
                                            {!scene.videoUrl && (
                                                <>
                                                    {scene.masterFrameUrl && (
                                                        <div className="space-y-3 p-3 bg-black/20 rounded-lg">
                                                            <div className="flex gap-2">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Instrução para editar o frame (Ex: adicione névoa)"
                                                                    value={scene.editPrompt}
                                                                    onChange={e => setStoryboard(produce(draft => { const s = draft.find(d => d.id === scene.id); if(s) s.editPrompt = e.target.value; }))}
                                                                    className="form-textarea !text-xs !py-1 flex-grow"
                                                                />
                                                                 <button onClick={() => handleEditMasterFrame(scene.id)} disabled={scene.isGeneratingMasterFrame || !scene.editPrompt} className="form-button !px-2" title="Editar Frame com IA"><EditIcon className="w-4 h-4" /></button>
                                                            </div>
                                                            <button onClick={() => handleGenerateMasterFrame(scene.id)} disabled={scene.isGeneratingMasterFrame} className="secondary-action-button w-full text-xs">
                                                                <RefreshCwIcon className="w-4 h-4 mr-2"/> Gerar Nova Versão
                                                            </button>
                                                        </div>
                                                    )}

                                                    {!scene.masterFrameUrl ? (
                                                        <button onClick={() => handleGenerateMasterFrame(scene.id)} disabled={scene.isGeneratingMasterFrame} className="action-button !bg-primary !text-white text-sm">
                                                            <ImageIcon className="w-4 h-4 mr-2"/> 1. Gerar Master Frame
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleFilmScene(scene.id)} disabled={scene.isGeneratingVideo || !apiKeyReady} className="action-button !bg-accent !text-background text-sm">
                                                           <ClapperboardIcon className="w-4 h-4 mr-2"/> 2. Animar Cena
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {scene.videoUrl && (
                                                <div className="p-4 bg-green-900/50 rounded-lg text-center">
                                                    <p className="font-bold text-green-300">Cena Filmada!</p>
                                                    <p className="text-xs text-white/80">Baixe o vídeo e prossiga para a próxima cena.</p>
                                                </div>
                                            )}
                                            {!apiKeyReady && !scene.videoUrl && <p className="text-amber-400 text-xs mt-2 text-center">Selecione uma chave de API para animar.</p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CollapsibleSection>

                    <CollapsibleSection title="Fase 4: Montagem" subtitle="Finalize seu curta" icon={<VideoIcon className="w-6 h-6 text-primary" />}>
                        <div className="text-sm text-white/80 space-y-3 bg-panel p-4 rounded-lg">
                           <p>Parabéns, diretor(a)!</p>
                           <p>Agora que você "filmou" suas cenas, o próximo passo é a pós-produção. Baixe cada clipe de vídeo individualmente usando o botão de download que aparece sobre o vídeo.</p>
                           <p>Importe os clipes para o seu editor de vídeo preferido (como CapCut, Adobe Premiere, DaVinci Resolve) para montar o seu curta-metragem, adicionar a trilha sonora, efeitos e finalizar sua obra-prima.</p>
                        </div>
                    </CollapsibleSection>
                    {error && <div className="fixed bottom-4 right-4 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50 animate-creation">{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default CinemaStudio;