// components/studios/EditorialStudio.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { 
    ImageFile, EditorialPreset, ProductPreset, CustomEditorialPreset 
} from '../../types';
import { enhanceImageWithPreset, refineCreativeDirection } from '../../services/geminiService';

import { SunIcon, DropletIcon, PaletteIcon, CarIcon, MapPinIcon, UserIcon, PackageIcon, GemIcon, CameraIcon, ImageIcon, ZapIcon, MessageSquareIcon, CropIcon, SaveIcon, TrashIcon, SparklesIcon, FilmIcon, DownloadIcon, SpotlightIcon, ChairIcon, PortraitIcon } from '../icons';
import ReferenceUploader from '../ReferenceUploader';

const EditorialStudio = () => {
    type EditorialMode = 'editorial' | 'product';

    const EDITORIAL_PRESETS: (Omit<EditorialPreset, 'icon'> & { icon: React.FC<React.SVGProps<SVGSVGElement>> })[] = [
        { id: 'spotlight_dramatic', name: 'Spotlight Dramático', icon: SpotlightIcon, description: 'Luz focada, sombras fortes e atmosfera de palco.', promptBase: 'Retrato dramático, mulher iluminada por um único feixe de luz (spotlight) circular, fundo completamente preto, criando uma sombra forte projetada na parede, pose expressiva e cinematográfica, fotografia de moda hyper-detalhada.', filterClass: 'contrast-150 brightness-90', shadowClass: 'shadow-[0_0_80px_rgba(255,255,255,0.4)]' },
        { id: 'power_seated', name: 'Poder & Negócios (Sentada)', icon: ChairIcon, description: 'Poses elegantes e confiantes em cadeiras e bancos.', promptBase: 'Mulher em um blazer preto grande, sentada em um banco alto, pernas cruzadas elegantemente, expressão séria e poderosa, fundo cinza sólido de estúdio, iluminação de moda com luz suave e de recorte.', filterClass: 'contrast-120 saturate-90', shadowClass: 'shadow-[0_0_60px_rgba(200,200,200,0.4)]' },
        { id: 'casual_denim', name: 'Casual Denim', icon: UserIcon, description: 'Estética atemporal de jeans e camisa branca em estúdio.', promptBase: 'Mulher sentada no chão do estúdio, pernas cruzadas, usando jeans e camisa branca desabotoada, olhar confiante para a câmera, iluminação de estúdio difusa e limpa, fotografia de moda minimalista.', filterClass: 'brightness-105 contrast-110 saturate-100', shadowClass: 'shadow-[0_0_50px_rgba(220,220,230,0.5)]' },
        { id: 'intimate_portrait', name: 'Retrato Íntimo (Close-up)', icon: PortraitIcon, description: 'Close-up expressivo, foco no olhar e emoção.', promptBase: 'Close-up íntimo, mulher com a mão cobrindo parcialmente a boca, olhar penetrante e misterioso, fotografia em preto e branco com alto grão, iluminação Rembrandt suave, fundo escuro, textura de pele visível.', filterClass: 'grayscale contrast-130 brightness-105', shadowClass: 'shadow-[0_0_70px_rgba(150,150,150,0.5)]' },
        { id: 'silhouette_shadow', name: 'Silhueta & Sombra', icon: PaletteIcon, description: 'Contraste, iluminação dividida e formas definidas.', promptBase: 'Retrato com iluminação dividida (split lighting), metade do rosto na sombra, metade iluminada por luz dura, olhar intenso, fundo escuro, estilo noir, foco na forma e contorno.', filterClass: 'grayscale contrast-200 brightness-90', shadowClass: 'shadow-[0_0_50px_rgba(0,0,0,0.8)]' },
        { id: '90s_grunge_fashion', name: 'Moda Anos 90 (Grunge)', icon: FilmIcon, description: 'Estética grunge, P&B de alto contraste, look de revista da época.', promptBase: 'Retrato de moda no estilo dos anos 90, fotografia em preto e branco com alto contraste e granulação de filme, luz dura, pose despojada e atitude "blasé", fundo de estúdio simples ou parede de concreto, hyper-detalhado.', filterClass: 'grayscale contrast-150 brightness-95', shadowClass: 'shadow-[0_0_60px_rgba(100,100,100,0.6)]' },
        { id: '70s_retro_film', name: 'Filme Retrô Anos 70', icon: SunIcon, description: 'Cores quentes e desbotadas, lens flare e uma vibe nostálgica.', promptBase: 'Fotografia estilo filme dos anos 70, cores quentes e desbotadas (tons de laranja, marrom e amarelo), lens flare suave do sol, granulação de filme 35mm, cabelo com volume, atmosfera nostálgica e sonhadora.', filterClass: 'sepia-40 contrast-110 saturate-120 brightness-105', shadowClass: 'shadow-[0_0_80px_rgba(255,180,100,0.5)]' },
        { id: 'y2k_pop_flash', name: 'Pop Anos 2000 (Y2K)', icon: ZapIcon, description: 'Flash direto, cores vibrantes, um pouco de superexposição e atitude pop.', promptBase: 'Fotografia de moda Y2K (anos 2000), flash direto e estourado na câmera, cores vibrantes com tons de azul e rosa, leve superexposição, fundo de estúdio limpo ou com brilhos, pose pop e confiante, estética de revista adolescente da época.', filterClass: 'contrast-110 saturate-120 brightness-110', shadowClass: 'shadow-[0_0_70px_rgba(200,200,255,0.6)]' },
        { id: 'vintage_car_editorial', name: 'Editorial Carro Vintage', icon: CarIcon, description: 'Ensaio com carro clássico, luz de fim de tarde e um look cinematográfico.', promptBase: 'Ensaio de moda editorial com um carro clássico vintage (ex: Mustang, Opala) ao pôr do sol, luz dourada (golden hour) criando reflexos quentes na lataria, artista apoiado no carro com uma pose elegante, estilo cinematográfico, lente 85mm com bokeh suave.', filterClass: 'contrast-125 saturate-110 brightness-100 sepia-20', shadowClass: 'shadow-[0_0_90px_rgba(255,165,0,0.5)]' },
    ];

    const PRODUCT_PRESETS: (Omit<ProductPreset, 'icon'> & { icon: React.FC<React.SVGProps<SVGSVGElement>> })[] = [
        { id: 'jewelry_studio', name: 'Joia em Estúdio (Alto Brilho)', icon: GemIcon, description: 'Foco total na joia. Fundo escuro, reflexos nítidos.', promptBase: 'Renderização ultra-realista de close-up de joia, fotografia de produto de luxo, fundo preto aveludado, iluminação de estúdio (macro photography), refração e dispersão de diamantes e ouro, alto detalhe, sem ruído.', filterClass: 'contrast-150 saturate-150', shadowClass: 'shadow-[0_0_50px_rgba(200,160,0,0.5)]' },
        { id: 'cosmetic_glow', name: 'Cosmético Brilhante', icon: DropletIcon, description: 'Tons pastel e superfícies aquosas. Iluminação suave.', promptBase: 'Fotografia de produto de cosmético, fundo pastel, superfície molhada/aquosa com gotículas, iluminação suave e difusa, renderização ultra-detalhada, foco no brilho do vidro/embalagem.', filterClass: 'brightness-110 contrast-120 saturate-120', shadowClass: 'shadow-[0_0_50px_rgba(100,200,255,0.5)]' },
        { id: 'cosmetic_splash', name: 'Cosmético com Splash', icon: DropletIcon, description: 'Dinâmico e energético. Líquido em movimento.', promptBase: 'Fotografia de produto de cosmético com um splash de líquido colorido congelado em alta velocidade, iluminação de estúdio nítida para capturar o movimento, fundo de cor sólida e vibrante, macro fotografia, ultra detalhado.', filterClass: 'contrast-125 saturate-150', shadowClass: 'shadow-[0_0_70px_rgba(255,100,150,0.5)]' },
        { id: 'tech_dark', name: 'Gadget Tech (Modo Escuro)', icon: SparklesIcon, description: 'Elegante e premium. Fundo escuro e luzes de realce.', promptBase: 'Fotografia de produto de um gadget tecnológico, estética de modo escuro (dark mode), fundo preto fosco com textura sutil, iluminação de realce nas bordas (rim lighting) em azul ou branco, reflexos limpos, estilo minimalista e premium.', filterClass: 'brightness-110 contrast-140', shadowClass: 'shadow-[0_0_90px_rgba(0,150,255,0.4)]' },
        { id: 'food_rustic', name: 'Comida Gourmet (Rústico)', icon: UserIcon, description: 'Aconchegante e natural. Ingredientes frescos e madeira.', promptBase: 'Fotografia de comida gourmet, estilo rústico, sobre uma mesa de madeira escura, ingredientes frescos ao redor, iluminação natural suave vinda de uma janela lateral, foco seletivo, atmosfera de "fazenda à mesa".', filterClass: 'contrast-120 saturate-130 brightness-105 sepia-20', shadowClass: 'shadow-[0_0_60px_rgba(150,100,50,0.5)]' },
        { id: 'tech_minimalist_white', name: 'Gadget Tech (Modo Claro)', icon: SunIcon, description: 'Limpo e minimalista. Fundo branco e sombras suaves.', promptBase: 'Fotografia de produto de um gadget tecnológico em um fundo branco infinito, iluminação de estúdio perfeitamente difusa e sem sombras duras, estilo minimalista inspirado na Apple, reflexos suaves e limpos, foco no design do produto.', filterClass: 'brightness-110 contrast-110', shadowClass: 'shadow-[0_0_80px_rgba(200,200,200,0.4)]' },
        { id: 'automotive_studio_shot', name: 'Automotivo de Estúdio', icon: CarIcon, description: 'Carro em estúdio. Reflexos perfeitos e fundo limpo.', promptBase: 'Fotografia de estúdio de um carro esportivo de luxo, em um fundo de ciclorama cinza escuro, reflexos perfeitos na lataria, iluminação de estúdio complexa com múltiplos softboxes, chão reflexivo, hyper-realista, fotografia comercial de alta classe.', filterClass: 'contrast-130 saturate-120', shadowClass: 'shadow-[0_0_100px_rgba(100,100,120,0.5)]' },
        { id: 'beverage_commercial', name: 'Bebida Comercial (Condensação)', icon: DropletIcon, description: 'Refrescante e comercial. Gotículas e gelo.', promptBase: 'Fotografia comercial de uma garrafa ou copo de bebida gelada, com gotículas de condensação escorrendo, gelo e frutas frescas ao redor, iluminação de fundo (backlight) para destacar a bebida, splash sutil, cores vibrantes.', filterClass: 'brightness-110 contrast-120 saturate-130', shadowClass: 'shadow-[0_0_70px_rgba(100,180,255,0.6)]' },
    ];
    const LIFESTYLE_BACKGROUNDS = [
        { id: 'none', name: 'Estúdio / Fundo Original', promptAddition: '' },
        { id: 'studio_infinite', name: 'Estúdio Fotográfico (Fundo Infinito)', promptAddition: ', em um estúdio fotográfico com fundo infinito preto, iluminação de estúdio controlada para um look limpo e profissional' },
        { id: 'festival_stage', name: 'Palco de Festival (Multidão)', promptAddition: ', em um palco de festival massivo, com a multidão energética visível ao fundo, luzes de palco e lasers' },
        { id: 'cafe', name: 'Café Europeu (Chic)', promptAddition: ', no interior de um café europeu chique, com luz suave de janela, estilo lifestyle' },
        { id: 'beach', name: 'Pôr do Sol na Praia', promptAddition: ', na areia da praia ao pôr do sol, iluminação dramática de backlight, estilo editorial de verão' },
        { id: 'city', name: 'Rua Urbana Noturna', promptAddition: ', em uma rua movimentada da cidade à noite, luzes de neon e profundidade rasa, estilo urbano moderno' },
        { id: 'loft', name: 'Loft Industrial', promptAddition: ', em um loft industrial com paredes de tijolos aparentes e grandes janelas, luz natural abundante' },
        { id: 'rooftop', name: 'Rooftop ao Amanhecer', promptAddition: ', em um terraço (rooftop) de um prédio alto ao amanhecer, com a cidade abaixo, céu com cores suaves de rosa e laranja, estilo cinematográfico' },
        { id: 'neon_alley', name: 'Beco de Neon', promptAddition: ', em um beco estreito iluminado por placas de neon vibrantes, chão molhado refletindo as luzes, atmosfera cyberpunk' },
    ];

    const CSS_PRESETS = [
        { id: 'cinematic', name: 'Cinematic', className: 'preset-cinematic' },
        { id: 'editorial', name: 'Editorial', className: 'preset-editorial' },
        { id: 'urban', name: 'Urban', className: 'preset-urban' },
        { id: 'studio', name: 'Studio Color', className: 'preset-studio' },
        { id: 'noir', name: 'Noir', className: 'preset-noir' },
        { id: 'ethereal', name: 'Ethereal', className: 'preset-ethereal' },
        { id: 'grunge', name: 'Grunge', className: 'preset-grunge' },
        { id: 'retro', name: 'Retro', className: 'preset-retro' },
        { id: 'vogue', name: 'Vogue', className: 'preset-vogue' },
        { id: 'beauty', name: 'Beauty', className: 'preset-beauty' },
        { id: 'cyberpunk', name: 'Cyberpunk', className: 'preset-cyberpunk' },
        { id: 'painterly', name: 'Painterly', className: 'preset-painterly' },
    ];

    const [mode, setMode] = useState<EditorialMode>('editorial');
    const [selectedPresetId, setSelectedPresetId] = useState(EDITORIAL_PRESETS[0].id);
    const [selectedBackgroundId, setSelectedBackgroundId] = useState(LIFESTYLE_BACKGROUNDS[0].id);
    const [customPrompt, setCustomPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '16:9'>('3:4');
    const [artistPhotos, setArtistPhotos] = useState<ImageFile[]>([]);
    const [displayImageSrc, setDisplayImageSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGenerated, setIsGenerated] = useState(false);
    const [customPresets, setCustomPresets] = useState<CustomEditorialPreset[]>([]);
    const [selectedCssPreset, setSelectedCssPreset] = useState<string | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('editorialCustomPresets_v2');
            if (saved) {
                setCustomPresets(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Failed to load custom presets from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('editorialCustomPresets_v2', JSON.stringify(customPresets));
        } catch (error) {
            console.error("Failed to save custom presets to localStorage", error);
        }
    }, [customPresets]);

    const activePresetsList = useMemo(() => (mode === 'editorial' ? EDITORIAL_PRESETS : PRODUCT_PRESETS), [mode]);
    const activePreset = useMemo(() => activePresetsList.find(p => p.id === selectedPresetId) || activePresetsList[0], [selectedPresetId, activePresetsList]);
    const activeBackground = useMemo(() => LIFESTYLE_BACKGROUNDS.find(bg => bg.id === selectedBackgroundId) || LIFESTYLE_BACKGROUNDS[0], [selectedBackgroundId]);

    const handlePhotosChange = (images: ImageFile[]) => {
        setArtistPhotos(images);
        setDisplayImageSrc(images.length > 0 ? images[0].preview : null);
        setIsGenerated(false);
    };

    const handlePresetSelect = (id: string) => {
        setSelectedPresetId(id);
        setIsGenerated(false);
        if (artistPhotos.length > 0) {
            setDisplayImageSrc(artistPhotos[0].preview);
        }
    };
    
    const handleModeChange = (newMode: EditorialMode) => {
        setMode(newMode);
        setSelectedPresetId(newMode === 'editorial' ? EDITORIAL_PRESETS[0].id : PRODUCT_PRESETS[0].id);
        setAspectRatio(newMode === 'editorial' ? '3:4' : '1:1');
        setSelectedBackgroundId(LIFESTYLE_BACKGROUNDS[0].id);
        setCustomPrompt('');
        setIsGenerated(false);
        if(artistPhotos.length > 0) setDisplayImageSrc(artistPhotos[0].preview);
    };

    const handleRefineWithAI = async () => {
        if (artistPhotos.length === 0) {
            alert("Carregue uma imagem base primeiro.");
            return;
        }
        setIsRefining(true);
        setError(null);
        try {
            // 1. Combine all user inputs into a single descriptive prompt base.
            let combinedPrompt = activePreset.promptBase;

            if (mode === 'editorial') {
                combinedPrompt += activeBackground.promptAddition;
            }

            if (customPrompt.trim()) {
                // Append the user's custom instructions to the base.
                combinedPrompt += `, com as seguintes modificações: ${customPrompt.trim()}`;
            }

            // Add aspect ratio information for the AI to consider composition.
            combinedPrompt += `. A imagem final deve ter a proporção de ${aspectRatio}.`;
            
            // 2. Call the refinement service with the combined prompt.
            const refinedDetails = await refineCreativeDirection(combinedPrompt, artistPhotos, 'fashion_specialist');

            // 3. Replace the custom prompt area with the full, refined result.
            setCustomPrompt(refinedDetails);

        } catch (e: any) {
            setError(e.message || "Falha ao refinar com IA.");
        } finally {
            setIsRefining(false);
        }
    };

    const handleGenerate = async () => {
        if (artistPhotos.length === 0) {
            alert("Por favor, carregue pelo menos uma imagem antes de gerar.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const baseImage = artistPhotos[0];
            const referenceImages = artistPhotos.slice(1);

            const framingPrompt = mode === 'product'
                ? 'Aprimore o produto nesta imagem para uma renderização ultra-realista de fotografia de estúdio. Aplique o seguinte estilo: '
                : 'Transforme esta imagem em uma foto de revista de alta moda, usando as imagens de referência adicionais para garantir a fidelidade do rosto. Aplique o estilo de luz, cor e cenário do seguinte prompt: ';
            
            let finalPrompt = framingPrompt + activePreset.promptBase;
            if(mode === 'editorial') {
                finalPrompt += activeBackground.promptAddition;
            }
            if (customPrompt.trim()) {
                finalPrompt += `, ${customPrompt.trim()}`;
            }
            
            const resultUrl = await enhanceImageWithPreset(baseImage, finalPrompt, aspectRatio, referenceImages);
            setDisplayImageSrc(resultUrl);
            setIsGenerated(true);

        } catch (e: any) {
            setError(e.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePreset = () => {
        const name = prompt("Digite um nome para o seu preset:");
        if (name && name.trim()) {
            const newPreset: CustomEditorialPreset = {
                id: uuidv4(),
                name: name.trim(),
                settings: {
                    mode,
                    selectedPresetId,
                    selectedBackgroundId,
                    customPrompt,
                    aspectRatio,
                }
            };
            setCustomPresets(prev => [...prev, newPreset]);
        }
    };

    const handleLoadPreset = (presetId: string) => {
        const preset = customPresets.find(p => p.id === presetId);
        if (preset) {
            handleModeChange(preset.settings.mode); // Resets some fields which is intended
            
            // Set specific settings after mode change
            setMode(preset.settings.mode);
            setSelectedPresetId(preset.settings.selectedPresetId);
            setSelectedBackgroundId(preset.settings.selectedBackgroundId);
            setCustomPrompt(preset.settings.customPrompt);
            setAspectRatio(preset.settings.aspectRatio);

            setIsGenerated(false);
            if (artistPhotos.length > 0) {
                setDisplayImageSrc(artistPhotos[0].preview);
            }
        }
    };

    const handleDeletePreset = (e: React.MouseEvent, presetId: string) => {
        e.stopPropagation();
        if (window.confirm("Tem certeza que deseja apagar este preset?")) {
            setCustomPresets(prev => prev.filter(p => p.id !== presetId));
        }
    };


    const currentFilterClass = !isGenerated ? activePreset.filterClass : '';
    const currentShadowClass = !isGenerated ? activePreset.shadowClass : 'shadow-2xl shadow-indigo-500/50';

    const aspectRatioClasses: Record<typeof aspectRatio, string> = {
        '1:1': 'aspect-square max-w-[600px] mx-auto',
        '3:4': 'aspect-[3/4] max-w-[500px] mx-auto',
        '16:9': 'aspect-[16/9] w-full max-w-[800px] mx-auto',
    };
    
    const isLifestyleVisible = mode === 'editorial';

    return (
        <div className="studio-grid">
            <div className="controls-panel">
                 <section>
                    <h2 className="section-title"><CameraIcon className="icon" /> 1. Modo de Foto</h2>
                    <div className="button-grid">
                        <button onClick={() => handleModeChange('editorial')} className={`form-button ${mode === 'editorial' ? 'active' : ''}`}><UserIcon className="w-4 h-4" /> Editorial (Pessoa)</button>
                        <button onClick={() => handleModeChange('product')} className={`form-button ${mode === 'product' ? 'active' : ''}`}><PackageIcon className="w-4 h-4" /> Produto</button>
                    </div>
                </section>
                <section>
                    <h2 className="section-title"><ImageIcon className="icon" /> 2. Imagem Base</h2>
                     <ReferenceUploader
                        label={`Carregar Imagens (${mode === 'editorial' ? '1-5' : 'Produto'})`}
                        files={artistPhotos}
                        onFilesChange={handlePhotosChange}
                        maxFiles={5}
                    />
                     <p className='mt-2 text-xs text-white/60'>Para retratos, envie até 5 fotos para a IA criar um modelo de identidade mais fiel.</p>
                </section>
                <section>
                    <h2 className="section-title"><SparklesIcon className="icon" /> 3. Estilo de Aprimoramento (IA)</h2>
                    <div className="space-y-3">
                        {activePresetsList.map(preset => {
                            const Icon = (preset as any).icon || SparklesIcon;
                            return (
                                <button key={preset.id} onClick={() => handlePresetSelect(preset.id)} className={`preset-card ${selectedPresetId === preset.id ? 'active' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-6 h-6 text-primary flex-shrink-0" style={{color: 'var(--color-primary)'}} />
                                        <div>
                                            <p className="font-bold text-sm">{preset.name}</p>
                                            <p className="text-xs text-white/70">{preset.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
                 <section>
                    <h2 className="section-title"><PaletteIcon className="icon" /> 4. Filtros Visuais (Prévia)</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {CSS_PRESETS.map(preset => (
                            <button key={preset.id} onClick={() => setSelectedCssPreset(preset.className)} className={`form-button ${selectedCssPreset === preset.className ? 'active' : ''}`}>{preset.name}</button>
                        ))}
                    </div>
                     {selectedCssPreset && (
                        <button onClick={() => setSelectedCssPreset(null)} className="w-full mt-2 text-center text-xs text-white/60 hover:text-white">Limpar filtro</button>
                    )}
                </section>

                {customPresets.length > 0 && (
                    <section>
                         <h2 className="section-title"><SaveIcon className="icon" /> Meus Presets</h2>
                         <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {customPresets.map((preset) => (
                                <div key={preset.id} className="relative group">
                                    <button onClick={() => handleLoadPreset(preset.id)} className="w-full text-left p-3 pr-8 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <p className="font-bold text-white/90">{preset.name}</p>
                                        <p className="text-xs text-white/60 truncate capitalize">
                                            {preset.settings.mode} | {preset.settings.aspectRatio} | {preset.settings.selectedPresetId.replace(/_/g, ' ')}
                                        </p>
                                    </button>
                                    <button onClick={(e) => handleDeletePreset(e, preset.id)} className="absolute top-1/2 -translate-y-1/2 right-2 p-1 text-white/50 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Apagar Preset">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                         </div>
                    </section>
                )}

                {isLifestyleVisible && (
                    <section>
                        <h2 className="section-title"><MapPinIcon className="icon" /> 5. Cenário Lifestyle</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {LIFESTYLE_BACKGROUNDS.map(bg => (
                                <button key={bg.id} onClick={() => setSelectedBackgroundId(bg.id)} className={`form-button ${selectedBackgroundId === bg.id ? 'active' : ''}`}>{bg.name}</button>
                            ))}
                        </div>
                    </section>
                )}
                 <section>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="section-title !mb-0 !border-b-0 !pb-0"><MessageSquareIcon className="icon" /> {isLifestyleVisible ? '6. Refine a I.A. (Opcional)' : '5. Refine a I.A. (Opcional)'}</h2>
                        <button onClick={handleRefineWithAI} disabled={isRefining || artistPhotos.length === 0} className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-white disabled:opacity-50" title="Pedir ajuda à especialista de moda da IA">
                           {isRefining ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-current"></div> : <SparklesIcon className="w-4 h-4" />}
                            Refinar
                        </button>
                    </div>
                    <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder={mode === 'editorial' ? "Ex: Mude a camisa para vermelho escuro..." : "Ex: Mármore branco no fundo..."} rows={3}
                        className="form-textarea" />
                    <p className='mt-2 text-xs text-white/60'>Use comandos em português ou clique em "Refinar" para a especialista de moda da IA compor a cena.</p>
                </section>
                <section>
                    <h2 className="section-title"><CropIcon className="icon" /> {isLifestyleVisible ? '7. Proporção da Imagem' : '6. Proporção da Imagem'}</h2>
                    <div className="button-grid-3">
                        {(['1:1', '3:4', '16:9'] as const).map(ar => (
                            <button key={ar} onClick={() => setAspectRatio(ar)} className={`form-button ${aspectRatio === ar ? 'active' : ''}`}>
                                {ar === '1:1' ? '1:1' : ar === '3:4' ? '3:4' : '16:9'}
                            </button>
                        ))}
                    </div>
                </section>
                <div className="mt-auto pt-6 space-y-4">
                     <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><ZapIcon className="w-5 h-5 text-green-400" /> {isLifestyleVisible ? '8. Ação' : '7. Ação'}</h3>
                         <button onClick={handleSavePreset} className="secondary-action-button">
                            <SaveIcon className="w-5 h-5 mr-2" /> Salvar Preset Atual
                        </button>
                        <button onClick={handleGenerate} disabled={isLoading || artistPhotos.length === 0} className="action-button">
                            {isLoading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : 'Gerar Imagem com IA'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </div>
            </div>
             <div className="display-panel-container">
                 <div className={`relative w-full h-full rounded-xl overflow-hidden bg-gray-800 transition-all duration-700 ${!selectedCssPreset ? currentShadowClass : ''} ${aspectRatioClasses[aspectRatio]} ${selectedCssPreset || ''}`}>
                    {isLoading && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-400"></div>
                            <p className='mt-4 text-white font-semibold'>Gerando imagem...</p>
                        </div>
                    )}
                    {displayImageSrc ? (
                        <>
                            <img src={displayImageSrc} alt="Preview" className={`absolute top-0 left-0 w-full h-full object-cover transition-all duration-700 ${!isGenerated && !selectedCssPreset ? currentFilterClass : ''}`} style={{ filter: !isGenerated && !selectedCssPreset ? activePreset.filterClass.split(' ').map(f => f.replace(/-\[/g, '(').replace(/\]/g, ')')).join(' ') : 'none' }} />
                            <div id="blend-overlay" className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${!isGenerated && selectedCssPreset ? 'opacity-100' : 'opacity-0'}`}></div>
                        </>
                    ) : (
                         <div className="flex flex-col gap-2 items-center justify-center h-full text-white/50">
                            <ImageIcon className="w-16 h-16"/>
                            <span className="font-semibold">Carregue uma imagem</span>
                         </div>
                    )}
                    <div className="absolute bottom-4 left-4 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                        {isGenerated ? 'Resultado da IA' : `Prévia: ${activePreset.name}`}
                        {mode === 'editorial' && activeBackground.id !== 'none' && ` + ${activeBackground.name}`}
                         {customPrompt.trim() && ' + Custom'}
                    </div>
                    {isGenerated && displayImageSrc && !isLoading && (
                        <a
                            href={displayImageSrc}
                            download="imagem_editorial.png"
                            className="absolute bottom-4 right-4 z-10 bg-[#7D4FFF] text-white p-3 rounded-full hover:bg-[#6b3fef] transition-colors shadow-md"
                            aria-label="Download"
                        >
                            <DownloadIcon className="w-6 h-6" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorialStudio;