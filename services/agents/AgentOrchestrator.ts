// services/agents/AgentOrchestrator.ts
// Orchestrates multiple agents to work together in a workflow

import { v4 as uuidv4 } from 'uuid';
import { 
    BaseAgent, 
    AgentInput, 
    AgentOutput, 
    AgentContext,
    CreativeDirectorAgent,
    CreativeDirectorInput,
    CreativeDirectorOutput,
    PromptEngineerAgent,
    PromptEngineerInput,
    PromptEngineerOutput,
    VisualAnalystAgent,
    VisualAnalystInput,
    VisualAnalystOutput
} from './index';
import { ImageFile, AudioFile } from '../../types';

export interface WorkflowStep {
    id: string;
    agentType: 'CreativeDirector' | 'PromptEngineer' | 'VisualAnalyst';
    input: AgentInput;
    output?: AgentOutput;
    status: 'pending' | 'running' | 'completed' | 'failed';
    dependsOn?: string[];
}

export interface WorkflowDefinition {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
}

export interface OrchestratorConfig {
    enableParallelExecution: boolean;
    maxRetries: number;
    timeoutMs: number;
    verboseLogging: boolean;
}

export class AgentOrchestrator {
    private sessionId: string;
    private agents: Map<string, BaseAgent>;
    private workflowHistory: WorkflowDefinition[];
    private config: OrchestratorConfig;

    constructor(config?: Partial<OrchestratorConfig>) {
        this.sessionId = uuidv4();
        this.agents = new Map();
        this.workflowHistory = [];
        this.config = {
            enableParallelExecution: true,
            maxRetries: 3,
            timeoutMs: 60000,
            verboseLogging: true,
            ...config
        };

        this.initializeAgents();
    }

    private initializeAgents() {
        this.agents.set('CreativeDirector', new CreativeDirectorAgent());
        this.agents.set('PromptEngineer', new PromptEngineerAgent());
        this.agents.set('VisualAnalyst', new VisualAnalystAgent());
        
        if (this.config.verboseLogging) {
            console.log('[AgentOrchestrator] Agents initialized:', Array.from(this.agents.keys()));
        }
    }

    private log(message: string, data?: any) {
        if (this.config.verboseLogging) {
            console.log(`[AgentOrchestrator:${this.sessionId}] ${message}`, data || '');
        }
    }

    async executeWorkflow(workflow: WorkflowDefinition): Promise<Map<string, AgentOutput>> {
        const results = new Map<string, AgentOutput>();
        const completedSteps = new Set<string>();

        this.log('Starting workflow execution', { workflowName: workflow.name, stepCount: workflow.steps.length });

        for (const step of workflow.steps) {
            // Check dependencies
            if (step.dependsOn && step.dependsOn.length > 0) {
                const dependenciesMet = step.dependsOn.every(depId => completedSteps.has(depId));
                if (!dependenciesMet) {
                    this.log(`Skipping step ${step.id}: dependencies not met`, { dependsOn: step.dependsOn });
                    step.status = 'pending';
                    continue;
                }
            }

            step.status = 'running';
            this.log(`Executing step ${step.id}`, { agentType: step.agentType });

            try {
                const agent = this.agents.get(step.agentType);
                if (!agent) {
                    throw new Error(`Agent ${step.agentType} not found`);
                }

                // Enrich input with context from previous steps
                const enrichedInput = await this.enrichInputWithPreviousOutputs(step.input, results);

                // Validate input
                if (!agent.validateInput(enrichedInput)) {
                    throw new Error('Input validation failed');
                }

                // Execute agent
                const output = await agent.execute(enrichedInput);
                
                if (output.success) {
                    step.output = output;
                    step.status = 'completed';
                    completedSteps.add(step.id);
                    results.set(step.id, output);
                    this.log(`Step ${step.id} completed successfully`);
                } else {
                    throw new Error(output.error || 'Agent execution failed');
                }
            } catch (error: any) {
                step.status = 'failed';
                this.log(`Step ${step.id} failed`, { error: error.message });
                
                // Retry logic could be implemented here
                
                results.set(step.id, {
                    success: false,
                    data: null as any,
                    error: error.message
                });
            }
        }

        // Save workflow to history
        this.workflowHistory.push(workflow);
        this.log('Workflow execution completed', { 
            completed: completedSteps.size, 
            total: workflow.steps.length 
        });

        return results;
    }

