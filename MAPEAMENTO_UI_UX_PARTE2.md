# MAPEAMENTO UI/UX - PARTE 2 (Processos 66-97)

## 🎬 SEÇÃO 08 - EDIÇÃO DE VÍDEO (VideoAgent)
**Tela Principal:** `VideoProductionStudio`  
**Componentes:** VideoPlayer, TimelineEditor, ColorGradingPanel, AudioMixer, ExportSettings, AssetLibrary

---

### Processo 08.01: Receber materiais brutos e roteiro
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Aba "Materiais Brutos"
- **Componentes:** FileUploader, VideoPreview, QualityChecker, RoteiroViewer
- **Ações do Usuário:** Upload de arquivos, visualização de qualidade, confirmação de recebimento
- **Status Visual:** 🟡 Aguardando materiais → 🟢 Materiais recebidos
- **Dados de Entrada:** URL do Drive, roteiro do CopyAgent
- **Dados de Saída:** Lista de arquivos validados, relatório de qualidade
- **SLA:** 2 horas para avaliação
- **Escalação:** Botão "Solicitar Regravação" → notifica CSAgent

### Processo 08.02: Análise do roteiro e planejamento da edição
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Aba "Planejamento"
- **Componentes:** RoteiroInterativo, ScenePlanner, TransitionSelector, MusicPicker
- **Ações do Usuário:** Marcar cenas, selecionar transições, definir tom
- **Status Visual:** 📝 Planejando edição
- **Dados de Entrada:** Roteiro estruturado
- **Dados de Saída:** Plano de edição documentado
- **SLA:** 1 hora
- **Escalação:** N/A

### Processo 08.03: Seleção da trilha sonora
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Painel "Trilha Sonora"
- **Componentes:** MusicLibrary, TrendingAudioFinder, LicenseChecker, AudioPreview
- **Ações do Usuário:** Buscar músicas, filtrar por trending, verificar licença
- **Status Visual:** 🎵 Selecionando trilha
- **Dados de Entrada:** Tom do vídeo, plataforma destino
- **Dados de Saída:** Trilha licenciada selecionada
- **SLA:** 30 minutos
- **Escalação:** N/A

### Processo 08.04: Montagem da linha do tempo (timeline)
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Editor "Timeline"
- **Componentes:** MultiTrackTimeline, ClipSorter, BeatSyncTool, CutPreview
- **Ações do Usuário:** Arrastar clipes, ajustar timing, sincronizar com batida
- **Status Visual:** ✂️ Editando timeline
- **Dados de Entrada:** Clipes brutos, plano de edição
- **Dados de Saída:** Timeline montada
- **SLA:** 2-4 horas
- **Escalação:** N/A

### Processo 08.05: Tratamento de cor (color grading)
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Painel "Color Grading"
- **Componentes:** ColorWheel, LUTSelector, BeforeAfterCompare, HistogramViewer
- **Ações do Usuário:** Aplicar LUT, ajustar exposição, equalizar cenas
- **Status Visual:** 🎨 Tratando cores
- **Dados de Entrada:** Timeline montada, LUT do cliente
- **Dados de Saída:** Vídeo com cor tratada
- **SLA:** 1 hora
- **Escalação:** N/A

### Processo 08.06: Inserção de textos on-screen
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Painel "Textos & Gráficos"
- **Componentes:** TextEditor, FontSelector, AnimationPreview, SafeZoneGuide
- **Ações do Usuário:** Adicionar textos, escolher fontes, animar entrada
- **Status Visual:** 📝 Inserindo textos
- **Dados de Entrada:** Roteiro com marcações de texto
- **Dados de Saída:** Vídeos com textos animados
- **SLA:** 1 hora
- **Escalação:** N/A

### Processo 08.07: Inserção de elementos gráficos e motion
- **Agente:** VideoAgent + DesignAgent
- **Tela:** VideoProductionStudio > Painel "Motion Graphics"
- **Componentes:** AssetImporter, LogoPositioner, LowerThirdsBuilder, CTAAnimator
- **Ações do Usuário:** Importar assets, posicionar logo, animar CTA
- **Status Visual:** 🎬 Adicionando motion
- **Dados de Entrada:** Assets do DesignAgent
- **Dados de Saída:** Vídeo com elementos gráficos
- **SLA:** 1-2 horas
- **Escalação:** Motion complexo → Designer humano

### Processo 08.08: Tratamento e mixagem de áudio
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Painel "Audio Mixer"
- **Componentes:** AudioWaveform, VolumeSlider, NoiseRemover, FadeTool
- **Ações do Usuário:** Ajustar volumes, remover ruído, aplicar fade
- **Status Visual:** 🔊 Mixando áudio
- **Dados de Entrada:** Áudio bruto, trilha selecionada
- **Dados de Saída:** Áudio mixado e equilibrado
- **SLA:** 30 minutos
- **Escalação:** N/A

### Processo 08.09: Exportação no formato correto
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Modal "Exportar"
- **Componentes:** FormatSelector, ResolutionPicker, BitrateSlider, PlatformPreset
- **Ações do Usuário:** Selecionar plataforma, ajustar settings, exportar
- **Status Visual:** 💾 Exportando vídeo
- **Dados de Entrada:** Vídeo editado completo
- **Dados de Saída:** Arquivo MP4 nas specs corretas
- **SLA:** 15-30 minutos (render)
- **Escalação:** N/A

### Processo 08.10: QA interno e entrega
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Aba "QA & Entrega"
- **Componentes:** MobilePreview, QAChecklist, DeliveryButton, DriveLinker
- **Ações do Usuário:** Assistir no mobile preview, marcar checklist, entregar
- **Status Visual:** ✅ QA Interno → 📦 Entregue
- **Dados de Entrada:** Vídeo exportado
- **Dados de Saída:** Vídeo aprovado, linkado ao calendário
- **SLA:** 30 minutos
- **Escalação:** Problemas críticos → Supervisor

### Processo 08.11: Gestão de revisões
- **Agente:** VideoAgent
- **Tela:** VideoProductionStudio > Aba "Revisões"
- **Componentes:** FeedbackViewer, VersionComparator, RevisionTimer, RedoButton
- **Ações do Usuário:** Ver feedback, comparar versões, refazer edições
- **Status Visual:** 🔄 Em revisão (v2, v3)
- **Dados de Entrada:** Feedback do cliente
- **Dados de Saída:** Versão revisada entregue
- **SLA:** 24 horas
- **Escalação:** Refilmagem necessária → CSAgent

---

## 📈 SEÇÃO 09 - TRÁFEGO PAGO (AdsAgent)
**Tela Principal:** `AdsManagerDashboard`  
**Componentes:** CampaignBuilder, AdsPreview, PerformanceCharts, ABTestManager, BudgetOptimizer

---

### Processo 09.01: Briefing de campanha
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > Criar Campanha > "Briefing"
- **Componentes:** BriefingForm, ObjectiveSelector, TargetAudienceBuilder, KPISetup
- **Ações do Usuário:** Preencher briefing, definir objetivos, configurar KPIs
- **Status Visual:** 📋 Briefing em andamento
- **Dados de Entrada:** Formulário de briefing
- **Dados de Saída:** Briefing documentado
- **SLA:** 1 hora
- **Escalação:** Dúvidas estratégicas → Gestor

### Processo 09.02: Auditoria e diagnóstico inicial
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > "Auditoria"
- **Componentes:** PixelChecker, ConversionTracker, SiteAnalyzer, HistoryViewer
- **Ações do Usuário:** Rodar auditoria, verificar pixel, analisar histórico
- **Status Visual:** 🔍 Auditando conta
- **Dados de Entrada:** Acessos Meta/Google, histórico
- **Dados de Saída:** Diagnóstico completo
- **SLA:** 2 horas
- **Escalação:** Problemas técnicos graves → Especialista

### Processo 09.03: Instalação de pixel e tags
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > Configurações > "Pixel & Tags"
- **Componentes:** PixelInstaller, GTMConnector, EventTester, VerificationTool
- **Ações do Usuário:** Instalar pixel, configurar eventos, testar
- **Status Visual:** ⚙️ Instalando pixel
- **Dados de Entrada:** Acesso ao site/GTM
- **Dados de Saída:** Pixel funcional, eventos configurados
- **SLA:** 2-4 horas
- **Escalação:** Site complexo → Desenvolvedor

