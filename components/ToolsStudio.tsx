// components/ToolsStudio.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ImageFile, ImagenAspectRatio, ToolMode, ExtractedStyleProfile } from '../types';
import { 
    generateImageWithImagen, 
    editImageWithFlash, 
    analyzeImageForTraining, 
    inpaintImage, 
    resizeImageWithAI,
    generateMotionPromptForResizedScene,
    generateVideo,
    copyPose,
    extractStyleAndPose,
} from '../services/geminiService';
import { ApiKeyError } from '../services/errors';
import ImageInput from './ImageInput';
import ReferenceUploader from './ReferenceUploader';
import InpaintingCanvas, { InpaintingCanvasRef } from './InpaintingCanvas';
import DisplayArea from './DisplayArea';
import { VideoIcon, SparklesIcon, BodyScanIcon } from './icons';
import { VideoFormData } from '../types';

interface UpscaleBenchmark {
    id: string;
    name: string;
    description: string;
    prompt: string;
}

const aspectRatioOptions: { id: ImagenAspectRatio, label: string }[] = [
    { id: '1:1', label: '1:1 (Quadrado)' },
    { id: '9:16', label: '9:16 (Vertical)' },
    { id: '16:9', label: '16:9 (Horizontal)' },
    { id: '4:3', label: '4:3 (Retrato)' },
    { id: '3:4', label: '3:4 (Paisagem)' },
];

const toolOptions: { id: ToolMode, label: string, icon?: React.FC<any> }[] = [
    { id: 'generate', label: 'Gerar Imagem' },
    { id: 'upscale', label: 'Upscale 4K' },
    { id: 'edit', label: 'Editar com IA' },
    { id: 'inpaint', label: 'Remover Objeto' },
    { id: 'resize', label: 'Expandir Imagem' },
    { id: 'analyze', label: 'Analisar (Treino)' },
    { id: 'copy_pose', label: 'Copiar Pose' },
    { id: 'extract_style', label: 'Analisador de Estilo', icon: BodyScanIcon },
];

interface ToolsStudioProps {
    apiKeyReady: boolean;
    onSelectKey: () => Promise<void>;
}

