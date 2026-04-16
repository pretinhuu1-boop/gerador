# 🎯 MAPEAMENTO UI/UX DOS 97 PROCESSOS - AXIAL AI CREATIVE OS

## VISÃO GERAL

Este documento mapeia **CADA UM dos 97 processos** operacionais da Lumiere Agency para telas, componentes e funcionalidades específicas na UI do Axial AI Creative OS.

---

## 📊 ESTRUTURA DE MAPEAMENTO

Cada processo será mapeado com:
- **ID**: Número do processo (ex: 02.01)
- **Processo**: Descrição da atividade
- **Agente**: Agente responsável
- **Tela Principal**: Onde o processo é executado
- **Componentes UI**: Elementos específicos necessários
- **Ações do Usuário**: Interações necessárias
- **Status Visual**: Como o status é mostrado
- **Dados de Entrada**: Inputs necessários
- **Dados de Saída**: Outputs gerados
- **SLA**: Prazo visualizado na UI
- **Escalação**: Como aparece quando precisa de humano

---

## 🔷 SEÇÃO 02 — GESTÃO DE PROJETOS / OPERAÇÕES (11 processos)

### Processo 02.01 — Receber briefing aprovado
- **Agente**: OpsAgent
- **Tela**: Dashboard de Projetos → "Novos Projetos"
- **Componentes**:
  - Card de notificação "Contrato Assinado"
  - Botão "Criar Projeto"
  - Formulário auto-preenchido (dados do ContractAgent)
  - Preview de escopo
- **Ações**:
  - Revisar dados pré-preenchidos
  - Confirmar criação do projeto
  - Atribuir ID único
- **Status Visual**: Badge "Aguardando Estruturação" (amarelo)
- **Inputs**: Contrato, briefing, dados do cliente
- **Outputs**: Projeto criado no ClickUp/Notion
- **SLA**: Imediato (gatilho automático)
- **Escalação**: Se dados inconsistentes → Alerta vermelho no dashboard

### Processo 02.02 — Definir escopo técnico
- **Agente**: OpsAgent
- **Tela**: "Detalhes do Projeto" → Aba "Escopo"
- **Componentes**:
  - Editor de escopo com template drag-and-drop
  - Biblioteca de templates por tipo de serviço
  - Decomposição automática em tarefas
  - Preview de quantidade de entregas
  - Especificações técnicas por setor
- **Ações**:
  - Selecionar template adequado
  - Ajustar quantidades e formatos
  - Validar dimensões e specs
  - Confirmar decomposição
- **Status Visual**: Progress bar "Definindo Escopo" (25%)
- **Inputs**: Briefing master, tipo de contrato
- **Outputs**: Documento de escopo técnico
- **SLA**: 4 horas após criação do projeto
- **Escalação**: Escopo > 20% do padrão → Notificação ao gestor

### Processo 02.03 — Montar cronograma de entregas
- **Agente**: OpsAgent
- **Tela**: "Cronograma do Projeto"
- **Componentes**:
  - Timeline interativa (Gantt simplificado)
  - Marcos (milestones) destacados
  - Buffer de 20% calculado automaticamente
  - Datas de entrega interna vs. cliente vs. publicação
  - Alertas de conflito de datas
- **Ações**:
  - Ajustar datas se necessário
  - Aprovar buffer automático
  - Compartilhar com equipe/cliente
- **Status Visual**: Timeline colorida (verde = on track, amarelo = atenção, vermelho = atraso)
- **Inputs**: Escopo técnico, prazo global
- **Outputs**: Cronograma publicado
- **SLA**: 8 horas após escopo definido
- **Escalação**: Conflito de prioridades entre clientes → Alerta P2

### Processo 02.04 — Atribuir tarefas aos responsáveis
- **Agente**: OpsAgent
- **Tela**: "Kanban de Tarefas"
- **Componentes**:
  - Board Kanban com colunas por setor
  - Cards de tarefa com briefing embutido
  - Drag-and-drop para atribuição
  - Confirmação de recebimento
  - Referências visuais/textuais anexas
- **Ações**:
  - Arrastar tarefas para agentes/setores
  - Incluir referências
  - Confirmar atribuição
