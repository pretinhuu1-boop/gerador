# MAPEAMENTO UI/UX - FRENTE 1 (PARTE 1 de 3)
## Seções 05, 06 e 07 - Social Media, Copywriting e Design Gráfico

---

## 📱 SEÇÃO 05: SOCIAL MEDIA (SMAgent) - 11 PROCESSOS

### **Processo 05.01: Planejamento Estratégico Mensal**
- **Agente:** SMAgent
- **Tela Principal:** `Dashboard > Calendário Editorial > Planejamento Mensal`
- **Componentes UI:**
  - Card de métricas do mês anterior (React Flow nodes com dados do Meta Insights)
  - Selector de pilares de conteúdo (4 cards interativos: Posicionamento, Valor, Prova Social, Conversão)
  - Timeline visual do mês (Framer Motion com datas comemorativas destacadas)
  - Input de metas de crescimento (gráfico de projeção com Tremor)
- **Ações do Usuário:**
  - Revisar gráficos de performance automática
  - Ajustar % dos 4 pilares (slider interativo)
  - Selecionar datas comemorativas relevantes (checkbox)
  - Definir meta numérica de crescimento
- **Status Visual:** 
  - 🟡 Em análise (coletando métricas)
  - 🟢 Estratégia definida
  - 🔵 Aprovada pelo gestor
- **Dados de Entrada:** Métricas do mês anterior (API Meta), histórico de posts
- **Dados de Saída:** Documento de estratégia mensal no Notion
- **SLA:** Último dia útil do mês
- **Escalação Humana:** Mudança de posicionamento de marca

---

### **Processo 05.02: Briefing de Pauta com Cliente**
- **Agente:** SMAgent + CSAgent
- **Tela Principal:** `Clientes > [Nome] > Briefing Mensal`
- **Componentes UI:**
  - Formulário Typeform embedado com perguntas dinâmicas
  - Barra de progresso do preenchimento (Framer Motion)
  - Área de uploads de referências (drag & drop)
  - Preview em tempo real das respostas
- **Ações do Usuário (Cliente):**
  - Preencher formulário online
  - Upload de materiais de referência
  - Selecionar produtos/serviços em destaque
- **Status Visual:**
  - ⚪ Aguardando cliente
  - 🟡 Parcialmente preenchido
  - 🟢 Completo
- **Dados de Entrada:** Template de briefing, histórico do cliente
- **Dados de Saída:** Briefing mensal estruturado no Notion
- **SLA:** 48h para cliente preencher
- **Escalação Humana:** Cliente não responde em 72h → CSAgent escala

---

### **Processo 05.03: Criação do Calendário Editorial**
- **Agente:** SMAgent
- **Tela Principal:** `Calendário Editorial > Visão Mensal`
- **Componentes UI:**
  - Calendar view interativo (React Big Calendar ou FullCalendar)
  - Drag & drop de posts entre dias
  - Cards de post com cores por pilar (Posicionamento=azul, Valor=verde, etc.)
  - Contador automático de posts por semana/plataforma
  - Alerta de excesso (>1 post/dia/platforma fica vermelho)
- **Ações do Usuário:**
  - Distribuir posts manualmente ou aceitar sugestão automática
  - Ajustar horários com slider
  - Definir formato (foto/carrossel/reel/story) com dropdown
  - Associar pilar e tema a cada post
- **Status Visual:**
  - 🟡 Em construção
  - 🟢 Completo (30 dias preenchidos)
  - 🔵 Enviado para aprovação
- **Dados de Entrada:** Estratégia mensal, briefing do cliente
- **Dados de Saída:** Calendário editorial completo no Notion
- **SLA:** 2 dias após briefing recebido
- **Escalação Humana:** Conflito de datas importantes

---

### **Processo 05.04: Envio do Calendário para Aprovação**
- **Agente:** SMAgent + CSAgent
- **Tela Principal:** `Aprovações > Calendário Mensal`
- **Componentes UI:**
  - Preview do calendário em formato PDF gerado automaticamente
  - Botão "Enviar para Cliente" com opções (WhatsApp, E-mail, Portal)
  - Timer de 48h para aprovação (countdown com alerta)
  - Histórico de versões (v1, v2, vFinal)
- **Ações do Usuário:**
  - Revisar preview antes de enviar
  - Selecionar canal de envio
  - Adicionar mensagem personalizada
  - Registrar feedback do cliente