### Processo 09.04: Definição de estratégia de campanha
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > Criar Campanha > "Estratégia"
- **Componentes:** CampaignStructureBuilder, AudienceSelector, BudgetAllocator, PlacementPicker
- **Ações do Usuário:** Definir estrutura, selecionar públicos, alocar orçamento
- **Status Visual:** 🎯 Estratégia definida
- **Dados de Entrada:** Briefing aprovado
- **Dados de Saída:** Estrutura de campanha documentada
- **SLA:** 1-2 horas
- **Escalação:** Orçamento > R$ 10k → Gestor

### Processo 09.05: Briefing de criativos para Design e Copy
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > "Briefing de Criativos"
- **Componentes:** CreativeRequestForm, SpecGenerator, ReferenceUploader, DeadlineSetter
- **Ações do Usuário:** Especificar formatos, solicitar variações, definir prazo
- **Status Visual:** 📢 Solicitando criativos
- **Dados de Entrada:** Estratégia de campanha
- **Dados de Saída:** Briefings enviados para DesignAgent/CopyAgent
- **SLA:** 30 minutos
- **Escalação:** N/A

### Processo 09.06: Subida da campanha (go live)
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > "Publicar Campanha"
- **Componentes:** CampaignUploader, AdPreview, UTMBuilder, LaunchConfirmator
- **Ações do Usuário:** Configurar anúncios, revisar, publicar
- **Status Visual:** 🚀 Campanha no ar
- **Dados de Entrada:** Criativos aprovados, estratégia
- **Dados de Saída:** Campanha ativa, screenshot de confirmação
- **SLA:** 1-2 horas
- **Escalação:** Campanha reprovada → Especialista

### Processo 09.07: Monitoramento e otimização em 72h
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > "Otimização 72h"
- **Componentes:** RealTimeMetrics, AlertSystem, CreativeSwapper, BidAdjuster
- **Ações do Usuário:** Monitorar métricas, trocar criativos, ajustar lances
- **Status Visual:** 📊 Otimizando (72h)
- **Dados de Entrada:** Dados de performance em tempo real
- **Dados de Saída:** Campanha otimizada
- **SLA:** Contínuo (2x/dia)
- **Escalação:** CTR < 1% → Troca automática de criativo

### Processo 09.08: Otimização semanal
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > "Otimização Semanal"
- **Componentes:** WeeklyReport, WinnerLoserAnalyzer, BudgetScaler, PauseButton
- **Ações do Usuário:** Analisar semana, pausar perdedores, escalar ganhadores
- **Status Visual:** 📈 Otimização semanal
- **Dados de Entrada:** Métricas da semana
- **Dados de Saída:** Relatório de otimização
- **SLA:** Toda segunda-feira
- **Escalação:** N/A

### Processo 09.09: Testes A/B estruturados
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > "Testes A/B"
- **Componentes:** ABTestCreator, VariableSelector, StatisticalSignificanceCalculator, ResultViewer
- **Ações do Usuário:** Criar teste, definir variável, analisar resultado
- **Status Visual:** 🧪 Teste A/B em andamento
- **Dados de Entrada:** Hipótese de teste
- **Dados de Saída:** Aprendizado documentado, vencedor escalado
- **SLA:** 2 semanas por teste
- **Escalação:** N/A

### Processo 09.10: Gestão de remarketing
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > "Remarketing"
- **Componentes:** AudienceBuilder, ListUploader, FunnelMapper, CampaignCreator
- **Ações do Usuário:** Criar públicos, upload de listas, configurar campanhas
- **Status Visual:** 🎯 Remarketing ativo
- **Dados de Entrada:** Listas de clientes, dados de visitantes
- **Dados de Saída:** Públicos configurados, campanhas ativas
- **SLA:** Mensal (atualização)
- **Escalação:** N/A

### Processo 09.11: Relatório mensal de performance
- **Agente:** AdsAgent
- **Tela:** AdsManagerDashboard > "Relatórios" > Mensal
- **Componentes:** MonthlyReportGenerator, MetricCharts, InsightExtractor, PresentationExporter
- **Ações do Usuário:** Gerar relatório, analisar insights, exportar apresentação
- **Status Visual:** 📑 Relatório mensal pronto
- **Dados de Entrada:** Métricas do mês, GA4, Meta/Google Ads
- **Dados de Saída:** Relatório apresentado ao cliente
- **SLA:** Primeiro dia útil do mês
- **Escalação:** N/A

---

## 💰 SEÇÃO 10 - FINANCEIRO & FATURAMENTO (FinanceAgent)
**Tela Principal:** `FinanceDashboard`  
**Componentes:** InvoiceGenerator, PaymentTracker, CashFlowChart, DelinquencyManager, FinancialReports

---

### Processo 10.01: Cadastro financeiro do cliente
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > Clientes > "Novo Cliente"
- **Componentes:** ClientRegistrationForm, ContractDataImporter, RecurringSetup, PaymentMethodSelector
- **Ações do Usuário:** Cadastrar dados, importar contrato, configurar recorrência
- **Status Visual:** 👤 Cliente cadastrado
- **Dados de Entrada:** Contrato assinado
- **Dados de Saída:** Cliente no sistema financeiro
- **SLA:** 1 hora após contrato
- **Escalação:** N/A

### Processo 10.02: Emissão de nota fiscal
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > Faturamento > "Emitir NF"
- **Componentes:** InvoiceCreator, TaxCalculator, DataValidator, EmailSender
- **Ações do Usuário:** Preencher dados, calcular impostos, emitir, enviar
- **Status Visual:** 📄 NF emitida
- **Dados de Entrada:** Dados do cliente, valor do contrato
- **Dados de Saída:** NF transmitida, enviada ao cliente
- **SLA:** Dia de faturamento
- **Escalação:** Erro na transmissão → Contador

### Processo 10.03: Envio de cobrança
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > Faturamento > "Cobranças"
- **Componentes:** BillingSender, BoletoGenerator, PixLinkCreator, MessageTemplate
- **Ações do Usuário:** Enviar cobrança, gerar boleto/Pix, acompanhar status
- **Status Visual:** 💸 Cobrança enviada
- **Dados de Entrada:** NF emitida
- **Dados de Saída:** Cobrança registrada, status "Aguardando pagamento"
- **SLA:** Junto com NF
- **Escalação:** N/A

### Processo 10.04: Controle e conciliação de recebimentos
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > "Conciliação Bancária"
- **Componentes:** BankStatementImporter, PaymentMatcher, DiscrepancyAlert, StatusUpdater
- **Ações do Usuário:** Importar extrato, conciliar pagamentos, investigar divergências
- **Status Visual:** ✅ Recebimento conciliado
- **Dados de Entrada:** Extrato bancário
- **Dados de Saída:** Pagamentos baixados, status atualizado
- **SLA:** Diário
- **Escalação:** Divergência de valor → CSAgent

### Processo 10.05: Gestão de inadimplência
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > "Inadimplência"
- **Componentes:** DelinquencyTracker, ReminderScheduler, EscalationWorkflow, SuspensionNotifier
- **Ações do Usuário:** Acompanhar vencidos, enviar lembretes, escalar
- **Status Visual:** ⚠️ Inadimplente (D+1, D+3, D+7, D+15)
- **Dados de Entrada:** Cobranças vencidas
- **Dados de Saída:** Inadimplência tratada, cliente suspenso se necessário
- **SLA:** D+1, D+3, D+7, D+15
- **Escalação:** D+15 → Gestor decide suspensão

### Processo 10.06: Pagamento de fornecedores e freelancers
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > "Pagamentos"
- **Componentes:** SupplierInvoiceReceiver, PaymentApprover, PixSender, ReceiptArchiver
- **Ações do Usuário:** Receber NF, aprovar pagamento, efetuar Pix, arquivar
- **Status Visual:** 💰 Pago
- **Dados de Entrada:** NF/recibo do fornecedor
- **Dados de Saída:** Pagamento efetuado, comprovante arquivado
- **SLA:** Na data combinada
- **Escalação:** N/A

