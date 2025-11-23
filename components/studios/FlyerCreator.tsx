// components/studios/FlyerCreator.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { produce } from 'immer';
import { v4 as uuidv4 } from 'uuid';

import { 
    FormData, Artist, ImageFile, CreativeDNA, Emotion, LayoutTemplate, TextHierarchy, 
    TypographyStyle, PostProductionStyle, ColorGrade, TextureOverlay, VideoFormData, 
    CompositionGuideline, ColorScheme, LightingStyle, GraphicElement, BusinessProfile,
    CardMaterial, CardFinishing, CardBorderStyle
} from '../../types';
import { getArtistPresets, getEmotionMatrix, getCreativeDNA } from '../../services/dnaEngine';
import { generateFlyer, refineCreativeDirection, editImageWithFlash, generateVideo, generateCommercialPromptDirection, refineOfferText, generateMotionPromptForResizedScene } from '../../services/geminiService';
import { constructExpansionPrompt } from '../../services/expansionEngine';
import { ApiKeyError } from '../../services/errors';

import { PlusIcon, SparklesIcon, TrashIcon, VideoIcon, ChevronDownIcon } from '../icons';
import CheckboxGroup from '../CheckboxGroup';
import Slider from '../Slider';
import ReferenceUploader from '../ReferenceUploader';
import ImageInput from '../ImageInput';
import DisplayArea from '../DisplayArea';
import PromptLibraryModal from '../PromptLibraryModal';

const influenceOptionsList = [
    { id: 'Funk', label: 'Funk' }, { id: 'Pop', label: 'Pop' },
    { id: 'Sertanejo', label: 'Sertanejo' }, { id: 'Reggaeton', label: 'Reggaeton' },
    { id: 'Trap', label: 'Trap' }, { id: 'Eletronico', label: 'Eletrônico' },
    { id: 'Streetwear', label: 'Streetwear' }, { id: 'Retrô', label: 'Retrô' },
    { id: 'Luxo / Premium', label: 'Luxo / Premium' }, { id: 'Moderno', label: 'Moderno' },
    { id: 'Grunge', label: 'Grunge' }, { id: 'Cinematico', label: 'Cinematico' },
    { id: 'Urbano', label: 'Urbano' }, { id: 'Neon / Rave', label: 'Neon / Rave' },
    { id: 'Minimalista', label: 'Minimalista' },
    { id: 'Synthwave', label: 'Synthwave' },
    { id: 'Holográfico', label: 'Holográfico' },
    { id: 'Brutalismo Digital', label: 'Brutalismo Digital' },
    { id: 'Swiss Design', label: 'Swiss Design / Tipográfico' },
    { id: 'Bauhaus', label: 'Bauhaus' },
    { id: 'Street Art / Graffiti', label: 'Street Art / Graffiti' },
    { id: 'Modern Corporate', label: 'Modern Corporate' },
    { id: 'Vintage / Handcrafted', label: 'Vintage / Handcrafted' },
    { id: 'Gourmet / Foodie', label: 'Gourmet / Foodie' },
];

const layoutOptions: { id: LayoutTemplate, label: string }[] = [
    { id: 'single_artist_centered', label: 'Artista Único Centralizado' },
    { id: 'artists_side_by_side', label: 'Artistas Lado a Lado' },
    { id: 'split_vertical', label: 'Split Vertical (Foto | Agenda)' },
    { id: 'info_block_bottom', label: 'Bloco de Informações Inferior' },
    { id: 'three_artists_grid', label: 'Grade de 3 Artistas (Trap)' },
    { id: 'overlay_panel', label: 'Painel Sobreposto (Agenda)' },
    { id: 'split_diagonal', label: 'Divisão Diagonal' },
    { id: 'photo_collage', label: 'Colagem de Fotos' },
    { id: 'text_as_graphic', label: 'Tipografia Gráfica' },
    { id: 'framed_content', label: 'Conteúdo Emoldurado' },
    { id: 'vertical_list_agenda', label: 'Lista de Agenda Vertical' },
    { id: 'full_bleed_typography', label: 'Tipografia Full-Bleed' },
];

const compositionGuidelineOptions: { id: CompositionGuideline, label: string }[] = [
    { id: 'none', label: 'Padrão' },
    { id: 'diagonal_composition', label: 'Composição Diagonal' },
    { id: 'scene_framing', label: 'Enquadramento de Cena' },
    { id: 'negative_space', label: 'Uso de Espaço Negativo' },
];

const colorSchemeOptions: { id: ColorScheme, label: string }[] = [
    { id: 'default', label: 'Padrão da Paleta' },
    { id: 'vibrant_gradient', label: 'Gradiente Vibrante' },
    { id: 'monochromatic', label: 'Monocromático' },
    { id: 'triadic_complementary', label: 'Triádico / Complementar' },
];

const lightingStyleOptions: { id: LightingStyle, label: string }[] = [
    { id: 'default', label: 'Padrão' },
    { id: 'soft_light', label: 'Luz Suave (Soft)' },
    { id: 'hard_light', label: 'Luz Dura (Hard)' },
    { id: 'volumetric_light', label: 'Luz Volumétrica' },
];

