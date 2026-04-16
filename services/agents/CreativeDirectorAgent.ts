// services/agents/CreativeDirectorAgent.ts
// Agent responsible for creative direction and concept development

import { BaseAgent, AgentInput, AgentOutput } from './BaseAgent';

export interface CreativeDirectorInput extends AgentInput {
    projectType: 'flyer' | 'video' | 'editorial' | 'branding';
    targetAudience?: string;
    moodKeywords?: string[];
    brandGuidelines?: string;
}

export interface CreativeConcept {
    title: string;
    description: string;
    visualStyle: string;
    colorPalette: string[];
    typography: string;
    moodBoard: string[];
    keyVisualElements: string[];
    emotionalTone: string;
}

export interface CreativeDirectorOutput {
    concepts: CreativeConcept[];
    recommendations: string[];
    warnings: string[];
}

const CREATIVE_DIRECTOR_SYSTEM_PROMPT = `
Você é um Diretor Criativo de elite com 20+ anos de experiência em design gráfico, direção de arte e branding.

Sua função é:
1. Analisar o briefing do cliente/projeto
2. Desenvolver conceitos criativos inovadores e executáveis
3. Fornecer direção clara sobre estilo visual, paleta de cores, tipografia e tom emocional
4. Identificar potenciais problemas e oferecer soluções proativas

FORMATO DE RESPOSTA (JSON):
{
    "concepts": [
        {
            "title": "Nome do Conceito",
            "description": "Descrição detalhada do conceito",
            "visualStyle": "Estilo visual principal",
            "colorPalette": ["#cor1", "#cor2", "#cor3"],
            "typography": "Recomendação tipográfica",
            "moodBoard": ["elemento1", "elemento2", "elemento3"],
            "keyVisualElements": ["elemento_chave1", "elemento_chave2"],
            "emotionalTone": "Tom emocional"
        }
    ],
    "recommendations": ["recomendação1", "recomendação2"],
    "warnings": ["alerta1", "alerta2"]
}

Seja específico, prático e criativo. Evite clichês.
`;

export class CreativeDirectorAgent extends BaseAgent<CreativeDirectorInput, CreativeDirectorOutput> {
    constructor() {
        super(
            'CreativeDirectorAgent',
            '1.0.0',
            CREATIVE_DIRECTOR_SYSTEM_PROMPT,
            'gemini-2.5-pro'
        );
    }

    validateInput(input: CreativeDirectorInput): boolean {
        if (!input.prompt || input.prompt.trim().length === 0) {
            console.warn('[CreativeDirectorAgent] Missing prompt');
            return false;
        }
        
        if (!['flyer', 'video', 'editorial', 'branding'].includes(input.projectType)) {
            console.warn('[CreativeDirectorAgent] Invalid projectType');
            return false;
        }

        return true;
    }

    transformOutput(rawOutput: any): CreativeDirectorOutput {
        return {
            concepts: rawOutput.concepts || [],
            recommendations: rawOutput.recommendations || [],
            warnings: rawOutput.warnings || []
        };
    }
}
