# 🤖 AXIAL AI - MAPEAMENTO DE FRAMEWORKS E COMPONENTES

## 📊 VISÃO GERAL

Este documento consolida a pesquisa de frameworks de agentes, componentes UI e repositórios que podem ser adaptados/clonados para implementação dos 9 agentes da Lumiere Agency.

---

## 🔍 FRAMEWORKS DE AGENTES - ANÁLISE COMPLETA

### 1. **Microsoft AutoGen** ⭐⭐⭐⭐⭐
- **Repo**: https://github.com/microsoft/autogen
- **Stars**: ~30k+
- **Linguagem**: Python (com wrappers JS/TS emergentes)
- **Licença**: MIT

**O que oferece:**
- ✅ Multi-agent conversations
- ✅ Agent orchestration patterns
- ✅ Code execution agents
- ✅ Human-in-the-loop workflows
- ✅ Tool integration framework
- ✅ Group chat patterns

**Podemos adaptar:**
- Padrões de comunicação entre agentes
- Sistema de orquestração baseado em conversação
- Mecanismos de tool calling
- Patterns de escalonamento humano

**Código para estudar:**
```python
# Exemplo de padrão que podemos portar para TS
class AgentGroup:
    def __init__(self, agents: List[Agent]):
        self.agents = agents
        self.message_history = []
    
    def chat(self, message: str, max_rounds: int = 10):
        # Lógica de round-robin entre agentes
        pass
```

---

### 2. **LangChain / LangChain.js** ⭐⭐⭐⭐
- **Repo Principal**: https://github.com/langchain-ai/langchain (Python)
- **Repo JS**: https://github.com/langchain-ai/langchainjs
- **Stars**: ~80k+ (Python), ~15k+ (JS)
- **Linguagem**: Python / TypeScript
- **Licença**: MIT

**O que oferece:**
- ✅ Agent executor framework
- ✅ Memory management (buffer, vector, summary)
- ✅ Tool calling abstraction
- ✅ RAG pipelines
- ✅ Vector store integrations
- ✅ Chain composition

**Podemos usar diretamente:**
- `langchainjs` já é TypeScript nativo
- Estrutura de Tools e Agents
- System de memória compartilhada
- Callbacks para logging e observability

**Instalação:**
```bash
npm install langchain @langchain/core @langchain/community
```

**Exemplo de uso:**
```typescript
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";

const agent = await createOpenAIFunctionsAgent({
  llm: new ChatOpenAI(),
  tools: [opsTool, contractTool, csTool],
  systemMessage: "Você é o OpsAgent da Lumiere Agency"
});
```

---

### 3. **CrewAI** ⭐⭐⭐⭐⭐ (PERFEITO PARA NOSSO CASO)
- **Repo**: https://github.com/joaomdmoura/crewAI
- **Stars**: ~15k+
- **Linguagem**: Python
- **Licença**: MIT

**O que oferece:**
- ✅ Role-based agents (exatamente como nossos 9 agentes!)
- ✅ Task delegation
- ✅ Process-driven workflows (sequential, hierarchical, consensual)
- ✅ Collaboration patterns
- ✅ Output validation

**POR QUE É PERFEITO:**
Nosso mapeamento tem 9 agentes com papéis definidos (OpsAgent, ContractAgent, etc.) que se encaixam exatamente no modelo do CrewAI.

**Podemos portar:**
- Conceito de `Crew` = nosso `AgentOrchestrator`
- Conceito de `Task` = nossas tarefas do Notion/ClickUp
- Conceito de `Process` = nossos workflows

**Exemplo (Python) que vamos portar para TS:**
```python
from crewai import Agent, Task, Crew

# Nossos 9 agentes seriam assim:
ops_agent = Agent(
    role='Gestor de Projetos',
    goal='Garantir 100% entregas no prazo',
    backstory='Você é o OpsAgent da Lumiere...',
    verbose=True
)

contract_task = Task(
    description='Gerar contrato a partir da proposta',
    agent=contract_agent
)

crew = Crew(
    agents=[ops_agent, contract_agent, ...],
    tasks=[contract_task, ...],
    process=Process.sequential  # ou hierarchical
)
```

