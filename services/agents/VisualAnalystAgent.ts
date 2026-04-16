// services/agents/VisualAnalystAgent.ts
// Agent specialized in analyzing images and extracting visual information

import { BaseAgent, AgentInput, AgentOutput } from './BaseAgent';

export interface VisualAnalystInput extends AgentInput {
    analysisType: 'style_extraction' | 'composition_analysis' | 'color_analysis' | 'mood_detection' | 'comprehensive';
    focusAreas?: string[];
}

export interface StyleProfile {
    styleName: string;
    description: string;
    keyCharacteristics: string[];
    artisticReferences: string[];
}

export interface CompositionAnalysis {
    layout: string;
    focalPoints: string[];
    balance: string;
    useOfSpace: string;
    leadingLines: string[];
    ruleOfThirds: boolean;
}

export interface ColorAnalysis {
    dominantColors: string[];
    colorScheme: string;
    palette: { hex: string; percentage: number; name: string }[];
    temperature: 'warm' | 'cool' | 'neutral';
    saturation: 'high' | 'medium' | 'low';
    contrast: 'high' | 'medium' | 'low';
}

export interface MoodAnalysis {
    primaryMood: string;
    secondaryMoods: string[];
    emotionalIntensity: number;
    atmosphere: string;
    keywords: string[];
}

export interface VisualAnalystOutput {
    styleProfile?: StyleProfile;
    composition?: CompositionAnalysis;
    colorAnalysis?: ColorAnalysis;
    moodAnalysis?: MoodAnalysis;
    technicalQuality: {
        sharpness: number;
        lighting: number;
        overallScore: number;
    };
    recommendations: string[];
    generatedPrompt: string;
}

const VISUAL_ANALYST_SYSTEM_PROMPT = `
Você é um Analista Visual especializado em crítica de arte, fotografia e design.

Sua função é:
1. Analisar imagens fornecidas em múltiplas dimensões (estilo, composição, cor, mood)
2. Extrair informações técnicas e artísticas detalhadas
3. Gerar prompts precisos que podem recriar o estilo analisado
4. Fornecer feedback construtivo e recomendações

FORMATO DE RESPOSTA (JSON):
{
    "styleProfile": {
        "styleName": "Nome do estilo",
        "description": "Descrição detalhada",
        "keyCharacteristics": ["caracteristica1", "caracteristica2"],
        "artisticReferences": ["referencia1", "referencia2"]
    },
    "composition": {
        "layout": "tipo de layout",
        "focalPoints": ["ponto1", "ponto2"],
        "balance": "descricao do equilibrio",
        "useOfSpace": "uso do espaco",
        "leadingLines": ["linha1", "linha2"],
        "ruleOfThirds": true
    },
    "colorAnalysis": {
        "dominantColors": ["#cor1", "#cor2"],
        "colorScheme": "tipo de esquema",
        "palette": [
            {"hex": "#cor1", "percentage": 40, "name": "nome"},
            {"hex": "#cor2", "percentage": 30, "name": "nome"}
        ],
        "temperature": "warm",
        "saturation": "high",
        "contrast": "high"
    },
    "moodAnalysis": {
        "primaryMood": "humor principal",
        "secondaryMoods": ["humor1", "humor2"],
        "emotionalIntensity": 0.8,
        "atmosphere": "descrição da atmosfera",
        "keywords": ["palavra1", "palavra2"]
    },
    "technicalQuality": {
        "sharpness": 0.9,
        "lighting": 0.85,
        "overallScore": 0.88
    },
    "recommendations": ["recomendacao1", "recomendacao2"],
    "generatedPrompt": "prompt completo para recrear este estilo"
}

Seja objetivo, técnico e específico. Use terminologia apropriada de arte e fotografia.
`;

export class VisualAnalystAgent extends BaseAgent<VisualAnalystInput, VisualAnalystOutput> {
    constructor() {
        super(
            'VisualAnalystAgent',
            '1.0.0',
            VISUAL_ANALYST_SYSTEM_PROMPT,
            'gemini-2.5-flash-image'
        );
    }

    validateInput(input: VisualAnalystInput): boolean {
        if (!input.images || input.images.length === 0) {
            console.warn('[VisualAnalystAgent] No images provided for analysis');
            return false;
        }
        
        const validTypes = ['style_extraction', 'composition_analysis', 'color_analysis', 'mood_detection', 'comprehensive'];
        if (!validTypes.includes(input.analysisType)) {
            console.warn('[VisualAnalystAgent] Invalid analysisType');
            return false;
        }

        return true;
    }

    transformOutput(rawOutput: any): VisualAnalystOutput {
        return {
            styleProfile: rawOutput.styleProfile || undefined,
            composition: rawOutput.composition || undefined,
            colorAnalysis: rawOutput.colorAnalysis || undefined,
            moodAnalysis: rawOutput.moodAnalysis || undefined,
            technicalQuality: rawOutput.technicalQuality || { sharpness: 0, lighting: 0, overallScore: 0 },
            recommendations: rawOutput.recommendations || [],
            generatedPrompt: rawOutput.generatedPrompt || ''
        };
    }
}
