# Sistema Agêntico - AI Content Studio

## Visão Geral

Este sistema transforma o gerador de conteúdo em uma arquitetura agêntica completa, onde múltiplos agentes especializados colaboram para produzir resultados criativos de alta qualidade.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                        │
│  (Coordena workflows e gerencia comunicação entre agentes)   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Creative    │   │   Prompt        │   │   Visual        │
│   Director    │   │   Engineer      │   │   Analyst       │
│   Agent       │   │   Agent         │   │   Agent         │
└───────────────┘   └─────────────────┘   └─────────────────┘
```

## Agentes

### 1. BaseAgent (Classe Abstrata)
- **Localização**: `services/agents/BaseAgent.ts`
- **Função**: Define a interface comum para todos os agentes
- **Recursos**:
  - Gerenciamento de contexto
  - Construção de prompts multimodais
  - Tratamento de erros padronizado
  - Validação de entrada/saída

### 2. CreativeDirectorAgent
- **Localização**: `services/agents/CreativeDirectorAgent.ts`
- **Função**: Desenvolvimento de conceitos criativos e direção de arte
- **Entradas**:
  - Briefing do projeto
  - Tipo de projeto (flyer, video, editorial, branding)
  - Palavras-chave de mood
  - Referências visuais
- **Saídas**:
  - Conceitos criativos detalhados
  - Paletas de cores
  - Recomendações tipográficas
  - Elementos visuais chave

### 3. PromptEngineerAgent
- **Localização**: `services/agents/PromptEngineerAgent.ts`
- **Função**: Otimização de prompts para geração de imagem/vídeo
- **Entradas**:
  - Conceito base
  - Tipo de tarefa (image_generation, video_generation, etc.)
  - Restrições técnicas
  - Referências de estilo
- **Saídas**:
  - Prompts otimizados
  - Prompts negativos
  - Modificadores de estilo
  - Parâmetros técnicos

### 4. VisualAnalystAgent
- **Localização**: `services/agents/VisualAnalystAgent.ts`
- **Função**: Análise de imagens e extração de características visuais
- **Entradas**:
  - Imagens para análise
  - Tipo de análise (style, composition, color, mood)
- **Saídas**:
  - Perfil de estilo
  - Análise de composição
  - Análise de cor
  - Análise de mood
  - Prompt gerado para recriação

### 5. AgentOrchestrator
- **Localização**: `services/agents/AgentOrchestrator.ts`
- **Função**: Orquestrar múltiplos agentes em workflows coordenados
- **Recursos**:
  - Execução sequencial e paralela
  - Gerenciamento de dependências entre steps
  - Enriquecimento de contexto entre etapas
  - Templates de workflow pré-definidos
  - Histórico de execuções

## Workflows Pré-definidos

### Creative Development Pipeline
```typescript
Concept → CreativeDirector → PromptEngineer → Optimized Prompt
```

**Uso:**
```typescript
const orchestrator = new AgentOrchestrator();
const workflow = orchestrator.createCreativeDevelopmentWorkflow(
    'Flyer para show de trap',
    'flyer',
    referenceImages
);
const results = await orchestrator.executeWorkflow(workflow);
```

### Visual Analysis Pipeline
```typescript
Image → VisualAnalyst → PromptEngineer → Recreation Prompt
```

**Uso:**
```typescript
const orchestrator = new AgentOrchestrator();
const workflow = orchestrator.createVisualAnalysisWorkflow(
    referenceImages,
    'comprehensive'
);
const results = await orchestrator.executeWorkflow(workflow);
```

## Como Usar

### Exemplo Básico - Agente Individual

```typescript
import { CreativeDirectorAgent } from './services/agents';

const agent = new CreativeDirectorAgent();
const input = {
    prompt: 'Criar conceito para flyer de festival eletrônico',
    projectType: 'flyer',
    moodKeywords: ['energético', 'futurista', 'noturno'],
    targetAudience: 'Jovens adultos 18-30'
};

if (agent.validateInput(input)) {
    const result = await agent.execute(input);
    if (result.success) {
        console.log('Conceitos:', result.data.concepts);
    }
}
```

### Exemplo Avançado - Workflow Orquestrado

```typescript
import { AgentOrchestrator } from './services/agents';

const orchestrator = new AgentOrchestrator({
    verboseLogging: true,
    maxRetries: 2
});