    private async enrichInputWithPreviousOutputs(
        input: AgentInput, 
        results: Map<string, AgentOutput>
    ): Promise<AgentInput> {
        if (results.size === 0) {
            return input;
        }

        const context: AgentContext = {
            sessionId: this.sessionId,
            timestamp: Date.now(),
            previousOutputs: {}
        };

        // Convert results to a format that can be used as context
        for (const [stepId, output] of results.entries()) {
            if (output.success && output.data) {
                context.previousOutputs![stepId] = output.data;
            }
        }

        // Append insights from previous outputs to the prompt
        let enrichedPrompt = input.prompt;
        
        if (context.previousOutputs && Object.keys(context.previousOutputs).length > 0) {
            enrichedPrompt += '\n\n[CONTEXT FROM PREVIOUS STEPS]\n';
            for (const [stepId, data] of Object.entries(context.previousOutputs)) {
                enrichedPrompt += `\n--- ${stepId} ---\n${JSON.stringify(data, null, 2)}\n`;
            }
        }

        return {
            ...input,
            prompt: enrichedPrompt,
            context
        };
    }

    // Pre-built workflow templates
    createCreativeDevelopmentWorkflow(
        concept: string,
        projectType: 'flyer' | 'video' | 'editorial' | 'branding',
        images?: ImageFile[],
        audio?: AudioFile | null
    ): WorkflowDefinition {
        const workflowId = uuidv4();

        return {
            id: workflowId,
            name: 'Creative Development Pipeline',
            description: 'From concept to optimized prompt',
            steps: [
                {
                    id: `${workflowId}-step1`,
                    agentType: 'CreativeDirector',
                    input: {
                        prompt: `Desenvolva conceitos criativos para: ${concept}`,
                        images,
                        audio,
                        metadata: { projectType }
                    },
                    status: 'pending'
                },
                {
                    id: `${workflowId}-step2`,
                    agentType: 'PromptEngineer',
                    input: {
                        prompt: `Com base nos conceitos aprovados, crie prompts otimizados para: ${concept}`,
                        images,
                        audio,
                        metadata: { taskType: projectType === 'video' ? 'video_generation' : 'image_generation' }
                    },
                    status: 'pending',
                    dependsOn: [`${workflowId}-step1`]
                }
            ]
        };
    }

    createVisualAnalysisWorkflow(
        images: ImageFile[],
        analysisType: 'style_extraction' | 'composition_analysis' | 'color_analysis' | 'mood_detection' | 'comprehensive' = 'comprehensive'
    ): WorkflowDefinition {
        const workflowId = uuidv4();

        return {
            id: workflowId,
            name: 'Visual Analysis Pipeline',
            description: 'Comprehensive visual analysis and prompt generation',
            steps: [
                {
                    id: `${workflowId}-step1`,
                    agentType: 'VisualAnalyst',
                    input: {
                        prompt: 'Analise esta imagem em todas as dimensões',
                        images,
                        metadata: { analysisType }
                    },
                    status: 'pending'
                },
                {
                    id: `${workflowId}-step2`,
                    agentType: 'PromptEngineer',
                    input: {
                        prompt: 'Crie um prompt otimizado baseado na análise visual',
                        images,
                        metadata: { taskType: 'image_generation', baseConcept: 'Recriar estilo analisado' }
                    },
                    status: 'pending',
                    dependsOn: [`${workflowId}-step1`]
                }
            ]
        };
    }

    getWorkflowHistory(): WorkflowDefinition[] {
        return [...this.workflowHistory];
    }

    getSessionId(): string {
        return this.sessionId;
    }
}
