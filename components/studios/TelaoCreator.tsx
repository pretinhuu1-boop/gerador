// components/studios/TelaoCreator.tsx
import React, { useState } from 'react';

import { 
    ImageFile, ArtistType, TelaoFormData, TypographyStyle, TextureOverlay, 
    CompositionGuideline, LightingStyle, GraphicElement, TelaoStageStylePreset
} from '../../types';
import { generateTelaoImage, generateTelaoAnimationScript, generateCreativeDirectionForStaticTelao } from '../../services/geminiService';

import { SparklesIcon, VideoIcon } from '../icons';
import ImageInput from '../ImageInput';
import DisplayArea from '../DisplayArea';

const artistTypeOptions: { id: ArtistType, label: string }[] = [
    { id: 'DJ', label: 'DJ' },
    { id: 'Cantor', label: 'Cantor(a)' },
    { id: 'Dupla', label: 'Dupla' },
    { id: 'Instrumentista', label: 'Instrumentista' },
];

const typographyStyleOptions: { id: TypographyStyle, label: string }[] = [
    { id: 'modern', label: 'Moderno' },
    { id: 'urban', label: 'Urbano' },
    { id: 'elegant', label: 'Elegante' },
    { id: 'bold', label: 'Bold' },
    { id: 'script', label: 'Script' },
    { id: 'digital_pixel', label: 'Pixel' },
    { id: 'classic_serif', label: 'Serifado' },
    { id: 'geometric_sans', label: 'Geométrico' },
    { id: 'street_tagging', label: 'Street/Tag' },
    { id: 'luxury_fashion_script', label: 'Script Luxo' },
    { id: 'playful_rounded', label: 'Arredondado' },
    { id: 'outline_wireframe', label: 'Contorno' },
    { id: 'stamped_distressed', label: 'Desgastado' },
    { id: 'graffiti_bubble', label: 'Graffiti (Bubble)' },
    { id: 'graffiti_wildstyle', label: 'Graffiti (Wildstyle)' },
    { id: 'handwritten_marker', label: 'Manuscrito (Pincel)' },
];

const textureOverlayOptions: { id: TextureOverlay, label: string }[] = [
    { id: 'none', label: 'Nenhuma' },
    { id: 'paper', label: 'Papel Amassado' },
    { id: 'noise', label: 'Ruído de TV' },
    { id: 'dust', label: 'Poeira e Arranhões' },
    { id: 'neon_lines', label: 'Linhas de Neon' },
    { id: 'geometric', label: 'Geométrico' },
    { id: 'film_grain', label: 'Granulação de Filme' },
    { id: 'laser_beams', label: 'Feixes de Laser' },
    { id: 'digital_glitch', label: 'Glitch Digital' },
    { id: 'concrete_urban_wall', label: 'Concreto / Parede' },
    { id: 'brushed_metal', label: 'Metal Escovado' },
];

const compositionGuidelineOptions: { id: CompositionGuideline, label: string }[] = [
    { id: 'none', label: 'Padrão' },
    { id: 'diagonal_composition', label: 'Composição Diagonal' },
    { id: 'scene_framing', label: 'Enquadramento de Cena' },
    { id: 'negative_space', label: 'Uso de Espaço Negativo' },
    { id: 'leading_lines_perspective', label: 'Linhas de Fuga / Perspectiva' },
];

const lightingStyleOptions: { id: LightingStyle, label: string }[] = [
    { id: 'default', label: 'Padrão' },
    { id: 'soft_light', label: 'Luz Suave (Soft)' },
    { id: 'hard_light', label: 'Luz Dura (Hard)' },
    { id: 'volumetric_light', label: 'Luz Volumétrica' },
    { id: 'strobe_lights', label: 'Luzes Estroboscópicas' },
    { id: 'laser_grid', label: 'Grade de Lasers' },
];

const graphicElementsOptions: { id: GraphicElement, label: string }[] = [
    { id: 'repeating_text_pattern', label: 'Padrão de Texto Repetido' },
    { id: 'abstract_organic_shapes', label: 'Formas Orgânicas/Abstratas' },
    { id: 'paint_splashes_drips', label: 'Splashes / Drips de Tinta' },
    { id: 'geometric_patterns', label: 'Padrões Geométricos' },
    { id: 'typography_as_texture', label: 'Tipografia como Textura' },
];