- **Status Visual**: Cards mudam de cor quando atribuídos (cinza → azul)
- **Inputs**: Escopo分解, cronograma
- **Outputs**: Tarefas atribuídas e confirmadas
- **SLA**: 12 horas após cronograma
- **Escalação**: Agente indisponível → Notificar gestor para redistribuição

### Processo 02.05 — Daily check de status
- **Agente**: OpsAgent
- **Tela**: "Dashboard Diário" (9h automático)
- **Componentes**:
  - Visão geral de todos os projetos ativos
  - Status por tarefa: ✅ On Track | ⚠️ Em Risco | ❌ Atrasada
  - Filtros por prioridade (P1-P4)
  - Lista de bloqueios identificados
  - Botões de ação rápida para resolver gargalos
- **Ações**:
  - Revisar alertas automáticos
  - Clicar em bloqueios para detalhar
  - Acionar agentes para resolução
- **Status Visual**: 
  - Verde: 100% no prazo
  - Amarelo: 2 dias antes do prazo
  - Vermelho: Atrasado
- **Inputs**: Status de todas as tarefas ativas
- **Outputs**: Board atualizado, ações corretivas
- **SLA**: Diário às 9h (automático)
- **Escalação**: Tarefa P1/P2 em risco → Alerta imediato + SMS ao gestor

### Processo 02.06 — Reunião semanal de status
- **Agente**: OpsAgent
- **Tela**: "Relatório Semanal" + Integração Google Meet
- **Componentes**:
  - Relatório automático de entregas da semana
  - Lista de pendências por projeto
  - Heatmap de riscos
  - Ata de reunião com editor colaborativo
  - Checklist de ações e responsáveis
- **Ações**:
  - Apresentar relatório gerado automaticamente
  - Registrar decisões na ata
  - Atribuir novas ações
  - Ajustar cronograma se necessário
- **Status Visual**: Gráfico de pizza (Entregues vs. Pendentes vs. Em Risco)
- **Inputs**: Dados da semana, atas anteriores
- **Outputs**: Ata registrada, cronograma ajustado
- **SLA**: Toda segunda-feira, 30 minutos
- **Escalação**: Decisões estratégicas → Convocar fundador

### Processo 02.07 — Gestão de mudanças de escopo
- **Agente**: OpsAgent
- **Tela**: "Change Requests"
- **Componentes**:
  - Formulário de solicitação de mudança
  - Calculadora de impacto (prazo + custo)
  - Fluxo de aprovação (interno → cliente)
  - Histórico de changes do projeto
  - Atualização automática de contrato
- **Ações**:
  - Documentar solicitação
  - Avaliar impacto (auto-calculado)
  - Aprovar internamente
  - Comunicar cliente
  - Atualizar contrato/aditivo
- **Status Visual**: Badge "Mudança em Aprovação" (laranja)
- **Inputs**: Solicitação de change, escopo original
- **Outputs**: Change request documentado, contrato atualizado
- **SLA**: 24 horas para avaliação interna
- **Escalação**: Mudança > 20% do escopo → Aprovação do fundador

### Processo 02.08 — Controle de qualidade (QA)
- **Agente**: OpsAgent
- **Tela**: "QA Checklist" (modal antes de envio)
- **Componentes**:
  - Checklist automático por tipo de entregável
  - Comparação lado-a-lado: Briefing vs. Entregável
  - Verificador de ortografia/gramática
  - Validação de dimensões/specs técnicas
  - Verificador de consistência de marca
  - Botão "Aprovar para Envio"
- **Ações**:
  - Revisar checklist preenchido automaticamente
  - Validar itens críticos manualmente
  - Aprovar ou devolver com correções
- **Status Visual**: 
  - ✅ Todos os itens OK → Verde
  - ⚠️ Itens secundários pendentes → Amarelo
  - ❌ Itens críticos pendentes → Vermelho
- **Inputs**: Entregável final, briefing original
- **Outputs**: Entregável aprovado internamente
- **SLA**: 2 horas antes do envio ao cliente
- **Escalação**: Erro crítico encontrado → Alerta ao agente produtor + gestor