const ToolsStudio: React.FC<ToolsStudioProps> = ({ apiKeyReady, onSelectKey }) => {
    const [mode, setMode] = useState<ToolMode>('generate');
    const [prompt, setPrompt] = useState<string>('Um robô segurando um skate vermelho, neon, cinematográfico.');
    const [baseImage, setBaseImage] = useState<ImageFile | null>(null);
    const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
    const [aspectRatio, setAspectRatio] = useState<ImagenAspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSecondaryLoading, setSecondaryLoading] = useState({ motion: false });
    const [error, setError] = useState<string | null>(null);
    const [resultMedia, setResultMedia] = useState<{ type: 'image' | 'text' | 'video', url: string, text?: string }>({ type: 'image', url: '', text: '' });
    const inpaintingCanvasRef = useRef<InpaintingCanvasRef>(null);

    const [poseJson, setPoseJson] = useState<string>('');
    const [upscaleBenchmarks, setUpscaleBenchmarks] = useState<UpscaleBenchmark[]>([]);
    const [selectedUpscaleStyle, setSelectedUpscaleStyle] = useState<string>('photographic');

     useEffect(() => {
        if (mode === 'upscale') {
            fetch('./data/upscale_benchmarks.json')
                .then(res => res.json())
                .then(data => {
                    setUpscaleBenchmarks(data.benchmarks);
                    if (data.benchmarks.length > 0) {
                        setSelectedUpscaleStyle(data.benchmarks[0].id);
                    }
                })
                .catch(err => console.error("Falha ao carregar benchmarks de upscale:", err));
        }
    }, [mode]);


    const handleRunTool = async () => {
        setIsLoading(true);
        setLoadingMessage('Iniciando processo...');
        setError(null);
        setResultMedia({ type: 'image', url: '', text: '' });
        try {
            let imageUrl: string | null = null;
            let textResult: string | null = null;

            switch (mode) {
                case 'generate':
                    setLoadingMessage('Gerando imagem com Imagen...');
                    imageUrl = await generateImageWithImagen(prompt, aspectRatio);
                    break;
                case 'edit':
                    if (!baseImage) throw new Error("Por favor, envie uma imagem base para editar.");
                    setLoadingMessage('Editando imagem com IA...');
                    imageUrl = await editImageWithFlash(baseImage, prompt, referenceImages);
                    break;
                case 'inpaint':
                    if (!baseImage || !inpaintingCanvasRef.current) throw new Error("Por favor, envie uma imagem e desenhe a máscara.");
                    setLoadingMessage('Removendo objeto da imagem...');
                    const maskImage = await inpaintingCanvasRef.current.getMaskAsImageFile();
                    if (!maskImage) throw new Error("Não foi possível gerar a máscara.");
                    imageUrl = await inpaintImage(baseImage, maskImage);
                    break;
                case 'resize':
                    if (!baseImage) throw new Error("Por favor, envie uma imagem base para expandir.");
                    setLoadingMessage('Expandindo imagem com IA...');
                    imageUrl = await resizeImageWithAI(baseImage, aspectRatio);
                    break;
                case 'analyze':
                    if (!baseImage) throw new Error("Por favor, envie uma imagem para analisar.");
                    setLoadingMessage('Analisando imagem para dados de treino...');
                    textResult = await analyzeImageForTraining(baseImage);
                    break;
                case 'extract_style':
                    if (!baseImage) throw new Error("Por favor, envie uma imagem para extrair o estilo.");
                    setLoadingMessage('Analisando pose e estilo da imagem...');
                    const profile: ExtractedStyleProfile = await extractStyleAndPose(baseImage);
                    textResult = `
## Análise de Estilo (IA) ##

**Pose:**
${profile.poseDescription}

**Iluminação:**
${profile.lightingDescription}

**Estilo e Composição:**
${profile.styleDescription}
${profile.compositionDescription}

---

### Prompt Gerado (Pronto para Uso) ###

${profile.generatedPrompt}
                    `;
                    break;
                case 'upscale':
                    if (!baseImage) throw new Error("Por favor, envie uma imagem para fazer o upscale.");
                    const benchmark = upscaleBenchmarks.find(b => b.id === selectedUpscaleStyle);
                    if (!benchmark) throw new Error("Estilo de upscale selecionado não encontrado.");
                    
                    setLoadingMessage(`Aplicando upscale 4K (${benchmark.name})...`);
                    imageUrl = await editImageWithFlash(baseImage, benchmark.prompt);
                    break;
                case 'copy_pose':
                    if (!baseImage) throw new Error("Por favor, envie uma imagem do artista.");
                    if (!poseJson) throw new Error("Por favor, cole o JSON da pose.");
                    setLoadingMessage('Recriando imagem com a nova pose...');
                    imageUrl = await copyPose(baseImage, poseJson);
                    break;
            }
            if (imageUrl) {
                setResultMedia({ type: 'image', url: imageUrl });
            }
            if (textResult) {
                setResultMedia({ type: 'text', url: '', text: textResult });
            }
        } catch (e: any) {
            setError(e.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleAnimateResult = useCallback(async () => {
        if (!resultMedia.url || resultMedia.type !== 'image') return;

        if (!apiKeyReady) {
            await onSelectKey();
            const hasKey = window.aistudio && await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                setError("É necessário selecionar uma chave de API para animar a imagem.");
                return;
            }
        }

        setSecondaryLoading({ motion: true });
        setError(null);

        try {
            const response = await fetch(resultMedia.url);
            const blob = await response.blob();
            const file = new File([blob], "generated_image.png", { type: blob.type });
            
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
            });
            
            const imageFile: ImageFile = {
                name: file.name,
                type: file.type,
                size: file.size,
                base64,
                preview: resultMedia.url
            };

            const motionPrompt = await generateMotionPromptForResizedScene(imageFile);

            // FIX: Conformed object to VideoFormData type by using motionEvents and masterFrame.
            const videoFormData: VideoFormData = {
                artistName: "Animated Scene",
                artistLogo: null,
                referencePhotos: [imageFile],
                finalScript: motionPrompt,
                masterFrame: null,
                motionEvents: [],
                cameraBehavior: 'Slow Dolly-In Realism',
                atmosphere: 'Amber Haze Drift',
                transition: 'Fog Pass Through',
                aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
                resolution: '1080p',
                useFaceLock: false,
                endFrame: null,
            };

            setLoadingMessage('Gerando vídeo animado...');
            const videoUrl = await generateVideo(videoFormData);
            
            setResultMedia({ type: 'video', url: videoUrl, text: '' });

        } catch (e: any) {
            if (e instanceof ApiKeyError) {
                setError('Chave de API inválida. Por favor, selecione outra no cabeçalho.');
            } else {
                setError(e.message || 'Falha ao animar a imagem.');
            }
        } finally {
            setSecondaryLoading({ motion: false });
        }
    }, [resultMedia, aspectRatio, apiKeyReady, onSelectKey]);

    const renderInputArea = () => {
        switch (mode) {
            case 'generate':
            case 'edit':
                return (
                    <>
                        {mode === 'edit' && (
                             <ImageInput 
                                label="Imagem Base para Edição"
                                image={baseImage}
                                onImageSelect={setBaseImage}
                            />
                        )}
                        <textarea
                            rows={4}
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full bg-white/5 p-3 rounded-md border border-white/20"
                            placeholder="Descreva o que você quer gerar ou editar..."
                        />
                        {mode === 'edit' && (
                            <ReferenceUploader 
                                label="Imagens de Referência de Estilo (Opcional)"
                                files={referenceImages}
                                onFilesChange={setReferenceImages}
                                maxFiles={3}
                            />
                        )}
                    </>
                );
            case 'inpaint':
                return (
                    <>
                        <ImageInput
                            label="Imagem para Remover Objeto"
                            image={baseImage}
                            onImageSelect={(img) => {
                                setBaseImage(img);
                                if (inpaintingCanvasRef.current) inpaintingCanvasRef.current.clearMask();
                            }}
                        />
                        {baseImage && <InpaintingCanvas ref={inpaintingCanvasRef} image={baseImage} />}
                    </>
                );
            case 'resize':
            case 'analyze':
            case 'extract_style':
                 return (
                    <ImageInput 
                        label={
                            mode === 'resize' ? "Imagem para Expandir" :
                            mode === 'analyze' ? "Imagem para Analisar" :
                            "Imagem para Extrair Estilo"
                        }
                        image={baseImage}
                        onImageSelect={setBaseImage}
                    />
                );
            case 'upscale':
                 return (
                    <>
                        <ImageInput 
                            label="Imagem para Upscale 4K"
                            image={baseImage}
                            onImageSelect={setBaseImage}
                        />
                        {baseImage && upscaleBenchmarks.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-white/80 mb-2">Estilo de Aprimoramento</h3>
                                <div className="space-y-2">
                                    {upscaleBenchmarks.map(b => (
                                         <button key={b.id} onClick={() => setSelectedUpscaleStyle(b.id)}
                                            className={`w-full text-left p-3 rounded-md transition-all border-2 ${selectedUpscaleStyle === b.id ? 'bg-[#7D4FFF]/20 border-[#7D4FFF]' : 'bg-white/5 border-transparent hover:border-white/20'}`}>
                                            <p className="font-semibold text-sm">{b.name}</p>
                                            <p className="text-xs text-white/60">{b.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                );
            case 'copy_pose':
                return (
                    <>
                        <ImageInput 
                            label="Imagem do Artista"
                            image={baseImage}
                            onImageSelect={setBaseImage}
                        />
                        <textarea
                            rows={8}
                            value={poseJson}
                            onChange={e => setPoseJson(e.target.value)}
                            className="w-full bg-white/5 p-3 rounded-md border border-white/20"
                            placeholder="Cole aqui o JSON da pose gerado pela ferramenta 'Analisar'..."
                        />
                    </>
                );
            default:
                return null;
        }
    };
    
    const canAnimate = resultMedia.type === 'image' && resultMedia.url && (mode === 'resize' || mode === 'generate' || mode === 'edit');

    return (
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-1 bg-[#1E1F22] p-6 rounded-lg flex flex-col gap-8 overflow-y-auto">
                <section>
                    <h2 className="text-lg font-bold border-b border-white/10 pb-2 mb-4">1. Ferramenta</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {toolOptions.map(opt => {
                             const Icon = opt.icon;
                             return (
                                <button key={opt.id} onClick={() => setMode(opt.id)}
                                    className={`py-2 px-2 rounded-md text-sm font-semibold transition flex items-center justify-center gap-2 ${mode === opt.id ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {opt.label}
                                </button>
                             );
                        })}
                    </div>
                </section>
                <section>
                    <h2 className="text-lg font-bold border-b border-white/10 pb-2 mb-4">2. Configurações</h2>
                    <div className="space-y-4">
                        {renderInputArea()}
                        {(mode === 'generate' || mode === 'resize') && (
                             <div>
                                <h3 className="text-sm font-medium text-white/80 mb-2">Proporção</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {aspectRatioOptions.map(opt => (
                                        <button key={opt.id} onClick={() => setAspectRatio(opt.id)} className={`py-2 px-2 rounded-md text-xs font-semibold capitalize transition ${aspectRatio === opt.id ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}>{opt.label}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                <div className="mt-auto pt-6">
                    <button onClick={handleRunTool} disabled={isLoading} className="w-full bg-[#7D4FFF] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:bg-[#6b3fef] transition-colors disabled:bg-gray-500">
                         {isLoading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : 'Executar Ferramenta'}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                </div>
            </div>
             <div className="lg:col-span-2 bg-[#1E1F22] p-6 rounded-lg flex items-center justify-center">
                <DisplayArea
                    mediaType={resultMedia.type}
                    mediaUrl={resultMedia.url}
                    textContent={resultMedia.text}
                    isLoading={isLoading}
                    prompt={loadingMessage}
                    onAnimate={canAnimate ? handleAnimateResult : undefined}
                    isSecondaryLoading={{ animate: isSecondaryLoading.motion, expand: false }}
                    isAnimationDisabled={!canAnimate}
                />
            </div>
        </div>
    );
};

export default ToolsStudio;