const stageStylePresets: { id: TelaoStageStylePreset, name: string, settings: Partial<TelaoFormData> }[] = [
    {
        id: 'neon_minimalist',
        name: 'Neon Urbano Minimalista',
        settings: {
            creativePrompt: 'Um palco escuro e minimalista, com uma única linha de neon azul ou rosa no horizonte. A atmosfera é limpa, focada no artista, com leve fumaça no chão.',
            typographyStyle: 'modern',
            textureOverlay: 'none',
            lightingStyle: 'default',
        }
    },
    {
        id: 'cinematic_drama',
        name: 'Luz Cinematográfica Dramática',
        settings: {
            creativePrompt: 'Iluminação de palco dramática com um único holofote (spotlight) vindo de cima ou de trás (contraluz), criando sombras longas e um clima de suspense. Fundo preto total.',
            typographyStyle: 'classic_serif',
            textureOverlay: 'film_grain',
            lightingStyle: 'hard_light',
        }
    },
    {
        id: 'bw_contrast',
        name: 'Gráfico P&B de Alto Contraste',
        settings: {
            creativePrompt: 'Uma estética em preto e branco com alto contraste. Formas geométricas simples (círculos, linhas) em branco sobre um fundo preto. O visual é gráfico e impactante, estilo editorial de moda.',
            typographyStyle: 'geometric_sans',
            textureOverlay: 'noise',
            lightingStyle: 'hard_light',
        }
    },
     {
        id: 'ethereal_dream',
        name: 'Visual Etéreo e Sonhador',
        settings: {
            creativePrompt: 'Uma atmosfera de sonho, com muita fumaça, luzes volumétricas suaves e difusas em tons pastel (lilás, azul claro). Partículas de poeira brilhantes flutuam no ar.',
            typographyStyle: 'elegant',
            textureOverlay: 'dust',
            lightingStyle: 'volumetric_light',
        }
    },
    {
        id: 'vibrant_texture',
        name: 'Energia Vibrante e Texturizada',
        settings: {
            creativePrompt: 'Uma explosão de cores e texturas. Fundo com projeções de grafite, splashes de tinta ou padrões geométricos coloridos. A iluminação é vibrante e preenche todo o palco.',
            typographyStyle: 'graffiti_wildstyle',
            textureOverlay: 'concrete_urban_wall',
            lightingStyle: 'default',
        }
    },
    {
        id: 'retro_future',
        name: 'Retrô Futurista (Synthwave)',
        settings: {
            creativePrompt: 'Visual inspirado nos anos 80, com uma grade de neon roxa no chão indo em perspectiva para um sol de neon no horizonte. Palmeiras em silhueta e cores magenta e ciano.',
            typographyStyle: 'digital_pixel',
            textureOverlay: 'neon_lines',
            lightingStyle: 'volumetric_light',
        }
    },
    {
        id: 'rock_classic_bw',
        name: 'Rock Clássico P&B',
        settings: {
            creativePrompt: 'Fundo de palco para show de rock, preto e branco, com holofotes (spotlights) fortes criando silhuetas e lens flares. A atmosfera é crua, com muito granulado de filme (35mm film grain) e uma energia de palco intensa.',
            typographyStyle: 'stamped_distressed',
            textureOverlay: 'film_grain',
            lightingStyle: 'hard_light',
        }
    },
    {
        id: 'geometric_tunnel',
        name: 'Túnel Geométrico Neon',
        settings: {
            creativePrompt: 'Um túnel infinito de formas geométricas de neon (triângulos, quadrados) voando em direção à câmera, criando uma sensação de velocidade e profundidade. Estilo VJ loop futurista, com cores vibrantes como ciano e magenta.',
            typographyStyle: 'outline_wireframe',
            textureOverlay: 'laser_beams',
            lightingStyle: 'laser_grid',
            compositionGuideline: 'leading_lines_perspective',
        }
    }
];