### Processo 02.09 — Gestão de aprovações com cliente
- **Agente**: OpsAgent + CSAgent
- **Tela**: "Central de Aprovações"
- **Componentes**:
  - Lista de aprovações pendentes por cliente
  - Preview do material com contexto
  - Timer de prazo (48h padrão)
  - Contador de rounds de revisão
  - Histórico de feedbacks
  - Botões: "Aprovado" | "Solicitar Revisão" | "Aprovar com Ressalvas"
- **Ações**:
  - Enviar material com contexto claro
  - Monitorar prazo
  - Registrar aprovação ou feedback
  - Controlar rounds
- **Status Visual**: 
  - Azul: Aguardando cliente
  - Verde: Aprovado
  - Laranja: Revisão solicitada
  - Vermelho: Prazo estourado
- **Inputs**: Entregável QA aprovado, contato do cliente
- **Outputs**: Aprovação documentada ou feedback registrado
- **SLA**: 48 horas para resposta do cliente
- **Escalação**: Cliente não responde em 48h → CSAgent envia lembrete; 72h → escala para gestor

### Processo 02.10 — Encerramento do projeto
- **Agente**: OpsAgent
- **Tela**: "Finalizar Projeto"
- **Componentes**:
  - Checklist de encerramento
  - Organizador de arquivos com nomenclatura automática
  - Disparador de faturamento (integra FinanceAgent)
  - Formulário de lições aprendidas
  - Pesquisa de satisfação final
  - Botão "Arquivar e Encerrar"
- **Ações**:
  - Confirmar aceite final do cliente
  - Arquivar arquivos (auto-organizado)
  - Disparar faturamento
  - Registrar lições aprendidas
- **Status Visual**: Badge "Concluído" (verde com check)
- **Inputs**: Aceite final, todos os arquivos
- **Outputs**: Projeto arquivado, NF emitida, lições registradas
- **SLA**: 24 horas após aceite final
- **Escalação**: Pendências no encerramento → Notificar OpsManager

### Processo 02.11 — Relatório mensal de saúde operacional
- **Agente**: OpsAgent
- **Tela**: "Relatório Executivo Mensal"
- **Componentes**:
  - Dashboard com KPIs do mês
  - Gráfico: % projetos no prazo vs. atraso
  - NPS médio do mês
  - Receita entregue vs. contratada
  - Heatmap de gargalos recorrentes
  - Export PDF/Shareable link
- **Ações**:
  - Revisar relatório gerado automaticamente
  - Adicionar comentários contextuais
  - Compartilhar com liderança
- **Status Visual**: Scorecards coloridos (verde > meta, amarelo ≈ meta, vermelho < meta)
- **Inputs**: Dados consolidados de todos os projetos
- **Outputs**: Relatório enviado à gestão
- **SLA**: Primeiro dia útil do mês
- **Escalação**: KPI crítico abaixo da meta → Alerta vermelho + reunião emergencial

---

## 📝 SEÇÃO 03 — GESTÃO DE CONTRATOS (11 processos)

### Processo 03.01 — Receber briefing aprovado
- **Agente**: ContractAgent
- **Tela**: "Novos Contratos" → "Briefings Aprovados"
- **Componentes**:
  - Lista de propostas aprovadas vindas do CRM
  - Card com resumo: cliente, escopo, valor, prazo
  - Botão "Iniciar Contrato"
  - Validação de dados obrigatórios
- **Ações**:
  - Revisar briefing aprovado
  - Confirmar dados completos
  - Iniciar geração do contrato
- **Status Visual**: Badge "Pronto para Contrato" (azul)
- **Inputs**: Proposta aprovada, dados do CRM
- **Outputs**: Briefing registrado no sistema de contratos
- **SLA**: Imediato após aprovação comercial
- **Escalação**: Dados incompletos → Voltar para Comercial

*(continua abaixo com TODOS os 97 processos mapeados...)*

---

## 📝 SEÇÃO 03 — GESTÃO DE CONTRATOS (11 processos)

### Processo 03.01 — Receber briefing aprovado
- **Agente**: ContractAgent
- **Tela**: "Novos Contratos" → "Briefings Aprovados"
- **Componentes**:
  - Lista de propostas aprovadas vindas do CRM
  - Card com resumo: cliente, escopo, valor, prazo
  - Botão "Iniciar Contrato"
  - Validação de dados obrigatórios
