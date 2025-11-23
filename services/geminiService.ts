// services/geminiService.ts

import { GoogleGenAI, Modality, Part } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { 
    VideoFormData, ImageFile, ImagenAspectRatio, TelaoCompositorFormData,
    AudioFile, MotionDesignerFormData, VisualizerEngineFormData,
    BusinessProfile, FormData, CreativeDNA, TelaoFormData, ExtractedStyleProfile,
    VibePreset, SequencedShot, CinemaGenre, LoopSceneType, DecupagemFormData, DecupagemScene, DecupagemShot, DecoupageEngineOutput,
    SibOutput
} from '../types';
import { ApiKeyError, GenerationError, SafetyError, NetworkError } from './errors';
import DRC_V1_0 from '../data/DRC_V1_0';
import { VFX_SUPERVISOR_SYSTEM_PROMPT } from '../data/VFX_Explosions_v1';
import { TRAP_STYLE_GUIDE } from '../data/TrapStyleGuide_v1';
import { bRollLibrary } from "../data/b_roll_library";
import { ammarStylePreset, trapGritUrbanoPreset, funkPeriferiaSpRawPreset } from '../data/cinema_style_library';
import { textureLibrary } from '../data/texture_library';
import { environmentLibrary } from '../data/environment_library';
import { narrativeLibrary } from '../data/narrative_library';
import actorBehaviorLibrary from '../data/actor_behavior_library';
import CME_V1_0 from '../data/CME_V1_0';
import RSSE_V1_0 from '../data/RSSE_V1_0';
import CLAFE_V1_0 from '../data/CLAFE_V1_0';
import CIME_V1_0 from '../data/CIME_V1_0';
import WardrobeEngine_V1_0 from '../data/WardrobeEngine_V1_0';
import ImageScience_4K_V1_0 from '../data/ImageScience_4K_V1_0';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_IMAGE_URL = 'https://storage.googleapis.com/maker-studio-project-media-prod/media/CREATIVE/2024-05-21/Projects/c7e29c0a-313d-4e92-9118-971c6d3a8174/generations/1716315570077-0.png';
const MOCK_VIDEO_URL = 'https://storage.googleapis.com/maker-studio-project-media-prod/media/VIDEO/2024-05-21/Projects/4d7a4b88-1a55-464a-a71d-e070d65b1c55/generations/1716327337_0.mp4';


// --- Actual Service Implementations ---
// This helper function needs to be available for multiple services
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


export const editImageWithFlash = async (baseImage: ImageFile | undefined, prompt: string, referenceImages: ImageFile[] = []): Promise<string> => {
    console.log("Editing image with Flash:", { prompt, baseImage, referenceImages: referenceImages.map(r => r.name) });
    const ai = getAi();
    const parts: Part[] = [];

    // The first image is the primary base for editing
    if (baseImage) {
        parts.push({ inlineData: { data: baseImage.base64, mimeType: baseImage.type } });
    }
    
    // All other images are context/references
    referenceImages.forEach(img => {
        parts.push({ inlineData: { data: img.base64, mimeType: img.type } });
    });
    
    // The prompt is the last part
    parts.push({ text: prompt });


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: { responseModalities: [Modality.IMAGE] },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new GenerationError("A API não retornou uma imagem editada.");

    } catch(e: any) {
        console.error(e);
        if (e.finishReason === 'SAFETY') throw new SafetyError();
        throw new GenerationError(e.message);
    }
};

const extractSection = (script: string, regex: RegExp): string => {
    const match = script.match(regex);
    return match ? match[1].trim() : '';
};

export const parseScriptToScenes = (script: string): DecupagemScene[] => {
    if (!script || !script.trim()) return [];

    const sceneBlocks = script.split(/CENA \d+: /);
    const scenes: DecupagemScene[] = [];
    
    const globalProjectBlock = sceneBlocks.shift() || ''; // The part before the first CENA

    sceneBlocks.forEach((block, index) => {
        const sceneNumber = index + 1;
        const lines = block.trim().split('\n');
        const titleLine = lines.shift() || '';
        const title = titleLine.match(/“([^”]+)”/)?.[1] || `CENA ${sceneNumber}`;

        const getMeta = (key: string, content: string) => content.match(new RegExp(`${key}:\\s*(.+)`, 'i'))?.[1].trim() || 'N/A';
        
        const sceneContent = lines.join('\n');
        
        const location = getMeta('INT.|EXT.', titleLine) || getMeta('AMBIENTE', sceneContent);
        const emotion = getMeta('EMOÇÃO-CHAVE', sceneContent);
        const lighting = getMeta('ILUMINAÇÃO', sceneContent);
        const textures = getMeta('TEXTURAS', sceneContent);
        const props = getMeta('OBJETOS', sceneContent);

        const shotBlocks = sceneContent.split(/\[CENA \d+ \/ PLANO \d+\.\d+\]/);
        shotBlocks.shift(); // Remove content before the first PLANO

        const shots: DecupagemShot[] = shotBlocks.map((shotBlock, shotIndex) => {
            const planNumber = `${sceneNumber}.${shotIndex + 1}`;
            const shotLines = shotBlock.trim().split('\n');
            const metadataLine = shotLines.shift() || '';
            const action = shotLines.map(l => l.replace(/^AÇÃO: /i, '').trim()).join('\n');
            
            return {
                id: uuidv4(),
                plan: `PLANO ${planNumber}`,
                action: action,
                duration: metadataLine.match(/\((.*?)\)/)?.[1] || undefined,
                lens: metadataLine.match(/Lente (\d+mm)/i)?.[1] || undefined,
                fullDescription: `[CENA ${sceneNumber} / PLANO ${planNumber}] ${metadataLine}\nAÇÃO: ${action}`,
                isLoading: false,
                isGeneratingVeoPrompt: false,
            };
        });
        
        if (shots.length > 0) {
            scenes.push({
                id: uuidv4(),
                sceneNumber,
                title,
                location,
                emotion,
                lighting,
                textures,
                props,
                shots,
            });
        }
    });

    return scenes;
};

// --- PHASE 3: NEW SIB (SEMANTIC INTENT BUILDER) FUNCTION ---