### Processo 10.07: Controle de fluxo de caixa
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > "Fluxo de Caixa"
- **Componentes:** CashFlowChart, RevenueProjection, ExpenseTracker, BalanceForecast
- **Ações do Usuário:** Atualizar receitas/despesas, projetar saldo, analisar tendências
- **Status Visual:** 📊 Fluxo atualizado
- **Dados de Entrada:** Receitas previstas, despesas fixas/variáveis
- **Dados de Saída:** Fluxo de caixa projetado 30-60 dias
- **SLA:** 2x/semana
- **Escalação:** Saldo negativo projetado → Gestor

### Processo 10.08: Relatório financeiro mensal
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > "Relatórios" > Mensal
- **Componentes:** FinancialReportGenerator, RevenueExpenseChart, MarginAnalyzer, DirectorPresentation
- **Ações do Usuário:** Gerar relatório, analisar margens, apresentar à diretoria
- **Status Visual:** 📑 Relatório financeiro pronto
- **Dados de Entrada:** Receitas, despesas, inadimplência do mês
- **Dados de Saída:** Relatório para diretoria
- **SLA:** Fechamento do mês
- **Escalação:** N/A

### Processo 10.09: Controle de impostos e obrigações
- **Agente:** FinanceAgent
- **Tela:** FinanceDashboard > "Impostos"
- **Componentes:** TaxCalendar, GuideGenerator, AccountantConnector, PaymentArchiver
- **Ações do Usuário:** Acompanhar vencimentos, gerar guias, comunicar contador
- **Status Visual:** 🏛️ Impostos em dia
- **Dados de Entrada:** Regime tributário, alíquotas
- **Dados de Saída:** Impostos recolhidos, obrigações cumpridas
- **SLA:** Mensal
- **Escalação:** Risco de atraso → Contador

### Processo 10.10: Gestão de contratos extras e cobranças adicionais
- **Agente:** FinanceAgent + OpsAgent
- **Tela:** FinanceDashboard > "Contratos Extras"
- **Componentes:** ExtraServiceProposal, ApprovalTracker, SupplementalInvoice, ContractUpdater
- **Ações do Usuário:** Emitir proposta, aguardar aprovação, faturar extra
- **Status Visual:** ➕ Serviço extra faturado
- **Dados de Entrada:** Solicitação de serviço extra
- **Dados de Saída:** NF complementar, registro no sistema
- **SLA:** Antes da execução
- **Escalação:** Cliente recusa pagamento → Gestor

---

## 📊 RESUMO FINAL DOS 97 PROCESSOS MAPEADOS

| Seção | Processos | Agente | Tela Principal | Status |
|-------|-----------|--------|----------------|--------|
| 02 | 11 | OpsAgent | ProjectDashboard | ✅ Mapeado |
| 03 | 11 | ContractAgent | ContractManager | ✅ Mapeado |
| 04 | 11 | CSAgent | ClientSuccessHub | ✅ Mapeado |
| 05 | 11 | SMAgent | SocialMediaPlanner | ✅ Mapeado |
| 06 | 10 | CopyAgent | CopywritingStudio | ✅ Mapeado |
| 07 | 11 | DesignAgent | DesignStudio | ✅ Mapeado |
| 08 | 11 | VideoAgent | VideoProductionStudio | ✅ Mapeado |
| 09 | 11 | AdsAgent | AdsManagerDashboard | ✅ Mapeado |
| 10 | 10 | FinanceAgent | FinanceDashboard | ✅ Mapeado |
| **TOTAL** | **97** | **9 Agentes** | **9 Telas Principais** | **✅ 100% CONCLUÍDO** |

---

## 🎯 PRÓXIMOS PASSOS

Com os 97 processos 100% mapeados para UI/UX, podemos agora:

1. **Criar wireframes de alta fidelidade** para cada uma das 9 telas principais
2. **Desenvolver componentes React** baseados nos especificados
3. **Implementar fluxos de navegação** entre as telas
4. **Configurar estados e status visuais** para cada processo
5. **Integrar com backend dos agentes** para dados em tempo real

**Documento completo com todos os 97 processos mapeados disponível para desenvolvimento!**
