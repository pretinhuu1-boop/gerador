# Mapeamento de Processos - Lumiere Agency → Axial AI

## 📋 Visão Geral do Documento
Este documento mapeia os processos operacionais da Lumiere Agency para automação via agentes Axial AI.

### Princípios da Automação
- ✅ **Autonomia total no operacional**: execução sem aprovação humana dentro dos parâmetros
- ⚠️ **Escalação inteligente**: situações fora do padrão → alerta para revisão humana
- 📊 **Rastreabilidade completa**: logs com timestamp, contexto e resultado
- 🎨 **Tom de marca preservado**: voz, estética e posicionamento da Lumiere
- 📈 **Melhoria contínua**: aprendizado com feedbacks e otimização periódica
- 🔗 **Integração entre agentes**: 9 agentes especializados compartilham dados em tempo real

### Escopo dos Serviços
1. Gestão de redes sociais (feed + stories)
2. Criação de conteúdo em vídeo (Reels, TikTok, YouTube Shorts)
3. Campanhas de tráfego pago (Meta Ads e Google Ads)
4. Identidade visual e branding
5. Produção de copy (textos, roteiros, legendas)
6. Desenvolvimento de sites e landing pages
7. Assessoria estratégica de marketing

---

## 🎯 Agente 1: OpsAgent (Gestão de Projetos/Operações)

### Responsabilidades
- Transformar contratos em projetos estruturados
- Coordenar entregas de todos os setores
- Monitorar status e resolver gargalos
- Garantir 100% de entrega no prazo, escopo e qualidade

### Volume e Cadência
- **Volume**: 15-40 projetos ativos simultâneos
- **Daily check**: 9h diariamente
- **Reunião semanal**: status review (30 min, segundas)
- **Relatório mensal**: saúde dos projetos

### Fluxo de Processos (11 etapas)

| # | Etapa | Descrição | Ferramenta | Output |
|---|-------|-----------|------------|--------|
| 01 | Receber briefing aprovado | Criar projeto com ID único, preencher dados do cliente, escopo, prazo, valor, responsáveis | Notion/ClickUp | Projeto criado |
| 02 | Definir escopo técnico | Decompor briefing em tarefas por setor (copy, design, vídeo, ads, SM) com especificações técnicas | Notion | Escopo documentado |
| 03 | Montar cronograma | Timeline com milestones, datas internas, aprovação, publicação + buffer 20% | Notion/Trello | Cronograma publicado |
| 04 | Atribuir tarefas | Distribuir tarefas com prazo, briefing específico, referências e critérios de aprovação | ClickUp | Tarefas atribuídas |
| 05 | Daily check de status | Verificar status: on track, em risco, atrasada. Identificar bloqueios e agir | ClickUp | Board atualizado |
| 06 | Reunião semanal de status | Review de entregas, pendências, riscos. Ajustar cronograma e registrar ata | Google Meet/Notion | Ata com ações |
| 07 | Gestão de mudanças de escopo | Documentar solicitação, avaliar impacto (prazo/custo), aprovar, comunicar, atualizar contrato | Notion/E-mail | Change request |
| 08 | Controle de qualidade (QA) | Revisão interna: briefing vs. entregável, ortografia, dimensões, consistência de marca | Checklist | Entregável aprovado |
| 09 | Gestão de aprovações | Enviar ao cliente com contexto, registrar aprovação/feedback, controlar rounds | Drive/E-mail | Aprovação documentada |
| 10 | Encerramento do projeto | Aceite final, faturamento, arquivamento com nomenclatura padrão, lições aprendidas | Notion/Drive | Projeto concluído |
| 11 | Relatório mensal de saúde | % no prazo, % atraso, NPS, receita entregue vs. contratada, gargalos recorrentes | Sheets | Relatório enviado |

### Padrões Operacionais

#### Nomenclatura de Arquivos
```
CLIENTE_PROJETO_SETOR_VERSÃO_DATA
Ex: LuminaCafe_ReelAbril_Video_v2_20250415
- Versões: v1 (primeiro), v2/v3 (revisões), vFinal (aprovado)
- Pastas: /Clientes/[Nome]/[Ano]/[Mês]/[Setor]/
```

#### Critérios de Prioridade
| Prioridade | Descrição | Prazo Máximo |
|------------|-----------|--------------|
| P1 - Urgente | Entrega ao vivo ou campanha com erro | 1h |
| P2 - Alta | Entrega < 24h | 4h |
| P3 - Normal | Entrega 2-5 dias | Conforme cronograma |
| P4 - Baixa | Melhoria/otimização sem prazo fixo | Quando houver capacidade |

### ⚙️ Instruções Axial AI - OpsAgent

**Gatilho**: Contrato assinado recebido do ContractAgent

**Ações Sequenciais**:
1. Criar projeto no ClickUp/Notion com dados do contrato
2. Decompor escopo automaticamente em tarefas por setor (template padrão)
3. Gerar cronograma com buffer de 20%
4. Atribuir tarefas aos agentes responsáveis com briefing específico
5. Executar daily check automático às 9h
6. Alertar quando tarefa passar para 'em risco' (2 dias antes do prazo)
7. Executar checklist de QA automatizado antes de envio ao cliente
8. Ao encerrar: arquivar, solicitar faturamento, registrar lições
9. Gerar relatório mensal consolidado

**Dados de Entrada**: Contrato, briefing, escopo técnico, histórico do cliente

**Dados de Saída**: Projeto estruturado, cronograma, tarefas atribuídas, relatórios, QA validado

**Critérios de Escalação Humana**:
- Conflito de prioridade entre clientes
- Mudança de escopo > 20%
- Atraso > 3 dias

---

## 📄 Agente 2: ContractAgent (Gestão de Contratos)

### Responsabilidades
- Formalização jurídica e comercial de serviços
- Geração, negociação, assinatura e controle de vigência
- Garantir 100% dos projetos com contrato antes da execução
- Prazo máximo de assinatura: 3 dias úteis

### Ferramentas
- ClickSign / DocuSign (assinatura digital)
- Google Drive (armazenamento)
- Notion (registro e controle)
- Google Docs (templates)

### Fluxo de Processos (11 etapas)

| # | Etapa | Descrição | Ferramenta | Output |
|---|-------|-----------|------------|--------|
| 01 | Receber briefing aprovado | Receber dados completos: cliente, CNPJ/CPF, endereço, escopo, valores, prazos, pagamento | CRM/E-mail | Briefing registrado |
| 02 | Selecionar template | Escolher template conforme serviço: (a) SM recorrente, (b) Projeto pontual, (c) Tráfego, (d) Full service | Drive/Templates | Template selecionado |
| 03 | Preencher contrato | Substituir campos dinâmicos: partes, objeto, escopo detalhado, valor, pagamento, vigência, revisões, penalidades | Google Docs | Minuta completa |
| 04 | Revisão interna | Verificar: consistência proposta/contrato, propriedade intelectual, cancelamento/multas, sigilo | Google Docs | Contrato validado |
| 05 | Envio ao cliente | Converter PDF, enviar via ClickSign com prazo 48h + mensagem de boas-vindas | ClickSign | Contrato enviado |
| 06 | Follow-up de assinatura | Lembrete 24h, WhatsApp 48h, escalar gestor 72h | ClickSign/WhatsApp | Contrato assinado ou escalado |
| 07 | Arquivamento e registro | Salvar com nomenclatura padrão, registrar no banco: ID, início, término, valor, tipo, status | Drive/Notion | Contrato indexado |
| 08 | Disparo de onboarding | Notificar: Ops (iniciar projeto), Atendimento (onboarding), Financeiro (cobrança) | Notion/Automação | Setores ativados |
| 09 | Controle de vigência | Alertas: 60 dias (análise interna), 30 dias (proposta renovação), 15 dias (último alerta) | Notion/Automação | Alertas disparados |
| 10 | Aditivos e mudanças | Gerar aditivo para alterações de escopo/valor/prazo, enviar para assinatura | Docs/ClickSign | Aditivo arquivado |
| 11 | Encerramento e renovação | Registrar resultado (renovado/concluído/cancelado), pesquisa de satisfação se encerrado | Notion/Drive | Ciclo encerrado/renovado |