**RECOMENDAÇÃO:** Criar `LumiereCrew.ts` baseado nos padrões do CrewAI

---

### 4. **Superagent** ⭐⭐⭐⭐ (TypeScript Nativo)
- **Repo**: https://github.com/superagent-ai/superagent
- **Stars**: ~5k+
- **Linguagem**: TypeScript
- **Licença**: MIT

**O que oferece:**
- ✅ Agent workflows em TypeScript puro
- ✅ API-first design
- ✅ Integration com múltiplos LLMs
- ✅ UI dashboard incluso
- ✅ Vector store integration

**VANTAGEM PRINCIPAL:**
Já é TypeScript, fácil integração direta sem precisar portar de Python.

**Podemos clonar:**
- Estrutura de definição de agentes
- Sistema de workflows
- Dashboard de monitoramento

**Exemplo:**
```typescript
import { Agent } from "@superagent/core";

const opsAgent = new Agent({
  name: "OpsAgent",
  model: "gpt-4",
  prompt: "Você é o gestor de projetos...",
  tools: [notionTool, clickupTool]
});
```

---

### 5. **LangGraph** ⭐⭐⭐⭐⭐ (PARA ORQUESTRAÇÃO)
- **Repo**: https://github.com/langchain-ai/langgraph
- **Stars**: ~8k+
- **Linguagem**: Python / TypeScript
- **Licença**: MIT

**O que oferece:**
- ✅ Graph-based agent workflows
- ✅ State management
- ✅ Cycles and branching
- ✅ Persistence (checkpoints)
- ✅ Human-in-the-loop nodes

**POR QUE É ESSENCIAL:**
Nosso fluxo de 9 agentes É UM GRAFO:
```
ContractAgent → OpsAgent → CSAgent → SMAgent
                                      ↓
                    CopyAgent ←→ DesignAgent ←→ VideoAgent
                                      ↓
                                   AdsAgent
                                      ↓
                                 FinanceAgent
```

**Podemos implementar:**
```typescript
import { StateGraph, END } from "@langchain/langgraph";

// Definir estado compartilhado
interface AgentState {
  projectId: string;
  clientData: Client;
  deliverables: Deliverable[];
  messages: Message[];
}

// Criar grafo
const workflow = new StateGraph<AgentState>({
  channels: {
    messages: { reducer: (x, y) => x.concat(y) }
  }
});

// Adicionar nodes (nossos agentes)
workflow.addNode("opsAgent", opsAgentNode);
workflow.addNode("smAgent", smAgentNode);
workflow.addNode("copyAgent", copyAgentNode);

// Definir arestas (fluxo)
workflow.addEdge("opsAgent", "smAgent");
workflow.addConditionalEdges("smAgent", selectProductionAgent);
```

---

### 6. **Mastra AI** ⭐⭐⭐ (Emergente)
- **Repo**: https://github.com/mastra-ai/mastra
- **Stars**: ~2k+
- **Linguagem**: TypeScript
- **Licença**: MIT

**O que oferece:**
- ✅ Agent framework TS-native
- ✅ Workflow engine
- ✅ RAG built-in
- ✅ Observability dashboard
- ✅ Vector store integration

**VANTAGEM:** Mais novo, mas desenhado do zero para TypeScript moderno.

---

### 7. **Vercel AI SDK** ⭐⭐⭐⭐⭐ (PARA UI)
- **Repo**: https://github.com/vercel/ai
- **Stars**: ~20k+
- **Linguagem**: TypeScript / React
- **Licença**: Apache 2.0

**O que oferece:**
- ✅ `useChat` hook para interfaces de chat
- ✅ `useCompletion` hook para autocomplete
- ✅ Streaming responses
- ✅ Multiple providers (OpenAI, Anthropic, etc.)
- ✅ Edge runtime support