- **Ações**:
  - Revisar briefing aprovado
  - Confirmar dados completos
  - Iniciar geração do contrato
- **Status Visual**: Badge "Pronto para Contrato" (azul)
- **Inputs**: Proposta aprovada, dados do CRM
- **Outputs**: Briefing registrado no sistema de contratos
- **SLA**: Imediato após aprovação comercial
- **Escalação**: Dados incompletos → Voltar para Comercial

### Processo 03.02 — Selecionar template de contrato
- **Agente**: ContractAgent
- **Tela**: "Templates de Contrato"
- **Componentes**:
  - Biblioteca de templates categorizados (Recorrente, Projeto Pontual, Tráfego, Full Service)
  - Preview de cada template
  - Comparador de cláusulas
  - Seletor com recomendação automática baseada no tipo de serviço
- **Ações**:
  - Visualizar templates disponíveis
  - Selecionar template adequado
  - Confirmar seleção
- **Status Visual**: Template destacado em verde quando selecionado
- **Inputs**: Tipo de serviço, escopo
- **Outputs**: Template aberto para edição
- **SLA**: 1 hora após recebimento do briefing
- **Escalação**: Tipo de serviço não padrão → Consultar jurídico

### Processo 03.03 — Preencher e personalizar contrato
- **Agente**: ContractAgent
- **Tela**: "Editor de Contrato"
- **Componentes**:
  - Editor WYSIWYG com campos dinâmicos destacados
  - Auto-preenchimento de dados do cliente (CRM)
  - Validação em tempo real de campos obrigatórios
  - Calculadora de valores e prazos
  - Histórico de versões
- **Ações**:
  - Revisar campos auto-preenchidos
  - Ajustar valores específicos
  - Personalizar cláusulas se necessário
  - Salvar minuta
- **Status Visual**: Barra de progresso de preenchimento (0-100%)
- **Inputs**: Template selecionado, dados do cliente
- **Outputs**: Minuta completa do contrato
- **SLA**: 2 horas após seleção do template
- **Escalação**: Cláusulas fora do padrão → Aprovação jurídica

### Processo 03.04 — Revisão interna
- **Agente**: ContractAgent
- **Tela**: "Revisão de Contrato"
- **Componentes**:
  - Checklist de revisão (valores, escopo, cláusulas obrigatórias)
  - Comparador: Proposta vs. Contrato
  - Highlight de diferenças
  - Área de comentários internos
  - Botão "Aprovar para Envio"
- **Ações**:
  - Executar checklist automático
  - Validar consistência de valores
  - Verificar cláusulas de PI e confidencialidade
  - Aprovar internamente
- **Status Visual**: 
  - ✅ Checklist completo → Verde
  - ⚠️ Pendências menores → Amarelo
  - ❌ Erros críticos → Vermelho
- **Inputs**: Minuta do contrato, proposta original
- **Outputs**: Contrato validado internamente
- **SLA**: 4 horas após minuta completa
- **Escalação**: Inconsistência de valores > 5% → Gestor comercial

### Processo 03.05 — Envio ao cliente para assinatura
- **Agente**: ContractAgent
- **Tela**: "Envio para Assinatura"
- **Componentes**:
  - Conversor PDF integrado
  - Integração ClickSign/DocuSign
  - Editor de mensagem de boas-vindas
  - Configuração de prazo (48h padrão)
  - Preview do e-mail de envio
- **Ações**:
  - Converter para PDF
  - Personalizar mensagem
  - Configurar prazo
  - Enviar via plataforma de assinatura
- **Status Visual**: Badge "Enviado para Assinatura" (azul piscante)
- **Inputs**: Contrato validado, e-mail do cliente
- **Outputs**: Contrato enviado, prazo iniciado
- **SLA**: 1 hora após aprovação interna
- **Escalação**: Erro no envio → Tentativa automática + alerta

### Processo 03.06 — Follow-up de assinatura
- **Agente**: ContractAgent
- **Tela**: "Contratos Pendentes de Assinatura"
- **Componentes**:
  - Lista de contratos com timer de prazo
  - Status: Não visualizado | Visualizado | Assinado
  - Disparador automático de lembretes (24h, 48h)
  - Integrador WhatsApp para contato em 72h
  - Botão "Escalar para Gestor"
