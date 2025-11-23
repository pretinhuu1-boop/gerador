
// components/studios/DecupagemStudio.tsx
import React, { useState } from 'react';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import { DecupagemFormData, DecupagemScene, ImageFile, DecupagemShot, SibOutput, AudioFile } from '../../types';
import { parseScriptToScenes, runSIB, runDecoupageEngine, generateSingleDecupagemFrame, runVideoEngine, generateVeoVideoFromPrompt } from '../../services/geminiService';
import { ApiKeyError } from '../../services/errors';
import { FilmIcon, ImageIcon, SparklesIcon, ClapperboardIcon, RefreshCwIcon, DownloadIcon, BookOpenIcon, CopyIcon, ChevronDownIcon, CheckCircleIcon, LayersIcon, ZapIcon, UserIcon } from '../icons';
import ReferenceUploader from '../ReferenceUploader';
import CheckboxGroup from '../CheckboxGroup';
import AudioInput from '../AudioInput';
import { bRollLibrary } from '../../data/b_roll_library';

const aestheticPresets = [
    { id: 'cinematic_realism', name: 'Realismo Cinematográfico' },
    { id: 'urban_noir', name: 'Noir Urbano' },
    { id: 'editorial_ammar_clean', name: 'Editorial Clean (Ammar)' },
    { id: 'trap_contemporaneo_grit', name: 'Trap Contemporâneo (Grit Urbano)' },
    { id: 'funk_periferia_sp_raw', name: 'Funk Periferia SP (Raw)' },
    { id: 'retro_film_70s', name: 'Filme Retrô (Anos 70)' },
    { id: 'ethereal_dream', name: 'Etéreo / Sonhador' },
    { id: 'documental_brasileiro', name: 'Documental Brasileiro' },
    { id: 'anime_style', name: 'Estilo Anime' },
];

const bRollOptions = bRollLibrary.map(cat => ({ id: cat.title, label: cat.title }));

// System Modules Definition
const systemModules = [
    { id: "SIB_V2.5", name: "Semantic Intent Builder", type: "AGENT", status: "ONLINE", description: "Roteirista Mestre. Analisa áudio/texto e define a intenção criativa e estrutura JSON." },
    { id: "DECOUPAGE_ENG", name: "Decoupage Logic Core", type: "ENGINE", status: "ONLINE", description: "Diretor de Fotografia. Traduz intenção em parâmetros técnicos de câmera e luz." },
    { id: "VIDEO_ARCH", name: "Veo Prompt Architect", type: "ENGINE", status: "ONLINE", description: "Tradutor de Prompt. Converte JSON estrutural em prompts narrativos para geração de vídeo." },
    { id: "DRC_V1_0", name: "Directing Ref. Creative", type: "LIBRARY", status: "ACTIVE", description: "Bíblia de Realismo. Regras de física, gravidade e óptica para evitar alucinações da IA." },
    { id: "CME_V1_0", name: "Cinematic Motion Engine", type: "LIBRARY", status: "ACTIVE", description: "Linguagem de Câmera. Define 30 movimentos canônicos e psicologia das lentes (18mm a 135mm)." },
    { id: "CLAFE_V1_0", name: "Cine Light & Atmos FX", type: "LIBRARY", status: "ACTIVE", description: "Motor de Iluminação. Controla Key/Fill/Rim, temperatura de cor e volumetria (Haze/Fog)." },
    { id: "CIME_V1_0", name: "Internal Motion Engine", type: "LIBRARY", status: "ACTIVE", description: "Física de Partículas. Simula vento, poeira, fumaça e micro-movimentos do ambiente." },
    { id: "RSSE_V1_0", name: "Real Surface Sim.", type: "LIBRARY", status: "ACTIVE", description: "Texturas PBR. Simula materiais reais (pele, metal, tecido) e micro-imperfeições." },
    { id: "WARDROBE_ENG", name: "Wardrobe Aesthetics", type: "LIBRARY", status: "ACTIVE", description: "Styling Digital. Define caimento, tecido e reação da roupa à luz e movimento." },
    { id: "ACTOR_BEHAVIOR", name: "Performance Engine", type: "LIBRARY", status: "ACTIVE", description: "Direção de Ator. Define as 10 leis da fisicalidade e micro-expressões faciais." },
    { id: "IMG_SCIENCE_4K", name: "4K Render Science", type: "LIBRARY", status: "ACTIVE", description: "Qualidade de Imagem. Garante pureza de pixel, microcontraste e evita 'look plástico'." },
    { id: "TRAP_STYLE", name: "Genre: TRAP/FUNK", type: "CONTEXT", status: "STANDBY", description: "Estética de Gênero. Ativado para presets urbanos (Grillz, Neon, Rua)." },
    { id: "VFX_PHYSICS", name: "VFX Physics Core", type: "CONTEXT", status: "STANDBY", description: "Simulação de Caos. Gerencia explosões, fogo e destruição com 5 fases físicas." },
    { id: "NARRATIVE_LIB", name: "Narrative Archetypes", type: "LIBRARY", status: "ACTIVE", description: "Estruturas de História. Define arcos emocionais e progressão de cena." },
];

