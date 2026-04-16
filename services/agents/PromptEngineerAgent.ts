// services/agents/PromptEngineerAgent.ts
// Agent specialized in crafting and optimizing prompts for image/video generation

import { BaseAgent, AgentInput, AgentOutput } from './BaseAgent';

export interface PromptEngineerInput extends AgentInput {
    taskType: 'image_generation' | 'video_generation' | 'image_edit' | 'style_transfer';
    baseConcept?: string;
    styleReferences?: string[];
    technicalConstraints?: {
        aspectRatio?: string;
        resolution?: string;
        model?: string;
    };
}

export interface OptimizedPrompt {
    mainPrompt: string;
    negativePrompt?: string;
    styleModifiers: string[];
    technicalParameters: Record<string, any>;
    confidenceScore: number;
    explanation: string;
}

export interface PromptEngineerOutput {
    optimizedPrompts: OptimizedPrompt[];
    alternativeApproaches: string[];
    tips: string[];
}

const PROMPT_ENGINEER_SYSTEM_PROMPT = `
Você é um Engenheiro de Prompt especialista em IA generativa para imagem e vídeo.

Sua função é:
1. Transformar conceitos básicos em prompts altamente detalhados e eficazes
2. Otimizar prompts para modelos específicos (Gemini, Imagen, Veo, etc.)
3. Adicionar modificadores de estilo, iluminação, composição e qualidade técnica
4. Fornecer prompts negativos quando aplicável
5. Explicar o raciocínio por trás das escolhas

FORMATO DE RESPOSTA (JSON):
{
    "optimizedPrompts": [
        {
            "mainPrompt": "prompt principal detalhado",
            "negativePrompt": "elementos a evitar",
            "styleModifiers": ["modificador1", "modificador2"],
            "technicalParameters": {
                "aspectRatio": "16:9",
                "quality": "high",
                "style": "cinematic"
            },
            "confidenceScore": 0.95,
            "explanation": "Por que este prompt funciona"
        }
    ],
    "alternativeApproaches": ["abordagem1", "abordagem2"],
    "tips": ["dica1", "dica2"]
}

Seja técnico, específico e inclua referências a:
- Estilo de iluminação (volumetric, soft, hard, neon, etc.)
- Composição (rule of thirds, leading lines, etc.)
- Paleta de cores
- Texturas e materiais
- Mood e atmosfera
- Referências artísticas/cinematográficas quando relevante
`;

export class PromptEngineerAgent extends BaseAgent<PromptEngineerInput, PromptEngineerOutput> {
    constructor() {
        super(
            'PromptEngineerAgent',
            '1.0.0',
            PROMPT_ENGINEER_SYSTEM_PROMPT,
            'gemini-2.5-pro'
        );
    }

    validateInput(input: PromptEngineerInput): boolean {
        if (!input.prompt || input.prompt.trim().length === 0) {
            console.warn('[PromptEngineerAgent] Missing prompt');
            return false;
        }
        
        const validTypes = ['image_generation', 'video_generation', 'image_edit', 'style_transfer'];
        if (!validTypes.includes(input.taskType)) {
            console.warn('[PromptEngineerAgent] Invalid taskType');
            return false;
        }

        return true;
    }

    transformOutput(rawOutput: any): PromptEngineerOutput {
        return {
            optimizedPrompts: rawOutput.optimizedPrompts || [],
            alternativeApproaches: rawOutput.alternativeApproaches || [],
            tips: rawOutput.tips || []
        };
    }
}