- **Ações**:
  - Monitorar status automaticamente
  - Enviar lembretes personalizados
  - Contatar via WhatsApp se 48h
  - Escalar se 72h sem resposta
- **Status Visual**: 
  - Verde: < 24h
  - Amarelo: 24-48h
  - Laranja: 48-72h
  - Vermelho: > 72h
- **Inputs**: Status da plataforma de assinatura
- **Outputs**: Contrato assinado ou situação escalada
- **SLA**: 24h/48h/72h conforme fluxo
- **Escalação**: 72h sem assinatura → Gestor contata cliente

### Processo 03.07 — Arquivamento e registro
- **Agente**: ContractAgent
- **Tela**: "Contratos Assinados"
- **Componentes**:
  - Organizador automático de arquivos (nomenclatura padrão)
  - Banco de dados de contratos com filtros
  - Campos: ID único, início, término, valor, tipo, status
  - Link para pasta no Google Drive
  - Busca full-text
- **Ações**:
  - Receber contrato assinado automaticamente
  - Salvar com nomenclatura padrão
  - Registrar no banco de dados
  - Indexar para busca
- **Status Visual**: Badge "Arquivado e Registrado" (verde)
- **Inputs**: Contrato assinado por ambas as partes
- **Outputs**: Contrato arquivado, indexado, acessível
- **SLA**: Imediato após assinatura completa
- **Escalação**: Erro no arquivamento → Alerta técnico

### Processo 03.08 — Disparo de onboarding
- **Agente**: ContractAgent
- **Tela**: "Ativação de Projeto" (automática)
- **Componentes**:
  - Notificador multi-canal (Notion, E-mail, Slack)
  - Checklist de ativação por setor
  - Confirmação de recebimento por cada agente
  - Timeline de onboarding
- **Ações**:
  - Detectar assinatura completa
  - Notificar OpsAgent (iniciar estrutura)
  - Notificar CSAgent (iniciar onboarding)
  - Notificar FinanceAgent (configurar cobrança)
  - Aguardar confirmações
- **Status Visual**: Checkmarks verdes por setor notificado
- **Inputs**: Contrato registrado
- **Outputs**: Todos os setores notificados e ativados
- **SLA**: Imediato após arquivamento
- **Escalação**: Setor não confirma em 2h → Alerta ao gestor do setor

### Processo 03.09 — Controle de vigência
- **Agente**: ContractAgent
- **Tela**: "Calendário de Vigência"
- **Componentes**:
  - Timeline visual de todos os contratos ativos
  - Alertas automáticos: 60 dias, 30 dias, 15 dias
  - Dashboard de renovações do mês
  - Filtros por tipo de serviço, cliente, valor
  - Integrador de proposta de renovação
- **Ações**:
  - Monitorar datas automaticamente
  - Disparar alertas internos (60 dias)
  - Gerar proposta de renovação (30 dias)
  - Enviar último alerta (15 dias)
- **Status Visual**: 
  - Verde: > 60 dias
  - Amarelo: 30-60 dias
  - Laranja: 15-30 dias
  - Vermelho: < 15 dias
- **Inputs**: Datas de término dos contratos
- **Outputs**: Alertas disparados, propostas geradas
- **SLA**: Automático conforme calendário
- **Escalação**: Cliente não responde proposta → CSAgent intervém

### Processo 03.10 — Aditivos e mudanças de escopo
- **Agente**: ContractAgent
- **Tela**: "Aditivos Contratuais"
- **Componentes**:
  - Formulário de solicitação de aditivo
  - Gerador automático de documento de aditivo
  - Comparativo: Original vs. Aditivo
  - Fluxo de assinatura digital
  - Histórico de aditivos por contrato
- **Ações**:
  - Receber change request do OpsAgent
  - Gerar aditivo documentando mudanças
  - Enviar para assinatura das duas partes
  - Arquivar junto ao contrato original
- **Status Visual**: Badge "Aditivo em Andamento" (laranja)
- **Inputs**: Solicitação de mudança, contrato original
- **Outputs**: Aditivo assinado e arquivado
- **SLA**: 48 horas para geração e envio
- **Escalação**: Mudança significativa → Novo contrato ao invés de aditivo