function parseSibResponse(responseText: string): SibOutput {
    const intentJsonMatch = responseText.match(/BLOCO 1 — INTENT JSON\s*={10,}\s*([\s\S]*?)\s*={10,}\s*BLOCO 2 — GUIA SEMÂNTICO/s);
    const guiaSemanticoMatch = responseText.match(/BLOCO 2 — GUIA SEMÂNTICO\s*={10,}\s*([\s\S]*?)\s*={10,}\s*BLOCO 3 — CENAS PREPARADAS/s);
    const cenasPreparadasMatch = responseText.match(/BLOCO 3 — CENAS PREPARADAS\s*={10,}\s*([\s\S]*)/s); // Goes to the end

    let intentJsonStr = "{}";
    let guiaSemantico = "";
    let cenasPreparadas = "";

    if (intentJsonMatch && guiaSemanticoMatch && cenasPreparadasMatch) {
        intentJsonStr = intentJsonMatch[1].replace(/```json/g, '').replace(/```/g, '').trim();
        guiaSemantico = guiaSemanticoMatch[1].trim();
        cenasPreparadas = cenasPreparadasMatch[1].replace(/={10,}[\s\S]*/s, '').trim();
    } else {
        throw new GenerationError("A resposta do SIB está mal formatada. Não foi possível extrair os 3 blocos.");
    }
    
    try {
        return {
            intentJson: JSON.parse(intentJsonStr),
            guiaSemantico: guiaSemantico,
            cenasPreparadas: cenasPreparadas,
        };
    } catch (e) {
        console.error("Failed to parse SIB Intent JSON:", e, "JSON string:", intentJsonStr);
        throw new GenerationError("O JSON de Intenção do SIB é inválido.");
    }
}


export const runSIB = async (idea: string, audio: AudioFile | null): Promise<SibOutput> => {
    const superPrompt = `
Você é o SIB — Semantic Intent Builder, um roteirista de IA de elite.

Sua função é interpretar QUALQUER briefing, que pode ser um texto, um áudio, ou ambos, e transformá-lo em um roteiro técnico para um videoclipe ou cena de cinema.
- Se um áudio for fornecido, TRATE-O COMO A FONTE PRINCIPAL DE INSPIRAÇÃO. Interprete sua energia, ritmo e mood.
- O texto serve como contexto adicional.

Transforme o briefing em TRÊS blocos principais, sempre com a mesma estrutura e marcadores:

===============================
BLOCO 1 — INTENT JSON
===============================
\`\`\`json
{
  "num_cenas": "number (entre 2 e 4)",
  "estilo": "string",
  "texturas": ["string", "string"],
  "ambiente": "string",
  "iluminacao": "string",
  "narrativa": "string",
  "ritmo_camera": "string",
  "detalhes_ator": {
    "expressao": "string",
    "gestos": "string",
    "olhar": "string"
  },
  "elementos_cenicos": ["string", "string"]
}
\`\`\`
===============================
BLOCO 2 — GUIA SEMÂNTICO
===============================
Texto natural, cinematográfico, explicando:
— a intenção criativa, a estética, o ambiente, o clima, o mood emocional, o ritmo da câmera, o tipo de narrativa, a atmosfera, o comportamento do ator e como amarrar tudo isso numa linguagem visual consistente.

===============================
BLOCO 3 — CENAS PREPARADAS
===============================
[INSTRUÇÃO CRÍTICA DE FORMATAÇÃO]
Para cada cena, você DEVE criar de 2 a 3 planos (shots). Cada CENA deve começar com "CENA X:". Cada PLANO DEVE seguir o formato exato: "[CENA X / PLANO X.Y] (DURAÇÃO) Lente XXmm" seguido por uma linha "AÇÃO:". Este formato é obrigatório para o sistema funcionar.

[EXEMPLO DE FORMATAÇÃO OBRIGATÓRIA]
CENA 1: “O DESPERTAR NA CIDADE”
INT. APARTAMENTO MINIMALISTA - MANHÃ
EMOÇÃO-CHAVE: Solidão contemplativa
ILUMINAÇÃO: Luz suave de janela, poeira visível no ar
TEXTURAS: Concreto, linho, pele
OBJETOS: Xícara de café, livro, janela grande

[CENA 1 / PLANO 1.1] (8 segundos) Lente 35mm
AÇÃO: Close-up de uma xícara de café sobre uma mesa de madeira. A mão do personagem entra em quadro e a segura delicadamente.

[CENA 1 / PLANO 1.2] (8 segundos) Lente 50mm
AÇÃO: Plano médio do personagem bebendo o café, olhando pela janela com uma expressão pensativa.

CENA 2: “A CAMINHADA”
EXT. RUA MOVIMENTADA - MANHÃ
... (e assim por diante)
===============================

REGRAS DO SIB
===============================
1. Sempre entregar exatamente os 3 blocos com os marcadores.
2. O BLOCO 1 DEVE ser um JSON válido.
3. O BLOCO 3 DEVE seguir a formatação de CENA e PLANO exatamente como no exemplo. É crucial para a próxima etapa da pipeline.

---
[BRIEFING DO USUÁRIO EM TEXTO]
${idea}
---
`;
    const ai = getAi();
    
    const parts: Part[] = [{ text: superPrompt }];
    if (audio) {
        parts.push({
            inlineData: {
                mimeType: audio.type,
                data: audio.base64,
            },
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts },
    });
    const resultText = response.text;
    
    return parseSibResponse(resultText);
};


// --- PHASE 1: NEW DECOUPAGE ENGINE FUNCTIONS ---

function parseDecoupageEngineResponse(responseText: string): DecoupageEngineOutput {
    const technicalDecupageMatch = responseText.match(/Decupagem técnica da cena([\s\S]*?)Frames detalhados/s);
    const framesDetailedMatch = responseText.match(/Frames detalhados([\s\S]*?)Super Prompt dos Frames/s);
    const superPromptMatch = responseText.match(/Super Prompt dos Frames([\s\S]*?)JSON Estrutural Final/s);
    const jsonMatch = responseText.match(/JSON Estrutural Final([\s\S]*)/s);

    if (!technicalDecupageMatch || !framesDetailedMatch || !superPromptMatch || !jsonMatch) {
        throw new GenerationError("A resposta do Decoupage Engine está mal formatada. Não foi possível extrair todas as seções.");
    }

    const frameDescriptionsText = framesDetailedMatch[1];
    const frame1Match = frameDescriptionsText.match(/FRAME 1:([\s\S]*?)FRAME 2:/s);
    const frame2Match = frameDescriptionsText.match(/FRAME 2:([\s\S]*?)FRAME 3:/s);
    const frame3Match = frameDescriptionsText.match(/FRAME 3:([\s\S]*)/s);

    if (!frame1Match || !frame2Match || !frame3Match) {
         throw new GenerationError("Não foi possível extrair as 3 descrições de frames da resposta.");
    }
    
    const jsonString = jsonMatch[1].replace(/```json/g, '').replace(/```/g, '').trim();

     try {
        return {
            technicalDecupage: technicalDecupageMatch[1].trim(),
            frameDescriptions: {
                frame_1: frame1Match[1].trim(),
                frame_2: frame2Match[1].trim(),
                frame_3: frame3Match[1].trim(),
            },
            framesSuperPrompt: superPromptMatch[1].trim(),
            structuralJson: JSON.parse(jsonString),
        };
    } catch (e) {
        console.error("Failed to parse Decoupage Engine JSON:", e, "JSON string:", jsonString);
        throw new GenerationError("O JSON Estrutural do Decoupage Engine é inválido.");
    }
}


