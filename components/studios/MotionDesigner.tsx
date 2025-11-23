// components/studios/MotionDesigner.tsx
import React, { useState } from 'react';
import { 
    ImageFile, MotionDesignerFormData, LoopSceneType, VideoAspectRatio, VideoResolution 
} from '../../types';
import { generateStaticSceneForLoop, generateLoopingScene, refineMotionDesignerPrompt } from '../../services/geminiService';
import { ApiKeyError } from '../../services/errors';

import ImageInput from '../ImageInput';
import DisplayArea from '../DisplayArea';
import { 
    CarIcon, MotorcycleIcon, WavesIcon, MicIcon, HeadphonesIcon, GlassesIcon, WindIcon, 
    BuildingIcon, MapPinIcon, UserIcon, ImageIcon, FilmIcon, SparklesIcon, WandIcon, DroneIcon, SunIcon, BoatIcon
} from '../icons';

interface MotionDesignerProps {
    apiKeyReady: boolean;
    onSelectKey: () => Promise<void>;
}

const sceneOptions: { id: LoopSceneType, name: string, icon: React.FC<any> }[] = [
    { id: 'driving', name: 'Dirigindo Carro', icon: CarIcon },
    { id: 'motorbike', name: 'Pilotando Moto', icon: MotorcycleIcon },
    { id: 'jetski', name: 'Pilotando Jetski', icon: WavesIcon },
    { id: 'singing', name: 'Cantando no Palco', icon: MicIcon },
    { id: 'dj', name: 'DJ Tocando', icon: HeadphonesIcon },
    { id: 'glasses', name: 'Mexendo no Óculos', icon: GlassesIcon },
    { id: 'smoking', name: 'Soltando Fumaça', icon: WindIcon },
    { id: 'leaning', name: 'Encostado no Muro', icon: BuildingIcon },
    { id: 'street_corner', name: 'Esquina Urbana', icon: MapPinIcon },
    { id: 'breathing', name: 'Respiração (Close-up)', icon: UserIcon },
    { id: 'drone_shot', name: 'Drone Aéreo', icon: DroneIcon },
    // Summer Pack
    { id: 'motorcycle_wheelie', name: 'Grau de Moto', icon: MotorcycleIcon },
    { id: 'floating_in_pool', name: 'Boiando na Piscina', icon: WavesIcon },
    { id: 'beach_fireworks', name: 'Fogos na Praia', icon: SparklesIcon },
    { id: 'summer_roadtrip', name: 'Viagem de Verão', icon: CarIcon },
    { id: 'beach_volleyball', name: 'Vôlei de Praia', icon: SunIcon },
    { id: 'boat_party', name: 'Festa no Barco', icon: BoatIcon },
];

const scenePrompts: Record<LoopSceneType, string> = {
    driving: "Dentro de um carro de luxo à noite, em uma cidade com luzes de neon. O artista está no banco do motorista, com uma expressão focada e confiante.",
    motorbike: "Pilotando uma moto esportiva em alta velocidade em uma estrada sinuosa durante o dia, com uma paisagem dramática ao fundo.",
    jetski: "Em um jetski, no mar, com o sol se pondo no horizonte, criando um brilho dourado na água e respingos congelados no ar.",
    singing: "Em um palco grande com uma multidão desfocada ao fundo. Holofotes (spotlights) iluminam o artista que segura um microfone.",
    dj: "Atrás de uma mesa de DJ em um clube escuro e lotado, com luzes laser e painéis de LED ao fundo, focado na mixagem.",
    glasses: "Um close-up extremo do artista ajustando seus óculos escuros em um ambiente urbano noturno, com reflexos de neon nas lentes.",
    smoking: "Em um beco escuro e com neblina, iluminado por uma única luz de poste, soltando uma nuvem densa de fumaça.",
    leaning: "Encostado em um muro de concreto com grafites coloridos, em uma rua urbana durante o dia, com uma postura relaxada e confiante.",
    street_corner: "Em uma esquina de rua movimentada à noite, com luzes de carros passando e placas de neon criando um bokeh vibrante.",
    breathing: "Um close-up extremo e íntimo do rosto do artista, em um ambiente de estúdio com iluminação suave, capturando uma respiração sutil.",
    drone_shot: "Uma vista aérea de drone sobrevoando a cidade à noite. As ruas estão molhadas, refletindo as luzes de neon dos prédios e carros, criando um visual cyberpunk e cinematográfico.",
    motorcycle_wheelie: "Artista empinando uma moto (grau) em uma rua vazia ao pôr do sol. A luz dourada cria uma silhueta dramática. Foco na habilidade e atitude.",
    floating_in_pool: "Artista boiando relaxadamente em uma piscina de luxo, com água cristalina e um drink na borda. A cena transmite paz e sucesso.",
    beach_fireworks: "Artista em uma praia à noite, com fogos de artifício explodindo no céu ao fundo. As luzes dos fogos formam o logo do artista de forma sutil e mágica.",
    summer_roadtrip: "Dentro de um carro conversível vintage, dirigindo por uma estrada costeira em um dia ensolarado de verão. Cabelo ao vento e óculos de sol.",
    beach_volleyball: "Artista jogando vôlei de praia com amigos durante o pôr do sol. A cena é cheia de energia, areia voando e a luz dourada do sol.",
    boat_party: "Em uma festa animada em um iate ou lancha, com amigos dançando, bebidas e o mar azul ao fundo. Clima de celebração e verão.",
};