**PERFEITO PARA:**
- Interface de chat com cada agente
- Streaming de respostas em tempo real
- UI de acompanhamento de workflows

**Exemplo:**
```typescript
import { useChat } from "ai/react";

function AgentChat({ agentId }: { agentId: string }) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: `/api/agents/${agentId}/chat`
  });
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.role}: {m.content}</div>
      ))}
    </div>
  );
}
```

---

### 8. **Dify.AI** ⭐⭐⭐⭐ (PARA CLONAR UI)
- **Repo**: https://github.com/langgenius/dify
- **Stars**: ~30k+
- **Linguagem**: Python / TypeScript
- **Licença**: Apache 2.0

**O que oferece:**
- ✅ Visual workflow builder (drag-and-drop)
- ✅ Agent orchestration UI
- ✅ RAG pipeline builder
- ✅ API deployment
- ✅ Dashboard de analytics

**PODEMOS CLONAR:**
- Componentes React do workflow builder
- UI de configuração de agentes
- Dashboard de monitoramento

---

### 9. **Flowise** ⭐⭐⭐⭐⭐ (PARA CLONAR EDITOR VISUAL)
- **Repo**: https://github.com/FlowiseAI/Flowise
- **Stars**: ~25k+
- **Linguagem**: TypeScript
- **Licença**: Apache 2.0

**O que oferece:**
- ✅ Drag-and-drop UI para fluxos de agentes
- ✅ LangChain integration
- ✅ Custom nodes
- ✅ API export
- ✅ Marketplace de templates

**ESSENCIAL CLONAR:**
- Editor visual baseado em React Flow
- Sistema de custom nodes
- Export/import de workflows

---

## 🎨 COMPONENTES UI - REPOSITÓRIOS PARA CLONAR

### 1. **React Flow** ⭐⭐⭐⭐⭐ (ESSENCIAL)
- **Repo**: https://github.com/wbkd/react-flow
- **Site**: https://reactflow.dev/
- **Stars**: ~25k+
- **Licença**: MIT

**O que oferece:**
- ✅ Node-based editor
- ✅ Drag-and-drop workflows
- ✅ Custom nodes e edges
- ✅ Zoom e pan
- ✅ Minimap
- ✅ Controls
- ✅ Background patterns

**PERFEITO PARA:**
- Editor visual dos workflows dos 9 agentes
- Visualização do fluxo de produção
- Debug de execução em tempo real

**Instalação:**
```bash
npm install reactflow
```

**Exemplo de uso:**
```typescript
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';

function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Nodes representam nossos agentes
  const initialNodes = [
    { id: 'ops', type: 'agentNode', position: { x: 0, y: 0 }, data: { label: 'OpsAgent' } },
    { id: 'sm', type: 'agentNode', position: { x: 250, y: 0 }, data: { label: 'SMAgent' } },
    { id: 'copy', type: 'agentNode', position: { x: 250, y: 100 }, data: { label: 'CopyAgent' } },
  ];
  
  // Edges representam o fluxo de trabalho
  const initialEdges = [
    { id: 'e1', source: 'ops', target: 'sm' },
    { id: 'e2', source: 'sm', target: 'copy' },
  ];
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
```

**Custom Node para Agentes:**
```typescript
function AgentNode({ data, selected }: { data: AgentNodeData, selected: boolean }) {
  return (
    <div className={`agent-node ${selected ? 'selected' : ''}`}>
      <div className="agent-icon">{data.icon}</div>
      <div className="agent-name">{data.label}</div>
      <div className="agent-status">{data.status}</div>
      <div className="agent-metrics">
        <span>Tasks: {data.tasksCompleted}</span>
        <span>SLA: {data.slaCompliance}%</span>
      </div>
    </div>
  );
}
```

---