export const runDecoupageEngine = async (
    formData: DecupagemFormData,
    scene: Omit<DecupagemScene, 'shots'>,
    shot: DecupagemShot,
    fullScript: string,
    sibOutput: SibOutput | null
): Promise<DecoupageEngineOutput> => {
    
    let intentJson: any;
    let guiaSemantico: string;
    const cenaPreparada = shot.fullDescription;

    const structuredPresets = {
        editorial_ammar_clean: ammarStylePreset,
        trap_contemporaneo_grit: trapGritUrbanoPreset,
        funk_periferia_sp_raw: funkPeriferiaSpRawPreset,
    };
    
    const selectedPresetId = formData.aestheticPreset as keyof typeof structuredPresets;

    if (sibOutput && sibOutput.intentJson) {
        // Use the direct output from SIB if it exists
        intentJson = sibOutput.intentJson;
        guiaSemantico = sibOutput.guiaSemantico;
    } else if (structuredPresets[selectedPresetId]) {
        // Use the selected structured preset
        const preset = structuredPresets[selectedPresetId];
        intentJson = {
          "estilo": preset.nome,
          "texturas": Object.values(preset.texture_profile),
          "ambiente": preset.environment_profile.locacoes_tipicas.join(', '),
          "iluminacao": preset.lighting_profile.tipo_geral,
          "narrativa": preset.logline,
          "detalhes_ator": preset.acting_blocking_profile,
          "elementos_cenicos": preset.environment_profile.objetos_recorrentes
        };
        guiaSemantico = `GERAR SEGUINDO O PERFIL TÉCNICO-NARRATIVO "${preset.nome}":\n- Logline: ${preset.logline}\n- Câmera: ${preset.camera_profile.movimentos_base.join(', ')}\n- Iluminação: ${preset.lighting_profile.tipo_geral}\n- Cor: ${preset.color_profile.paleta_base.join(', ')}`;
    } else {
        // Fallback to simulating SIB output from form data
        intentJson = {
          "estilo": formData.aestheticPreset,
          "texturas": scene.textures.split(',').map(t => t.trim()),
          "ambiente": scene.location,
          "iluminacao": scene.lighting,
          "narrativa": scene.title,
          "detalhes_ator": { "expressao": scene.emotion },
          "elementos_cenicos": scene.props.split(',').map(p => p.trim())
        };
        guiaSemantico = `A intenção criativa para esta cena é capturar a emoção de "${scene.emotion}" dentro do ambiente "${scene.location}". O estilo visual geral deve ser "${formData.aestheticPreset}", com uma iluminação focada em "${scene.lighting}" e a aplicação de texturas como "${scene.textures}".`;
    }
    
    const sibInputForPrompt = `
[INPUTS DO SIB PARA ESTE PLANO]
===============================
BLOCO 1 — INTENT JSON
===============================
${JSON.stringify(intentJson, null, 2)}
===============================
BLOCO 2 — GUIA SEMÂNTICO
===============================
${guiaSemantico}
===============================
BLOCO 3 — CENAS PREPARADAS
===============================
${cenaPreparada}
`;

    const useFunkBroll = ['trap_contemporaneo_grit', 'funk_periferia_sp_raw'].includes(formData.aestheticPreset);
    const trapBRollCategory = bRollLibrary.find(cat => cat.title.includes("FUNK BR"));
    const trapBRollScenarios = trapBRollCategory ? trapBRollCategory.scenarios.map(s => `- ${s.description}`).join('\n') : '';
    const bRollContext = useFunkBroll ? `
---
[BIBLIOTECA DE REFERÊNCIA B-ROLL (TRAP/FUNK)]
Para enriquecer a cena, consulte a seguinte biblioteca de B-Rolls de estilo TRAP/FUNK para inspiração de detalhes e objetos de cena. NÃO copie as cenas, use-as como INSPIRAÇÃO para adicionar autenticidade.
${trapBRollScenarios}
---
` : '';

    const narrativeLibraryContext = `
---
[BIBLIOTECA 7: NARRATIVA VISUAL (OBRIGATÓRIO - CAMADA MESTRA)]
Você TEM ACESSO a uma biblioteca de narrativas. Esta é a camada mais importante. PRIMEIRO, escolha o arquétipo narrativo que melhor se encaixa no roteiro (ex: [id: ascensao_urbana_introspectiva]). A narrativa escolhida DEVE guiar TODAS as outras decisões. A progressão emocional dos 3 frames (continuidade_entre_frames) é uma regra inquebrável.
\`\`\`json
${JSON.stringify(narrativeLibrary, null, 2)}
\`\`\`
---
`;

    const actorBehaviorLibraryContext = `
---
[BIBLIOTECA 8: Cinematic Performance Engine (OBRIGATÓRIO)]
Após a narrativa, você DEVE usar esta biblioteca para traduzir a intenção emocional em performance física. Descreva a postura, olhar e microgestos do ator, seguindo as 10 Leis da Fisicalidade Realista.
\`\`\`
${actorBehaviorLibrary}
\`\`\`
---
`;

    const cmeContext = `
---
[BIBLIOTECA 10: Cinematic Motion Engine (CME_V1_0) - AUTORIDADE MÁXIMA EM CÂMERA]
Esta é sua bíblia de cinematografia. TODAS as decisões de câmera (linguagem, lente, movimento, composição) DEVEM ser guiadas pelo CME. Siga a progressão de 3 frames (Observar -> Conectar -> Dominar).
\`\`\`
${CME_V1_0}
\`\`\`
---
`;

    const clafeContext = `
---
[BIBLIOTECA 11: Cinematic Light & Atmos FX Engine (CLAFE_V1_0) - AUTORIDADE MÁXIMA EM LUZ]
Esta é a sua bíblia de iluminação e atmosfera, substituindo qualquer biblioteca de luz anterior. TODAS as decisões de luz (key, fill, rim, volumetria, haze) DEVEM ser guiadas pelo CLAFE. Pense como um gaffer e um diretor de fotografia.
\`\`\`
${CLAFE_V1_0}
\`\`\`
---
`;

    const cimeContext = `
---
[BIBLIOTECA 12: Cinematic Internal Motion Engine (CIME_V1_0) - OBRIGATÓRIO]
Esta é a sua bíblia de física e movimento interno. Após definir todos os elementos estáticos da cena, você DEVE usar o CIME para adicionar vida. Descreva o vento, o movimento de partículas, a respiração do ator e como o ambiente reage à narrativa. Isso é o que transforma uma imagem em uma cena viva.
\`\`\`
${CIME_V1_0}
\`\`\`
---
`;

    const wardrobeEngineContext = `
---
[BIBLIOTECA 13: FIGURINO & ESTÉTICA VISUAL (WARDROBE ENGINE) - OBRIGATÓRIO]
Esta é a sua bíblia de figurino. TODAS as decisões sobre roupas, acessórios e materiais do personagem DEVEM ser guiadas pelo Wardrobe Engine. O figurino é um elemento narrativo e deve interagir com a luz, o ambiente e o movimento de forma realista.
\`\`\`
${WardrobeEngine_V1_0}
\`\`\`
---
`;

    const environmentLibraryContext = `
---
[BIBLIOTECA 5: AMBIENTES CINEMATOGRÁFICOS (OBRIGATÓRIO)]
Após escolher a narrativa, selecione o ambiente da biblioteca que melhor serve a essa narrativa. Use os parâmetros do ambiente (camadas, iluminação motivada) como base para a decupagem. Referencie o ambiente pelo 'id'.
\`\`\`json
${JSON.stringify(environmentLibrary, null, 2)}
\`\`\`
---
`;

    const textureLibraryContext = `
---
[BIBLIOTECA 3: TEXTURAS CINEMATOGRÁFICAS (OBRIGATÓRIO)]
Use os presets desta biblioteca para descrever as texturas, alinhadas com a narrativa, ambiente e luz. Referencie-os pelo 'id'.
\`\`\`json
${JSON.stringify(textureLibrary, null, 2)}
\`\`\`
---
`;

    const rsseContext = `
---
[BIBLIOTECA 9: Real Surface Simulation Engine (RSSE_V1_0) - OBRIGATÓRIO]
Além de usar os presets de textura, você DEVE seguir as regras do RSSE_V1_0 para descrever os materiais e superfícies com realismo físico. Pense como um artista de 3D PBR.
- Use os parâmetros (roughness, specular, microdetail) como base para suas descrições.
- Descreva como a luz interage com cada material.
- Evite os "Erros Proibidos de Textura".
- O objetivo é hiper-realismo, não uma imagem "bonita" mas sim uma imagem "real".
\`\`\`
${RSSE_V1_0}
\`\`\`
---
`;

    const imageScienceContext = `
---
[BIBLIOTECA 14: A CIÊNCIA DA IMAGEM 4K (OBRIGATÓRIO)]
Esta é a sua bíblia de qualidade de imagem. TODAS as suas descrições devem visar uma qualidade 4K cinematográfica real, não apenas alta resolução. Foque em pureza de pixel, nitidez óptica suave, microcontraste e gradientes sem banding. Evite a todo custo a aparência de "plástico" ou "sharpening" artificial.
\`\`\`
${ImageScience_4K_V1_0}
\`\`\`
---
`;

    const superPrompt = `
Você é o Decoupage Engine, um diretor de cinema de IA. Sua função é transformar os inputs do SIB em uma decupagem técnica completa para UM ÚNICO PLANO, usando as bibliotecas de conhecimento fornecidas.

===============================
ETAPAS DE EXECUÇÃO (HIERARQUIA DE DIREÇÃO OBRIGATÓRIA)
===============================
1.  **Leitura e Interpretação:** Leia os 3 blocos de input do SIB e TODAS as bibliotecas de conhecimento.
2.  **Direção de Narrativa (MAIS IMPORTANTE):** Com base no roteiro, selecione UM preset da [BIBLIOTECA 7: NARRATIVA VISUAL]. Esta escolha é a CAMADA MESTRA que guiará todo o resto.
3.  **Direção de Ator:** Guiado pela narrativa, use a [BIBLIOTECA 8: CINEMATIC PERFORMANCE ENGINE] para traduzir a emoção em performance física (postura, olhar, gestos).
4.  **Direção de Fotografia (Câmera, Luz, Atmosfera):**
    - Para enquadrar a performance, use a [BIBLIOTECA 10: CINEMATIC MOTION ENGINE] para definir a linguagem da câmera, lente e movimento.
    - Para iluminar a cena, use a [BIBLIOTECA 11: CLAFE_V1_0] para definir o setup de luz (key, fill, rim) e a atmosfera (haze, volumetria).
5.  **Design de Produção (Figurino, Ambiente, Textura, Materiais, Qualidade 4K):**
    - Primeiro, defina o **Figurino** usando o [BIBLIOTECA 13: WARDROBE ENGINE].
    - Depois, selecione os presets das bibliotecas de **Ambiente** e **Textura**.
    - Use o [RSSE_V1_0] para detalhar os materiais de tudo (figurino e ambiente).
    - Aplique os princípios da [BIBLIOTECA 14: CIÊNCIA DA IMAGEM 4K] para garantir que todas as descrições visem o realismo cinematográfico.
6.  **Simulação de Movimento Interno (CIME):** Com todos os elementos definidos, use a [BIBLIOTECA 12: CIME_V1_0] para descrever a física sutil da cena.
7.  **Decupagem e Geração:** Com base na hierarquia acima, gere a decupagem técnica, as descrições dos 3 frames, o super prompt e o JSON final.

===============================
FORMATO DE SAÍDA OBRIGATÓRIO
===============================
Sempre entregue sua resposta na seguinte ordem e formato, usando os marcadores exatos:
1. Decupagem técnica da cena
[CONTEÚDO DA DECUPAGEM TÉCNICA, DETALHANDO AS ESCOLHAS DE CADA BIBLIOTECA]
2. Frames detalhados
FRAME 1: [DESCRIÇÃO DO FRAME 1 DETALHANDO ATOR E CÂMERA]
FRAME 2: [DESCRIÇÃO DO FRAME 2 DETALHANDO ATOR E CÂMERA]
FRAME 3: [DESCRIÇÃO DO FRAME 3 DETALHANDO ATOR E CÂMERA]
3. Super Prompt dos Frames
[CONTEÚDO DO SUPER PROMPT]
4. JSON Estrutural Final
\`\`\`json
{
  "scene_number": ${scene.sceneNumber},
  "plan_number": "${shot.plan.replace('PLANO ', '')}",
  "duration": 8,
  "style": "${intentJson.estilo}",
  "qualidade_4k_real": {
    "pixel_purity": "alta",
    "micro_texturas": "coerentes_fisicamente",
    "nitidez": "optica_suave",
    "contraste": "microcontraste_verdadeiro",
    "profundidade": "lente_real",
    "gradiente": "suave_sem_banding",
    "cores": "cinematograficas",
    "compressao": "minima",
    "detalhe_fundo": "legivel_com_coerencia",
    "materialidade": "realista_por_fisica_optica",
    "artefatos": "zero",
    "overdetail": "proibido"
  },
  "narrative": { "id": "ID_DA_NARRATIVA_AQUI", "theme": "TEMA_CENTRAL_DA_NARRATIVA_AQUI" },
  "environment": { "id": "ID_DO_AMBIENTE_AQUI", "description": "${intentJson.ambiente}" },
  "lighting": { "description": "Descrição detalhada da luz e atmosfera, seguindo os princípios e modelos do CLAFE." },
  "textures": { "description": "Descrição das texturas usando IDs da biblioteca e regras do RSSE. Ex: Pele: [id: skin_microdetail_pores_01], Ambiente: [id: urban_asphalt_wet_neon]" },
  "wardrobe": { "description": "Descrição detalhada do figurino, incluindo camadas, materiais, movimento e interação com a luz, seguindo os princípios do Wardrobe Engine." },
  "actor_behavior": { "description": "Descrição detalhada do comportamento do ator, seguindo as 10 leis e a intenção emocional." },
  "camera_behavior": { "language": "LINGUAGEM_DA_CAMERA_AQUI", "description": "Descrição detalhada do movimento da câmera, lente e composição para cada fase (Observar, Conectar, Dominar), seguindo o CME." },
  "internal_motion": { "description": "Descrição detalhada do movimento interno da cena (vento, partículas, respiração do ator, movimento de tecidos e cabelo), seguindo os princípios do CIME." },
  "action": "Ação principal do plano: ${shot.action.replace(/\n/g, ' ')}",
  "frames": {
    "frame_1": { "description": "Descrição detalhada do frame 1 aqui..." },
    "frame_2": { "description": "Descrição detalhada do frame 2 aqui..." },
    "frame_3": { "description": "Descrição detalhada do frame 3 aqui..." }
  },
  "video_timeline": {
    "0_2": "Descrição da ação e câmera de 0 a 2 segundos...",
    "2_4": "Descrição da ação e câmera de 2 a 4 segundos...",
    "4_6": "Descrição da ação e câmera de 4 a 6 segundos...",
    "6_8": "Descrição da ação e câmera de 6 a 8 segundos..."
  }
}
\`\`\`
Nada além disso.
${bRollContext}
${narrativeLibraryContext}
${actorBehaviorLibraryContext}
${cmeContext}
${clafeContext}
${cimeContext}
${wardrobeEngineContext}
${environmentLibraryContext}
${textureLibraryContext}
${rsseContext}
${imageScienceContext}
${sibInputForPrompt}
`;

    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: superPrompt,
    });
    const resultText = response.text;
    
    return parseDecoupageEngineResponse(resultText);
};