const loopingInstructionsPrompts: Record<LoopSceneType, string> = {
    driving: "Movimento sutil da cabeça do artista olhando para o retrovisor e voltando. As luzes da cidade refletidas no para-brisa se movem continuamente da direita para a esquerda, criando um loop perfeito.",
    motorbike: "A moto inclina levemente em uma curva contínua. O vento faz a jaqueta e o cabelo balançarem sutilmente. O cenário na estrada se repete perfeitamente.",
    jetski: "Um leve solavanco para cima e para baixo, como se passasse por uma pequena onda. Respingos de água aparecem na lente e desaparecem, em loop.",
    singing: "O artista levanta o microfone para cantar uma linha e o abaixa. As luzes do palco piscam em um padrão que se repete a cada 4 segundos.",
    dj: "A mão do artista se move do crossfader para um knob de efeito e volta. A cabeça balança levemente no ritmo da música. As luzes do clube piscam em loop.",
    glasses: "A mão sobe, ajusta os óculos no rosto com um dedo e desce de volta à posição inicial. A ação é suave e contínua.",
    smoking: "A fumaça é exalada, sobe e se dissipa no ar. No final do loop, a cena está limpa, pronta para a próxima exalação, criando a ilusão de um ciclo contínuo.",
    leaning: "O artista vira a cabeça lentamente para o lado, observa algo fora da tela e retorna o olhar para a frente. A corrente no pescoço balança sutilmente com o movimento.",
    street_corner: "As luzes de um semáforo mudam de vermelho para verde e voltam para o vermelho. Carros passam em um padrão repetitivo. Uma leve brisa move o vapor de um bueiro.",
    breathing: "O peito sobe e desce sutilmente. Os olhos piscam lentamente uma vez durante o loop. A câmera tem um micro-movimento para cima e para baixo, simulando a respiração.",
    drone_shot: "O drone se move para a frente em uma linha reta e constante sobre a cidade. O movimento dos carros abaixo é projetado para criar um loop contínuo e hipnótico, onde o final da cena se conecta perfeitamente ao início.",
    motorcycle_wheelie: "A roda da frente da moto sobe e desce em um movimento de 'grau' controlado e suave. A roda traseira gira constantemente. O fundo se move para criar a ilusão de velocidade.",
    floating_in_pool: "O corpo do artista flutua suavemente para cima e para baixo com as pequenas ondulações da água. A câmera tem um micro-movimento de respiração.",
    beach_fireworks: "Um fogo de artifício explode, formando o logo, que brilha por um instante e se dissipa em fumaça luminosa. Outros fogos menores explodem em um padrão repetitivo ao fundo.",
    summer_roadtrip: "A mão do artista bate levemente no ritmo da música na porta do carro. O cabelo balança continuamente com o vento. O cenário da estrada se repete perfeitamente.",
    beach_volleyball: "O artista salta para cortar a bola e aterrissa suavemente. A bola entra e sai do quadro em um loop. A areia que sobe com o salto se dissipa.",
    boat_party: "O artista faz um movimento de dança que se repete. Pessoas ao fundo dançam em um loop. O barco balança suavemente nas ondas.",
};