### 2. **Shadcn/ui** ⭐⭐⭐⭐⭐ (BASE DE COMPONENTES)
- **Repo**: https://github.com/shadcn-ui/ui
- **Site**: https://ui.shadcn.com/
- **Stars**: ~50k+
- **Licença**: MIT

**O que oferece:**
- ✅ Componentes React copy-paste
- ✅ Totalmente customizável
- ✅ Tailwind CSS
- ✅ Acessível (WAI-ARIA)
- ✅ Dark mode
- ✅ 40+ componentes

**PODEMOS COPIAR:**
- Buttons, Cards, Inputs, Dialogs
- Tables para listagem de projetos
- Forms para briefing
- Toasts para notificações
- Badges para status

**Instalação:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input dialog table
```

---

### 3. **Tremor** ⭐⭐⭐⭐⭐ (DASHBOARDS)
- **Repo**: https://github.com/tremorlabs/tremor
- **Site**: https://www.tremor.so/
- **Stars**: ~10k+
- **Licença**: MIT

**O que oferece:**
- ✅ Componentes para dashboards
- ✅ Charts (bar, line, area, donut)
- ✅ KPI cards
- ✅ Metric displays
- ✅ Time series

**PERFEITO PARA:**
- Dashboard de monitoramento dos 9 agentes
- KPIs em tempo real (entregas no prazo, NPS, ROAS)
- Gráficos de performance

**Exemplo:**
```typescript
import { Card, Title, BarChart, Metric } from "@tremor/react";

function AgentDashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <Title>Entregas no Prazo</Title>
        <Metric>97%</Metric>
      </Card>
      
      <BarChart
        data={agentMetrics}
        index="agent"
        categories={["tasksCompleted", "slaCompliance"]}
      />
    </div>
  );
}
```

---

### 4. **Aceternity UI** ⭐⭐⭐⭐ (ANIMAÇÕES)
- **Site**: https://ui.aceternity.com/
- **Repo**: https://github.com/hiteshchoudhary/aceternity
- **Licença**: MIT

**O que oferece:**
- ✅ Animações impressionantes
- ✅ Hero sections
- ✅ Cards animados
- ✅ Background effects
- ✅ Gradients e glows

**PODEMOS USAR:**
- Efeitos visuais no dashboard
- Cards de agentes com hover effects
- Background animado

---

### 5. **Nivo** ⭐⭐⭐⭐ (GRÁFICOS AVANÇADOS)
- **Repo**: https://github.com/plouc/nivo
- **Site**: https://nivo.rocks/
- **Stars**: ~10k+
- **Licença**: MIT

**O que oferece:**
- ✅ Gráficos React ricos
- ✅ Time series
- ✅ Heatmaps
- ✅ Network graphs (PERFEITO para visualizar fluxo entre agentes!)
- ✅ Sankey diagrams

**Exemplo - Network Graph dos Agentes:**
```typescript
import { ResponsiveNetwork } from '@nivo/network';