export const generateSingleDecupagemFrame = async (
    frameDescription: string,
    formData: DecupagemFormData,
    scene: Omit<DecupagemScene, 'shots'>,
    shot: DecupagemShot,
    continuityFrames: ImageFile[],
    fullScript: string
): Promise<string> => {
    
    const continuityPrompt = continuityFrames.length > 0
        ? `\n\n[CONTEXTO DE CONTINUIDADE - FRAMES ANTERIORES (OBRIGATÓRIO)]\nVocê está gerando uma sequência. As imagens dos frames gerados anteriormente foram fornecidas como referência. Elas são a sua referência visual OBRIGATÓRIA para manter a continuidade. Analise o ÚLTIMO frame gerado (a última imagem de referência fornecida) para determinar o figurino, cabelo, cor dos olhos, tatuagens e cenário atuais. NÃO use as roupas das fotos de referência originais do ator. Mantenha a consistência com o frame imediatamente anterior.`
        : "\n\n[CONTEXTO DE CONTINUIDADE - FRAMES ANTERIORES (OBRIGATÓRIO)]\nNenhum. Este é o primeiro frame. Use as fotos de referência do personagem como sua única verdade para a aparência dele (rosto, cabelo, tatuagens) e a descrição do roteiro para o figurino.";

    const charactersBlock = fullScript.match(/PERSONAGENS & FIGURINO[\s\S]*?(?=CENA 1:)/s) || [''];
    
    const castDefinition = `
**[ELENCO (CASTING) - REGRA INQUEBRÁVEL]**
- **${formData.actor1Name || 'ATOR_1'} (Principal):** A aparência deste ator é definida pelo primeiro conjunto de fotos de referência.
- **${formData.actor2Name || 'ATOR_2'}:** A aparência deste ator é definida pelo segundo conjunto de fotos.
- **${formData.actor3Name || 'ATOR_3'}:** A aparência deste ator é definida pelo terceiro conjunto de fotos.
- **SUA TAREFA DE CASTING:** Identifique qual personagem está em cena. A falha em usar o ator correto é uma FALHA CRÍTICA.`;

    const trapStyleContext = ['trap_contemporaneo_grit', 'funk_periferia_sp_raw'].includes(formData.aestheticPreset) ? `\n**[MÓDULO DE ESTILO: TRAP/FUNK]**\n${TRAP_STYLE_GUIDE}\n` : '';
    const vfxContext = frameDescription.match(/explosão|fogo|fumaça/i) ? `\n**[MÓDULO DE EFEITOS ESPECIAIS]**\n${VFX_SUPERVISOR_SYSTEM_PROMPT}\n` : '';
    const rsseContextForFrameGen = `
**[MÓDULO DE TEXTURA AVANÇADA: RSSE_V1_0]**
Sua interpretação das texturas (ex: [id: skin_microdetail_pores_01]) DEVE ser guiada pelos princípios do RSSE_V1_0. Crie superfícies com microdetalhes, rugosidade correta e interação realista com a luz. Evite superfícies de plástico ou lisas demais.
${RSSE_V1_0}
`;
    const clafeContextForFrameGen = `
**[MÓDULO DE LUZ AVANÇADA: CLAFE_V1_0]**
Sua interpretação da iluminação DEVE ser guiada pelos princípios do CLAFE_V1_0. Crie luz volumétrica, sombras suaves, e modele o rosto e o ambiente com realismo cinematográfico.
${CLAFE_V1_0}
`;
    const wardrobeContextForFrameGen = `
**[MÓDULO DE FIGURINO: WARDROBE ENGINE]**
O figurino do personagem (roupas, acessórios) deve ser renderizado com física realista. Tecidos devem ter dobras, peso e textura corretos. Metais devem refletir a luz do ambiente. Siga as diretrizes do Wardrobe Engine para garantir a coerência e realismo do vestuário.
`;
    const imageScienceContextForFrameGen = `
**[MÓDULO DE QUALIDADE 4K: CIÊNCIA DA IMAGEM]**
Sua renderização final DEVE seguir os 12 pilares da imagem 4K real. Evite nitidez artificial ('sharpening'), texturas de plástico e 'overdetailing'. Foque em pureza de pixel, micro-contraste real e gradientes suaves. A imagem deve parecer ter sido capturada por uma lente de cinema, não gerada por computador.
`;
    
    const superPrompt = `
**[ROLE & GOAL - CRÍTICO]**
Você é um GERADOR DE IMAGEM de IA. Sua missão é criar um único frame de alta qualidade com base na descrição detalhada fornecida, mantendo a continuidade com os frames anteriores. As descrições usarão IDs de bibliotecas (ex: [id: key_hard_rembrandt]); sua tarefa é interpretar esses presets para criar a luz, as superfícies, a performance do ator e a composição cinematográficas corretas.

**[DIRETIVA DE QUADRO OBRIGATÓRIA]**
A proporção da imagem final DEVE ser exatamente ${formData.aspectRatio}. Esta é a regra mais importante. Use a foto de referência do ator como base e EXPANDA a composição para preencher o quadro (outpainting) na proporção correta.

**[DOCUMENTOS DE REFERÊNCIA OBRIGATÓRIOS]**
Você DEVE seguir os princípios do DRC_V1_0 para realismo cinematográfico e da CIÊNCIA DA IMAGEM 4K para qualidade de render.
${trapStyleContext}
${vfxContext}
${clafeContextForFrameGen}
${rsseContextForFrameGen}
${wardrobeContextForFrameGen}
${imageScienceContextForFrameGen}

**[ROTEIRO (CONTEXTO)]**
---
${charactersBlock[0]}
---
${castDefinition}
${continuityPrompt}

**[DESCRIÇÃO DETALHADA DO FRAME PARA GERAR]**
---
${frameDescription}
---

**[ORDEM DE EXECUÇÃO - PENSE PASSO A PASSO E OBEDEÇA]**
1.  **Identifique o Ator:** Determine qual personagem está em cena.
2.  **Face Lock:** Use as fotos de referência do ator CORRETO para fixar a aparência do rosto.
3.  **Continuidade:** Use os frames anteriores (se houver) para o figurino, cenário e cor dos olhos. Se for o primeiro frame, use o bloco de PERSONAGENS & FIGURINO.
4.  **Gere a Imagem:** Crie a imagem descrita, obedecendo a TODOS os contextos e com a proporção ${formData.aspectRatio}.
5.  **A consistência é a única métrica de sucesso.**
`;
    
    let baseImage: ImageFile | undefined = formData.actor1Photos[0];
    let allReferencePhotos: ImageFile[] = [...formData.actor1Photos.slice(1), ...formData.actor2Photos, ...formData.actor3Photos];
    
    const actionText = shot.action.toLowerCase();
    const actor2Name = formData.actor2Name.toLowerCase();
    const actor3Name = formData.actor3Name.toLowerCase();

    if (actor2Name && actionText.includes(actor2Name) && formData.actor2Photos.length > 0) {
        baseImage = formData.actor2Photos[0];
        allReferencePhotos = [...formData.actor2Photos.slice(1), ...formData.actor1Photos, ...formData.actor3Photos];
    } else if (actor3Name && actionText.includes(actor3Name) && formData.actor3Photos.length > 0) {
         baseImage = formData.actor3Photos[0];
         allReferencePhotos = [...formData.actor3Photos.slice(1), ...formData.actor1Photos, ...formData.actor2Photos];
    }

    if (!baseImage) throw new GenerationError(`A foto de referência para o ator principal da cena é obrigatória.`);
    
    const allReferences = [...allReferencePhotos, ...continuityFrames];
    
    return editImageWithFlash(baseImage, superPrompt, allReferences);
};