// Criar workflow personalizado
const customWorkflow: WorkflowDefinition = {
    id: 'custom-001',
    name: 'Full Creative Pipeline',
    description: 'Análise visual → Direção criativa → Prompt engineering',
    steps: [
        {
            id: 'step-1',
            agentType: 'VisualAnalyst',
            input: {
                prompt: 'Analisar estilo desta referência',
                images: referenceImages,
                metadata: { analysisType: 'comprehensive' }
            },
            status: 'pending'
        },
        {
            id: 'step-2',
            agentType: 'CreativeDirector',
            input: {
                prompt: 'Desenvolver conceito baseado na análise',
                images: referenceImages,
                metadata: { projectType: 'video' }
            },
            status: 'pending',
            dependsOn: ['step-1']
        },
        {
            id: 'step-3',
            agentType: 'PromptEngineer',
            input: {
                prompt: 'Criar prompt otimizado para vídeo',
                metadata: { taskType: 'video_generation' }
            },
            status: 'pending',
            dependsOn: ['step-2']
        }
    ]
};

const results = await orchestrator.executeWorkflow(customWorkflow);

// Acessar resultados por step ID
for (const [stepId, output] of results.entries()) {
    if (output.success) {
        console.log(`${stepId}:`, output.data);
    } else {
        console.error(`${stepId} failed:`, output.error);
    }
}
```

## Integração com Serviços Existentes

Os agentes podem ser integrados com os serviços existentes:

```typescript
import { AgentOrchestrator } from './services/agents';
import { editImageWithFlash } from './services/geminiService';

async function generateWithAgents(concept: string, referenceImages: ImageFile[]) {
    // 1. Usar agentes para desenvolver conceito e prompt
    const orchestrator = new AgentOrchestrator();
    const workflow = orchestrator.createCreativeDevelopmentWorkflow(
        concept,
        'flyer',
        referenceImages
    );
    const results = await orchestrator.executeWorkflow(workflow);
    
    // 2. Extrair prompt otimizado
    const promptOutput = results.get('step-2') as AgentOutput<PromptEngineerOutput>;
    const optimizedPrompt = promptOutput.data.optimizedPrompts[0].mainPrompt;
    
    // 3. Usar serviço existente para gerar imagem
    const imageUrl = await editImageWithFlash(undefined, optimizedPrompt, referenceImages);
    
    return { imageUrl, agentResults: results };
}
```

## Vantagens da Arquitetura Agêntica

1. **Especialização**: Cada agente foca em uma tarefa específica
2. **Reusabilidade**: Agentes podem ser combinados em diferentes workflows
3. **Manutenibilidade**: Mudanças em um agente não afetam os outros
4. **Escalabilidade**: Novos agentes podem ser adicionados facilmente
5. **Contexto Rico**: Informações fluem entre agentes para resultados mais coerentes
6. **Debugging**: Logs detalhados por agente e por step

## Extensão

### Criando um Novo Agente

```typescript
import { BaseAgent, AgentInput, AgentOutput } from './BaseAgent';

interface MyAgentInput extends AgentInput {
    customField: string;
}

interface MyAgentOutput {
    result: string;
}

const MY_AGENT_PROMPT = `Você é um especialista em...`;

export class MyAgent extends BaseAgent<MyAgentInput, MyAgentOutput> {
    constructor() {
        super('MyAgent', '1.0.0', MY_AGENT_PROMPT);
    }

    validateInput(input: MyAgentInput): boolean {
        return !!input.customField;
    }

    transformOutput(rawOutput: any): MyAgentOutput {
        return { result: rawOutput.result };
    }
}
```

### Registrando no Orchestrator

```typescript
// No AgentOrchestrator.ts, método initializeAgents():
this.agents.set('MyAgent', new MyAgent());
```

## Próximos Passos Sugeridos

1. **Novos Agentes**:
   - CopywriterAgent (textos e slogans)
   - BrandingAgent (identidade visual)
   - VideoDirectorAgent (storyboarding)
   - ColorGradingAgent (correção de cor)

2. **Workflows Avançados**:
   - Pipeline completo de produção de flyer
   - Pipeline de produção de vídeo
   - Pipeline de branding

3. **Features**:
   - Cache de resultados de agentes
   - Parallel execution real
   - Retry com backoff exponencial
   - Metrics e analytics