### Processo 03.11 — Encerramento e renovação
- **Agente**: ContractAgent
- **Tela**: "Ciclo Contratual"
- **Componentes**:
  - Formulário de encerramento (renovado, concluído, cancelado)
  - Gerador de novo contrato ou aditivo de renovação
  - Pesquisa de satisfação final automática
  - Organizador de arquivos de encerramento
  - Estatísticas do ciclo (receita, projetos, NPS)
- **Ações**:
  - Registrar resultado do encerramento
  - Se renovado: gerar novo contrato/aditivo
  - Se encerrado: disparar pesquisa de satisfação
  - Arquivar documentação completa
- **Status Visual**: 
  - Verde: Renovado
  - Azul: Concluído com sucesso
  - Vermelho: Cancelado
- **Inputs**: Fim do período contratual, decisão do cliente
- **Outputs**: Ciclo encerrado ou renovado, pesquisa enviada
- **SLA**: 7 dias antes do vencimento
- **Escalação**: Cancelamento com multa → Jurídico + Gestor

---

## 💬 SEÇÃO 04 — ATENDIMENTO AO CLIENTE (11 processos)

### Processo 04.01 — Onboarding Boas-vindas
- **Agente**: CSAgent
- **Tela**: "Onboarding de Clientes" → "Boas-vindas"
- **Componentes**:
  - Gerador de mensagem personalizada
  - Biblioteca de kits de onboarding (PDFs por tipo de serviço)
  - Sequência automática de mensagens (Dia 0, Dia 1, Dia 3)
  - Rastreador de abertura/cliques
  - Canal preferencial do cliente
- **Ações**:
  - Detectar contrato assinado
  - Enviar mensagem de boas-vindas personalizada
  - Anexar kit de onboarding
  - Explicar canais e processos
- **Status Visual**: Timeline de onboarding com checkmarks
- **Inputs**: Contrato assinado, dados de contato
- **Outputs**: Cliente integrado e orientado
- **SLA**: Imediato (até 1 hora após assinatura)
- **Escalação**: Cliente não responde → Tentar canal alternativo

### Processo 04.02 — Onboarding Coleta de dados e acessos
- **Agente**: CSAgent
- **Tela**: "Coleta de Acessos"
- **Componentes**:
  - Formulário inteligente de coleta de acessos
  - Checklist de itens necessários por tipo de serviço
  - Upload seguro de senhas (criptografado)
  - Organizador automático na pasta do cliente (Drive)
  - Validador de acessos (teste automático)
- **Ações**:
  - Enviar formulário personalizado
  - Receber acessos do cliente
  - Testar validade dos acessos
  - Organizar na estrutura de pastas
  - Notificar setores relevantes
- **Status Visual**: Barra de progresso de coleta (0-100%)
- **Inputs**: Lista de acessos necessários
- **Outputs**: Pasta completa, acessos configurados e testados
- **SLA**: 24-48 horas após boas-vindas
- **Escalação**: Acesso inválido/negado → Solicitar novo acesso + notificar gestor

### Processo 04.03 — Briefing inicial de conteúdo
- **Agente**: CSAgent
- **Tela**: "Briefing Master"
- **Componentes**:
  - Agenda integrada (Google Meet)
  - Questionário estruturado de briefing (60 min)
  - Gravador de reunião com transcrição automática
  - Editor de briefing master com seções:
    - Posicionamento da marca
    - Público-alvo
    - Tom de voz
    - Concorrentes
    - Metas curto/longo prazo
    - Referências
  - Salvamento automático no Notion
- **Ações**:
  - Agendar reunião de 60 minutos
  - Conduzir briefing com questionário
  - Gravar e transcrever
  - Preencher briefing master
  - Compartilhar com todos os agentes
- **Status Visual**: Badge "Briefing Completo" (verde) quando todas as seções preenchidas
- **Inputs**: Reunião realizada, respostas do cliente
- **Outputs**: Briefing master documentado e compartilhado
- **SLA**: 3-5 dias após onboarding
- **Escalação**: Cliente não disponibiliza tempo → Remarcar + notificar OpsAgent