export const generateTextFromImage = async (prompt: string, image: ImageFile): Promise<string> => {
    const ai = getAi();
    const imagePart = {
        inlineData: {
            mimeType: image.type,
            data: image.base64,
        },
    };
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (e: any) {
        console.error(e);
        if (e.finishReason === 'SAFETY') throw new SafetyError();
        throw new GenerationError(e.message);
    }
};

export const runVideoEngine = async (
    decupagemShot: DecupagemShot,
    frameImages: ImageFile[],
    formData: DecupagemFormData
): Promise<string> => {
    
    const castingInstructions = `
**Casting & Location Instructions (CRITICAL):**
- **Face-Lock:** The video generation MUST use the provided reference images to maintain the facial and physical identity of the actors:
  - ${formData.actor1Name}: Use the first set of reference photos.
  - ${formData.actor2Name}: Use the second set of reference photos.
  - ${formData.actor3Name}: Use the third set of reference photos.
- **Location Lock:** If location photos were provided, maintain their architectural and atmospheric consistency.
- Failure to maintain character and location consistency is a CRITICAL FAILURE.
`;

    const superPrompt = `
You are the Video Engine for the system, an expert in generating prompts for Veo 3.
You receive the scene's Decoupage, 3 reference frames, and the scene's Structural JSON.

Your function is to transform this into a **final Super Prompt for Veo 3**, in ENGLISH.

===============================
ETAPA 1 — LEITURA E ANÁLISE
===============================
Analyze the following inputs:
1.  **Decupagem Técnica:** ${decupagemShot.technicalDecupage}
2.  **JSON Estrutural:** ${JSON.stringify(decupagemShot.structuralJson, null, 2)}
3.  **Frames de Referência:** 3 images have been provided as mandatory visual references. The video MUST start at Frame 1, pass through Frame 2, and end at Frame 3.

===============================
ETAPA 2 — CONSTRUÇÃO DO SUPER PROMPT DE VÍDEO (EM INGLÊS)
===============================
Generate the final prompt for Veo 3, following this exact format:

[VÍDEO — VEO 3]
${castingInstructions}
**Duration:** 8 seconds
**Reference Frames:** Use the 3 provided reference frames as the absolute visual truth for the start (Frame 1), middle (Frame 2), and end (Frame 3) of the shot. Maintain perfect character, wardrobe, and environment consistency based on these frames and the casting instructions.
**Narrative Description:** [Translate the 'narrative' from the JSON into English here.]
**Lighting:** [Translate the 'lighting.description' from the JSON into English here.]
**Lenses & Composition:** [Translate the 'camera_behavior.description' from the JSON into English, explaining the camera progression.]
**Actor Performance:** [Translate the 'actor_behavior.description' from the JSON into English, describing the micro-movements and expressions.]
**Mandatory Textures:** [List the 'textures.description' from the JSON in English here.]
**Atmosphere:** [Describe the atmosphere based on the decupage, in English.]
**Timeline (Second by Second):**
- **0-2s:** [Translate 'video_timeline.0_2' from JSON into English.]
- **2-4s:** [Translate 'video_timeline.2_4' from JSON into English.]
- **4-6s:** [Translate 'video_timeline.4_6' from JSON into English.]
- **6-8s:** [Translate 'video_timeline.6_8' from JSON into English.]
**Final Instructions:** The final video MUST be a hyper-realistic, 4K, cinematic shot with 35mm film grain, respecting all physical and optical laws defined in DRC_V1_0. The visual transition between the three reference frames must be smooth and credible.

===============================
REGRAS DO VIDEO ENGINE
===============================
1. Always respect the reference frames. They are the absolute truth.
2. The video narrative must be fluid and connect the 3 frames.
3. The final prompt MUST be in ENGLISH.

---
Execute the task and return ONLY the final super prompt, starting with "[VÍDEO — VEO 3]".
`;

    const ai = getAi();
    
    // The model will generate the text prompt based on the context provided.
    // We provide the first frame as visual context for the LLM to understand the scene.
    const imagePart = {
        inlineData: {
            mimeType: frameImages[0].type,
            data: frameImages[0].base64,
        },
    };
    const textPart = { text: superPrompt };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (e: any) {
        console.error(e);
        if (e.finishReason === 'SAFETY') throw new SafetyError();
        throw new GenerationError(e.message);
    }
};