// Helper to convert URL to ImageFile, needed for continuity.
const convertUrlToImageFile = async (url: string, fileName = "image.png"): Promise<ImageFile> => {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (!reader.result) {
                return reject(new Error("Failed to read file as data URL."));
            }
            const base64 = (reader.result as string).split(',')[1];
            resolve({ name: file.name, type: file.type, size: file.size, base64, preview: url });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const ShotDetails: React.FC<{ shot: DecupagemShot }> = ({ shot }) => {
    const [isOpen, setIsOpen] = useState(false);
    if (!shot.technicalDecupage) return null;

    return (
        <div className="mt-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left text-xs font-semibold text-white/70 hover:text-white">
                <span>Ver Detalhes Técnicos da IA</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="mt-2 space-y-3 bg-black/30 p-3 rounded-md text-xs">
                    <div>
                        <h6 className="font-bold text-accent">Decupagem Técnica</h6>
                        <p className="text-white/80 whitespace-pre-wrap">{shot.technicalDecupage}</p>
                    </div>
                    <div>
                        <h6 className="font-bold text-accent">JSON Estrutural</h6>
                        <pre className="whitespace-pre-wrap bg-black/40 p-2 rounded text-white/70 text-[10px] max-h-40 overflow-auto"><code>{JSON.stringify(shot.structuralJson, null, 2)}</code></pre>
                    </div>
                </div>
            )}
        </div>
    )
}

interface DecupagemStudioProps {
    apiKeyReady: boolean;
    onSelectKey: () => Promise<void>;
}