function AgentNetwork() {
  return (
    <ResponsiveNetwork
      data={{
        nodes: [
          { id: 'ops', label: 'OpsAgent' },
          { id: 'contract', label: 'ContractAgent' },
          // ... todos os 9 agentes
        ],
        links: [
          { source: 'contract', target: 'ops' },
          { source: 'ops', target: 'cs' },
          // ... todas as conexões
        ]
      }}
      nodeSize={20}
      linkDistance={100}
    />
  );
}
```

---

### 6. **Mantine** ⭐⭐⭐⭐ (COMPONENTES COMPLETOS)
- **Repo**: https://github.com/mantinedev/mantine
- **Site**: https://mantine.dev/
- **Stars**: ~20k+
- **Licença**: MIT

**O que oferece:**
- ✅ 100+ componentes
- ✅ Hooks utilitários
- ✅ Theme system
- ✅ Dark mode
- ✅ Notifications
- ✅ Modals

---

### 7. **Refine** ⭐⭐⭐⭐ (PAINÉIS ADMIN)
- **Repo**: https://github.com/refinedev/refine
- **Site**: https://refine.dev/
- **Stars**: ~20k+
- **Licença**: MIT

**O que oferece:**
- ✅ Admin panels
- ✅ CRUD interfaces
- ✅ Real-time updates
- ✅ Audit logs
- ✅ Access control

**PODEMOS USAR:**
- Estrutura do painel de gestão dos agentes
- CRUD de clientes e projetos
- Logs de auditoria

---

## 🏗️ ARQUITETURAS DE REFERÊNCIA

### 1. **21st.dev** (PADRÕES MODERNOS)
- **Site**: https://21st.dev/
- **O que oferece:**
  - Design systems
  - Component patterns
  - Best practices
  - Code snippets

---

### 2. **AI Engineering Patterns**
- **Repo**: https://github.com/kaarthik108/ai-engineering-patterns
- **O que oferece:**
  - Agent design patterns
  - Orchestration examples
  - Error handling
  - Retry mechanisms

---

## 📋 ESTRATÉGIA RECOMENDADA

### FASE 1: Fundação (Semana 1-2)

**1.1 Instalar dependências base:**
```bash
# Framework de agentes
npm install langchain @langchain/core @langchain/community

# UI Components
npm install reactflow @tremor/react @radix-ui/react-dialog
npx shadcn-ui@latest init

# Vercel AI SDK para streaming
npm install ai @ai-sdk/openai
```

**1.2 Criar estrutura de diretórios:**
```
/workspace
├── services/agents/
│   ├── core/
│   │   ├── BaseAgent.ts           (inspirado em CrewAI + LangChain)
│   │   ├── AgentOrchestrator.ts   (inspirado em LangGraph)
│   │   ├── AgentState.ts          (estado compartilhado)
│   │   └── types.ts               (tipos TypeScript)
│   ├── lumiere/
│   │   ├── OpsAgent.ts
│   │   ├── ContractAgent.ts
│   │   ├── CSAgent.ts
│   │   ├── SMAgent.ts
│   │   ├── CopyAgent.ts
│   │   ├── DesignAgent.ts
│   │   ├── VideoAgent.ts
│   │   ├── AdsAgent.ts
│   │   └── FinanceAgent.ts
│   ├── tools/
│   │   ├── NotionTool.ts
│   │   ├── ClickUpTool.ts
│   │   ├── MetaAdsTool.ts
│   │   └── ...
│   └── workflows/
│       ├── contentProduction.ts
│       ├── contractManagement.ts
│       └── ...
├── components/agents/
│   ├── dashboard/
│   │   ├── AgentDashboard.tsx     (usando Tremor)
│   │   ├── KPICards.tsx
│   │   └── AgentMetrics.tsx
│   ├── workflow-editor/
│   │   ├── WorkflowEditor.tsx     (usando React Flow)
│   │   ├── AgentNode.tsx
│   │   └── WorkflowControls.tsx
│   ├── chat/
│   │   ├── AgentChat.tsx          (usando Vercel AI SDK)
│   │   └── MessageList.tsx
│   └── shared/
│       ├── AgentCard.tsx          (usando Shadcn)
│       └── StatusBadge.tsx
├── hooks/
│   ├── useAgent.ts
│   ├── useWorkflow.ts
│   └── useMetrics.ts
└── pages/
    ├── agents/
    │   └── [agentId].tsx
    └── workflows/
        └── [workflowId].tsx
```

---

### FASE 2: Implementação dos 9 Agentes (Semana 3-4)

**2.1 Começar pelo Core:**
```typescript
// services/agents/core/BaseAgent.ts
import { BaseLanguageModel } from "@langchain/core/language_models/base";

export abstract class BaseAgent {
  protected name: string;
  protected role: string;
  protected goal: string;
  protected backstory: string;
  protected llm: BaseLanguageModel;
  