- **Status Visual:**
  - 🟡 Aguardando aprovação
  - 🟢 Aprovado
  - 🔴 Rejeitado (com comentários)
- **Dados de Entrada:** Calendário editorial completo
- **Dados de Saída:** Aprovação documentada no Notion
- **SLA:** 48h para cliente aprovar
- **Escalação Humana:** Cliente não responde em 48h → CSAgent aciona

---

### **Processo 05.05: Briefing para Equipe de Produção**
- **Agente:** SMAgent
- **Tela Principal:** `Produção > Briefings Pendentes`
- **Componentes UI:**
  - Lista de cards por post aprovado
  - Tabs separadas: Copy | Design | Vídeo
  - Auto-preenchimento de campos baseado no tipo de post
  - Botão "Distribuir para Agentes" (dispara para CopyAgent, DesignAgent, VideoAgent)
- **Ações do Usuário:**
  - Revisar briefings gerados automaticamente
  - Ajustar detalhes específicos (tom, CTA, referências)
  - Confirmar distribuição
- **Status Visual:**
  - ⚪ Aguardando geração
  - 🟡 Briefing criado
  - 🟢 Distribuído para produção
- **Dados de Entrada:** Calendário aprovado, briefing master do cliente
- **Dados de Saída:** Briefings específicos no ClickUp/Notion para cada agente
- **SLA:** Imediato após aprovação do calendário
- **Escalação Humana:** Briefing ambíguo requer esclarecimento

---

### **Processo 05.06: Revisão dos Materiais Produzidos**
- **Agente:** SMAgent
- **Tela Principal:** `QA > Materiais em Revisão`
- **Componentes UI:**
  - Grid de preview dos materiais (imagens, vídeos, textos)
  - Checklist lateral automatizado (tom de voz ✓, CTA ✓, dimensões ✓, etc.)
  - Ferramenta de annotação (desenhar sobre a imagem/vídeo)
  - Comparação lado a lado: Briefing vs Entregável
- **Ações do Usuário:**
  - Marcar checklist item por item
  - Fazer annotações nos materiais
  - Aprovar ou solicitar revisão com comentários
- **Status Visual:**
  - 🟡 Em revisão
  - 🟢 Aprovado internamente
  - 🔴 Devolvido para ajustes
- **Dados de Entrada:** Materiais do CopyAgent, DesignAgent, VideoAgent
- **Dados de Saída:** Materiais aprovados ou devolvidos com feedback
- **SLA:** 24h para revisar
- **Escalação Humana:** Divergência grave com briefing

---

### **Processo 05.07: Envio ao Cliente para Aprovação Final**
- **Agente:** SMAgent + CSAgent
- **Tela Principal:** `Aprovações > Batch Semanal`
- **Componentes UI:**
  - Agrupamento por semana (Segunda a Domingo)
  - Preview de como ficará publicado (mockup de Instagram/TikTok)
  - Contador de rounds de revisão por post
  - Botão "Enviar Batch" com mensagem padrão personalizável
- **Ações do Usuário:**
  - Selecionar posts da semana
  - Gerar preview automático
  - Enviar para cliente
  - Registrar aprovação/feedback
- **Status Visual:**
  - 🟡 Aguardando aprovação
  - 🟢 Aprovado
  - 🔴 Em revisão (round 1/2/3)
  - ⚫ Limite de revisões atingido
- **Dados de Entrada:** Materiais aprovados no QA interno
- **Dados de Saída:** Aprovação final documentada
- **SLA:** 48h para cliente aprovar
- **Escalação Humana:** Cliente excede rounds contratuais → CSAgent negocia

---

### **Processo 05.08: Agendamento das Publicações**
- **Agente:** SMAgent
- **Tela Principal:** `Publicações > Agendamentos`
- **Componentes UI:**
  - Integração visual com Meta Business Suite / Later
  - Timeline de publicações agendadas
  - Preview mobile de cada post agendado
  - Status de sincronização com plataformas
- **Ações do Usuário:**
  - Confirmar agendamento em lote
  - Ajustar horário individual se necessário
  - Verificar preview antes de confirmar
  - Monitorar status de publicação
- **Status Visual:**
  - ⚪ Pendente de agendamento
  - 🟡 Agendado
  - 🟢 Publicado
  - 🔴 Falha na publicação
- **Dados de Entrada:** Posts aprovados pelo cliente
- **Dados de Saída:** Posts agendados nas plataformas via API
- **SLA:** 7 dias antes da publicação
- **Escalação Humana:** API da plataforma indisponível

---

### **Processo 05.09: Monitoramento Diário de Publicações**
- **Agente:** SMAgent
- **Tela Principal:** `Monitoramento > Dashboard Diário`
- **Componentes UI:**
  - Feed unificado de comentários de todas as plataformas
  - Sistema de tickets para DMs e comentários
  - Respostas rápidas com templates (base de conhecimento)
  - Alertas de menções à marca
  - Botão de denúncia/remoção de conteúdo
- **Ações do Usuário:**
  - Responder comentários (com sugestões automáticas do agente)
  - Classificar DMs por prioridade
  - Marcar comentários como respondidos
  - Sinalizar conteúdo problemático
- **Status Visual:**
  - 🔴 Comentários não respondidos (>2h)
  - 🟡 DMs pendentes
  - 🟢 Tudo em dia
- **Dados de Entrada:** Comentários, DMs, menções das APIs sociais
- **Dados de Saída:** Interações respondidas, logs de monitoramento
- **SLA:** 2h para responder comentários/DMs
- **Escalação Humana:** Comentário viral negativo ou crise de imagem

---

### **Processo 05.10: Coleta de Métricas Semanais**
- **Agente:** SMAgent
- **Tela Principal:** `Analytics > Métricas Semanais`
- **Componentes UI:**
  - Gráficos automáticos do Tremor (alcance, engajamento, seguidores)
  - Comparativo semana atual vs anterior
  - Top posts da semana com análise automática
  - Exportação para Google Sheets
- **Ações do Usuário:**
  - Revisar métricas coletadas automaticamente
  - Adicionar insights manuais se necessário
  - Aprovar relatório semanal
- **Status Visual:**
  - 🟡 Coletando dados (sexta-feira)
  - 🟢 Métricas consolidadas
- **Dados de Entrada:** APIs Meta Insights, TikTok Analytics, GA4
- **Dados de Saída:** Planilha consolidada de métricas semanais
- **SLA:** Toda sexta-feira
- **Escalação Humana:** Discrepância anômala nas métricas

---

### **Processo 05.11: Relatório Mensal de Performance**
- **Agente:** SMAgent
- **Tela Principal:** `Relatórios > Mensal`
- **Componentes UI:**
  - Template Canva/Google Slides gerado automaticamente
  - Gráficos de evolução mês a mês
  - Top 3 posts com análise de performance
  - Comparativo com metas estabelecidas
  - Seção de insights e recomendações (preenchida pelo agente)
  - Botão "Apresentar ao Cliente" (agenda reunião automática)
- **Ações do Usuário:**
  - Revisar relatório gerado
  - Ajustar insights se necessário
  - Agendar apresentação com cliente
  - Enviar relatório por e-mail/portal
- **Status Visual:**
  - 🟡 Gerando relatório (dia 1 do mês)
  - 🟢 Pronto para apresentação
  - 🔵 Apresentado ao cliente
- **Dados de Entrada:** Métricas mensais consolidadas, metas do cliente
- **Dados de Saída:** Relatório em PDF/Slides enviado ao cliente
- **SLA:** Primeiro dia útil de cada mês
- **Escalação Humana:** Resultados muito abaixo da meta exigem explicação estratégica

---

## ✍️ SEÇÃO 06: COPYWRITING (CopyAgent) - 10 PROCESSOS

### **Processo 06.01: Imersão no Briefing Master**
- **Agente:** CopyAgent
- **Tela Principal:** `Briefing > Master do Cliente`
- **Componentes UI:**
  - Documento Notion integrado com highlighting de pontos-chave
  - Tags de tom de voz (ex: "descontraído", "profissional", "provocativo")
  - Lista de palavras proibidas/permitidas
  - Histórico de copies anteriores aprovadas (carousel)
  - Quiz de compreensão (agente faz auto-checklist)
- **Ações do Usuário:**
  - Revisar briefing master
  - Atualizar informações se necessário
  - Confirmar compreensão do tom de voz
- **Status Visual:**
  - 🟡 Lendo briefing
  - 🟢 Contexto absorvido
- **Dados de Entrada:** Briefing master no Notion, histórico de copies
- **Dados de Saída:** Contexto carregado na memória do agente
- **SLA:** Antes de qualquer produção
- **Escalação Humana:** Briefing desatualizado ou contraditório

---

