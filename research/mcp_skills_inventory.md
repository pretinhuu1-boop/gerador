# Inventário de MCPs e Skills para Higgsfield AI

## 🌐 MCP Browser Automation

### Camofox Browse
**Repositório:** github.com/camofox/browser
**Funcionalidades:**
- Anti-detect browser para automação web
- Fingerprint spoofing
- Multi-profile management
- Integração com Puppeteer/Playwright

**Casos de uso Lumiere:**
- Pesquisa de tendências por agente (CopyAgent, SMAgent)
- Coleta de métricas de concorrentes
- Verificação de publicações ao vivo
- Download de referências visuais

### Playwright MCP
**Repositório:** modelcontextprotocol/servers/tree/main/src/playwright
**Funcionalidades:**
- Navegação headless/full-browser
- Screenshots automáticos
- Extração de conteúdo estruturado
- Interação com formulários

### Puppeteer MCP
**Repositório:** modelcontextprotocol/servers/tree/main/src/puppeteer
**Similar ao Playwright com foco em Chrome**

---

## 🧠 MCP Memory Systems

### GSD (Getting Shit Done)
**Repositório:** github.com/ModelContextProtocol/servers/tree/main/src/gsd
**Funcionalidades:**
- Task management integrado
- Priorização automática
- Tracking de progresso
- Integração com calendário

**Casos de uso Lumiere:**
- OpsAgent: gestão de tarefas do projeto
- CSAgent: follow-up de aprovações
- Todos agentes: tracking de deadlines

### Memory Palace
**Conceito:** Sistema de memória de longo prazo estruturada
**Implementação sugerida:**
- Vector database (Pinecone/Weaviate)
- Chunking estratégico de contextos
- Recall baseado em similaridade
- Hierarquia de memórias (curto/longo prazo)

**Casos de uso Lumiere:**
- Briefing master de cada cliente
- Histórico de decisões criativas
- Lições aprendidas por projeto
- Preferências de estilo por cliente

---

## 🛠️ MCP Universal Tools

### CLI Anything
**Repositório:** github.com/ModelContextProtocol/servers/tree/main/src/cli
**Funcionalidades:**
- Execução segura de comandos shell
- Sandbox para scripts
- Output streaming
- Error handling

**Casos de uso Lumiere:**
- VideoAgent: renderização FFmpeg
- DesignAgent: processamento ImageMagick
- FinanceAgent: geração de PDFs
- OpsAgent: scripts de automação

### MCP Anything
**Conceito:** Adaptador universal para qualquer API/ferramenta
**Permite conectar:**
- APIs REST/SOAP
- Bancos de dados
- Sistemas legados
- Webhooks

---

## 🎨 UI & Visualização

### Awesome Agents 3D (3dsvg.design)
**Repositório:** github.com/3dsvg/awesome-agents-3d
**Funcionalidades:**
- Visualização 3D de workflows
- Agentes como objetos 3D interativos
- Animações de transição de estado
- Export para vídeo/imagem

**Componentes clonáveis:**
- AgentNode3D.tsx - Nodo 3D de agente
- WorkflowCanvas3D.tsx - Canvas principal
- StateAnimator.ts - Sistema de animação
- CameraController.ts - Controles de câmera

### Graphify
**Repositório:** github.com/graphify-viz/graphify
**Funcionalidades:**
- Visualização de grafos complexos
- Layout automático (force-directed, hierarchical)
- Zoom/pan interativo
- Real-time updates

**Casos de uso Lumiere:**
- Mapa de dependências entre agentes
- Fluxo de dados em tempo real
- Identificação de gargalos
- Métricas de performance visual

### GBrain
**Repositório:** github.com/gbrain-ai/gbrain
**Funcionalidades:**
- Visualização de chain-of-thought
- Debug de decisões de agentes
- Tree view de raciocínio
- Highlight de pontos críticos

**Casos de uso Lumiere:**
- Debug de CreativeDirectorAgent
- Análise de decisões do AdsAgent
- Auditoria de ContractAgent
- Training de novos agentes

---

## 🎬 Motion & Video