const MotionDesigner: React.FC<MotionDesignerProps> = ({ apiKeyReady, onSelectKey }) => {
    const [formData, setFormData] = useState<MotionDesignerFormData>({
        artistPhoto: null,
        artistLogo: null,
        sceneType: 'driving',
        duration: 4,
        aspectRatio: '9:16',
        resolution: '720p',
        creativePrompt: scenePrompts.driving,
        loopingInstructions: loopingInstructionsPrompts.driving,
    });

    const [loadingStep, setLoadingStep] = useState<'static' | 'animation' | null>(null);
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [staticImageUrl, setStaticImageUrl] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const handleFormChange = <T extends keyof MotionDesignerFormData>(field: T, value: MotionDesignerFormData[T]) => {
        setFormData(prev => {
            const newState = { ...prev, [field]: value };
            if (field === 'sceneType') {
                const newSceneType = value as LoopSceneType;
                newState.creativePrompt = scenePrompts[newSceneType];
                newState.loopingInstructions = loopingInstructionsPrompts[newSceneType];
            }
            return newState;
        });
    };

    const handleRefinePrompt = async () => {
        if (isRefining) return;
        if (!formData.artistPhoto) {
            setError("Carregue uma foto do artista para a IA refinar o prompt com mais contexto.");
            return;
        };
        setIsRefining(true);
        setError(null);
        try {
            const refinedPrompt = await refineMotionDesignerPrompt(formData);
            handleFormChange('creativePrompt', refinedPrompt);
        } catch (e: any) {
            setError(`Falha ao refinar o prompt: ${e.message}`);
        } finally {
            setIsRefining(false);
        }
    };

    const handleGenerateStaticScene = async () => {
        if (!formData.artistPhoto) {
            setError("Por favor, carregue a foto do artista para gerar a cena.");
            return;
        }

        setLoadingStep('static');
        setError(null);
        setStaticImageUrl(null);
        setVideoUrl(null);
        try {
            const imageUrl = await generateStaticSceneForLoop(formData);
            setStaticImageUrl(imageUrl);
        } catch (e: any) {
            setError(`Falha ao gerar a cena estática: ${e.message}`);
        } finally {
            setLoadingStep(null);
        }
    };

    const convertUrlToImageFile = async (url: string): Promise<ImageFile> => {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "static_scene.png", { type: blob.type });
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (!reader.result) {
                    return reject(new Error("Falha ao ler o arquivo de imagem."));
                }
                const base64 = (reader.result as string).split(',')[1];
                resolve({ name: file.name, type: file.type, size: file.size, base64, preview: url });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAnimateScene = async () => {
        if (!staticImageUrl) {
            setError("Gere a cena estática primeiro antes de animar.");
            return;
        }
        if (!apiKeyReady) {
            await onSelectKey();
            const hasKey = window.aistudio && await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setError("É necessário selecionar uma chave de API para gerar o vídeo.");
                return;
            }
        }

        setLoadingStep('animation');
        setError(null);
        try {
            const staticImageFile = await convertUrlToImageFile(staticImageUrl);
            const generatedVideoUrl = await generateLoopingScene(formData, staticImageFile);
            setVideoUrl(generatedVideoUrl);
        } catch (e: any) {
            if (e instanceof ApiKeyError) {
                setError(e.message);
            } else {
                setError(`Falha ao gerar a micro-cena: ${e.message}`);
            }
        } finally {
            setLoadingStep(null);
        }
    };

    return (
        <div className="studio-grid">
            <div className="controls-panel">
                <section>
                    <h2 className="section-title"><ImageIcon className="icon" /> 1. Assets do Artista</h2>
                    <div className="space-y-4">
                        <ImageInput 
                            label="Foto do Artista (Obrigatório)"
                            image={formData.artistPhoto}
                            onImageSelect={img => handleFormChange('artistPhoto', img)}
                        />
                        <ImageInput 
                            label="Logo (Opcional)"
                            image={formData.artistLogo}
                            onImageSelect={img => handleFormChange('artistLogo', img)}
                        />
                    </div>
                </section>
                <section>
                    <h2 className="section-title"><FilmIcon className="icon" /> 2. Tipo de Cena Loopável</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {sceneOptions.map(opt => {
                            const Icon = opt.icon;
                            return (
                                <button key={opt.id} onClick={() => handleFormChange('sceneType', opt.id)} className={`preset-card ${formData.sceneType === opt.id ? 'active' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-6 h-6 text-primary flex-shrink-0" />
                                        <p className="font-bold text-sm">{opt.name}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <h2 className="section-title"><WandIcon className="icon" /> 3. Direção Criativa</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="creative-prompt" className="block text-sm font-medium text-white/80">
                                    Descrição da Cena (Aparência)
                                </label>
                                <button onClick={handleRefinePrompt} disabled={isRefining} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-white disabled:opacity-50">
                                    {isRefining ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-current"></div> : <SparklesIcon className="w-4 h-4" />}
                                    Refinar com IA
                                </button>
                            </div>
                            <textarea
                                id="creative-prompt"
                                rows={5}
                                value={formData.creativePrompt}
                                onChange={e => handleFormChange('creativePrompt', e.target.value)}
                                className="form-textarea"
                                placeholder="Descreva a cena que você quer criar..."
                            />
                        </div>
                         <div>
                            <label htmlFor="looping-instructions" className="block text-sm font-medium text-white/80 mb-2">
                                Diretor de Loop (Animação)
                            </label>
                            <textarea
                                id="looping-instructions"
                                rows={4}
                                value={formData.loopingInstructions}
                                onChange={e => handleFormChange('loopingInstructions', e.target.value)}
                                className="form-textarea"
                                placeholder="Descreva o movimento exato para o loop. Ex: Câmera faz um pan lento da esquerda para a direita e volta."
                            />
                            <p className="text-xs text-white/60 mt-2">Dê instruções claras para a IA sobre o movimento exato que deve se repetir.</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="section-title"><SparklesIcon className="icon" /> 4. Configurações Técnicas</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Duração do Loop</h3>
                            <div className="button-grid-3">
                                <button onClick={() => handleFormChange('duration', 4)} className={`form-button ${formData.duration === 4 ? 'active' : ''}`}>4 seg</button>
                                <button onClick={() => handleFormChange('duration', 6)} className={`form-button ${formData.duration === 6 ? 'active' : ''}`}>6 seg</button>
                                <button onClick={() => handleFormChange('duration', 8)} className={`form-button ${formData.duration === 8 ? 'active' : ''}`}>8 seg</button>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Proporção (Aspect Ratio)</h3>
                            <div className="button-grid">
                                <button onClick={() => handleFormChange('aspectRatio', '9:16')} className={`form-button ${formData.aspectRatio === '9:16' ? 'active' : ''}`}>9:16 (Vertical)</button>
                                <button onClick={() => handleFormChange('aspectRatio', '16:9')} className={`form-button ${formData.aspectRatio === '16:9' ? 'active' : ''}`}>16:9 (Horizontal)</button>
                            </div>
                        </div>
                         <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Resolução</h3>
                            <div className="button-grid">
                                <button onClick={() => handleFormChange('resolution', '720p')} className={`form-button ${formData.resolution === '720p' ? 'active' : ''}`}>720p (Rápido)</button>
                                <button onClick={() => handleFormChange('resolution', '1080p')} className={`form-button ${formData.resolution === '1080p' ? 'active' : ''}`}>1080p (Qualidade)</button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-auto pt-6 space-y-3">
                     <button onClick={handleGenerateStaticScene} disabled={loadingStep !== null || !formData.artistPhoto} className="action-button !bg-primary !text-white">
                        {loadingStep === 'static' ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : '1. Gerar Cena Estática'}
                    </button>
                     <button onClick={handleAnimateScene} disabled={loadingStep !== null || !staticImageUrl || !apiKeyReady} className="action-button">
                        {loadingStep === 'animation' ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-background"></div> : '2. Animar Cena Loopável'}
                    </button>
                    {!apiKeyReady && <p className="text-amber-400 text-xs mt-2 text-center">Selecione uma chave de API para animar.</p>}
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </div>
            </div>
            <div className="display-panel-container">
                 <DisplayArea 
                    mediaType={videoUrl ? 'video' : 'image'}
                    mediaUrl={videoUrl || staticImageUrl}
                    isLoading={loadingStep !== null}
                    prompt={
                        loadingStep === 'static' 
                            ? "Gerando cena estática..." 
                            : loadingStep === 'animation' 
                            ? "Gerando animação loopável... Isso pode levar alguns minutos." 
                            : "Sua micro-cena aparecerá aqui"
                    }
                    isAnimationDisabled={true}
                 />
            </div>
        </div>
    );
};

export default MotionDesigner;