### **Processo 06.02: Receber Briefing Específico de Produção**
- **Agente:** CopyAgent
- **Tela Principal:** `Tarefas > Briefings de Copy`
- **Componentes UI:**
  - Card de tarefa com todos os detalhes do post
  - Campos destacados: tema, pilar, objetivo, CTA, limite de caracteres
  - Referências visuais anexadas
  - Botão "Aceitar Tarefa"
- **Ações do Usuário:**
  - Ler briefing específico
  - Clarificar dúvidas com SMAgent (chat integrado)
  - Confirmar recebimento
- **Status Visual:**
  - ⚪ Nova tarefa
  - 🟡 Em leitura
  - 🟢 Compreendido
- **Dados de Entrada:** Briefing do SMAgent via Notion/ClickUp
- **Dados de Saída:** Tarefa aceita e compreendida
- **SLA:** Imediato ao receber do SMAgent
- **Escalação Humana:** Briefing incompleto ou ambíguo

---

### **Processo 06.03: Pesquisa de Referências e Tendências**
- **Agente:** CopyAgent
- **Tela Principal:** `Pesquisa > Tendências do Nicho`
- **Componentes UI:**
  - Feed integrado do Instagram/TikTok com posts trending do nicho
  - Análise automática de hooks mais usados
  - Banco de referências salvas (favoritos)
  - Word cloud de termos performáticos
- **Ações do Usuário:**
  - Revisar tendências identificadas pelo agente
  - Salvar referências relevantes
  - Selecionar hooks promissores
- **Status Visual:**
  - 🟡 Pesquisando
  - 🟢 Referências coletadas
- **Dados de Entrada:** APIs Instagram/TikTok, Google Trends
- **Dados de Saída:** Lista de referências e insights de hooks
- **SLA:** 1-2 horas por peça
- **Escalação Humana:** Nicho muito específico sem dados suficientes

---

### **Processo 06.04: Produção da Legenda/Copy**
- **Agente:** CopyAgent
- **Tela Principal:** `Editor de Copy > Produção`
- **Componentes UI:**
  - Editor de texto com estrutura guiada (Hook → Desenvolvimento → CTA)
  - Contador de caracteres em tempo real
  - Sugestão de emojis baseada no tom
  - Gerador de 2 versões alternativas (botão "Gerar Variações")
  - Preview de como ficará no mobile
  - Checker de ortografia/gramática integrado
- **Ações do Usuário:**
  - Escrever/editar copy
  - Gerar variações automáticas
  - Selecionar melhor versão
  - Auto-revisão com checklist
- **Status Visual:**
  - 🟡 Escrevendo
  - 🟢 2 versões produzidas
  - 🔵 Aprovado internamente
- **Dados de Entrada:** Briefing específico, referências, briefing master
- **Dados de Saída:** 2 versões de copy no Google Docs/Notion
- **SLA:** 2-3 dias antes da publicação
- **Escalação Humana:** Dificuldade em criar hook eficaz

---

### **Processo 06.05: Produção de Roteiro de Reel/TikTok**
- **Agente:** CopyAgent
- **Tela Principal:** `Editor de Roteiros > Produção`
- **Componentes UI:**
  - Template de roteiro com marcações de tempo
  - Timeline visual do vídeo (0-3s hook, 3-15s desenvolvimento, 15-30s CTA)
  - Campos para: tom de voz, sugestão de trilha, texto on-screen, transições
  - Preview de roteiro formatado
  - Integração com VideoAgent para revisão técnica
- **Ações do Usuário:**
  - Escrever roteiro cena por cena
  - Definir timing de cada parte
  - Sugerir elementos visuais e sonoros
  - Revisar com VideoAgent
- **Status Visual:**
  - 🟡 Escrevendo roteiro
  - 🟢 Roteiro completo
  - 🔵 Aprovado tecnicamente
- **Dados de Entrada:** Briefing de vídeo, referências de Reels performáticos
- **Dados de Saída:** Roteiro detalhado no Google Docs
- **SLA:** 4 dias antes da publicação
- **Escalação Humana:** Roteiro complexo exige direção criativa humana

---

### **Processo 06.06: Produção de Copy para Anúncio (Ads)**
- **Agente:** CopyAgent + AdsAgent
- **Tela Principal:** `Ads > Copies para Teste A/B/C`
- **Componentes UI:**
  - Formulário com limites de caracteres (título 30, subtítulo 90, texto 125)
  - Preview de como o anúncio aparecerá no feed/stories
  - Gerador de 3 variações (A/B/C) automático
  - Sugestões de gatilhos (urgência, prova social, etc.)
  - Histórico de copies que performaram bem