  constructor(config: AgentConfig) {
    this.name = config.name;
    this.role = config.role;
    this.goal = config.goal;
    this.backstory = config.backstory;
    this.llm = config.llm;
  }
  
  abstract execute(input: AgentInput): Promise<AgentOutput>;
  
  protected async callLLM(prompt: string): Promise<string> {
    const response = await this.llm.invoke(prompt);
    return response.toString();
  }
}
```

**2.2 Implementar OpsAgent (primeiro):**
```typescript
// services/agents/lumiere/OpsAgent.ts
import { BaseAgent } from "../core/BaseAgent";
import { NotionTool } from "../tools/NotionTool";
import { ClickUpTool } from "../tools/ClickUpTool";

export class OpsAgent extends BaseAgent {
  private notionTool: NotionTool;
  private clickupTool: ClickUpTool;
  
  constructor(llm: BaseLanguageModel) {
    super({
      name: "OpsAgent",
      role: "Gestor de Projetos e Operações",
      goal: "Garantir que 100% dos projetos sejam entregues no prazo",
      backstory: "Você é o centro nervoso da Lumiere Agency...",
      llm
    });
    
    this.notionTool = new NotionTool();
    this.clickupTool = new ClickUpTool();
  }
  
  async execute(input: OpsInput): Promise<OpsOutput> {
    // Passo 1: Criar projeto no Notion
    const project = await this.notionTool.createProject(input.contract);
    
    // Passo 2: Decompor escopo em tarefas
    const tasks = await this.decomposeScope(input.scope);
    
    // Passo 3: Atribuir tarefas no ClickUp
    await this.clickupTool.assignTasks(tasks);
    
    return { projectId: project.id, tasks };
  }
}
```

**2.3 Implementar os outros 8 agentes seguindo o mesmo pattern**

---

### FASE 3: Orquestração com LangGraph (Semana 5)

```typescript
// services/agents/core/LumiereOrchestrator.ts
import { StateGraph, END } from "@langchain/langgraph";
import { AgentState } from "./AgentState";

export class LumiereOrchestrator {
  private workflow: StateGraph<AgentState>;
  
  constructor() {
    this.workflow = new StateGraph<AgentState>({
      channels: {
        messages: { reducer: (x, y) => x.concat(y) },
        currentAgent: { value: null }
      }
    });
    
    this.setupAgents();
    this.setupFlows();
  }
  
  private setupAgents() {
    // Adicionar cada agente como um node
    this.workflow.addNode("opsAgent", this.opsAgentNode.bind(this));
    this.workflow.addNode("contractAgent", this.contractAgentNode.bind(this));
    this.workflow.addNode("csAgent", this.csAgentNode.bind(this));
    this.workflow.addNode("smAgent", this.smAgentNode.bind(this));
    this.workflow.addNode("copyAgent", this.copyAgentNode.bind(this));
    this.workflow.addNode("designAgent", this.designAgentNode.bind(this));
    this.workflow.addNode("videoAgent", this.videoAgentNode.bind(this));
    this.workflow.addNode("adsAgent", this.adsAgentNode.bind(this));
    this.workflow.addNode("financeAgent", this.financeAgentNode.bind(this));
  }
  
  private setupFlows() {
    // Fluxo principal: Contrato → Ops → CS → SM → Produção
    this.workflow.setEntryPoint("contractAgent");
    this.workflow.addEdge("contractAgent", "opsAgent");
    this.workflow.addEdge("opsAgent", "csAgent");
    this.workflow.addEdge("csAgent", "smAgent");
    
    // Produção paralela
    this.workflow.addConditionalEdges("smAgent", this.selectProductionPath.bind(this));
    this.workflow.addEdge("copyAgent", "videoAgent");
    this.workflow.addEdge("designAgent", "adsAgent");
    this.workflow.addEdge("videoAgent", "adsAgent");
    
    // Finalização
    this.workflow.addEdge("adsAgent", "financeAgent");
    this.workflow.addEdge("financeAgent", END);
  }
  