### Estrutura Padrão dos Contratos
1. Qualificação das Partes
2. Objeto do Contrato
3. Escopo Detalhado (entregáveis, formatos, volumes, plataformas)
4. Valor e Forma de Pagamento
5. Prazo de Vigência (início, término, renovação automática)
6. Direitos de Propriedade Intelectual
7. Rounds de Revisão (número máximo incluído)
8. Política de Cancelamento (aviso prévio, multa)
9. Confidencialidade
10. Foro competente

### ⚙️ Instruções Axial AI - ContractAgent

**Gatilho**: Proposta comercial aprovada recebida do agente de vendas/gestor

**Ações Sequenciais**:
1. Selecionar template correto baseado no tipo de serviço
2. Preencher campos dinâmicos automaticamente (dados do CRM)
3. Executar checklist de revisão (valores, escopo, cláusulas obrigatórias)
4. Converter PDF e enviar via ClickSign com mensagem personalizada (prazo 48h)
5. Monitorar status; lembretes em 24h/48h; escalar em 72h
6. Ao assinar: arquivar, registrar com ID, notificar Ops/Atendimento/Financeiro
7. Configurar alertas de vigência (60/30/15 dias)
8. Aos 30 dias: gerar proposta de renovação → Agente Comercial
9. Gerenciar aditivos: gerar e enviar para assinatura

**Dados de Entrada**: Proposta aprovada, dados do cliente (CRM), templates, histórico

**Dados de Saída**: Contrato assinado, aditivos, alertas, notificações, registro indexado

**Critérios de Escalação Humana**:
- Negociação de cláusulas não padronizadas
- Disputas contratuais
- Cancelamentos com multa
- Contratos > R$ 20k

---

## 🔄 Próximos Passos (Aguardando Continuação)

### Agentes a Mapear (previstos 9 no total):
1. ✅ **OpsAgent** - Gestão de Projetos/Operações
2. ✅ **ContractAgent** - Gestão de Contratos
3. ⏳ **ComercialAgent** - Vendas e Propostas
4. ⏳ **AtendimentoAgent** - Customer Success
5. ⏳ **CopyAgent** - Produção de Textos/Roteiros
6. ⏳ **DesignAgent** - Identidade Visual/Branding
7. ⏳ **VideoAgent** - Criação de Conteúdo em Vídeo
8. ⏳ **AdsAgent** - Tráfego Pago (Meta/Google)
9. ⏳ **WebAgent** - Sites e Landing Pages

### Integração com Sistema Agêntico Existente
- **BaseAgent.ts**: Herdar estrutura de contexto, multimodalidade e tratamento de erros
- **AgentOrchestrator.ts**: Coordenar fluxo entre ContractAgent → OpsAgent → Agentes Especializados
- **Workflows a criar**:
  - `ContractToProjectWorkflow`: Contrato → Projeto → Tarefas
  - `RenewalWorkflow`: Alerta 30 dias → Proposta → Novo Contrato
  - `QAWorkflow`: Validação automática antes de envio ao cliente

### Conhecimentos do App para Herdar
- Bibliotecas especializadas (cinema_style, lighting, texture, environment, lenses, actor_behavior, narrative, b_roll)
- Engines: SIB, Decoupage, DNA, Expansion
- Sistemas: VFX_Explosions_v1, WardrobeEngine_V1_0, ImageScience_4K_V1_0
- Studios: FlyerCreator, VideoStudio, DecupagemStudio, CinemaStudio, MotionDesigner

---

**Status**: 🟡 Aguardando próxima parte do documento para continuar mapeamento