export const generateVeoVideoFromPrompt = async (
    prompt: string,
    aspectRatio: '16:9' | '9:16',
    startImage: ImageFile,
    endImage: ImageFile
): Promise<string> => {
    if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
        // This check ensures the user is prompted if no key is selected.
        // The parent component should call `onSelectKey` if this error is caught.
        throw new ApiKeyError("Selecione uma chave de API para geração de vídeo.");
    }

    const ai = getAi(); // Get a fresh instance to ensure the latest key is used.

    const config: any = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio,
        lastFrame: {
            imageBytes: endImage.base64,
            mimeType: endImage.type,
        },
    };

    const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: startImage.base64,
            mimeType: startImage.type,
        },
        config: config,
    };

    try {
        let operation = await ai.models.generateVideos(payload);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10s
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (operation.error) {
             if (operation.error.message?.includes("Requested entity was not found.")) {
                throw new ApiKeyError("A chave de API selecionada é inválida ou não tem permissão. Por favor, selecione outra.");
            }
            throw new GenerationError(`Erro na operação de vídeo: ${operation.error.message}`);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new GenerationError("A operação foi concluída, mas nenhuma URL de vídeo foi retornada.");
        }
        
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Failed to download video:", errorBody);
            throw new NetworkError("Falha ao baixar o vídeo gerado do link fornecido.");
        }
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);

    } catch (e: any) {
        if (e.message?.includes("API key not valid")) {
             throw new ApiKeyError("A chave de API selecionada é inválida ou não tem permissão. Por favor, selecione outra.");
        }
        console.error("Error in generateVeoVideoFromPrompt:", e);
        throw e; // Re-throw other errors
    }
};