const DecupagemStudio: React.FC<DecupagemStudioProps> = ({ apiKeyReady, onSelectKey }) => {
    const [formData, setFormData] = useState<DecupagemFormData>({
        script: '',
        actor1Name: 'ATOR 1',
        actor1Photos: [],
        actor2Name: 'ATOR 2',
        actor2Photos: [],
        actor3Name: 'ATOR 3',
        actor3Photos: [],
        aestheticPreset: 'cinematic_realism',
        aspectRatio: '16:9',
        bRollCategoryIds: [],
    });
    const [storyboard, setStoryboard] = useState<DecupagemScene[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
    const [sibIdea, setSibIdea] = useState('Um clipe de trap sobre superação na cidade à noite, com chuva e neon.');
    const [sibOutput, setSibOutput] = useState<SibOutput | null>(null);
    const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
    const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);

    const handleFormChange = <T extends keyof DecupagemFormData>(field: T, value: DecupagemFormData[T]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateScriptWithSib = async () => {
        if (!sibIdea) {
            setError("Por favor, insira uma ideia para o roteiro.");
            return;
        }
        setIsGeneratingScript(true);
        setError(null);
        setStoryboard([]); // Clear old storyboard
        handleFormChange('script', ''); // Clear old script text
        setSibOutput(null); // Clear old SIB output
        
        try {
            let finalIdea = sibIdea;
            if (audioFile) {
                finalIdea += "\n\n[CONTEXTO ADICIONAL]: O usuário enviou um arquivo de áudio musical. A intenção é criar um VIDEOCLIPE para esta música. A análise semântica e a criação das cenas devem seguir a estética de um videoclipe musical moderno.";
            } else {
                finalIdea += "\n\n[CONTEXTO ADICIONAL]: A intenção é criar uma CENA DE CINEMA. A análise semântica e a criação das cenas devem seguir a estética cinematográfica tradicional.";
            }

            const output = await runSIB(finalIdea, audioFile);
            setSibOutput(output);
            handleFormChange('script', output.cenasPreparadas);
        } catch (e: any) {
            setError(e.message || "Falha ao gerar o roteiro com SIB.");
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const handleDecupagem = async () => {
        if (!formData.script || formData.actor1Photos.length === 0) {
            setError("Roteiro e pelo menos uma foto para o Ator 1 são obrigatórios.");
            return;
        }
        setIsLoading(true);
        setError(null);
        
        const scenes = parseScriptToScenes(formData.script);
        setStoryboard(scenes);

        for (const scene of scenes) {
            for (const shot of scene.shots) {
                // This is the persistent continuity memory ONLY for the current shot.
                const shotContinuityFrames: ImageFile[] = [];

                setStoryboard(produce(draft => {
                    const s = draft.find(s => s.id === scene.id);
                    const f = s?.shots.find(f => f.id === shot.id);
                    if (f) f.isLoading = true;
                }));

                try {
                    // STEP 1: Run Decoupage Engine to get descriptions
                    const decupagemOutput = await runDecoupageEngine(formData, scene, shot, formData.script, sibOutput);
                    
                    setStoryboard(produce(draft => {
                        const s = draft.find(d => d.id === scene.id);
                        if(s) {
                            const currentShot = s.shots.find(f => f.id === shot.id);
                            if (currentShot) {
                                currentShot.technicalDecupage = decupagemOutput.technicalDecupage;
                                currentShot.frameDescriptions = decupagemOutput.frameDescriptions;
                                currentShot.framesSuperPrompt = decupagemOutput.framesSuperPrompt;
                                currentShot.structuralJson = decupagemOutput.structuralJson;
                                currentShot.frameImageUrls = [];
                            }
                        }
                    }));
                    
                    // STEP 2: Generate 3 frames sequentially for continuity WITHIN this shot
                    const frameUrls: string[] = [];
                    const frameDescriptions = [
                        decupagemOutput.frameDescriptions.frame_1,
                        decupagemOutput.frameDescriptions.frame_2,
                        decupagemOutput.frameDescriptions.frame_3,
                    ];
                    
                    for (const desc of frameDescriptions) {
                        const imageUrl = await generateSingleDecupagemFrame(desc, formData, scene, shot, shotContinuityFrames, formData.script);
                        frameUrls.push(imageUrl);
                        const imageFile = await convertUrlToImageFile(imageUrl);
                        shotContinuityFrames.push(imageFile); // Add to the SHOT's memory

                        setStoryboard(produce(draft => {
                           const s = draft.find(d => d.id === scene.id);
                            if(s) {
                                const currentShot = s.shots.find(f => f.id === shot.id);
                                if (currentShot) {
                                    currentShot.frameImageUrls = [...frameUrls];
                                }
                            }
                        }));
                    }

                } catch (e: any) {
                    setError(`Erro ao gerar plano ${shot.plan}: ${e.message}`);
                    setIsLoading(false);
                    return; // Stop on error
                } finally {
                     setStoryboard(produce(draft => {
                        const s = draft.find(d => d.id === scene.id);
                        if(s) {
                            const f = s.shots.find(fr => fr.id === shot.id);
                            if (f) {
                                 f.isLoading = false;
                            }
                        }
                    }));
                }
            }
        }
        setIsLoading(false);
    };
    
    const handleGenerateVeoPrompt = async (sceneId: string, shotId: string) => {
        const scene = storyboard.find(s => s.id === sceneId);
        const shot = scene?.shots.find(f => f.id === shotId);

        if (!shot || !shot.frameImageUrls || shot.frameImageUrls.length < 3) {
            setError("Os 3 frames precisam ser gerados antes de criar o prompt de vídeo.");
            return;
        }

        setStoryboard(produce(draft => {
            const s = draft.find(d => d.id === sceneId);
            if(s) {
                const f = s.shots.find(fr => fr.id === shotId);
                if (f) f.isGeneratingVeoPrompt = true;
            }
        }));
        setError(null);

        try {
            const frameImageFiles = await Promise.all(shot.frameImageUrls.map(url => convertUrlToImageFile(url)));
            const veoPrompt = await runVideoEngine(shot, frameImageFiles, formData);

            setStoryboard(produce(draft => {
                const s = draft.find(d => d.id === sceneId);
                if(s) {
                    const f = s.shots.find(fr => fr.id === shotId);
                    if (f) {
                        f.veoPrompt = veoPrompt;
                    }
                }
            }));
        } catch (e: any) {
            setError(`Erro ao gerar prompt VEO: ${e.message}`);
        } finally {
             setStoryboard(produce(draft => {
                const s = draft.find(d => d.id === sceneId);
                if(s) {
                    const f = s.shots.find(fr => fr.id === shotId);
                    if (f) f.isGeneratingVeoPrompt = false;
                }
            }));
        }
    };

    const handleFilmScene = async (sceneId: string, shotId: string) => {
        if (!apiKeyReady) {
            await onSelectKey();
            // Re-check after attempting to select key
            const hasKey = window.aistudio && await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                 setError("É necessário selecionar uma chave de API para filmar a cena.");
                return;
            }
        }
        
        const scene = storyboard.find(s => s.id === sceneId);
        const shot = scene?.shots.find(f => f.id === shotId);

        if (!shot || !shot.veoPrompt || !shot.frameImageUrls || shot.frameImageUrls.length < 3) {
            setError("O prompt VEO e os 3 frames são necessários para filmar.");
            return;
        }

        setStoryboard(produce(draft => {
            const s = draft.find(d => d.id === sceneId);
            if(s) {
                const f = s.shots.find(fr => fr.id === shotId);
                if (f) f.isGeneratingVideo = true;
            }
        }));
        setError(null);
        
        try {
            const startImage = await convertUrlToImageFile(shot.frameImageUrls[0]);
            const endImage = await convertUrlToImageFile(shot.frameImageUrls[2]);
            
            const videoUrl = await generateVeoVideoFromPrompt(shot.veoPrompt, formData.aspectRatio, startImage, endImage);

             setStoryboard(produce(draft => {
                const s = draft.find(d => d.id === sceneId);
                if(s) {
                    const f = s.shots.find(fr => fr.id === shotId);
                    if (f) f.videoUrl = videoUrl;
                }
            }));

        } catch (e: any) {
            if (e instanceof ApiKeyError) {
                setError(e.message);
                // Optionally trigger re-selection of key
                onSelectKey();
            } else {
                setError(`Falha ao filmar cena: ${e.message}`);
            }
        } finally {
            setStoryboard(produce(draft => {
                const s = draft.find(d => d.id === sceneId);
                if(s) {
                    const f = s.shots.find(fr => fr.id === shotId);
                    if (f) f.isGeneratingVideo = false;
                }
            }));
        }
    };


    const handleRerollFrame = async (sceneId: string, shotId: string) => {
        const targetScene = storyboard.find(s => s.id === sceneId);
        if (!targetScene) return;

        const shotToReroll = targetScene.shots.find(f => f.id === shotId);
        if (!shotToReroll) return;

        setStoryboard(produce(draft => {
            const s = draft.find(d => d.id === sceneId);
            if(s) {
                const f = s.shots.find(fr => fr.id === shotId);
                if (f) {
                    f.isLoading = true;
                    f.frameImageUrls = [];
                    f.veoPrompt = undefined;
                    f.frameDescriptions = undefined;
                    f.videoUrl = undefined;
                }
            }
        }));
        setError(null);

        try {
            const decupagemOutput = await runDecoupageEngine(formData, targetScene, shotToReroll, formData.script, sibOutput);
             setStoryboard(produce(draft => {
                const s = draft.find(d => d.id === sceneId);
                if(s) {
                    const f = s.shots.find(fr => fr.id === shotId);
                    if (f) Object.assign(f, decupagemOutput);
                }
            }));

            const frameUrls: string[] = [];
            const localContinuityFrames: ImageFile[] = [];
            for (const desc of Object.values(decupagemOutput.frameDescriptions)) {
                const imageUrl = await generateSingleDecupagemFrame(desc, formData, targetScene, shotToReroll, localContinuityFrames, formData.script);
                frameUrls.push(imageUrl);
                localContinuityFrames.push(await convertUrlToImageFile(imageUrl));
                setStoryboard(produce(draft => {
                    const s = draft.find(d => d.id === sceneId);
                    if(s) {
                        const f = s.shots.find(fr => fr.id === shotId);
                        if (f) f.frameImageUrls = [...frameUrls];
                    }
                }));
            }

        } catch (e: any) {
             setError(`Erro ao re-gerar plano: ${e.message}`);
        } finally {
            setStoryboard(produce(draft => {
                const s = draft.find(d => d.id === sceneId);
                if(s) {
                    const f = s.shots.find(fr => fr.id === shotId);
                    if (f) {
                         f.isLoading = false;
                    }
                }
            }));
        }
    };

    const handleCopyPrompt = (prompt: string, shotId: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPromptId(shotId);
        setTimeout(() => setCopiedPromptId(null), 2000);
    }


    return (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-4">
            
            {/* System Modules Modal */}
            {isSystemModalOpen && (
                <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4" onClick={() => setIsSystemModalOpen(false)}>
                    <div className="bg-[#1E1F22] rounded-lg shadow-xl max-w-4xl w-full h-[80vh] flex flex-col border border-white/10 modal-fade" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/30 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <LayersIcon className="w-6 h-6 text-accent" />
                                <div>
                                    <h3 className="text-xl font-bold text-white">System Core & Neural Modules</h3>
                                    <p className="text-xs text-white/50">Arquitetura de Inteligência Ativa do Decupagem Studio</p>
                                </div>
                            </div>
                            <button onClick={() => setIsSystemModalOpen(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-grow bg-[#131314]">
                            <div className="grid grid-cols-1 gap-4">
                                {systemModules.map((mod) => (
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
                            SYSTEM INTEGRITY: 100% | LATENCY: 12ms | CORE: GEMINI 2.5 PRO
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#1E1F22] p-6 rounded-lg flex flex-col gap-6 overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3"><ClapperboardIcon className="w-6 h-6 text-primary" /> Estúdio de Decupagem</h2>
                    <button 
                        onClick={() => setIsSystemModalOpen(true)}
                        className="text-[10px] font-mono bg-white/5 hover:bg-white/10 text-white/60 hover:text-accent px-3 py-1.5 rounded border border-white/10 transition-colors flex items-center gap-2"
                    >
                        <LayersIcon className="w-3 h-3" />
                        SYSTEM CORE
                    </button>
                </div>
                
                <section>
                    <h3 className="section-title !mb-4 !pb-2"><ImageIcon className="icon"/> 1. Elenco e Referências</h3>
                     <div className="space-y-4 bg-black/20 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="text-sm font-semibold text-white/80">Nome do Personagem no Roteiro</label>
                            <label className="text-sm font-semibold text-white/80">Fotos de Referência (Face-Lock)</label>
                        </div>
                        <div className="space-y-4">
                            {([1, 2, 3] as const).map(actorNum => (
                                <div key={actorNum} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    <input 
                                        type="text"
                                        value={formData[`actor${actorNum}Name` as keyof typeof formData] as string}
                                        onChange={e => handleFormChange(`actor${actorNum}Name` as any, e.target.value)}
                                        className="form-textarea !py-2 !text-sm"
                                        placeholder={`Ex: O INTENSO, CANTOR 1`}
                                    />
                                    <ReferenceUploader
                                        label={`Ator ${actorNum}`}
                                        files={formData[`actor${actorNum}Photos` as keyof typeof formData] as ImageFile[]}
                                        onFilesChange={files => handleFormChange(`actor${actorNum}Photos` as any, files)}
                                        maxFiles={5}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-white/60 mt-2">Nomeie os atores para a IA associar corretamente ao roteiro.</p>
                </section>
                
                <section>
                    <h3 className="section-title !mb-4 !pb-2"><FilmIcon className="icon"/> 2. Roteiro & Estética</h3>
                    <div className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-lg space-y-3">
                             <label htmlFor="sib-idea-input" className="block text-sm font-medium text-white/80">
                                Comece com uma ideia (Texto ou Áudio):
                            </label>
                            <textarea
                                id="sib-idea-input"
                                rows={3}
                                value={sibIdea}
                                onChange={(e) => setSibIdea(e.target.value)}
                                className="w-full bg-white/5 p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-primary font-sans text-sm"
                                placeholder="Ex: Um clipe de trap sobre superação na cidade à noite, com chuva e neon."
                            />
                             <AudioInput
                                label="Áudio de Referência (Opcional)"
                                audio={audioFile}
                                onAudioSelect={setAudioFile}
                            />
                             <p className="text-xs text-white/60 text-center">Enviar um áudio musical define a intenção como "Videoclipe". Sem áudio, a intenção é "Cinema".</p>
                             <button onClick={handleGenerateScriptWithSib} disabled={isGeneratingScript} className="secondary-action-button w-full">
                                {isGeneratingScript ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <><SparklesIcon className="w-5 h-5 mr-2"/>Gerar Roteiro com SIB</>}
                            </button>
                             <p className="text-xs text-white/60 text-center">A IA irá transformar sua ideia em um roteiro técnico e detalhado abaixo.</p>
                        </div>
                        <div>
                            <label htmlFor="script-input" className="block text-sm font-medium text-white/80 mb-2">
                                Roteiro Detalhado para Decupagem:
                            </label>
                            <textarea
                                id="script-input"
                                rows={15}
                                value={formData.script}
                                onChange={(e) => handleFormChange('script', e.target.value)}
                                className="w-full bg-white/5 p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-primary font-mono text-xs"
                                placeholder="Cole seu roteiro aqui ou use o SIB acima para gerar um."
                            />
                        </div>
                         <div>
                            <h4 className="block text-sm font-medium text-white/80 mb-2">Preset Estético Global</h4>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {aestheticPresets.map(p => (
                                    <button key={p.id} onClick={() => handleFormChange('aestheticPreset', p.id)} className={`form-button ${formData.aestheticPreset === p.id ? 'active' : ''}`}>{p.name}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="block text-sm font-medium text-white/80 mb-2">Proporção (Aspect Ratio)</h4>
                            <div className="button-grid">
                                <button onClick={() => handleFormChange('aspectRatio', '16:9')} className={`form-button ${formData.aspectRatio === '16:9' ? 'active' : ''}`}>16:9 (Horizontal)</button>
                                <button onClick={() => handleFormChange('aspectRatio', '9:16')} className={`form-button ${formData.aspectRatio === '9:16' ? 'active' : ''}`}>9:16 (Vertical)</button>
                            </div>
                        </div>
                    </div>
                </section>

                 <section>
                    <h3 className="section-title !mb-4 !pb-2"><BookOpenIcon className="icon"/> 3. Biblioteca de Referência (B-Roll)</h3>
                    <div className="space-y-4">
                       <CheckboxGroup 
                            label="Selecione as categorias de B-Roll para dar contexto à IA"
                            options={bRollOptions}
                            selected={formData.bRollCategoryIds}
                            onChange={(ids) => handleFormChange('bRollCategoryIds', ids)}
                       />
                       <p className="text-xs text-white/60 mt-2">A IA usará exemplos dessas bibliotecas como inspiração visual para garantir uma estética mais autêntica.</p>
                    </div>
                </section>
                
                <div className="mt-auto pt-4">
                    <button 
                        onClick={handleDecupagem} 
                        disabled={isLoading || !formData.script || formData.actor1Photos.length === 0}
                        className="action-button"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-background"></div> : 'Decupar Roteiro com IA'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
                </div>
            </div>
            <div className="bg-[#1E1F22] p-6 rounded-lg overflow-y-auto">
                 <h3 className="text-lg font-bold text-white mb-4">Plano de Cenas (Storyboard)</h3>
                 {storyboard.length > 0 ? (
                     <div className="space-y-6">
                         {storyboard.map(scene => (
                             <div key={scene.id} className="bg-black/20 p-4 rounded-lg">
                                 <h4 className="font-bold text-md text-primary mb-1">CENA {scene.sceneNumber}: "{scene.title}"</h4>
                                 <p className="text-xs text-white/70 mb-4">{scene.location} | {scene.emotion}</p>
                                 <div className="space-y-4">
                                     {scene.shots.map((shot) => (
                                         <div key={shot.id} className="shot-card bg-panel p-4 rounded-lg border border-transparent">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h5 className="font-bold text-white">{shot.plan}</h5>
                                                    <p className="text-xs text-white/60 font-mono">{shot.lens} | {shot.duration}</p>
                                                </div>
                                                <button onClick={() => handleRerollFrame(scene.id, shot.id)} disabled={shot.isLoading || shot.isGeneratingVideo} className="secondary-action-button !w-auto !text-xs" title="Re-gerar este plano">
                                                    <RefreshCwIcon className={`w-4 h-4 ${(shot.isLoading || shot.isGeneratingVideo) ? 'animate-spin' : ''}`} />
                                                </button>
                                            </div>
                                             <p className="text-xs text-white/80 mb-3">{shot.action}</p>

                                             <div className={`relative ${formData.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
                                                {(shot.isLoading || shot.isGeneratingVideo) && (
                                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center text-white/80 p-2 z-20 rounded-md">
                                                        <div className="spinner"></div>
                                                        <p className="font-semibold text-xs mt-2">
                                                            {shot.isGeneratingVideo ? 'Filmando cena...' : 'Gerando frames...'}
                                                        </p>
                                                    </div>
                                                )}
                                                {shot.videoUrl ? (
                                                    <div className="relative w-full h-full group">
                                                        <video key={shot.videoUrl} src={shot.videoUrl} controls loop muted className="w-full h-full object-cover rounded-md" />
                                                        <a href={shot.videoUrl} download={`cena_${scene.sceneNumber}_plano_${shot.plan.replace('PLANO ', '')}.mp4`} className="absolute bottom-2 right-2 z-10 bg-primary text-white p-2 rounded-full hover:bg-secondary transition-colors shadow-md opacity-0 group-hover:opacity-100">
                                                            <DownloadIcon className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {([0, 1, 2] as const).map(index => {
                                                            const frameNumber = index + 1 as 1 | 2 | 3;
                                                            const frameUrl = shot.frameImageUrls?.[index];
                                                            
                                                            return (
                                                                <div key={index} className={`frame-slot ${formData.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
                                                                    <span className="frame-slot-label">FRAME {frameNumber}</span>
                                                                    {frameUrl ? <img src={frameUrl} alt={`Frame ${frameNumber} for ${shot.plan}`} className="animate-creation" /> : <ImageIcon className="w-8 h-8 text-white/30" />}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                             </div>
                                             
                                            <ShotDetails shot={shot} />

                                            {shot.frameImageUrls && shot.frameImageUrls.length === 3 && (
                                                <div className="mt-4 space-y-2">
                                                    {!shot.veoPrompt ? (
                                                        <button onClick={() => handleGenerateVeoPrompt(scene.id, shot.id)} disabled={shot.isGeneratingVeoPrompt} className="secondary-action-button w-full text-xs">
                                                            {shot.isGeneratingVeoPrompt ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div> : <><SparklesIcon className="w-4 h-4 mr-2"/>Gerar Prompt VEO 3.1</>}
                                                        </button>
                                                    ) : (
                                                        <div className="bg-black/30 p-3 rounded-md">
                                                            <h5 className="font-bold text-accent text-sm mb-1 flex justify-between items-center">
                                                                <span>Prompt VEO 3.1</span>
                                                                <button onClick={() => handleCopyPrompt(shot.veoPrompt!, shot.id)} className="p-1.5 bg-panel-light text-white/60 rounded-md hover:bg-primary hover:text-white" title="Copiar prompt VEO">
                                                                    {copiedPromptId === shot.id ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}
                                                                </button>
                                                            </h5>
                                                            <p className="font-mono text-xs leading-relaxed text-white/80 max-h-24 overflow-y-auto">{shot.veoPrompt}</p>
                                                        </div>
                                                    )}

                                                    {shot.veoPrompt && !shot.videoUrl && (
                                                        <>
                                                            <button onClick={() => handleFilmScene(scene.id, shot.id)} disabled={shot.isGeneratingVideo || !apiKeyReady} className="action-button w-full text-sm">
                                                                {shot.isGeneratingVideo ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-background"></div> : <><FilmIcon className="w-4 h-4 mr-2"/>Filmar Cena (VEO)</>}
                                                            </button>
                                                             {!apiKeyReady && <p className="text-amber-400 text-xs mt-1 text-center">Selecione uma chave de API para filmar.</p>}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center text-white/60">
                         <FilmIcon className="w-12 h-12 mb-3"/>
                         <p className="font-semibold">O storyboard visual aparecerá aqui.</p>
                         <p className="text-sm">Preencha as informações e clique em "Decupar Roteiro".</p>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default DecupagemStudio;