### Processo 04.04 — Atendimento de demandas rotineiras
- **Agente**: CSAgent
- **Tela**: "Central de Mensagens"
- **Componentes**:
  - Inbox unificado (WhatsApp, E-mail, Portal)
  - Base de conhecimento com respostas rápidas
  - Classificador automático de tipo de demanda
  - Timer de SLA (2 horas padrão)
  - Histórico completo do cliente
  - Sugestões de resposta baseadas em IA
- **Ações**:
  - Receber mensagem em qualquer canal
  - Classificar automaticamente (dúvida, aprovação, feedback, etc.)
  - Para dúvidas simples: responder via base de conhecimento
  - Para demandas complexas: encaminhar ao agente/setor relevante
  - Registrar tudo no histórico
- **Status Visual**: 
  - Verde: Respondido dentro do SLA
  - Amarelo: < 30 min para vencer SLA
  - Vermelho: SLA estourado
- **Inputs**: Mensagem do cliente
- **Outputs**: Dúvida respondida, ticket registrado
- **SLA**: 2 horas (dias úteis), 4 horas (fora do horário)
- **Escalação**: Demanda complexa → Encaminhar ao agente especializado

### Processo 04.05 — Gestão de aprovações de materiais
- **Agente**: CSAgent
- **Tela**: "Central de Aprovações" (compartilhada com OpsAgent)
- **Componentes**:
  - Preview do material com contexto
  - Mensagem padrão personalizável
  - Timer de prazo (48h)
  - Botões de ação rápida para o cliente
  - Registro automático de aprovação/feedback
  - Notificador de prazo estourado
- **Ações**:
  - Receber material do agente produtor
  - Enviar ao cliente com contexto claro
  - Monitorar prazo
  - Registrar resposta (aprovação ou feedback)
  - Atualizar status no projeto
- **Status Visual**:
  - Azul: Aguardando cliente
  - Verde: Aprovado
  - Laranja: Feedback recebido
  - Vermelho: Prazo estourado
- **Inputs**: Material aprovado no QA
- **Outputs**: Aprovação documentada ou feedback registrado
- **SLA**: 48 horas para resposta do cliente
- **Escalação**: Sem resposta em 48h → Lembrete; 72h → Gestor

### Processo 04.06 — Controle de rounds de revisão
- **Agente**: CSAgent
- **Tela**: "Contador de Revisões"
- **Componentes**:
  - Contador visual de rounds por entregável
  - Limite contratual destacado
  - Calculadora de custo de revisões extras
  - Template de comunicação de limite atingido
  - Histórico de revisões por projeto
- **Ações**:
  - Monitorar contador automaticamente
  - Alertar quando atingir 80% do limite
  - Comunicar cliente ao atingir limite
  - Informar custo de revisões extras
  - Gerar cobrança se aplicável
- **Status Visual**: 
  - Verde: 1-(limite-2) revisões
  - Amarelo: Penúltima revisão
  - Vermelho: Limite atingido
- **Inputs**: Número de revisões no contrato, feedbacks recebidos
- **Outputs**: Revisões controladas, cliente informado, cobrança gerada
- **SLA**: Contínuo
- **Escalação**: Cliente contesta limite → Gestor negocia

### Processo 04.07 — Registro e encaminhamento de solicitações
- **Agente**: CSAgent
- **Tela**: "Tickets de Solicitação"
- **Componentes**:
  - Formulário de captura de solicitação
  - Classificador de prioridade (P1-P4)
  - Roteador automático para agente/setor
  - Tracking de status da solicitação
  - Notificador de atualização para o cliente
- **Ações**:
  - Receber solicitação (alteração, novo projeto, demanda extra)
  - Registrar com dados completos
  - Classificar prioridade
  - Encaminhar ao OpsAgent com classificação
  - Acompanhar resolução
- **Status Visual**: 
  - P1: Vermelho piscante
  - P2: Laranja
  - P3: Azul
  - P4: Cinza
- **Inputs**: Solicitação do cliente
- **Outputs**: Ticket criado, encaminhado, tracking ativo
- **SLA**: 2 horas para confirmação de recebimento
- **Escalação**: Solicitação urgente (P1) → Notificar gestor imediatamente