// --- All other functions (mostly mock or simplified) ---
const mockApiCall = <T>(data: T, delay: number = 1500): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), delay));

export const generateVideo = async (formData: VideoFormData): Promise<string> => mockApiCall(MOCK_VIDEO_URL);
export const generateImageWithImagen = async (prompt: string, aspectRatio: ImagenAspectRatio): Promise<string> => mockApiCall(MOCK_IMAGE_URL);
export const refineCreativeDirection = async (prompt: string, images?: ImageFile[], specialist?: string): Promise<string> => {
    // Upgraded this to have a slightly more intelligent response for fashion
    if (specialist === 'fashion_specialist') {
         return mockApiCall(`PROMPT REFINADO (ESPECIALISTA DE MODA):\n- Look: ${prompt}\n- Iluminação: Softbox grande para uma luz suave e difusa, com um kicker para separar do fundo.\n- Lente: 85mm f/1.4 para compressão e bokeh suave.\n- Composição: Regra dos terços, com espaço negativo para um look editorial.`);
    }
    return mockApiCall(`PROMPT REFINADO PELA IA: ${prompt}`);
};
export const generateBackdropImage = async (formData: TelaoCompositorFormData): Promise<string> => mockApiCall(MOCK_IMAGE_URL);
export const animateTelaoLoop = async (imageFile: ImageFile, formData: TelaoCompositorFormData): Promise<string[]> => mockApiCall([MOCK_VIDEO_URL, MOCK_VIDEO_URL]);
export const generateCreativeDirectionForTelao = async (formData: TelaoCompositorFormData): Promise<string> => mockApiCall(`Direção para Telao: ${formData.creativePrompt}`);
export const generateVisualizer = async (formData: any): Promise<string> => mockApiCall(MOCK_VIDEO_URL);
export const generateMotionScriptForImage = async (imageFile: ImageFile): Promise<string> => mockApiCall("Roteiro de movimento gerado pela IA para a imagem.");
export const generateStoryboardScript = async (creativeDirection: string): Promise<SequencedShot[]> => mockApiCall([{ shot_number: 1, description: 'CENA INICIAL: ' + creativeDirection, duration_seconds: 8 }]);
export const generateMoodboardImage = async (prompt: string): Promise<string> => mockApiCall(MOCK_IMAGE_URL);
export const analyzeMusicForDNA = async (audioFile: AudioFile): Promise<any> => mockApiCall({ bpm: 128, mood: 'Energético', genre: 'Funk' });
export const generateDirectionFromDNA = async (musicDna: any, vibeSettings: any): Promise<string> => mockApiCall(`Direção criativa baseada no DNA da música: ${musicDna.mood}.`);
export const analyzeImageForTraining = async (image: ImageFile): Promise<string> => mockApiCall(`Análise da Imagem: A imagem contém X, Y, Z. Prompt sugerido: ...`);
export const inpaintImage = async (baseImage: ImageFile, maskImage: ImageFile): Promise<string> => mockApiCall(MOCK_IMAGE_URL);
export const resizeImageWithAI = async (baseImage: ImageFile, aspectRatio: ImagenAspectRatio): Promise<string> => mockApiCall(MOCK_IMAGE_URL);
export const generateMotionPromptForResizedScene = async (image: ImageFile): Promise<string> => mockApiCall("Movimento de câmera suave, com zoom lento para o centro da imagem expandida.");
export const copyPose = async (baseImage: ImageFile, poseJson: string): Promise<string> => mockApiCall(MOCK_IMAGE_URL);
export const extractStyleAndPose = async (image: ImageFile): Promise<ExtractedStyleProfile> => mockApiCall({ poseDescription: 'Pose extraída', lightingDescription: 'Iluminação extraída', styleDescription: 'Estilo extraído', compositionDescription: 'Composição extraída', generatedPrompt: 'Prompt gerado a partir da análise.' });
export const generateCommercialPromptDirection = async (formData: FormData, dna: CreativeDNA): Promise<string> => mockApiCall(`Direção para comercial: ${formData.creativePrompt}`);
export const refineOfferText = async (text: string, profile: BusinessProfile): Promise<string> => mockApiCall(`OFERTA REFINADA: ${text}`);
export const generateTelaoImage = async (formData: TelaoFormData): Promise<string> => mockApiCall(MOCK_IMAGE_URL);
export const generateTelaoAnimationScript = async (baseImage: ImageFile, formData: TelaoFormData): Promise<string> => mockApiCall("Roteiro de animação para telão gerado pela IA.");
export const generateCreativeDirectionForStaticTelao = async (formData: TelaoFormData): Promise<string> => mockApiCall(`Direção para telão estático: ${formData.creativePrompt}`);
export const enhanceImageWithPreset = async (baseImage: ImageFile, prompt: string, aspectRatio: '1:1' | '3:4' | '16:9', referenceImages: ImageFile[]): Promise<string> => editImageWithFlash(baseImage, prompt, referenceImages);
export const generateVisualizerFromEngine = async (prompt: string, formData: VisualizerEngineFormData): Promise<string> => mockApiCall(MOCK_VIDEO_URL);
export const buildVisualizerEnginePrompt = (formData: VisualizerEngineFormData): string => `Visualizer com BPM ${formData.bpm}, template ${formData.template}.`;
export const refineMotionDesignerPrompt = async (formData: MotionDesignerFormData): Promise<string> => mockApiCall(`Prompt refinado para Motion Designer: ${formData.creativePrompt}`);
export const generateStaticSceneForLoop = async (formData: MotionDesignerFormData): Promise<string> => mockApiCall(MOCK_IMAGE_URL);
export const generateLoopingScene = async (formData: MotionDesignerFormData, staticImage: ImageFile): Promise<string> => mockApiCall(MOCK_VIDEO_URL);
export const refineScriptWithAI = async (idea: string, genreName: string): Promise<string> => mockApiCall(`ROTEIRO REFINADO:\nCENA 1: ${idea}`);
export const runFilmmakerPipeline = async (script: string, genre: CinemaGenre, cast: ImageFile[], locations: ImageFile[]): Promise<any[]> => mockApiCall([{ shot_number: 1, description: 'Descrição da cena 1', duration_seconds: 8, master_frame_description: 'Frame da cena 1', aux_frame_1_description: 'Frame aux 1', aux_frame_2_description: 'Frame aux 2' }]);
export const generateCinemaSceneVideo = async (description: string, masterFrame: ImageFile, cast: ImageFile[], locations: ImageFile[]): Promise<string> => mockApiCall(MOCK_VIDEO_URL);
export const generateCinemaMasterFrame = async (prompt: string, cast: ImageFile[], locations: ImageFile[]): Promise<string> => mockApiCall(MOCK_IMAGE_URL);

