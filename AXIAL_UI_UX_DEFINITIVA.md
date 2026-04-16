# 🎨 AXIAL AI CREATIVE OS - UI/UX DEFINITIVA

## VISÃO GERAL DO SISTEMA

O AXIAL AI Creative OS é um **Sistema Operacional Criativo** onde 9 agentes especializados operam de forma autônoma, criando conteúdo visual diretamente na plataforma usando tecnologias nativas (Remotion, Framer Motion, 3dsvg) e integrando-se com o mundo externo via MCPs.

---

## 🏗️ ARQUITETURA DE UI EM 5 CAMADAS

### CAMADA 0: FUNDAÇÃO (Invisível ao usuário)
**Tecnologias:** LangChain.js + LangGraph + MCP Server + Higgsfield AI

- **Orquestração:** LangGraph gerencia estado e transições entre agentes
- **MCP Server:** Bridge para browser automation, memória e ferramentas externas
- **Higgsfield:** Execução remota de agentes e streaming de resultados
- **Memória:** GSD (tasks) + Memory Palace (long-term) + Vector Store

### CAMADA 1: DASHBOARD EXECUTIVO (Visão do Gestor)
**Tecnologias:** Tremor + Shadcn/ui + Graphify

**Componentes:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo AXIAL]  │  Projetos Ativos  │  Alertas  │  User    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 MÉTRICAS EM TEMPO REAL                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 42       │ │ 96.3%    │ │ 8.7      │ │ R$ 482K │      │
│  │ Projetos │ │ No Prazo │ │ NPS      │ │ MRR     │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ⚠️ ALERTAS PRIORITÁRIOS (P1-P4)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 P1 | VideoAgent | Cliente: LuminaCafe           │   │
│  │    Material bruto inviável - requer refilmagem      │   │
│  │    [Ver Detalhes] [Escalar Humano]                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🟡 P2 | AdsAgent | Campanha reprovada Meta         │   │
│  │    Aguardando revisão humana                        │   │
│  │    [Ver Detalhes] [Reenviar]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📈 WORKFLOWS ATIVOS                                        │
│  [████████░░] SMAgent → CopyAgent → DesignAgent (78%)      │
│  [███░░░░░░░] ContractAgent → OpsAgent (32%)               │
│  [██████████] FinanceAgent (100%) ✅                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Cards de métricas atualizados em tempo real (Tremor)
- Lista de alertas com filtro por prioridade (P1/P2/P3/P4)
- Barras de progresso de workflows (Shadcn Progress)
- Gráficos de performance semanal/mensal (Graphify)

---

### CAMADA 2: WORKFLOW VISUAL INTERATIVO
**Tecnologias:** React Flow + 3dsvg.design + Framer Motion + GBrain

**Componentes:**
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Buscar projeto...        │  Zoom: [-] 100% [+]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         ┌─────────────┐                                    │
│         │ ContractAgent│                                   │
│         │   ✅ Done   │                                   │
│         └──────┬──────┘                                    │
│                │ Framer Motion                             │
│                ▼                                            │
│         ┌─────────────┐                                    │
│         │  OpsAgent   │───┐                                │
│         │  🔄 Running │   │ 3dsvg (3D connection)          │
│         └──────┬──────┘   │                                │
│                │          │                                │
│        ┌───────┼───────┐ │                                │
│        ▼       ▼       ▼ │                                │
│   ┌────────┐ ┌────────┐ ┌────────┐                        │
│   │CSAgent │ │SMAgent │ │Finance │                        │
│   │ 🔄 Run │ │ ⏳ Wait │ │ ✅ Done│                        │
│   └───┬────┘ └───┬────┘ └────────┘                        │
│       │          │                                         │
│       │    ┌─────┴─────┐                                  │
│       │    ▼           ▼                                  │
│       │ ┌────────┐ ┌────────┐                            │
│       └─►│CopyAgent│ │DesignAgent│                         │
│         │ 🔄 Run │ │ ⏳ Wait │                            │
│         └───┬────┘ └───┬────┘                            │
│             │          │                                   │
│             └────┬─────┘                                   │
│                  ▼                                          │
│            ┌──────────┐                                    │
│            │VideoAgent│                                    │
│            │  ⏳ Wait │                                    │
│            └────┬─────┘                                    │
│                 │                                           │
│                 ▼                                           │
│            ┌──────────┐                                    │
│            │AdsAgent  │                                    │
│            │  ⏳ Wait │                                    │
│            └──────────┘                                    │
│                                                             │
│  Legenda: 🔄 Running  ⏳ Waiting  ✅ Done  ❌ Error        │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- **React Flow:** Canvas interativo com zoom, pan, drag
- **3dsvg.design:** Conexões 3D animadas entre agentes
- **Framer Motion:** Animações suaves de transição de estado
- **GBrain:** Overlay de chain-of-thought ao clicar em agente
- **Minimapa:** Navegação rápida em workflows grandes

**Interações:**
- **Click em agente:** Abre painel lateral com detalhes
- **Double-click:** Expande sub-tasks do agente
- **Drag & Drop:** Reordenar prioridades manualmente
- **Hover:** Preview rápido do status atual

---

### CAMADA 3: PAINEL DE DETALHES DO AGENTE
**Tecnologias:** Shadcn/ui + GBrain + Remotion Preview

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  VideoAgent - Edição de Vídeo                    [Fechar X]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 BRIEFING                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cliente: LuminaCafe                                 │   │
│  │ Projeto: Reel Abril 2025                            │   │
│  │ Formato: Instagram Reels (1080x1920, 30fps)         │   │
│  │ Duração: 30 segundos                                │   │
│  │ Entrega: 2025-04-15                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎬 ESPECIFICAÇÕES TÉCNICAS                                 │
│  • Hook: Primeiros 3s com movimento dinâmico               │
│  • Trilha: Trending audio do Instagram                     │
│  • Textos on-screen: Fonte Montserrat, zona segura         │
│  • Color grading: LUT "Warm Coffee" do cliente             │
│  • Áudio: Voz -12dB, Trilha -18dB                          │
│                                                             │
│  ⏱️ STATUS & PROGRESSO                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Materiais brutos      │ ✅ Recebidos (1080p)       │   │
│  │ Roteiro               │ ✅ Aprovado                 │   │
│  │ Timeline              │ 🔄 Renderizando (67%)       │   │
│  │ Color grading         │ ⏳ Aguardando               │   │
│  │ Textos on-screen      │ ⏳ Aguardando               │   │
│  │ Mixagem de áudio      │ ⏳ Aguardando               │   │
│  │ Exportação            │ ⏳ Aguardando               │   │
│  │ QA Mobile             │ ⏳ Aguardando               │   │
│  └─────────────────────────────────────────────────────┘   │
│  Tempo restante estimado: 8 minutos                        │
│                                                             │
│  🧠 CHAIN OF THOUGHT (GBrain)                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [14:32:15] Analisando materiais brutos...           │   │
│  │ [14:32:18] ✓ Resolução OK (1080p), iluminação boa   │   │
│  │ [14:32:20] ✓ Áudio limpo, sem ruídos                │   │
│  │ [14:32:22] Lendo roteiro... 5 cenas identificadas   │   │
│  │ [14:32:25] Selecionando trilha trending #4521       │   │
│  │ [14:32:28] ✓ Licença comercial verificada           │   │
│  │ [14:32:30] Iniciando montagem da timeline...        │   │
│  │ [14:33:45] Cena 1 sincronizada com batida da música  │   │
│  │ [14:34:12] Aplicando LUT "Warm Coffee"...           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎥 PREVIEW (Remotion)                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │         [Preview do vídeo renderizando]             │   │
│  │         Frame atual: 00:00:18 / 00:00:30           │   │
│  │         ████████████░░░░░░░░░░ 60%                 │   │
│  │                                                     │   │
│  │  [◄◄] [▶] [►►]  [🔊 Volume]  [⛶ Fullscreen]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📝 LOG DE ATIVIDADES                                       │
│  • 14:32:10 - Tarefa iniciada pelo OpsAgent               │
│  • 14:32:15 - Materiais recebidos do Drive                │
│  • 14:32:22 - Roteiro recebido do CopyAgent               │
│  • 14:33:00 - Início da renderização Remotion             │
│  • 14:35:00 - Previsão de conclusão                        │
│                                                             │
│  [💬 Comentar] [⚠️ Reportar Problema] [👤 Escalar Humano]  │
└─────────────────────────────────────────────────────────────┘
```

---

### CAMADA 4: LISTA DE PROJETOS / KANBAN
**Tecnologias:** Shadcn/ui + Framer Motion (drag & drop)

**Visualização Kanban:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  📁 PROJETOS          │  🔍 Buscar...  │  Filtros: [▼]  │  View: █▤▦│
├──────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  📋 BACKLOG          │  🔄 EM PROGRESSO   │  👀 REVISÃO     │  ✅ CONCLUÍDO │
│  ┌────────────────┐  │  ┌────────────────┐│  ┌────────────┐  │  ┌────────┐ │
│  │ Novo Cliente   │  │  │ LuminaCafe   ││  │ TechStore  │  │  │BakeryCo│ │
│  │ - Contrato     │  │  │ - Reel Abril ││  │ - Campanha │  │  │ - Site │ │
│  │ - Onboarding   │  │  │ - Posts Maio ││  │  Ads Q2    │  │  │ ✅ Entregue││
│  └────────────────┘  │  │ - Branding   ││  └────────────┘  │  └────────┘ │
│                      │  │ 🟡 OpsAgent   ││  🟠 CSAgent    │  │  📅 2 dias │
│                      │  │ 🟢 CopyAgent  ││  ⏰ 1 dia      │  │  atrás    │
│                      │  │ 🔵 DesignAgent││                │  │           │
│                      │  └────────────────┘│                │  │           │
│                      │                    │                │  │           │
│                      │  ┌────────────────┐│                │  │           │
│                      │  │ FitLife Academy││                │  │           │
│                      │  │ - 8 Reels      ││                │  │           │
│                      │  │ - Landing Page ││                │  │           │
│                      │  │ 🟢 VideoAgent  ││                │  │           │
│                      │  │ 🔴 AdsAgent    ││                │  │           │
│                      │  │   (Campaign    ││                │  │           │
│                      │  │    rejected)   ││                │  │           │
│                      │  └────────────────┘│                │  │           │
│                                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

**Visualização Lista (alternativa):**
```
┌─────────────────────────────────────────────────────────────────────┐
│ Cliente          │ Projeto        │ Status  │ Prazo   │ Agentes    │
├─────────────────────────────────────────────────────────────────────┤
│ LuminaCafe       │ Reel Abril     │ 🟡 Risk │ 2 dias  │ 3/5 agents │
│ TechStore        │ Campanha Q2    │ 🟠 Wait │ 1 dia   │ 1/3 agents │
│ FitLife Academy  │ 8 Reels        │ 🔴 Err  │ 5 dias  │ 2/4 agents │
│ BakeryCo         │ Site Institucional│ ✅ Done│ 2d atrás│ 4/4 agents │
│ ...              │ ...            │ ...     │ ...     │ ...        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 FLUXOS DE USUÁRIO PRINCIPAIS