  private selectProductionPath(state: AgentState): string {
    // Decide qual caminho de produção seguir baseado no tipo de conteúdo
    if (state.contentType === "video") {
      return ["copyAgent", "videoAgent"];
    } else if (state.contentType === "design") {
      return ["designAgent"];
    }
    return ["copyAgent", "designAgent"];
  }
  
  async run(initialState: AgentState): Promise<AgentState> {
    const app = this.workflow.compile();
    const result = await app.invoke(initialState);
    return result;
  }
}
```

---

### FASE 4: UI Components (Semana 6-7)

**4.1 Dashboard com Tremor:**
```typescript
// components/agents/dashboard/AgentDashboard.tsx
import { Card, Title, Metric, BarChart, Grid } from "@tremor/react";

export function AgentDashboard() {
  return (
    <Grid numItemsSm={2} numItemsLg={3} className="gap-4">
      {/* KPI Cards */}
      <Card>
        <Title>Entregas no Prazo</Title>
        <Metric>97%</Metric>
      </Card>
      
      <Card>
        <Title>NPS Médio</Title>
        <Metric>8.7</Metric>
      </Card>
      
      <Card>
        <Title>Receita Mensal</Title>
        <Metric>R$ 145k</Metric>
      </Card>
      
      {/* Chart de Performance por Agente */}
      <Card className="col-span-2">
        <Title>Performance por Agente</Title>
        <BarChart
          data={agentPerformanceData}
          index="agent"
          categories={["tasksCompleted", "slaCompliance", "qualityScore"]}
        />
      </Card>
    </Grid>
  );
}
```

**4.2 Editor de Workflows com React Flow:**
```typescript
// components/agents/workflow-editor/WorkflowEditor.tsx
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import { AgentNode } from './AgentNode';

const nodeTypes = {
  agentNode: AgentNode
};

export function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  return (
    <div className="w-full h-[600px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls />
        <MiniMap nodeStrokeColor={(n) => getNodeColor(n)} />
      </ReactFlow>
    </div>
  );
}
```

**4.3 Chat com Agente usando Vercel AI SDK:**
```typescript
// components/agents/chat/AgentChat.tsx
import { useChat } from "ai/react";

export function AgentChat({ agentId }: { agentId: string }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `/api/agents/${agentId}/chat`,
    streamProtocol: "data"
  });
  
  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem..."
          className="w-full p-2 border rounded"
        />
      </form>
    </div>
  );
}
```

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Escolher stack principal:**
   - ✅ LangChain.js + LangGraph (orquestração)
   - ✅ React Flow (editor visual)
   - ✅ Tremor (dashboard)
   - ✅ Shadcn/ui (componentes base)
   - ✅ Vercel AI SDK (streaming/chat)

2. **Instalar dependências:**
   ```bash
   npm install langchain @langchain/core @langchain/community
   npm install @langchain/langgraph
   npm install reactflow
   npm install @tremor/react
   npm install ai @ai-sdk/openai
   npx shadcn-ui@latest init
   ```

3. **Criar estrutura de diretórios** (como mostrado acima)

4. **Implementar BaseAgent** (inspirado em CrewAI + LangChain)

5. **Implementar OpsAgent** (primeiro dos 9)

6. **Criar Orchestrator com LangGraph**

7. **Implementar UI components** (Dashboard + Workflow Editor)

---

## 📚 RECURSOS ADICIONAIS

- **CrewAI Documentation**: https://docs.crewai.com/
- **LangChain.js Docs**: https://js.langchain.com/docs/
- **React Flow Docs**: https://reactflow.dev/docs/
- **Tremor Docs**: https://www.tremor.so/docs/
- **Vercel AI SDK**: https://sdk.vercel.ai/docs

---

**Documento criado:** 2025-04-15
**Versão:** 1.0
**Status:** Pronto para implementação