### Frame Motion
**Repositório:** github.com/framer/motion
**Funcionalidades:**
- Biblioteca de animação React
- Gestos e interações
- Layout animations
- Shared element transitions

**Casos de uso Lumiere:**
- Transições suaves entre estados
- Feedback visual de ações
- Loading states animados
- Micro-interações de UI

### Remotion
**Repositório:** github.com/remotion-dev/remotion
**Funcionalidades:**
- Criação de vídeos com React
- Programmatic video generation
- Timeline-based animations
- Export MP4/WebM

**Casos de uso Lumiere:**
- Relatórios mensais em vídeo automáticos
- Recap de campanhas para clientes
- Highlights de performance
- Demo reels de projetos

---

## 🔗 Integração Higgsfield AI

### Higgsfield SDK
**Documentação:** higgsfield.ai/docs
**Funcionalidades necessárias:**
- Remote agent execution
- Result streaming via WebSocket
- File upload/download
- Authentication/authorization

### MCP Server para Higgsfield
**Estrutura proposta:**
```typescript
// mcp-higgsfield-server.ts
import { MCPServer } from '@modelcontextprotocol/sdk';
import { HiggsfieldClient } from '@higgsfield/sdk';

export class HiggsfieldMCP extends MCPServer {
  async executeAgent(agentId: string, input: any) {
    // Executa agente remoto no Higgsfield
  }
  
  async streamResults(sessionId: string) {
    // Stream de resultados em tempo real
  }
  
  async uploadFile(file: Buffer, metadata: any) {
    // Upload de arquivos para o Higgsfield
  }
}
```

---

## 📦 PACOTE DE INSTALAÇÃO RECOMENDADO

```bash
# MCP Core
npm install @modelcontextprotocol/sdk
npm install @mcp/browser
npm install @mcp/memory
npm install @mcp/cli

# Browser Automation
npm install camofox
npm install playwright
npm install puppeteer

# UI Components
npm install @reactflow/core
npm install @3dsvg/agents-3d
npm install graphify
npm install gbrain

# Motion & Video
npm install framer-motion
npm install @remotion/renderer
npm install @remotion/react

# Higgsfield Integration
npm install @higgsfield/sdk
npm install ws  # WebSocket support

# Memory & Vector
npm install pinecone-client
npm install @langchain/community  # vector stores
```

---

## 🎯 PRIORIZAÇÃO DE IMPLEMENTAÇÃO

### Semana 1 - Fundação
- [ ] Setup MCP Server base
- [ ] Integrar Playwright MCP (browser)
- [ ] Implementar GSD (task management)
- [ ] Criar Hello World agent com MCP

### Semana 2 - UI Básica
- [ ] Clonar React Flow components
- [ ] Integrar Graphify visualization
- [ ] Adicionar Frame Motion animations
- [ ] Dashboard básico de status

### Semana 3 - Advanced UI
- [ ] Implementar 3dsvg agents
- [ ] Integrar GBrain debugging
- [ ] Criar Remotion report generator
- [ ] Real-time updates via WebSocket

### Semana 4 - Higgsfield Integration
- [ ] Setup Higgsfield SDK
- [ ] Remote execution working
- [ ] Streaming de resultados
- [ ] File transfer bidirecional

---

## 🔍 REPOSITÓRIOS PARA CLONAR/ANALISAR

1. **Agent Frameworks:**
   - github.com/workerkit/agent-bright-bean
   - github.com/meta-harness/core
   - github.com/modelcontextprotocol/servers

2. **UI Components:**
   - github.com/3dsvg/awesome-agents-3d
   - github.com/graphify-viz/graphify
   - github.com/gbrain-ai/gbrain
   - github.com/remotion-dev/remotion

3. **Browser & Automation:**
   - github.com/camofox/browser
   - github.com/microsoft/playwright
   - github.com/puppeteer/puppeteer

4. **Memory & Tools:**
   - github.com/ModelContextProtocol/servers/tree/main/src/gsd
   - github.com/ModelContextProtocol/servers/tree/main/src/memory
   - github.com/pinecone-io/pinecone-ts-client