### FLUXO 1: GESTOR ACOMPANHA PROJETO EM TEMPO REAL

1. **Login** → Dashboard Executivo (Camada 1)
2. **Vê alerta P1** de VideoAgent no card de alertas
3. **Clica no alerta** → Abre Workflow Visual (Camada 2)
4. **Workflow mostra** VideoAgent com ícone 🔴
5. **Clica no VideoAgent** → Painel de Detalhes (Camada 3)
6. **Lê chain-of-thought:** "Material bruto com resolução 480p, abaixo do mínimo 1080p"
7. **Vê preview** do material bruto problemático
8. **Clica em [Escalar Humano]** → Modal abre
9. **Seleciona:** "Solicitar refilmagem ao cliente"
10. **CSAgent automaticamente:** Envia WhatsApp ao cliente explicando situação
11. **Workflow atualiza:** VideoAgent muda para ⏳ Waiting (aguardando novo material)
12. **Gestor retorna** ao Dashboard → Alerta P1 resolvido

### FLUXO 2: CLIENTE APROVA CONTEÚDO (PORTAL DO CLIENTE)

1. **Cliente recebe** link por WhatsApp (CSAgent)
2. **Acessa portal** white-labeled da Lumiere
3. **Vê lista** de conteúdos pendentes de aprovação
4. **Clica em "Reel Abril - v1"**
5. **Assiste preview** (Remotion player)
6. **Vê detalhes:** Roteiro, especificações, prazo de aprovação (48h)
7. **Opções:** [✅ Aprovar] [💬 Comentar] [⚠️ Solicitar Revisão]
8. **Cliente clica** em [💬 Comentar]
9. **Digita:** "Gostei, mas pode aumentar o volume da música?"
10. **Sistema registra:** Feedback enviado, notifica VideoAgent
11. **VideoAgent:** Ajusta áudio (-18dB → -15dB), re-renderiza
12. **Cliente recebe** notificação: "Nova versão disponível (v2)"
13. **Cliente assiste** v2 e clica [✅ Aprovar]
14. **Sistema marca:** Conteúdo aprovado, notifica OpsAgent e SMAgent
15. **SMAgent:** Agenda publicação automática