### Processo 04.08 — Reunião mensal de alinhamento
- **Agente**: CSAgent
- **Tela**: "Reuniões Mensais"
- **Componentes**:
  - Agenda automática (Google Meet)
  - Relatório de performance do mês (auto-gerado)
  - Template de pauta pré-definido
  - Editor de ata colaborativo
  - Checklist de próximos passos
  - Disparador de ata em 24h
- **Ações**:
  - Agendar reunião mensal (45 min)
  - Consolidar relatório de performance
  - Conduzir reunião com pauta estruturada
  - Registrar decisões e feedbacks
  - Enviar ata em até 24h
- **Status Visual**: Calendário com reuniões marcadas (verde = realizada, cinza = agendada)
- **Inputs**: Dados do mês, calendário do cliente
- **Outputs**: Ata enviada, próximos passos definidos
- **SLA**: Primeira semana do mês seguinte, ata em 24h
- **Escalação**: Cliente não comparece → Remarcar + notificar gestor

### Processo 04.09 — Pesquisa de satisfação (NPS)
- **Agente**: CSAgent
- **Tela**: "NPS & Satisfação"
- **Componentes**:
  - Gerador de formulário NPS (2 perguntas)
  - Disparador automático pós-entrega
  - Dashboard de NPS por cliente e geral
  - Alerta de NPS baixo (< 7)
  - Campo de comentário aberto
  - Histórico de NPS ao longo do tempo
- **Ações**:
  - Detectar entrega relevante concluída
  - Disparar formulário NPS
  - Coletar resposta (nota 0-10 + comentário)
  - Registrar no histórico do cliente
  - Analisar tendências
- **Status Visual**: 
  - Verde: NPS ≥ 9 (Promotor)
  - Amarelo: NPS 7-8 (Neutro)
  - Vermelho: NPS ≤ 6 (Detrator)
- **Inputs**: Entrega concluída, contato do cliente
- **Outputs**: NPS registrado, insights coletados
- **SLA**: Até 24h após entrega relevante
- **Escalação**: NPS < 7 → Alertar gestor em 1 hora

### Processo 04.10 — Gestão de insatisfação e reclamações
- **Agente**: CSAgent
- **Tela**: "Gestão de Crises"
- **Componentes**:
  - Alerta vermelho de NPS baixo ou reclamação
  - Template de resposta empática
  - Formulário de registro de problema
  - Workflow de resolução com prazo
  - Checklist de follow-up
  - Medidor de satisfação pós-resolução
- **Ações**:
  - Detectar NPS < 7 ou reclamação direta
  - Responder em até 1 hora com empatia
  - Escalar para gestor com contexto completo
  - Propor solução concreta com prazo
  - Acompanhar resolução
  - Fazer follow-up de satisfação
- **Status Visual**: 
  - Vermelho piscante: Crise ativa
  - Laranja: Em resolução
  - Amarelo: Aguardando follow-up
  - Verde: Resolvido
- **Inputs**: Reclamação ou NPS baixo
- **Outputs**: Problema resolvido, cliente reconquistado
- **SLA**: Resposta em 1 hora, resolução em 24-48h
- **Escalação**: Imediata para gestor + fundador se cliente estratégico

### Processo 04.11 — Gestão de renovação e upsell
- **Agente**: CSAgent
- **Tela**: "Renovações & Expansão"
- **Componentes**:
  - Dashboard de contratos vencendo (60 dias)
  - Avaliador de saúde do cliente (NPS, histórico, projetos)
  - Gerador de apresentação de resultados
  - Construtor de proposta de renovação/upsell
  - Agendador de reunião de renovação
  - Tracker de status da negociação
- **Ações**:
  - Identificar contratos vencendo em 60 dias
  - Avaliar saúde e histórico do cliente
  - Preparar apresentação de resultados
  - Criar proposta de renovação com possível expansão
  - Agendar reunião
  - Acompanhar negociação
- **Status Visual**: Funil de renovação (Proposto → Negociação → Fechado)
- **Inputs**: Contrato com 60 dias para vencer, histórico do cliente
- **Outputs**: Proposta preparada, reunião agendada
- **SLA**: 60 dias antes do vencimento
- **Escalação**: Cliente hesitante → Fundador participa da reunião

---

*Continua nas próximas seções com Social Media (11), Copywriting (10), Design (11), Vídeo (11), Tráfego (11) e Financeiro (10)...*