export const generateFlyer = async (formData: FormData, dna: CreativeDNA | null): Promise<string> => {
    const ai = getAi();
    const parts: Part[] = [];

    const allImages: ImageFile[] = [];

    // Collect all images from the profiles
    if (formData.flyerType === 'business_promo' || formData.flyerType === 'business_card') {
        if (formData.businessProfile) {
            if (formData.businessProfile.logo) {
                allImages.push(formData.businessProfile.logo);
            }
            // Note: business card uses productPhotos for brand identity assets
            allImages.push(...formData.businessProfile.productPhotos);
        }
    } else { // Artist flyers
        formData.artistProfiles.forEach(artist => {
            if (artist.logo) {
                allImages.push(artist.logo);
            }
            allImages.push(...artist.photos);
        });
    }

    // Add general reference photos
    allImages.push(...formData.referencePhotos);

    // Add all unique images as inlineData parts
    const uniqueImages = Array.from(new Map(allImages.map(img => [img.preview, img])).values());

    uniqueImages.forEach(img => {
        parts.push({ inlineData: { data: img.base64, mimeType: img.type } });
    });
    
    // Add the final prompt as the last part
    parts.push({ text: formData.creativePrompt });

    const modelConfig = { 
        responseModalities: [Modality.IMAGE] 
    };
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: modelConfig,
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData?.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new GenerationError("A IA não retornou uma imagem. Tente refinar seu prompt ou suas imagens de referência.");

    } catch(e: any) {
        console.error("Error generating flyer:", e);
        if (e.message?.includes('SAFETY') || (e.response && e.response.promptFeedback && e.response.promptFeedback.blockReason)) {
            throw new SafetyError("A geração foi bloqueada por políticas de segurança. Tente um prompt ou imagens diferentes.");
        }
        throw new GenerationError(e.message || 'Um erro desconhecido ocorreu durante a geração da imagem.');
    }
};