- **Ações do Usuário:**
  - Escrever variações de copy
  - Testar diferentes gatilhos
  - Preview em diferentes formatos
  - Submeter para AdsAgent
- **Status Visual:**
  - 🟡 Criando variações
  - 🟢 3 versões prontas
  - 🔵 Enviado para AdsAgent
- **Dados de Entrada:** Briefing de campanha, criativos do DesignAgent
- **Dados de Saída:** 3 variações de copy por criativo
- **SLA:** 3 dias antes do lançamento da campanha
- **Escalação Humana:** Campanha de alto budget (>R$ 10k) requer revisão humana

---

### **Processo 06.07: Produção de Copy de Site/Landing Page**
- **Agente:** CopyAgent
- **Tela Principal:** `Projetos Web > Copy de LP`
- **Componentes UI:**
  - Wireframe visual da landing page com seções marcadas
  - Editor por seção (Hero, Benefícios, Como Funciona, Depoimentos, FAQ, CTA)
  - Checklist de conversão (headline impactante, benefícios claros, prova social, urgência)
  - Preview da página com copy inserida
  - Integração com DesignAgent para layout
- **Ações do Usuário:**
  - Escrever copy seção por seção
  - Revisar fluxo de conversão
  - Ajustar baseado no design
  - Aprovar versão final
- **Status Visual:**
  - 🟡 Escrevendo seções
  - 🟢 Copy completa
  - 🔵 Integrada ao design
- **Dados de Entrada:** Wireframe, briefing de produto/serviço
- **Dados de Saída:** Copy completa estruturada por seções
- **SLA:** Conforme cronograma do projeto web
- **Escalação Humana:** Projeto de rebranding ou posicionamento complexo

---

### **Processo 06.08: Revisão e Autoedição**
- **Agente:** CopyAgent
- **Tela Principal:** `QA > Revisão de Copy`
- **Componentes UI:**
  - Leitor de texto em voz alta (text-to-speech para fluidez)
  - Checklist automatizado: tom de voz ✓, ortografia ✓, hook forte ✓, CTA claro ✓
  - Highlighter de problemas potenciais
  - Comparação com briefing original
  - Integração Grammarly
- **Ações do Usuário:**
  - Ouvir copy em voz alta
  - Marcar checklist item por item
  - Corrigir problemas identificados
  - Aprovar para envio
- **Status Visual:**
  - 🟡 Em revisão
  - 🟢 Aprovado internamente
- **Dados de Entrada:** Copies produzidas
- **Dados de Saída:** Copies revisadas e aprovadas
- **SLA:** Imediato após produção
- **Escalação Humana:** Copy não atinge padrões de qualidade

---

### **Processo 06.09: Entrega ao Social Media**
- **Agente:** CopyAgent
- **Tela Principal:** `Entregas > Copy para SMAgent`
- **Componentes UI:**
  - Lista de copies organizadas por data de publicação
  - Links diretos para calendário editorial
  - Campo para notas do copywriter (contexto especial)
  - Botão "Enviar para SMAgent"
  - Confirmação de recebimento
- **Ações do Usuário:**
  - Organizar copies por data
  - Adicionar notas contextuais
  - Confirmar entrega
  - Aguardar confirmação do SMAgent
- **Status Visual:**
  - 🟡 Pronto para entrega
  - 🟢 Entregue
  - 🔵 Recebido por SMAgent
- **Dados de Entrada:** Copies revisadas e aprovadas
- **Dados de Saída:** Copies linkadas ao calendário no Notion
- **SLA:** 5 dias antes da publicação (legendas/roteiros)
- **Escalação Humana:** Atraso na entrega impacta cronograma

---

### **Processo 06.10: Gestão de Revisões**
- **Agente:** CopyAgent
- **Tela Principal:** `Revisões > Feedback do Cliente`
- **Componentes UI:**
  - Thread de feedback do cliente (comentários no documento)
  - Comparação versão anterior vs nova
  - Contador de rounds de revisão
  - Estimativa de tempo para revisão (24h)
  - Alerta se revisão altera posicionamento (escalar)
- **Ações do Usuário:**
  - Analisar feedback do cliente
  - Decidir se está dentro do escopo
  - Produzir nova versão
  - Manter hook e CTA originais
  - Reenviar em até 24h