const TelaoCreator = () => {
    const [formData, setFormData] = useState<TelaoFormData>({
        artistName: 'NOME DO ARTISTA',
        artistType: 'DJ',
        artistLogo: null,
        artistPhoto: null,
        primaryColor: '#7D4FFF',
        secondaryColor: '#FF1493',
        creativePrompt: 'Um palco futurista com painéis de LED geométricos e uma atmosfera de show de trap, com fumaça e luzes de neon.',
        typographyStyle: 'urban',
        textureOverlay: 'neon_lines',
        compositionGuideline: 'none',
        lightingStyle: 'default',
        graphicElements: [],
        finalPrompt: '',
        stageStylePreset: 'neon_minimalist',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [staticImageUrl, setStaticImageUrl] = useState<string | null>(null);
    const [animationScript, setAnimationScript] = useState<string | null>(null);
    const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
    
    const handleFormChange = <T extends keyof TelaoFormData>(field: T, value: TelaoFormData[T]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSelectStageStyle = (presetId: TelaoStageStylePreset) => {
        const preset = stageStylePresets.find(p => p.id === presetId);
        if (preset) {
            setFormData(prev => ({
                ...prev,
                ...preset.settings,
                stageStylePreset: presetId,
            }));
        }
    };

    const handleGenerateDirection = async () => {
        if (isLoading) return;
        setIsLoading(true);
        setLoadingMessage('Gerando Direção Criativa...');
        setError(null);
        try {
            const direction = await generateCreativeDirectionForStaticTelao(formData);
            handleFormChange('finalPrompt', direction);
        } catch (e: any) {
            setError(e.message || "Falha ao gerar direção criativa.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    const handleGenerateStaticScene = async () => {
        if (isLoading || !formData.finalPrompt) return;
        setIsLoading(true);
        setLoadingMessage('Gerando Cena Estática...');
        setError(null);
        setStaticImageUrl(null);
        try {
            const imageUrl = await generateTelaoImage(formData);
            setStaticImageUrl(imageUrl);
        } catch (e: any) {
            setError(e.message || "Falha ao gerar a imagem do telão.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const convertUrlToImageFile = async (url: string): Promise<ImageFile> => {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], "telao.png", { type: blob.type });
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                if (!reader.result) {
                    reject(new Error("Failed to read image file."));
                    return;
                }
                const base64 = (reader.result as string).split(',')[1];
                resolve({ name: file.name, type: file.type, size: file.size, base64, preview: url });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleAnimateTelao = async () => {
        if (!staticImageUrl || isLoading) return;

        setIsLoading(true);
        setLoadingMessage('Gerando Roteiro de Animação...');
        setError(null);
        setAnimationScript(null);
        try {
            const baseImage = await convertUrlToImageFile(staticImageUrl);
            const script = await generateTelaoAnimationScript(baseImage, formData);
            setAnimationScript(script);
            setIsScriptModalOpen(true);
        } catch (e: any) {
            setError(e.message || "Falha ao gerar o roteiro de animação.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 bg-[#1E1F22] p-6 rounded-lg flex flex-col gap-8 overflow-y-auto">
                <section>
                    <h2 className="text-lg font-bold border-b border-white/10 pb-2 mb-4">1. Diretor de Arte de Palco</h2>
                    <div className="space-y-4">
                        <input type="text" value={formData.artistName} onChange={(e) => handleFormChange('artistName', e.target.value)} placeholder="Nome do Artista" className="w-full bg-white/10 p-2 rounded-md border border-white/20" />
                        <div className="grid grid-cols-2 gap-2">
                            {artistTypeOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('artistType', opt.id)} className={`py-2 px-2 rounded-md text-xs font-semibold transition ${formData.artistType === opt.id ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}>{opt.label}</button>)}
                        </div>
                        <ImageInput 
                            label="Foto do Artista (Opcional)" 
                            image={formData.artistPhoto} 
                            onImageSelect={(f) => handleFormChange('artistPhoto', f)} 
                            onScanComplete={(p) => handleFormChange('artistPhotoScanProfile', p)}
                        />
                        <ImageInput 
                            label="Logo do Artista (Opcional)" 
                            image={formData.artistLogo} 
                            onImageSelect={(f) => handleFormChange('artistLogo', f)} 
                            onScanComplete={(p) => handleFormChange('artistLogoScanProfile', p)}
                        />
                         <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Paleta de Cores</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label htmlFor="primary_color" className="text-xs text-white/60">Primária</label>
                                    <input type="color" id="primary_color" value={formData.primaryColor} onChange={(e) => handleFormChange('primaryColor', e.target.value)} className="w-full h-10 p-1 bg-white/10 rounded-md border-white/20" />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="secondary_color" className="text-xs text-white/60">Secundária</label>
                                    <input type="color" id="secondary_color" value={formData.secondaryColor} onChange={(e) => handleFormChange('secondaryColor', e.target.value)} className="w-full h-10 p-1 bg-white/10 rounded-md border-white/20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="text-lg font-bold border-b border-white/10 pb-2 mb-4">2. Estilo Visual</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Estilo de Palco (Presets)</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {stageStylePresets.map(preset => (
                                    <button 
                                        key={preset.id} 
                                        onClick={() => handleSelectStageStyle(preset.id)} 
                                        className={`py-2 px-3 rounded-md text-xs text-center font-semibold capitalize transition ${formData.stageStylePreset === preset.id ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="telao-prompt" className="block text-sm font-medium text-white/80 mb-2">Direção Criativa (Tema)</label>
                            <textarea id="telao-prompt" rows={4} value={formData.creativePrompt} onChange={(e) => handleFormChange('creativePrompt', e.target.value)} className="w-full bg-white/5 p-3 rounded-md border border-white/20" placeholder="Ex: 'palco de trap com leds', 'fundo futurista', 'grafite neon'"/>
                        </div>
                         <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Estilo da Tipografia</h3>
                             <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {typographyStyleOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('typographyStyle', opt.id)} className={`py-2 px-2 rounded-md text-xs font-semibold capitalize transition ${formData.typographyStyle === opt.id ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}>{opt.label}</button>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Textura de Fundo</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {textureOverlayOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('textureOverlay', opt.id)} className={`py-2 px-2 rounded-md text-xs font-semibold capitalize transition ${formData.textureOverlay === opt.id ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}>{opt.label}</button>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Composição da Cena</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {compositionGuidelineOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('compositionGuideline', opt.id)} className={`py-2 px-2 rounded-md text-xs text-center font-semibold capitalize transition ${formData.compositionGuideline === opt.id ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}>{opt.label}</button>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Estilo de Iluminação</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {lightingStyleOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('lightingStyle', opt.id)} className={`py-2 px-2 rounded-md text-xs text-center font-semibold capitalize transition ${formData.lightingStyle === opt.id ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}>{opt.label}</button>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Elementos Gráficos Adicionais</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {graphicElementsOptions.map(opt => (
                                    <div key={opt.id} className="flex items-center bg-white/5 p-2 rounded-md">
                                        <input
                                            id={`ge-telao-${opt.id}`} type="checkbox"
                                            checked={formData.graphicElements.includes(opt.id)}
                                            onChange={() => handleFormChange('graphicElements', 
                                                formData.graphicElements.includes(opt.id) 
                                                ? formData.graphicElements.filter(g => g !== opt.id)
                                                : [...formData.graphicElements, opt.id]
                                            )}
                                            className="w-4 h-4 text-[#7D4FFF] bg-gray-700 border-gray-600 rounded focus:ring-[#7D4FFF] focus:ring-2"
                                        />
                                        <label htmlFor={`ge-telao-${opt.id}`} className="ml-2 text-xs font-medium text-white/90">{opt.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-auto space-y-4 pt-6">
                     <div className="space-y-4">
                        <button onClick={handleGenerateDirection} disabled={isLoading} className="w-full bg-[#3c3e42] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-[#4a4c50] transition-colors disabled:opacity-50">
                            {isLoading && loadingMessage.includes('Direção') ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <><SparklesIcon className="w-5 h-5 mr-2" />Gerar Direção Criativa com IA</>}
                        </button>
                        <div>
                            <label htmlFor="telao-final-prompt" className="block text-sm font-medium text-white/80 mb-2">Roteiro da Cena Final (Gerado pela IA)</label>
                            <textarea id="telao-final-prompt" rows={5} value={formData.finalPrompt} onChange={e => handleFormChange('finalPrompt', e.target.value)} className="w-full bg-black/20 p-3 rounded-md border border-white/10" placeholder="A direção criativa da IA aparecerá aqui."/>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 space-y-4">
                        <button onClick={handleGenerateStaticScene} disabled={isLoading || !formData.finalPrompt} className="w-full bg-white/10 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-50">
                            {isLoading && loadingMessage.includes('Cena') ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <>1. Gerar Cena Estática</>}
                        </button>
                        <button onClick={handleAnimateTelao} disabled={!staticImageUrl || isLoading} className="w-full bg-[#7D4FFF] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-[#6b3fef] transition-colors disabled:opacity-50">
                            {isLoading && loadingMessage.includes('Roteiro') ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <><VideoIcon className="w-5 h-5 mr-2" />2. Gerar Roteiro de Animação</>}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </section>
            </div>
             <div className="lg:col-span-2 bg-[#1E1F22] p-6 rounded-lg flex items-center justify-center">
                <DisplayArea
                    mediaType="image"
                    mediaUrl={staticImageUrl}
                    isLoading={isLoading}
                    prompt={loadingMessage || "Telão de Show"}
                    isAnimationDisabled={true} // Disable default animation button
                />
            </div>
             {isScriptModalOpen && (
                <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4" onClick={() => setIsScriptModalOpen(false)}>
                    <div className="bg-[#1E1F22] rounded-lg shadow-xl max-w-2xl w-full p-6 border border-white/10 modal-fade" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><VideoIcon className="w-6 h-6 text-[#7D4FFF]" /> Roteiro de Animação Gerado</h3>
                            <button onClick={() => setIsScriptModalOpen(false)} className="text-white/50 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="bg-black/50 p-4 rounded-md max-h-[60vh] overflow-y-auto">
                            <p className="text-white/90 whitespace-pre-wrap font-mono text-sm">
                                {animationScript}
                            </p>
                        </div>
                        <div className="mt-6 flex gap-4">
                            <button 
                                onClick={() => {
                                    if(animationScript) navigator.clipboard.writeText(animationScript);
                                }}
                                className="flex-1 bg-[#7D4FFF] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#6b3fef] transition-colors"
                            >
                                Copiar Roteiro
                            </button>
                            <button 
                                onClick={() => setIsScriptModalOpen(false)}
                                className="flex-1 bg-white/10 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                        <p className="text-xs text-white/50 mt-4 text-center">Copie este roteiro e use-o no Estúdio de Vídeo para criar sua animação.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TelaoCreator;