const graphicElementsOptions: { id: GraphicElement, label: string }[] = [
    { id: 'repeating_text_pattern', label: 'Padrão de Texto Repetido' },
    { id: 'abstract_organic_shapes', label: 'Formas Orgânicas/Abstratas' },
    { id: 'paint_splashes_drips', label: 'Splashes / Drips de Tinta' },
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

const textHierarchyOptions: { id: TextHierarchy, label: string }[] = [
    { id: 'artist_name', label: 'Foco no Nome do Artista' },
    { id: 'event_name', label: 'Foco na Data/Evento' },
    { id: 'title', label: 'Foco no Título (AGENDA)' },
    { id: 'call_to_action', label: 'Foco na Chamada (Contrate)' },
];

const postProductionStyleOptions: { id: PostProductionStyle, label: string }[] = [
    { id: 'clean', label: 'Limpo / Comercial' },
    { id: 'graphic', label: 'Gráfico / Colagem' },
    { id: 'retro', label: 'Retrô / Analógico' },
    { id: 'digital_glitch', label: 'Digital / Glitch' },
    { id: 'digital_illustration', label: 'Ilustração Digital' },
    { id: 'corporate_clean', label: 'Corporativo Clean' },
];

const colorGradeOptions: { id: ColorGrade, label: string }[] = [
    { id: 'none', label: 'Natural' },
    { id: 'neon_urban', label: 'Neon Urbano' },
    { id: 'warm_sepia', label: 'Sépia Quente' },
    { id: 'bw_contrast', label: 'Contraste P&B' },
    { id: 'duotone_vibrant', label: 'Duotone Vibrante' },
    { id: 'teal_orange', label: 'Cinematic Teal & Orange' },
    { id: 'desaturated_moody', label: 'Desaturado / Moody' },
];

const textureOverlayOptions: { id: TextureOverlay, label: string }[] = [
    { id: 'none', label: 'Nenhuma' },
    { id: 'paper', label: 'Papel Amassado' },
    { id: 'noise', label: 'Ruído de TV' },
    { id: 'dust', label: 'Poeira e Arranhões' },
    { id: 'neon_lines', label: 'Linhas de Neon' },
    { id: 'geometric', label: 'Geométrico' },
    { id: 'film_grain', label: 'Granulação de Filme' },
    { id: 'wood_grain', label: 'Textura de Madeira' },
    { id: 'frosted_glass_plastic', label: 'Vidro / Plástico Fosco' },
    { id: 'concrete_urban_wall', label: 'Concreto / Parede' },
    { id: 'brushed_metal', label: 'Metal Escovado' },
];

const cardMaterialOptions: { id: CardMaterial, label: string }[] = [
    { id: 'matte', label: 'Papel Fosco' },
    { id: 'glossy', label: 'Papel Brilhante' },
    { id: 'textured', label: 'Papel Texturizado' },
    { id: 'black_card', label: 'Cartão Preto' },
];

const cardFinishingOptions: { id: CardFinishing, label: string }[] = [
    { id: 'none', label: 'Nenhum' },
    { id: 'gold_foil', label: 'Dourado (Foil)' },
    { id: 'silver_foil', label: 'Prateado (Foil)' },
    { id: 'emboss', label: 'Relevo Seco' },
    { id: 'spot_uv', label: 'Verniz Localizado' },
];

const cardBorderStyleOptions: { id: CardBorderStyle, label: string }[] = [
    { id: 'none', label: 'Nenhuma' },
    { id: 'thin_line', label: 'Borda Fina' },
    { id: 'colored_edges', label: 'Bordas Coloridas' },
    { id: 'geometric_lines', label: 'Linhas Geométricas' },
    { id: 'rounded_corners', label: 'Cantos Arredondados' },
];


const aspectRatioOptions: { id: '1:1' | '9:16' | '16:9', label: string }[] = [
    { id: '1:1', label: '1:1 (Quadrado)' },
    { id: '9:16', label: '9:16 (Vertical)' },
    { id: '16:9', label: '16:9 (Horizontal)' },
];

const colorPresets = [
    { name: "Tecnologia", primary: "#0B3B2B", secondary: "#39FF14", gradient: "bg-gradient-to-r from-[#0B3B2B] to-[#39FF14]" },
    { name: "Varejo", primary: "#FF0000", secondary: "#FFD600", gradient: "bg-gradient-to-r from-[#FF0000] to-[#FFD600]" },
    { name: "Luxo", primary: "#1C1C1C", secondary: "#B8860B", gradient: "bg-gradient-to-r from-[#1C1C1C] to-[#B8860B]" },
    { name: "Saúde", primary: "#00BFFF", secondary: "#FFFFFF", gradient: "bg-gradient-to-r from-[#00BFFF] to-[#FFFFFF]" },
    { name: "Natureza", primary: "#2E8B57", secondary: "#FFD700", gradient: "bg-gradient-to-r from-[#2E8B57] to-[#FFD700]" },
    { name: "Neon", primary: "#9400D3", secondary: "#FF1493", gradient: "bg-gradient-to-r from-[#9400D3] to-[#FF1493]" },
];

interface FlyerCreatorProps {
    apiKeyReady: boolean;
    onSelectKey: () => Promise<void>;
}

const CollapsibleSection: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-black/20 py-4 px-5 rounded-lg border border-white/5 w-full">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h2 className="font-bold text-lg text-primary" style={{color: 'var(--color-primary)'}}>{title}</h2>
                <ChevronDownIcon className={`w-6 h-6 text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="mt-4 animate-creation">{children}</div>}
        </div>
    );
};

const FlyerCreator: React.FC<FlyerCreatorProps> = ({ apiKeyReady, onSelectKey }) => {
    const [formData, setFormData] = useState<Omit<FormData, 'creationMode'>>({
        flyerType: 'artist_agenda',
        artistProfiles: [],
        businessProfile: null,
        referencePhotos: [],
        referencePhotoScanProfiles: [],
        creativePrompt: 'Configure as opções de design para ver o prompt técnico aqui.',
        eventDates: '22/11 - SÃO PAULO - DJ PIU\n23/11 - RIO DE JANEIRO - FESTIVAL',
        influenceOptions: ['Funk', 'Urbano', 'Neon / Rave'],
        identityFidelity: 100,
        clothingFidelity: 50,
        typographyStyle: 'modern',
        textHierarchy: 'artist_name',
        layout: 'single_artist_centered',
        emotion: 'vibrant',
        aspectRatio: '9:16',
        postProductionStyle: 'clean',
        colorGrade: 'none',
        textureOverlay: 'none',
        primaryColor: '#0B3B2B',
        secondaryColor: '#39FF14',
        usePresetPalette: true,
        compositionGuideline: 'none',
        colorScheme: 'default',
        lightingStyle: 'default',
        graphicElements: [],
        cardMaterial: 'matte',
        cardFinishing: 'none',
        cardBorderStyle: 'none',
    });
    
    const [presets, setPresets] = useState<string[]>([]);
    const [emotionOptions, setEmotionOptions] = useState<Emotion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAIAssisting, setIsAIAssisting] = useState(false);
    const [isRefiningText, setIsRefiningText] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedMediaUrl, setGeneratedMediaUrl] = useState<string | null>(null);
    const [dna, setDna] = useState<CreativeDNA | null>(null);
    const [displayMediaType, setDisplayMediaType] = useState<'image' | 'video'>('image');
    const [isPromptManuallyEdited, setIsPromptManuallyEdited] = useState(false);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

    const [isSecondaryLoading, setSecondaryLoading] = useState({ animate: false, expand: false });

    // Initial Data Loading
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const loadedPresets = await getArtistPresets();
                const emotions = await getEmotionMatrix();
                setPresets(loadedPresets);
                setEmotionOptions(emotions);
                if (formData.artistProfiles.length === 0 && loadedPresets.length > 0) {
                     handleAddArtist(loadedPresets[0]);
                }
            } catch (e) {
                setError("Falha ao carregar os dados do DNA. Verifique o console.");
                console.error("Failed to load DNA data:", e);
            }
        };
        loadInitialData();
    }, []);

    // Fetch Creative DNA when principal subject or emotion changes
    useEffect(() => {
        const fetchDna = async () => {
            const subjectName = formData.flyerType === 'business_promo' || formData.flyerType === 'business_card'
                ? formData.businessProfile?.name 
                : formData.artistProfiles[0]?.name;

            if (subjectName) {
                try {
                    const currentDna = await getCreativeDNA(subjectName, formData.emotion);
                    setDna(currentDna);
                } catch (e) {
                    console.error("Could not fetch DNA for:", subjectName);
                    setDna(null);
                }
            } else {
                setDna(null);
            }
        };
        fetchDna();
    }, [formData.artistProfiles[0]?.name, formData.businessProfile?.name, formData.emotion, formData.flyerType]);


    // This effect updates the technical prompt whenever relevant fields change.
    useEffect(() => {
        if (isPromptManuallyEdited) return;

        let finalPrompt = '';

        if (formData.flyerType === 'business_card') {
            const bp = formData.businessProfile;
            const materialLabel = cardMaterialOptions.find(o => o.id === formData.cardMaterial)?.label || 'fosco';
            const finishingLabel = cardFinishingOptions.find(o => o.id === formData.cardFinishing)?.label || 'nenhum';
            const borderStyleLabel = {
                'none': 'sem detalhes especiais na borda.',
                'thin_line': 'com uma borda fina e elegante ao redor.',
                'colored_edges': 'com as bordas laterais pintadas em uma cor de destaque da marca (edge painting).',
                'geometric_lines': 'com linhas geométricas abstratas que cruzam o design, integradas à identidade da marca.',
                'rounded_corners': 'com cantos suavemente arredondados.'
            }[formData.cardBorderStyle || 'none'];
            const typographyLabel = typographyStyleOptions.find(o => o.id === formData.typographyStyle)?.label || 'moderno';

            finalPrompt = `Crie um mockup fotorrealista de um cartão de visita de luxo, mostrando a frente e o verso, sobre uma superfície elegante que combine com o estilo (ex: mármore, couro, madeira escura).\n\n**INSTRUÇÕES DE DESIGN:**\n- **Identidade Visual:** Use as imagens de referência fornecidas para extrair o logo, a paleta de cores e o estilo geral da marca. A consistência com a marca é crucial.\n- **Material & Acabamento:** O cartão deve ter uma aparência de **${materialLabel}** com acabamento em **${finishingLabel}**.\n- **Borda & Formato:** O design do cartão deve ter ${borderStyleLabel}\n- **Tipografia:** Use um estilo de tipografia **${typographyLabel}**, garantindo excelente legibilidade e sofisticação.\n- **Layout:** Crie um layout profissional e criativo. O verso pode ter apenas o logo ou um elemento gráfico da marca, enquanto a frente contém as informações de contato.\n- **Proporção do Mockup:** A imagem final deve ter a proporção de ${formData.aspectRatio}.\n\n**CONTEÚDO DO CARTÃO:**\n- Empresa: ${bp?.name || ''}\n- Nome: ${bp?.personName || ''}\n- Cargo: ${bp?.personTitle || ''}\n- Telefone: ${bp?.phone || ''}\n- Email: ${bp?.email || ''}\n- Website: ${bp?.website || ''}\n- Endereço: ${bp?.address || ''}\n\nGere uma imagem com qualidade de estúdio, focada nos detalhes da textura do papel e nos efeitos do acabamento.`;
        } else {
            const mainSubject = formData.flyerType === 'business_promo' 
                ? formData.businessProfile?.name 
                : formData.artistProfiles.map(a => a.name).join(', ');

            const directives = [
                `TEMA_BASE: Estilo ${dna ? `"${dna.style}"` : 'genérico'}. Emoção: ${formData.emotion}.`,
            ];

            if (formData.flyerType === 'business_promo') {
                directives.push(`CORES_CAMPANHA: Primária '${formData.primaryColor}', Secundária '${formData.secondaryColor}'.`);
                directives.push(`USAR_PALETA_PRESET: ${formData.usePresetPalette ? 'SIM' : 'NÃO'}.`);
            } else if (formData.flyerType === 'contrate') {
                directives.push(`FOCO_PRINCIPAL: Criar uma arte de "Contrate-me" impactante para o artista. O texto de contato é crucial e deve ser legível e proeminente.`);
            }
            
            directives.push(`LAYOUT_TEMPLATE: ${formData.layout}.`);
            directives.push(`TIPOGRAFIA: Estilo '${formData.typographyStyle}', com foco em '${formData.textHierarchy}'.`);
            directives.push(`POS_PRODUCAO: Estilo '${formData.postProductionStyle}', Cor '${formData.colorGrade}', Textura '${formData.textureOverlay}'.`);
            directives.push(`INFLUENCIAS_ADICIONAIS: ${formData.influenceOptions.join(', ')}.`);
            directives.push(`ASPECT_RATIO: ${formData.aspectRatio}.`);
            
            finalPrompt = `Gerar um flyer para "${mainSubject || 'sujeito não definido'}".\n\n-- DIRETIVAS TÉCNICAS --\n${directives.join('\n')}`;
        }
        
        setFormData(prev => ({...prev, creativePrompt: finalPrompt}));

    }, [dna, formData.flyerType, formData.businessProfile, formData.artistProfiles, formData.emotion, formData.primaryColor, formData.secondaryColor, formData.usePresetPalette, formData.layout, formData.typographyStyle, formData.textHierarchy, formData.postProductionStyle, formData.colorGrade, formData.textureOverlay, formData.influenceOptions, formData.aspectRatio, formData.cardMaterial, formData.cardFinishing, formData.cardBorderStyle, isPromptManuallyEdited]);


    const handleFormChange = <T extends keyof Omit<FormData, 'creationMode'>>(field: T, value: Omit<FormData, 'creationMode'>[T]) => {
        setFormData(prev => ({...prev, [field]: value}));
        if(field !== 'creativePrompt') {
            setIsPromptManuallyEdited(false);
        }
    };
    
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIsPromptManuallyEdited(true);
        setFormData(prev => ({...prev, creativePrompt: e.target.value}));
    };

    const handleResetPrompt = () => {
        setIsPromptManuallyEdited(false);
    };

    const handleArtistChange = <T extends keyof Omit<Artist, 'id'>>(artistId: string, field: T, value: Omit<Artist, 'id'>[T]) => {
        setFormData(currentData => produce(currentData, draft => {
            const artist = draft.artistProfiles.find(a => a.id === artistId);
            if (artist) {
                (artist[field] as any) = value;
            }
        }));
    };

    const handleBusinessChange = <T extends keyof Omit<BusinessProfile, 'id'>>(field: T, value: Omit<BusinessProfile, 'id'>[T]) => {
        setFormData(currentData => produce(currentData, draft => {
            if (draft.businessProfile) {
                (draft.businessProfile[field] as any) = value;
            }
        }));
    };
    
    const handleAddArtist = (presetName: string = '') => {
        const newArtist: Artist = { id: uuidv4(), name: presetName || 'Novo Artista', logo: null, photos: [] };
        setFormData(currentData => produce(currentData, draft => { 
            draft.artistProfiles.push(newArtist) 
        }));
    };

    const handleRemoveArtist = (artistId: string) => {
        setFormData(currentData => produce(currentData, draft => { 
            draft.artistProfiles = draft.artistProfiles.filter(a => a.id !== artistId) 
        }));
    };

    const handleFlyerTypeChange = (type: FormData['flyerType']) => {
        setFormData(currentData => produce(currentData, draft => {
            draft.flyerType = type;
            if (type === 'business_promo' || type === 'business_card') {
                draft.artistProfiles = [];
                if (!draft.businessProfile) {
                    draft.businessProfile = { id: uuidv4(), name: 'Minha Empresa', logo: null, productPhotos: [] };
                }
                
                if (type === 'business_card') {
                     draft.businessProfile.personName = draft.businessProfile.personName ?? 'Seu Nome';
                     draft.businessProfile.personTitle = draft.businessProfile.personTitle ?? 'Seu Cargo';
                     draft.businessProfile.phone = draft.businessProfile.phone ?? '+55 (11) 99999-9999';
                     draft.businessProfile.email = draft.businessProfile.email ?? 'email@suaempresa.com';
                     draft.businessProfile.website = draft.businessProfile.website ?? 'www.suaempresa.com.br';
                     draft.businessProfile.address = draft.businessProfile.address ?? 'Rua Exemplo, 123, São Paulo, SP';
                     draft.eventDates = '';
                     draft.layout = 'text_as_graphic';
                     draft.typographyStyle = 'elegant';
                     draft.aspectRatio = '16:9';
                } else { // business_promo
                    draft.eventDates = "PROMOÇÃO IMPERDÍVEL!\n- Produto X: R$99,99\n- Leve 2 Pague 1\n- www.seusite.com.br";
                    draft.layout = 'info_block_bottom';
                    draft.textHierarchy = 'title';
                }
            } else { // Artist types
                draft.businessProfile = null;
                if (draft.artistProfiles.length === 0 && presets.length > 0) {
                     draft.artistProfiles.push({ id: uuidv4(), name: presets[0], logo: null, photos: [] });
                }

                if (type === 'contrate') {
                    draft.eventDates = 'CONTRATE PARA SHOWS\n(99) 9.9999-9999\n@seuinstagram';
                    draft.layout = 'text_as_graphic';
                    draft.textHierarchy = 'call_to_action';
                } else { // artist_agenda or event
                    draft.eventDates = '22/11 - SÃO PAULO - DJ PIU\n23/11 - RIO DE JANEIRO - FESTIVAL';
                    draft.layout = 'single_artist_centered';
                    draft.textHierarchy = 'artist_name';
                }
            }
        }));
    };
    
    const handleGenerateFlyer = async () => {
        const hasContent = formData.flyerType === 'business_promo' || formData.flyerType === 'business_card'
            ? formData.businessProfile
            : formData.artistProfiles.length > 0;
            
        if (isLoading || !hasContent) return;
        setIsLoading(true);
        setError(null);
        try {
            if (!dna && !['business_promo', 'business_card'].includes(formData.flyerType)) {
                throw new Error("DNA Criativo não pôde ser carregado. Verifique o nome do artista.");
            }
            const imageUrl = await generateFlyer({ ...formData, creationMode: 'image' }, dna);
            setGeneratedMediaUrl(imageUrl);
            setDisplayMediaType('image');
        } catch (e: any) {
            setError(e.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const convertUrlToImageFile = async (url: string): Promise<ImageFile> => {
        try {
            const response = await fetch(url);
             if (!response.ok) throw new Error('Failed to fetch image for processing.');
            const blob = await response.blob();
            const file = new File([blob], "generated_flyer.png", { type: blob.type });
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
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
        } catch (e) {
            console.error("Error converting URL to ImageFile:", e);
            throw e;
        }
    };

    const handleAIAssist = async () => {
        if (isAIAssisting) return;
        setIsAIAssisting(true);
        setError(null);
        try {
            let refinedPrompt: string;
    
            if (formData.flyerType === 'business_promo') {
                if (!dna || !formData.businessProfile) {
                    throw new Error("Perfil comercial ou DNA criativo não está disponível para a IA assistente.");
                }
                refinedPrompt = await generateCommercialPromptDirection({ ...formData, creationMode: 'image' }, dna);
            } else {
                const allImages: ImageFile[] = [...formData.referencePhotos];
                formData.artistProfiles.forEach(artist => {
                    if (artist.logo) allImages.push(artist.logo);
                    allImages.push(...artist.photos);
                });
                if (generatedMediaUrl && displayMediaType === 'image') {
                    allImages.push(await convertUrlToImageFile(generatedMediaUrl));
                }
                refinedPrompt = await refineCreativeDirection(formData.creativePrompt, allImages);
            }
            
            handleFormChange("creativePrompt", refinedPrompt);
            setIsPromptManuallyEdited(true);
        } catch (e: any) {
            setError(e.message || "Falha ao refinar a direção criativa.");
        } finally {
            setIsAIAssisting(false);
        }
    };

    const handleRefineOfferText = async () => {
        if (isRefiningText || !formData.businessProfile) return;
        setIsRefiningText(true);
        setError(null);
        try {
            const refinedText = await refineOfferText(formData.eventDates, formData.businessProfile);
            handleFormChange('eventDates', refinedText);
        } catch (e: any) {
            setError(e.message || "Falha ao refinar o texto da oferta.");
        } finally {
            setIsRefiningText(false);
        }
    };
    
    const handleAnimate = async () => {
        if (!generatedMediaUrl || isSecondaryLoading.animate || formData.aspectRatio === '1:1') return;
    
        if (!apiKeyReady) {
            await onSelectKey();
            const hasKey = window.aistudio && await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setError("É necessário selecionar uma chave de API para animar o flyer.");
                return;
            }
        }
    
        setSecondaryLoading(s => ({ ...s, animate: true }));
        setError(null);
        try {
            const baseImage = await convertUrlToImageFile(generatedMediaUrl);
            
            const motionPrompt = await generateMotionPromptForResizedScene(baseImage);
    
            const animationFormData: VideoFormData = {
                artistName: formData.artistProfiles.map(a => a.name).join(', '),
                artistLogo: null,
                referencePhotos: [baseImage], 
                masterFrame: null,
                motionEvents: [],
                finalScript: motionPrompt,
                cameraBehavior: 'Slow Dolly-In Realism',
                atmosphere: 'Amber Haze Drift',
                transition: 'Fog Pass Through',
                aspectRatio: formData.aspectRatio === '16:9' ? '16:9' : '9:16',
                resolution: '1080p',
                useFaceLock: true,
                endFrame: null,
            };
            
            const videoUrl = await generateVideo(animationFormData);
    
            setGeneratedMediaUrl(videoUrl);
            setDisplayMediaType('video');
    
        } catch (e: any) {
            if (e instanceof ApiKeyError) {
                setError(e.message);
            } else {
                setError(`Falha ao animar o flyer: ${e.message}`);
            }
        } finally {
            setSecondaryLoading(s => ({ ...s, animate: false }));
        }
    };
    
    const handleExpand = async () => {
        if (!generatedMediaUrl || isSecondaryLoading.expand) return;

        setSecondaryLoading(s => ({ ...s, expand: true }));
        setError(null);
        try {
            const baseImage = await convertUrlToImageFile(generatedMediaUrl);
            const expansionPrompt = constructExpansionPrompt(formData.creativePrompt, 100, []);
            const newImageUrl = await editImageWithFlash(baseImage, expansionPrompt);

            setGeneratedMediaUrl(newImageUrl);
            setDisplayMediaType('image');
        } catch (e: any) {
            setError(`Falha ao expandir o flyer: ${e.message}`);
        } finally {
            setSecondaryLoading(s => ({ ...s, expand: false }));
        }
    };

    return (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
             <PromptLibraryModal 
                isOpen={isPromptModalOpen} 
                onClose={() => setIsPromptModalOpen(false)} 
                onSelectPrompt={(p) => {
                    handleFormChange('creativePrompt', p);
                    setIsPromptManuallyEdited(true);
                }} 
            />
            <div className="lg:col-span-1 bg-[#1E1F22] p-6 rounded-lg flex flex-col gap-4 overflow-y-auto">
                <CollapsibleSection title="1. Tipo de Criação" defaultOpen>
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {(['artist_agenda', 'event', 'business_promo', 'contrate', 'business_card'] as const).map(type => (
                            <button key={type} onClick={() => handleFlyerTypeChange(type)}
                                className={`py-2 px-4 rounded-md text-sm font-semibold transition ${formData.flyerType === type ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}
                            >
                                {type === 'artist_agenda' ? 'Agenda' : type === 'event' ? 'Evento' : type === 'business_promo' ? 'Comercial' : type === 'contrate' ? 'Contrate' : 'Cartão Premium'}
                            </button>
                        ))}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title="2. Conteúdo Essencial" defaultOpen>
                    {formData.flyerType === 'business_promo' || formData.flyerType === 'business_card' ? (
                        <div 
                          className="space-y-4"
                          style={{
                              '--color-primary': formData.primaryColor,
                              '--color-secondary': formData.secondaryColor
                          } as React.CSSProperties}
                        >
                            {formData.businessProfile && (
                                <>
                                    <h3 className="font-semibold text-white">{formData.flyerType === 'business_card' ? 'Dados do Cartão' : 'Perfil Comercial'}</h3>
                                    <input type="text" value={formData.businessProfile.name} onChange={(e) => handleBusinessChange('name', e.target.value)} placeholder="Nome da Empresa/Produto" className="w-full bg-white/10 p-2 rounded-md border border-white/20" />
                                    
                                    {formData.flyerType === 'business_card' && (
                                        <div className="space-y-3 bg-black/20 p-4 rounded-md">
                                            <input type="text" value={formData.businessProfile.personName || ''} onChange={e => handleBusinessChange('personName', e.target.value)} placeholder="Seu Nome" className="w-full bg-white/5 p-2 rounded-md border border-white/20 text-sm"/>
                                            <input type="text" value={formData.businessProfile.personTitle || ''} onChange={e => handleBusinessChange('personTitle', e.target.value)} placeholder="Seu Cargo" className="w-full bg-white/5 p-2 rounded-md border border-white/20 text-sm"/>
                                            <input type="text" value={formData.businessProfile.phone || ''} onChange={e => handleBusinessChange('phone', e.target.value)} placeholder="Telefone" className="w-full bg-white/5 p-2 rounded-md border border-white/20 text-sm"/>
                                            <input type="email" value={formData.businessProfile.email || ''} onChange={e => handleBusinessChange('email', e.target.value)} placeholder="Email" className="w-full bg-white/5 p-2 rounded-md border border-white/20 text-sm"/>
                                            <input type="text" value={formData.businessProfile.website || ''} onChange={e => handleBusinessChange('website', e.target.value)} placeholder="Website" className="w-full bg-white/5 p-2 rounded-md border border-white/20 text-sm"/>
                                            <input type="text" value={formData.businessProfile.address || ''} onChange={e => handleBusinessChange('address', e.target.value)} placeholder="Endereço" className="w-full bg-white/5 p-2 rounded-md border border-white/20 text-sm"/>
                                        </div>
                                    )}

                                    <ReferenceUploader 
                                        label={formData.flyerType === 'business_card' ? "Identidade Visual (Logo, Cores)" : "Fotos do Produto/Serviço"} 
                                        files={formData.businessProfile.productPhotos} 
                                        onFilesChange={(files) => handleBusinessChange('productPhotos', files)} 
                                        onScansChange={(profiles) => handleBusinessChange('productPhotoScanProfiles', profiles)}
                                        maxFiles={5}
                                        creativeDNA={dna} 
                                    />
                                </>
                            )}
                            
                            {formData.flyerType === 'business_promo' && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-white/80 mb-2">Cores da Campanha</label>
                                    <div className="flex gap-4">
                                        {/* Color pickers and presets */}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.artistProfiles.map((artist, index) => (
                                <div key={artist.id} className="bg-white/5 p-4 rounded-lg space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-white">Artista {index + 1}</h3>
                                        {formData.artistProfiles.length > 1 && <button onClick={() => handleRemoveArtist(artist.id)}><TrashIcon className="w-5 h-5 text-red-500 hover:text-red-400" /></button>}
                                    </div>
                                    <input type="text" value={artist.name} onChange={(e) => handleArtistChange(artist.id, 'name', e.target.value)} placeholder="Nome do Artista" className="w-full bg-white/10 p-2 rounded-md border border-white/20" />
                                    <ImageInput 
                                        label="Logo do Artista (Opcional)" 
                                        image={artist.logo} 
                                        onImageSelect={(img) => handleArtistChange(artist.id, 'logo', img)}
                                        onScanComplete={(profile) => handleArtistChange(artist.id, 'logoScanProfile', profile)}
                                        creativeDNA={dna}
                                    />
                                    <ReferenceUploader 
                                        label="Fotos do Artista" 
                                        files={artist.photos} 
                                        onFilesChange={(files) => handleArtistChange(artist.id, 'photos', files)} 
                                        onScansChange={(profiles) => handleArtistChange(artist.id, 'photoScanProfiles', profiles)}
                                        maxFiles={3}
                                        creativeDNA={dna} 
                                    />
                                </div>
                            ))}
                             <button onClick={() => handleAddArtist()} className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-semibold transition bg-white/10 hover:bg-white/20">
                                <PlusIcon className="w-5 h-5"/> Adicionar Artista
                            </button>
                        </div>
                    )}

                    {formData.flyerType !== 'business_card' && (
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="eventDates" className="block text-sm font-medium text-white/80">
                                    {formData.flyerType === 'business_promo' ? 'Informações da Oferta / Chamada para Ação' : formData.flyerType === 'contrate' ? 'Informações de Contato / Chamada' : 'Datas e Locais da Agenda'}
                                </label>
                                {formData.flyerType === 'business_promo' && (
                                    <button onClick={handleRefineOfferText} disabled={isRefiningText} className="flex items-center gap-1 text-xs font-semibold text-[#7D4FFF] hover:text-white disabled:opacity-50" title="Refinar com IA">
                                        {isRefiningText ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-current"></div> : <SparklesIcon className="w-4 h-4" />}
                                        Refinar
                                    </button>
                                )}
                            </div>
                            <textarea
                                id="eventDates" rows={4} value={formData.eventDates}
                                onChange={(e) => handleFormChange('eventDates', e.target.value)}
                                className="w-full bg-white/5 p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-[#7D4FFF]"
                                placeholder={formData.flyerType === 'business_promo' ? 'Ex: 50% OFF em todo o site!\nUse o cupom: PROMO50\nwww.seusite.com.br' : formData.flyerType === 'contrate' ? 'Ex: CONTRATE PARA SHOWS\n(99) 9.9999-9999\n@seuinstagram' : 'Deixe em branco para um flyer sem agenda'}
                            />
                        </div>
                    )}
                </CollapsibleSection>

                {formData.flyerType === 'business_card' && (
                    <>
                        <CollapsibleSection title="3. Estilo do Cartão" defaultOpen>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-white/80 mb-2">Material do Papel</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cardMaterialOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('cardMaterial', opt.id)} className={`form-button ${formData.cardMaterial === opt.id ? 'active' : ''}`}>{opt.label}</button>)}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-white/80 mb-2">Acabamento Premium</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                        {cardFinishingOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('cardFinishing', opt.id)} className={`form-button ${formData.cardFinishing === opt.id ? 'active' : ''}`}>{opt.label}</button>)}
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>
                        <CollapsibleSection title="4. Estilo da Borda" defaultOpen>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {cardBorderStyleOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('cardBorderStyle', opt.id)} className={`form-button ${formData.cardBorderStyle === opt.id ? 'active' : ''}`}>{opt.label}</button>)}
                            </div>
                        </CollapsibleSection>
                    </>
                )}
                
                {formData.flyerType !== 'business_card' && (
                    <CollapsibleSection title="3. Direção de Arte e Estilo">
                        <div className="space-y-4">
                            <ReferenceUploader 
                                label="Fotos de Referência de Estilo" 
                                files={formData.referencePhotos} 
                                onFilesChange={f => handleFormChange('referencePhotos', f)} 
                                onScansChange={p => handleFormChange('referencePhotoScanProfiles', p)}
                                maxFiles={5} 
                                creativeDNA={dna}
                            />
                            <CheckboxGroup label="Influências de Estilo" options={influenceOptionsList} selected={formData.influenceOptions} onChange={s => handleFormChange('influenceOptions', s)} />
                            <Slider label="Fidelidade da Identidade (Rosto/Produto)" value={formData.identityFidelity} onChange={v => handleFormChange('identityFidelity', v)} />
                            <Slider label="Fidelidade de Itens Secundários" value={formData.clothingFidelity} onChange={v => handleFormChange('clothingFidelity', v)} />
                        </div>
                    </CollapsibleSection>
                )}
                
                {formData.flyerType !== 'business_card' && (
                    <CollapsibleSection title="4. Layout e Composição">
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Template de Layout</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {layoutOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('layout', opt.id)} className={`py-2 px-2 rounded-md text-xs text-center font-semibold capitalize transition ${formData.layout === opt.id ? 'active' : ''}`}>{opt.label}</button>)}
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-sm font-medium text-white/80 mb-2">Diretrizes de Composição</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {compositionGuidelineOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('compositionGuideline', opt.id)} className={`py-2 px-2 rounded-md text-xs text-center font-semibold capitalize transition ${formData.compositionGuideline === opt.id ? 'active' : ''}`}>{opt.label}</button>)}
                            </div>
                        </div>
                    </CollapsibleSection>
                )}
                
                <CollapsibleSection title={formData.flyerType === 'business_card' ? "5. Tipografia" : "5. Tipografia e Hierarquia"}>
                     <div className="space-y-3">
                        <div>
                            <h3 className="text-sm font-medium text-white/80 mb-2">Estilo da Fonte</h3>
                             <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                {typographyStyleOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('typographyStyle', opt.id)} className={`py-2 px-2 rounded-md text-xs font-semibold capitalize transition ${formData.typographyStyle === opt.id ? 'active' : ''}`}>{opt.label}</button>)}
                            </div>
                        </div>
                        {formData.flyerType !== 'business_card' && (
                            <div>
                                <h3 className="text-sm font-medium text-white/80 mb-2">Foco Principal do Texto</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {textHierarchyOptions.map(opt => <button key={opt.id} onClick={() => handleFormChange('textHierarchy', opt.id)} className={`py-2 px-2 rounded-md text-xs text-center font-semibold capitalize transition ${formData.textHierarchy === opt.id ? 'active' : ''}`}>{opt.label}</button>)}
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
                
                 <CollapsibleSection title="6. Prompt Final (Revisão)">
                     <div className="relative">
                         <div className="flex justify-between items-center mb-2">
                            <label htmlFor="prompt" className="block text-sm font-medium text-white/80">Prompt de Comando para IA</label>
                            <button onClick={() => setIsPromptModalOpen(true)} className="text-xs font-semibold text-[#7D4FFF] hover:text-white">
                                Biblioteca
                            </button>
                        </div>
                        <textarea
                            id="prompt" rows={6} value={formData.creativePrompt}
                            onChange={handlePromptChange}
                            className="w-full bg-white/5 p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-[#7D4FFF]"
                        />
                         <div className="absolute top-8 right-2 flex flex-col gap-2">
                            <button onClick={handleAIAssist} disabled={isAIAssisting} className="text-white/70 hover:text-[#7D4FFF] disabled:opacity-50" title="Refinar com IA">
                                {isAIAssisting ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <SparklesIcon className="w-6 h-6" />}
                            </button>
                             <button onClick={handleResetPrompt} className="text-white/70 hover:text-white" title="Resetar para o prompt automático">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-white/50 mt-2">Este prompt é gerado a partir de suas escolhas. Edite-o para refinar o resultado. Resetar irá restaurar o prompt automático.</p>
                </CollapsibleSection>
                <div className="mt-auto pt-6">
                    <button onClick={handleGenerateFlyer} disabled={isLoading} className="w-full bg-[#7D4FFF] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-[#6b3fef] transition-colors disabled:bg-gray-500">
                        {isLoading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : 'Gerar Arte'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </div>
            </div>
            <div className="lg:col-span-2 bg-[#1E1F22] p-6 rounded-lg flex items-center justify-center">
                <DisplayArea
                    mediaType={displayMediaType}
                    mediaUrl={generatedMediaUrl}
                    isLoading={isLoading}
                    prompt="Gerando sua arte..."
                    onAnimate={handleAnimate}
                    onExpand={handleExpand}
                    isSecondaryLoading={isSecondaryLoading}
                    isAnimationDisabled={formData.aspectRatio === '1:1'}
                />
            </div>
        </div>
    );
};

export default FlyerCreator;