- **Status Visual:**
  - 🟡 Aguardando revisão
  - 🟢 Revisão entregue
  - 🔵 Aprovada pelo cliente
  - ⚫ Escalada (mudança de posicionamento)
- **Dados de Entrada:** Feedback do cliente via CSAgent/SMAgent
- **Dados de Saída:** Copy revisada entregue
- **SLA:** 24h para entregar revisão
- **Escalação Humana:** Revisão altera completamente o posicionamento da marca

---

## 🎨 SEÇÃO 07: DESIGN GRÁFICO (DesignAgent) - 11 PROCESSOS

### **Processo 07.01: Receber e Analisar Briefing Visual**
- **Agente:** DesignAgent
- **Tela Principal:** `Tarefas > Briefings de Design`
- **Componentes UI:**
  - Card de tarefa com especificações completas
  - Dimensões destacadas, paleta de cores, elementos obrigatórios
  - Referências visuais em grid
  - Texto da copy já inserido (do CopyAgent)
  - Link para manual de marca se existir
  - Botão "Aceitar Briefing"
- **Ações do Usuário:**
  - Analisar todos os requisitos
  - Verificar existência de manual de marca
  - Confirmar compreensão
  - Solicitar esclarecimentos se necessário
- **Status Visual:**
  - ⚪ Novo briefing
  - 🟡 Em análise
  - 🟢 Aceito para produção
- **Dados de Entrada:** Briefing do SMAgent, copy do CopyAgent
- **Dados de Saída:** Briefing compreendido e aceito
- **SLA:** Imediato ao receber
- **Escalação Humana:** Briefing contraditório ou incompleto

---

### **Processo 07.02: Consultar Manual de Marca do Cliente**
- **Agente:** DesignAgent
- **Tela Principal:** `Recursos > Manuais de Marca`
- **Componentes UI:**
  - Visualizador de PDF do manual de marca
  - Paleta de cores interativa (clicar copia HEX/CMYK)
  - Tipografia com preview de fontes
  - Logo com área de respiro destacada
  - Lista de elementos proibidos
  - Estilo fotográfico preferido em carousel
- **Ações do Usuário:**
  - Navegar pelo manual
  - Copiar códigos de cores
  - Baixar logos e assets
  - Marcar manual como "consultado"
- **Status Visual:**
  - 🟡 Consultando manual
  - 🟢 Manual absorvido
- **Dados de Entrada:** Manual de marca no Google Drive
- **Dados de Saída:** Assets e diretrizes carregadas no projeto
- **SLA:** Sempre antes de criar peça nova
- **Escalação Humana:** Manual desatualizado ou inexistente

---

### **Processo 07.03: Seleção de Banco de Imagens e Assets**
- **Agente:** DesignAgent
- **Tela Principal:** `Assets > Banco de Imagens`
- **Componentes UI:**
  - Busca integrada em múltiplos bancos (Unsplash, Pexels, Adobe Stock, Freepik)
  - Filtros por orientação, cor dominante, estilo
  - Indicador de licença comercial ✓
  - Pasta do projeto no Drive com assets selecionados
  - Preview de imagens favoritas
- **Ações do Usuário:**
  - Buscar imagens por palavra-chave
  - Filtrar por características
  - Selecionar e baixar imagens licenciadas
  - Organizar na pasta do projeto
- **Status Visual:**
  - 🟡 Selecionando assets
  - 🟢 Assets licenciados prontos
- **Dados de Entrada:** Tema do post, briefing visual
- **Dados de Saída:** Assets organizados na pasta do cliente
- **SLA:** 1-2 horas por peça
- **Escalação Humana:** Imagem específica necessária não disponível em bancos

---

### **Processo 07.04: Criação das Peças - Posts de Feed**
- **Agente:** DesignAgent
- **Tela Principal:** `Editor de Design > Posts de Feed`
- **Componentes UI:**
  - Canvas do Figma/Canva integrado
  - Templates de formatos (1080x1080, 1080x1350)
  - Camadas organizadas: elemento principal → headline → subtext → CTA/logo
  - Verificador de contraste WCAG 4.5:1 em tempo real
  - Gerador de variações de cor
  - Preview mobile
- **Ações do Usuário:**
  - Arrastar elementos para o canvas
  - Aplicar hierarquia visual
  - Inserir copy recebida
  - Verificar contraste e legibilidade
  - Criar variações se necessário
  - Exportar em alta resolução