### FLUXO 3: AGENTE CRIA CONTEÚDO DO ZERO (END-TO-END)

1. **OpsAgent** cria projeto "TechStore - Campanha Q2"
2. **SMAgent** gera calendário editorial de Maio
3. **SMAgent** dispara briefing para CopyAgent: "Post sobre lançamento produto X"
4. **CopyAgent:**
   - Consulta briefing master no Memory Palace
   - Pesquisa tendências no nicho (via MCP Browser/Camofox)
   - Gera 2 versões de copy (Hook → Desenvolvimento → CTA)
   - Salva no Drive e notifica SMAgent
5. **SMAgent** dispara briefing para DesignAgent
6. **DesignAgent:**
   - Carrega manual de marca do cliente (3dsvg assets)
   - Seleciona banco de imagens (licenciadas)
   - Gera peça 1080x1350 no Figma (via API)
   - Aplica textos do CopyAgent
   - Exporta PNG e salva no Drive
7. **SMAgent** consolida copy + design
8. **CSAgent** envia para aprovação do cliente
9. **Cliente aprova** (ver Fluxo 2)
10. **SMAgent** agenda publicação (Meta API)
11. **OpsAgent** registra entrega concluída
12. **FinanceAgent** fatura se for extra

---

## 🎨 SISTEMA DE DESIGN

### Paleta de Cores
```
Primárias:
- Axial Blue: #3B82F6 (confiança, tecnologia)
- Deep Space: #0F172A (fundo principal)
- Neural Purple: #8B5CF6 (IA, automação)

Status:
- Success: #10B981 (verde)
- Warning: #F59E0B (âmbar)
- Error: #EF4444 (vermelho)
- Info: #3B82F6 (azul)

Prioridades:
- P1 Critical: #DC2626 (vermelho intenso)
- P2 High: #EA580C (laranja)
- P3 Normal: #2563EB (azul)
- P4 Low: #6B7280 (cinza)
```

### Tipografia
```
Principal: Inter (UI, textos gerais)
Monospace: JetBrains Mono (logs, código, chain-of-thought)
Display: Space Grotesk (títulos, dashboard)
```

### Ícones
```
Lucide React (padrão Shadcn)
Custom SVGs para agentes (3dsvg.design)
Animações Framer Motion para transições de estado
```

---

## 🔧 COMPONENTES CLONÁVEIS

### Do Vercel AI SDK
- Chat interface com streaming
- Code block syntax highlighting
- Thinking process visualization

### Do React Flow
- Custom nodes para agentes
- Edge types animados
- Minimap e controls
- Background patterns

### Do Tremor
- Metric cards
- Area/Bar charts
- Progress bars
- Badge components

### Do Shadcn/ui
- Dialog, Sheet, Drawer
- Tabs, Accordion
- Table, Card
- Button, Input, Select
- Toast notifications

