// services/agents/BaseAgent.ts
// Base abstract class for all agents in the system

import { Part } from "@google/genai";
import { GoogleGenAI } from "@google/genai";
import { ImageFile, AudioFile } from '../../types';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AgentContext {
    sessionId: string;
    timestamp: number;
    previousOutputs?: Record<string, any>;
    userPreferences?: Record<string, any>;
}

export interface AgentInput {
    prompt: string;
    images?: ImageFile[];
    audio?: AudioFile | null;
    context?: AgentContext;
    metadata?: Record<string, any>;
}

export interface AgentOutput<T = any> {
    success: boolean;
    data: T;
    metadata?: {
        modelUsed: string;
        processingTime?: number;
        tokensUsed?: number;
    };
    error?: string;
}

export abstract class BaseAgent<TInput extends AgentInput = AgentInput, TOutput = any> {
    protected agentName: string;
    protected agentVersion: string;
    protected systemPrompt: string;
    protected model: string;

    constructor(agentName: string, version: string, systemPrompt: string, model: string = 'gemini-2.5-pro') {
        this.agentName = agentName;
        this.agentVersion = version;
        this.systemPrompt = systemPrompt;
        this.model = model;
    }

    protected async buildParts(input: TInput): Promise<Part[]> {
        const parts: Part[] = [{ text: this.systemPrompt }];
        
        if (input.prompt) {
            parts.push({ text: `\n[USER REQUEST]\n${input.prompt}` });
        }

        if (input.images && input.images.length > 0) {
            for (const image of input.images) {
                parts.push({ 
                    inlineData: { 
                        mimeType: image.type, 
                        data: image.base64 
                    } 
                });
            }
        }

        if (input.audio) {
            parts.push({
                inlineData: {
                    mimeType: input.audio.type,
                    data: input.audio.base64,
                },
            });
        }

        if (input.context) {
            parts.push({ 
                text: `\n[CONTEXT]\nSession: ${input.context.sessionId}\nTimestamp: ${new Date(input.context.timestamp).toISOString()}` 
            });
        }

        return parts;
    }

    protected parseResponse(responseText: string): TOutput {
        try {
            return JSON.parse(responseText);
        } catch (e) {
            return responseText as unknown as TOutput;
        }
    }

    async execute(input: TInput): Promise<AgentOutput<TOutput>> {
        const startTime = Date.now();
        
        try {
            const ai = getAi();
            const parts = await this.buildParts(input);

            const response = await ai.models.generateContent({
                model: this.model,
                contents: { parts },
            });

            const resultText = response.text;
            const parsedData = this.parseResponse(resultText);

            return {
                success: true,
                data: parsedData,
                metadata: {
                    modelUsed: this.model,
                    processingTime: Date.now() - startTime,
                }
            };
        } catch (error: any) {
            console.error(`[${this.agentName}] Error:`, error);
            return {
                success: false,
                data: null as any,
                error: error.message || 'Unknown error occurred',
                metadata: {
                    modelUsed: this.model,
                    processingTime: Date.now() - startTime,
                }
            };
        }
    }

    abstract validateInput(input: TInput): boolean;
    abstract transformOutput(rawOutput: any): TOutput;
}