- **Status Visual:**
  - 🟡 Criando peça
  - 🟢 Arte finalizada
  - 🔵 QA interno aprovado
- **Dados de Entrada:** Briefing visual, copy, assets selecionados, manual de marca
- **Dados de Saída:** Arte de feed em PNG/JPG alta resolução
- **SLA:** 4 dias antes da publicação
- **Escalação Humana:** Peça conceitual complexa ou ilustração customizada

---

### **Processo 07.05: Criação das Peças - Stories**
- **Agente:** DesignAgent
- **Tela Principal:** `Editor de Design > Stories`
- **Componentes UI:**
  - Canvas vertical 1080x1920
  - Zona segura destacada (100px de margem)
  - Stickers interativos (enquete, quiz, link) pré-configurados
  - Templates de layouts verticais
  - Preview em dispositivo móvel
- **Ações do Usuário:**
  - Adaptar layout para vertical
  - Posicionar textos dentro da zona segura
  - Adicionar elementos interativos
  - Testar legibilidade sem zoom
  - Exportar para stories
- **Status Visual:**
  - 🟡 Criando stories
  - 🟢 Stories finalizados
  - 🔵 Aprovados no QA
- **Dados de Entrada:** Briefing de story, copy, assets
- **Dados de Saída:** Stories em PNG/JPG 1080x1920
- **SLA:** 4 dias antes da publicação
- **Escalação Humana:** Story com animação complexa requer After Effects

---

### **Processo 07.06: Criação dos Criativos de Anúncios**
- **Agente:** DesignAgent + AdsAgent
- **Tela Principal:** `Ads > Criativos para Teste`
- **Componentes UI:**
  - Multi-format generator: 1080x1080, 1080x1350, 1080x1920 simultaneamente
  - Variação automática para cada copy A/B/C
  - Verificador de proporção de texto (<20% da imagem)
  - Preview de como aparece no feed/stories do Meta
  - Pack de 3-6 variações por conjunto
- **Ações do Usuário:**
  - Criar peça base
  - Gerar variações de formato automaticamente
  - Adaptar para cada variação de copy
  - Verificar regra dos 20% de texto
  - Exportar pack completo
- **Status Visual:**
  - 🟡 Criando variações
  - 🟢 Pack de criativos pronto
  - 🔵 Enviado para AdsAgent
- **Dados de Entrada:** Copies A/B/C do CopyAgent, briefing de campanha
- **Dados de Saída:** Pack de 3-6 criativos em todos os formatos
- **SLA:** 3 dias antes do lançamento da campanha
- **Escalação Humana:** Criativo de alto budget (>R$ 10k) requer revisão humana

---

### **Processo 07.07: Criação de Identidade Visual**
- **Agente:** DesignAgent
- **Tela Principal:** `Projetos > Branding > Identidade Visual`
- **Componentes UI:**
  - Moodboard colaborativo (Pinterest-style)
  - Sketches de logo em canvas livre
  - Comparador de 3-5 direções de logo
  - Desenvolvimento digital das melhores opções
  - Ferramenta de refinamento de logo aprovado
  - Gerador de manual de marca em PDF
  - Controle de 3 rounds de revisão
- **Ações do Usuário:**
  - Pesquisar referências e criar moodboard
  - Desenhar sketches preliminares
  - Desenvolver 3 propostas digitais
  - Refinar proposta aprovada
  - Gerar manual completo
  - Gerenciar rounds de revisão
- **Status Visual:**
  - 🟡 Pesquisa e moodboard
  - 🟡 Sketcheando
  - 🟡 Desenvolvendo propostas
  - 🟢 Manual de marca entregue
  - 🔵 Rounds de revisão (1/2/3)
- **Dados de Entrada:** Briefing de branding, referências do cliente
- **Dados de Saída:** Manual de marca completo em PDF + arquivos editáveis
- **SLA:** Conforme cronograma de projeto de branding
- **Escalação Humana:** Rebranding completo ou decisões estratégicas de marca

---

### **Processo 07.08: Criação de Peças para Site/LP**
- **Agente:** DesignAgent
- **Tela Principal:** `Projetos Web > Assets de Site`
- **Componentes UI:**
  - Wireframe da página como guia
  - Lista de assets necessários por seção
  - Otimizador de imagens para web (compressão para <200kb)
  - Exportador em WebP/JPEG automático
  - Organização por seção da página
  - Preview da página com assets inseridos