### Do 3dsvg.design
- 3D agent avatars
- Animated connections
- Interactive workflow nodes

### Do GBrain
- Chain-of-thought viewer
- Decision tree visualization
- Real-time thought streaming

### Do Remotion
- Video player customizado
- Timeline scrubber
- Render progress indicator
- Frame-by-frame preview

---

## 📱 RESPONSIVIDADE

### Desktop (1920px+)
- Todas as 5 camadas visíveis
- Workflow em tela cheia
- Múltiplos painéis laterais

### Tablet (768px-1919px)
- Dashboard em grid 2x2
- Workflow com zoom automático
- Painel lateral em drawer

### Mobile (até 767px)
- Dashboard em coluna única
- Workflow simplificado (lista)
- Painel de detalhes em tela cheia
- Ações principais em bottom sheet

---

## 🚀 TECNOLOGIAS POR CAMADA

| Camada | Tecnologias Principais | Bibliotecas Secundárias |
|--------|----------------------|------------------------|
| 0 - Fundação | LangChain.js, LangGraph, MCP Server | Higgsfield AI, Vector Store |
| 1 - Dashboard | Tremor, Shadcn/ui, Graphify | Recharts, Lucide Icons |
| 2 - Workflow | React Flow, 3dsvg.design, Framer Motion | D3.js, Three.js |
| 3 - Detalhes | Shadcn/ui, GBrain, Remotion | CodeMirror, Waveform Audio |
| 4 - Kanban | Shadcn/ui, Framer Motion | React Beautiful DnD |

---

## 🎯 PRÓXIMOS PASSOS - IMPLEMENTAÇÃO

### Semana 1-2: Fundação
- [ ] Setup LangChain.js + LangGraph
- [ ] Configurar MCP Server base
- [ ] Integrar Higgsfield AI
- [ ] Criar BaseAgent v2 com memória

### Semana 3-4: Dashboard + Workflow
- [ ] Clonar componentes Tremor/Shadcn
- [ ] Implementar React Flow com nodos customizados
- [ ] Adicionar 3dsvg connections
- [ ] Integrar Framer Motion animations

### Semana 5-6: Detalhes + Preview
- [ ] Criar painel de detalhes do agente
- [ ] Integrar GBrain chain-of-thought
- [ ] Implementar Remotion preview player
- [ ] Adicionar logs em tempo real

### Semana 7-8: Kanban + Integração
- [ ] Criar view Kanban com drag & drop
- [ ] Conectar todos os 9 agentes
- [ ] Implementar fluxos end-to-end
- [ ] Testes de usabilidade

### Semana 9-10: Refinamento
- [ ] Otimizar performance
- [ ] Adicionar responsividade mobile
- [ ] Criar documentação
- [ ] Deploy em produção

---

## 💡 IDEIAS DISRUPTIVAS

1. **Git para Vídeo:** Versionamento visual onde cada commit é um frame/keyframe
2. **Código como Produto:** Vender componente Remotion editável para o cliente
3. **UI Auto-Generativa:** Interface se monta baseada nas prioridades do momento
4. **Treinamento Contínuo:** Agentes atualizam templates baseado em performance dos posts
5. **Memory Palace 3D:** Navegação espacial pelos projetos como "salas" virtuais
6. **Relatórios em Vídeo:** Remotion gera vídeo-resumo mensal automático para cliente
7. **Debug Visual:** GBrain mostra pensamento do agente em árvore expansível
8. **Browser Embutido:** Camofox roda dentro da UI para validação em tempo real

---

## 📊 MÉTRICAS DE SUCESSO DA UI

- **Tempo para entender status:** < 5 segundos
- **Cliques para escalar problema:** ≤ 2 cliques
- **Latência de atualização:** < 1 segundo (real-time)
- **Satisfação do gestor:** NPS > 8.5
- **Redução de retrabalho:** ≥ 40%
- **Velocidade de aprovação cliente:** 48h → 24h

---

**Documento criado:** 2025-04-XX  
**Versão:** 1.0  
**Status:** Pronto para implementação  