- **Ações do Usuário:**
  - Criar banners, ícones, ilustrações por seção
  - Otimizar para web automaticamente
  - Exportar em formatos adequados
  - Organizar por pasta de seção
  - Validar no contexto da página
- **Status Visual:**
  - 🟡 Criando assets
  - 🟢 Assets otimizados
  - 🔵 Integrados ao site
- **Dados de Entrada:** Wireframe, copy das seções, identidade visual
- **Dados de Saída:** Assets exportados e organizados por seção
- **SLA:** Conforme cronograma do projeto web
- **Escalação Humana:** Ilustrações customizadas complexas

---

### **Processo 07.09: Revisão de Qualidade Interna**
- **Agente:** DesignAgent
- **Tela Principal:** `QA > Revisão de Design`
- **Componentes UI:**
  - Checklist automatizado: resolução ✓, cores ✓, ortografia ✓, dimensões ✓, proporção de texto ✓
  - Zoom inspector para verificar qualidade
  - Comparador de cores com paleta do cliente
  - Verificador de ortografia em textos na arte
  - Preview em diferentes dispositivos
- **Ações do Usuário:**
  - Passar por checklist item por item
  - Inspecionar qualidade em zoom
  - Verificar consistência de cores
  - Corrigir erros encontrados
  - Aprovar para entrega
- **Status Visual:**
  - 🟡 Em revisão QA
  - 🟢 Aprovado internamente
- **Dados de Entrada:** Peças finalizadas
- **Dados de Saída:** Peças aprovadas no QA
- **SLA:** Imediato após criação
- **Escalação Humana:** Erro crítico de marca ou qualidade insuficiente

---

### **Processo 07.10: Exportação e Entrega**
- **Agente:** DesignAgent
- **Tela Principal:** `Entregas > Design para SMAgent`
- **Componentes UI:**
  - Exportador em lote com formatos pré-configurados
  - Nomenclatura automática: CLIENTE_PROJETO_SETOR_VERSÃO_DATA
  - Organização automática na pasta do cliente no Drive
  - Link automático para calendário no Notion
  - Confirmação de entrega
- **Ações do Usuário:**
  - Selecionar peças para exportar
  - Confirmar formatos e nomenclatura
  - Exportar em lote
  - Linkar ao calendário
  - Notificar SMAgent
- **Status Visual:**
  - 🟡 Pronto para exportar
  - 🟢 Exportado e organizado
  - 🔵 Entregue e linkado
- **Dados de Entrada:** Peças aprovadas no QA
- **Dados de Saída:** Arquivos na pasta do cliente, linkados ao calendário
- **SLA:** Imediato após aprovação no QA
- **Escalação Humana:** Problema técnico na exportação

---

### **Processo 07.11: Gestão de Revisões**
- **Agente:** DesignAgent
- **Tela Principal:** `Revisões > Feedback do Cliente`
- **Componentes UI:**
  - Thread de feedback com annotações na imagem
  - Comparador lado a lado: versão anterior vs nova
  - Contador de rounds de revisão (1/2/3)
  - Estimativa de 24h para entrega
  - Alerta se revisão altera conceito completamente
  - Numeração automática de versões (v1, v2, v3, vFinal)
- **Ações do Usuário:**
  - Analisar feedback do cliente
  - Verificar se está dentro dos rounds contratuais
  - Fazer alterações solicitadas
  - Exportar nova versão numerada
  - Entregar em até 24h
  - Registrar se requer novo briefing
- **Status Visual:**
  - 🟡 Aguardando revisão
  - 🟢 Revisão entregue (v2/v3)
  - 🔵 Aprovada pelo cliente
  - ⚫ Conceito alterado → novo briefing
- **Dados de Entrada:** Feedback do cliente via CSAgent/SMAgent
- **Dados de Saída:** Versão revisada entregue
- **SLA:** 24h para entregar revisão
- **Escalação Humana:** Revisão altera completamente o conceito → novo briefing necessário

---

## 📊 RESUMO DA FRENTE 1 - PARTE 1

**Total de Processos Mapeados:** 32 processos
- **Social Media (SMAgent):** 11 processos ✓
- **Copywriting (CopyAgent):** 10 processos ✓
- **Design Gráfico (DesignAgent):** 11 processos ✓

**Próxima Parte:** Frente 1 - Parte 2 (Vídeo, Tráfego Pago e Financeiro - 32 processos restantes)
