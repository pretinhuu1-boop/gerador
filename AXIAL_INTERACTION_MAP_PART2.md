# 🗺️ AXIAL AI - MAPA MESTRE DE INTERAÇÕES E COMPONENTES
## PARTE 2: SOCIAL MEDIA, COPYWRITING & DESIGN

**Documento Base:** 97 Processos Operacionais Lumiere Agency  
**Objetivo:** Mapear cada ação do usuário → componente UI → interação com agente → feedback visual  
**Total de Ações Mapeadas nesta Parte:** 32 interações específicas  

---

## 📱 SEÇÃO 05 - SOCIAL MEDIA (SMAgent)

### Processo 05.01 - Planejamento estratégico mensal
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Clicar em "Gerar Estratégia do Mês" e revisar pilares sugeridos |
| **Componente Principal** | `MonthlyStrategyPlanner` |
| **Sub-componentes** | `PerformanceReviewChart`, `PillarSelector`, `GoalSetter`, `CalendarDatesPicker` |
| **Estado da UI** | Dashboard mostra métricas do mês anterior → IA sugere 4 pilares → usuário ajusta porcentagens → define metas |
| **Agente Acionado** | SMAgent (análise + estratégia) |
| **Feedback Visual** | Gráficos de performance com animação, pills dos pilares selecionados em azul, meta com progresso em % |
| **SLA Visual** | 5s para analisar mês anterior, instantâneo ao ajustar |

### Processo 05.02 - Briefing de pauta com cliente
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Enviar formulário personalizado via link ou preencher internamente |
| **Componente Principal** | `ClientBriefingFormBuilder` |
| **Sub-componentes** | `QuestionEditor`, `FormPreview`, `SendLinkButton`, `ResponseTracker` |
| **Estado da UI** | Editor de perguntas → preview do formulário → envio de link → tracker de respostas em tempo real |
| **Agente Acionado** | SMAgent (envio + processamento) |
| **Feedback Visual** | Link copiado, contador "X/Y clientes responderam", notificação quando cliente responde |
| **SLA Visual** | 2s para gerar link, instantâneo ao receber resposta |

### Processo 05.03 - Criação do calendário editorial
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Arrastar posts para dias específicos e ajustar formatos |
| **Componente Principal** | `EditorialCalendarBuilder` |
| **Sub-componentes** | `MonthViewGrid`, `PostCard`, `FormatSelector`, `PillarTagger`, `DragDropHandler` |
| **Estado da UI** | Grid mensal vazio → usuário arrasta cards de post → seleciona formato (foto/reel/carrossel) → taggeia pilar |
| **Agente Acionado** | SMAgent (distribuição inteligente) |
| **Feedback Visual** | Cards encaixam com snap, warning se >1 post/dia/plataforma, contador de posts por pilar atualizado |
| **SLA Visual** | Instantâneo no drag, 1s para validar regras |

### Processo 05.04 - Envio do calendário para aprovação
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Clicar em "Enviar para Aprovação" com mensagem personalizada |
| **Componente Principal** | `CalendarApprovalSender` |
| **Sub-componentes** | `PreviewPDF`, `MessageCustomizer`, `DeadlinePicker`, `TrackingDashboard` |
| **Estado da UI** | Preview do calendário em PDF → editor de mensagem → selector de prazo (48h default) → envia |
| **Agente Acionado** | SMAgent (envio) + CSAgent (follow-up) |
| **Feedback Visual** | Toast "Calendário enviado", status muda para "Aguardando aprovação", countdown de 48h inicia |
| **SLA Visual** | 3s para gerar PDF e enviar |

### Processo 05.05 - Briefing para equipe de produção
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Clicar em "Gerar Briefings" e revisar automaticamente |
| **Componente Principal** | `ProductionBriefingGenerator` |
| **Sub-componentes** | `BriefingList`, `CopyBriefCard`, `DesignBriefCard`, `VideoBriefCard`, `SendToAgentButton` |
| **Estado da UI** | Lista de posts aprovados → gera 3 briefings por post (copy/design/vídeo) → usuário revisa → envia para agentes |
| **Agente Acionado** | SMAgent (geração) + CopyAgent/DesignAgent/VideoAgent (recebimento) |
| **Feedback Visual** | Cards de briefing com ícones coloridos por setor, badge "Enviado" após confirmação |
| **SLA Visual** | 2s para gerar todos briefings |

### Processo 05.06 - Revisão dos materiais produzidos
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Visualizar comparação lado-a-lado e marcar aprovação/rejeição |
| **Componente Principal** | `ProductionReviewBoard` |
| **Sub-componentes** | `SideBySideViewer`, `BriefingChecklist`, `CommentTool`, `ApproveRejectButtons` |
| **Estado da UI** | Tela dividida: briefing à esquerda, material produzido à direita → checklist de verificação → comentários → aprova/rejeita |
| **Agente Acionado** | SMAgent (validação) |
| **Feedback Visual** | Checkboxes verdes, comentários em threads laterais, botão aprova fica verde, rejeita fica vermelho |
| **SLA Visual** | Instantâneo |

### Processo 05.07 - Envio ao cliente para aprovação final
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Selecionar batch semanal e enviar para cliente |
| **Componente Principal** | `ClientBatchSender` |
| **Sub-componentes** | `BatchSelector`, `PreviewCarousel`, `MessageEditor`, `ApprovalTracker` |
| **Estado da UI** | Selector de semana → carousel com posts → editor de mensagem → envio → tracker de aprovação |
| **Agente Acionado** | CSAgent (envio) + SMAgent (tracking) |
| **Feedback Visual** | Badge "Enviado", timeline com deadline de 48h, notificação quando cliente aprova |
| **SLA Visual** | 3s para enviar batch |

### Processo 05.08 - Agendamento das publicações
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Confirmar agendamento em lote com preview de como ficará |
| **Componente Principal** | `PostSchedulerPro` |
| **Sub-componentes** | `PlatformPreview`, `DateTimePicker`, `HashtagManager`, `BatchConfirmModal` |
| **Estado da UI** | Preview mobile de cada post → selector de data/hora → gerenciador de hashtags → confirmação em lote |
| **Agente Acionado** | SMAgent (agendamento via API) |
| **Feedback Visual** | Checkmarks verdes por plataforma agendada, contador "X posts agendados", ícone de calendário preenchido |
| **SLA Visual** | 5s por plataforma (API call) |

### Processo 05.09 - Monitoramento diário de publicações
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Visualizar dashboard de publicações do dia e responder comentários |
| **Componente Principal** | `DailyMonitoringDashboard` |
| **Sub-componentes** | `PublishedPostsList`, `CommentsInbox`, `DMReader`, `QuickReplyTemplates` |
| **Estado da UI** | Lista de posts publicados → comentários chegam em inbox → usuário clica e responde com templates ou texto livre |
| **Agente Acionado** | SMAgent (monitoramento) + CSAgent (respostas) |
| **Feedback Visual** | Badge de comentários não lidos em vermelho, toast "Resposta enviada", status muda para "Respondido" |
| **SLA Visual** | Tempo real (WebSocket) |

### Processo 05.10 - Coleta de métricas semanais
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Clicar em "Atualizar Métricas" e visualizar gráficos |
| **Componente Principal** | `WeeklyMetricsCollector` |
| **Sub-componentes** | `PlatformSelector`, `MetricCharts`, `ComparisonToggle`, `ExportCSVButton` |
| **Estado da UI** | Selector de plataforma/semana → gráficos de alcance, engajamento, seguidores → comparativo com semana anterior → exportar |
| **Agente Acionado** | SMAgent (coleta via API) |
| **Feedback Visual** | Spinners enquanto coleta, gráficos animados, badge "Atualizado há X min" |
| **SLA Visual** | 10s para coletar todas plataformas |

### Processo 05.11 - Relatório mensal de performance
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Gerar relatório, editar insights e enviar ao cliente |
| **Componente Principal** | `MonthlyReportGenerator` |
| **Sub-componentes** | `ReportTemplateSelector`, `AutoInsightsEditor`, `TopPostsHighlighter`, `SendToClientButton` |
| **Estado da UI** | Template selecionado → IA gera insights automáticos → usuário edita → destaca top 3 posts → envia |
| **Agente Acionado** | SMAgent (consolidação) |
| **Feedback Visual** | Preview do relatório em PDF, insights destacados em amarelo, toast "Relatório enviado" |
| **SLA Visual** | 8s para gerar relatório completo |

---

## ✍️ SEÇÃO 06 - COPYWRITING (CopyAgent)

### Processo 06.01 - Imersão no briefing master
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Abrir briefing master e marcar como "Lido e Compreendido" |
| **Componente Principal** | `BriefingMasterViewer` |
| **Sub-componentes** | `SectionAccordion`, `ToneOfVoiceTags`, `ForbiddenWordsList`, `CompetitorGrid`, `ReadConfirmButton` |
| **Estado da UI** | Briefing organizado em abas (posicionamento, público, tom, restrições) → usuário navega → marca como lido |
| **Agente Acionado** | CopyAgent (context loading) |
| **Feedback Visual** | Progress bar de leitura, badge "Briefing Dominado" em verde, tags de tom destacadas |
| **SLA Visual** | Instantâneo ao marcar |

### Processo 06.02 - Receber briefing específico de produção
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Visualizar notificação de novo briefing e abrir card |
| **Componente Principal** | `ProductionBriefingInbox` |
| **Sub-componentes** | `BriefingCard`, `PriorityBadge`, `DeadlineCountdown`, `OpenBriefingButton` |
| **Estado da UI** | Inbox com cards de briefings recebidos → badge de prioridade (P1-P4) → countdown de prazo → abre detalhe |
| **Agente Acionado** | CopyAgent (recebimento) |
| **Feedback Visual** | Card pisca suavemente quando novo, badge de prioridade colorido, countdown em vermelho se <24h |
| **SLA Visual** | Tempo real (push notification) |

### Processo 06.03 - Pesquisa de referências e tendências
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Clicar em "Buscar Tendências" e filtrar por nicho |
| **Componente Principal** | `TrendResearchTool` |
| **Sub-componentes** | `NicheSelector`, `TrendCarousel`, `HookLibrary`, `SaveReferenceButton` |
| **Estado da UI** | Selector de nicho → carousel de trends do Instagram/TikTok → lista de hooks que funcionam → salvar favoritos |
| **Agente Acionado** | CopyAgent (pesquisa via MCP/Camofox) |
| **Feedback Visual** | Loading skeleton, cards de trend com thumbnail, toast "Referência salva" |
| **SLA Visual** | 5s para buscar trends |

### Processo 06.04 - Produção da legenda/copy
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Escrever/editar copy com sugestões de IA e gerar 2 versões |
| **Componente Principal** | `CopyWriterStudio` |
| **Sub-componentes** | `HookInput`, `DevelopmentEditor`, `CTASelector`, `VersionToggle`, `CharCounter`, `EmojiPicker`, `HashtagSuggester` |
| **Estado da UI** | Editor dividido em Hook/Desenvolvimento/CTA → IA sugere melhorias → gera Versão A e B → contador de caracteres → emoji/hashtags |
| **Agente Acionado** | CopyAgent (produção + otimização) |
| **Feedback Visual** | Sugestões em tooltip amarelo, versions tabuladas, warning se ultrapassar limite, check verde se dentro |
| **SLA Visual** | 2s para gerar sugestões, instantâneo ao digitar |

### Processo 06.05 - Produção de roteiro de Reel/TikTok
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Preencher estrutura de roteiro com timings e indicações técnicas |
| **Componente Principal** | `VideoScriptBuilder` |
| **Sub-componentes** | `SceneBuilder`, `TimingInput`, `ToneSelector`, `MusicSuggester`, `OnScreenTextEditor`, `TransitionPicker` |
| **Estado da UI** | Timeline vertical de cenas → usuário define tempo de cada → seleciona tom → IA sugere trilha → adiciona textos on-screen → escolhe transições |
| **Agente Acionado** | CopyAgent (roteirização) + VideoAgent (sugestões técnicas) |
| **Feedback Visual** | Duration total calculada em tempo real, preview de trilha com play button, cenas numeradas |
| **SLA Visual** | 3s para sugerir trilha |

### Processo 06.06 - Produção de copy para anúncio (Ads)
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Criar 3 variações A/B/C com testes de headline e CTA |
| **Componente Principal** | `AdsCopyGenerator` |
| **Sub-componentes** | `HeadlineInput`, `SubheadlineInput`, `BodyEditor`, `VariationCards`, `CharLimitIndicator`, `ABTestPreview` |
| **Estado da UI** | 3 cards lado a lado (A/B/C) → usuário edita cada campo → indicador de limite (30/90/125 chars) → preview de como fica no anúncio |
| **Agente Acionado** | CopyAgent (produção) + AdsAgent (validação de specs) |
| **Feedback Visual** | Barra de progresso de caractere (verde/amarelo/vermelho), preview realístico do anúncio, badge "Pronto para teste" |
| **SLA Visual** | Instantâneo |

### Processo 06.07 - Produção de copy de site/landing page
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Estruturar seções da página e escrever copy de cada uma |
| **Componente Principal** | `LandingPageCopyBuilder` |
| **Sub-componentes** | `SectionMapper`, `HeroEditor`, `BenefitsList`, `SocialProofUploader`, `FAQBuilder`, `CTAConfigurator` |
| **Estado da UI** | Mapa visual da LP → usuário clica em cada seção (Hero, Benefícios, Prova Social, FAQ, CTA) → editor específico → preview da página |
| **Agente Acionado** | CopyAgent (produção) |
| **Feedback Visual** | Seções completas com check verde, preview da página em tempo real, score de conversão estimado |
| **SLA Visual** | 2s para calcular score |

### Processo 06.08 - Revisão e autoedição
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Ouvir copy em voz alta (TTS) e revisar com grammar checker |
| **Componente Principal** | `CopyRevisionSuite` |
| **Sub-componentes** | `TextToSpeechPlayer`, `GrammarChecker`, `HookStrengthMeter`, `CTAClearScore`, `InternalApproveButton` |
| **Estado da UI** | Player de áudio TTS → highlights de erros gramaticais → medidor de força do hook → score de clareza do CTA → aprovar |
| **Agente Acionado** | CopyAgent (auto-revisão) |
| **Feedback Visual** | Erros sublinhados em vermelho, hook score em gauge (verde se >80%), CTA score similar |
| **SLA Visual** | 1s para TTS, 2s para análise |

### Processo 06.09 - Entrega ao Social Media
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Clicar em "Entregar" e confirmar link com calendário |
| **Componente Principal** | `CopyDeliveryPortal` |
| **Sub-componentes** | `DeliveryList`, `CalendarLinkPreview`, `CopywriterNoteEditor`, `ConfirmDeliveryButton` |
| **Estado da UI** | Lista de copies prontas → preview de como estão linkadas ao calendário → campo para nota contextual → confirma entrega |
| **Agente Acionado** | CopyAgent (entrega) + SMAgent (recebimento) |
| **Feedback Visual** | Badge "Entregue" em verde, notificação enviada confirmada, status no calendário atualizado |
| **SLA Visual** | 2s para entregar |

### Processo 06.10 - Gestão de revisões
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Visualizar feedback do cliente, comentar e reenviar versão revisada |
| **Componente Principal** | `RevisionManager` |
| **Sub-componentes** | `FeedbackThread`, `ChangeHighlighter`, `VersionHistory`, `RevisedCopyEditor`, `ResendButton` |
| **Estado da UI** | Thread de feedback → mudanças solicitadas destacadas → histórico de versões (v1, v2, v3) → editor para revisão → reenvia |
| **Agente Acionado** | CopyAgent (revisão) |
| **Feedback Visual** | Diffs entre versões (verde=adicionado, vermelho=removido), contador de rounds, toast "Versão X enviada" |
| **SLA Visual** | 24h para entregar revisão (SLA de processo), instantâneo ao salvar |

---

## 🎨 SEÇÃO 07 - DESIGN GRÁFICO (DesignAgent)

### Processo 07.01 - Receber e analisar briefing visual
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Abrir briefing visual e marcar requisitos obrigatórios |
| **Componente Principal** | `VisualBriefingAnalyzer` |
| **Sub-componentes** | `RequirementChecklist`, `DimensionDisplay`, `ColorPalettePreview`, `ReferenceGallery`, `AnalyzeConfirmButton` |
| **Estado da UI** | Checklist de requisitos → dimensões exibidas → paleta de cores → galeria de referências → confirma análise |
| **Agente Acionado** | DesignAgent (análise) |
| **Feedback Visual** | Checkboxes marcados, palette renderizada, referências em grid, badge "Briefing Analisado" |
| **SLA Visual** | Instantâneo |

### Processo 07.02 - Consultar manual de marca do cliente
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Buscar manual na biblioteca e abrir viewer interativo |
| **Componente Principal** | `BrandManualViewer` |
| **Sub-componentes** | `ManualSearch`, `LogoGuidelines`, `ColorCodesDisplay`, `TypographySpecs`, `DoDontExamples` |
| **Estado da UI** | Search de manuais → viewer com abas (Logo, Cores, Tipografia, Aplicações, Proibições) → códigos HEX/CMYK copiáveis |
| **Agente Acionado** | DesignAgent (consulta) |
| **Feedback Visual** | Códigos de cor com botão "Copiar HEX", tipografia com preview de fonte, exemplos Do/Dont lado a lado |
| **SLA Visual** | 1s para carregar manual |

### Processo 07.03 - Seleção de banco de imagens e assets
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Pesquisar em bancos integrados e salvar assets na pasta do projeto |
| **Componente Principal** | `AssetLibraryExplorer` |
| **Sub-componentes** | `MultiBankSearch`, `LicenseFilter`, `AssetPreviewModal`, `ProjectFolderSelector`, `BulkDownloadButton` |
| **Estado da UI** | Busca unificada (Unsplash, Adobe Stock, Freepik) → filtro por licença → preview em modal → seleciona pasta do projeto → baixa |
| **Agente Acionado** | DesignAgent (busca) |
| **Feedback Visual** | Badge de licença (✅ Comercial), contador de assets selecionados, toast "X assets salvos na pasta" |
| **SLA Visual** | 3s para busca multi-banco |

### Processo 07.04 - Criação das peças - Posts de feed
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Usar canvas interativo para montar peça com elementos arrastáveis |
| **Componente Principal** | `FeedPostDesigner` |
| **Sub-componentes** | `Canvas1080x1080`, `LayerPanel`, `HierarchyGuide`, `ContrastChecker`, `ExportButton` |
| **Estado da UI** | Canvas quadrado → camadas à esquerda → guias de hierarquia visual → verificador de contraste WCAG → exporta |
| **Agente Acionado** | DesignAgent (criação) |
| **Feedback Visual** | Guias aparecem ao mover elementos, contraste em tempo real (verde se ≥4.5:1), preview mobile |
| **SLA Visual** | Instantâneo no drag |

### Processo 07.05 - Criação das peças - Stories
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Montar story vertical com zona segura destacada |
| **Componente Principal** | `StoriesDesigner` |
| **Sub-componentes** | `Canvas1080x1920`, `SafeZoneOverlay`, `InteractiveStickers`, `VerticalLayoutGuide`, `PreviewPhone` |
| **Estado da UI** | Canvas vertical → overlay de zona segura (100px margem) → stickers de enquete/quiz/link → preview em mockup de celular |
| **Agente Acionado** | DesignAgent (criação) |
| **Feedback Visual** | Zona segura em vermelho translúcido, alertas se elemento fora da zona, preview realístico no phone |
| **SLA Visual** | Instantâneo |

### Processo 07.06 - Criação dos criativos de Anúncios
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Gerar variações A/B/C em múltiplos formatos automaticamente |
| **Componente Principal** | `AdsCreativeGenerator` |
| **Sub-componentes** | `CopyVariationSelector`, `FormatMultiplier`, `TextRatioChecker`, `PreviewGrid`, `ExportAllButton` |
| **Estado da UI** | Selector de copies A/B/C → multiplica para formatos (feed, retrato, stories) → verifica % de texto → grid de preview → exporta pack |
| **Agente Acionado** | DesignAgent (geração) + AdsAgent (validação) |
| **Feedback Visual** | Warning se >20% texto, grid com todas variações, badge "Pack pronto: X arquivos" |
| **SLA Visual** | 5s para gerar pack completo |

### Processo 07.07 - Criação de identidade visual
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Seguir wizard de branding em 5 etapas com apresentação de propostas |
| **Componente Principal** | `BrandingWizard` |
| **Sub-componentes** | `MoodboardBuilder`, `LogoSketches`, `ProposalPresenter`, `RefinementTool`, `ManualGenerator` |
| **Estado da UI** | Wizard passo-a-passo: (1) Moodboard → (2) Sketches → (3) 3 Propostas → (4) Refinamento → (5) Manual completo |
| **Agente Acionado** | DesignAgent (criação) |
| **Feedback Visual** | Progress bar do wizard, proposals em carousel, manual preview em PDF |
| **SLA Visual** | 10s por etapa (geração IA) |

### Processo 07.08 - Criação de peças para site/LP
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Exportar assets otimizados para web com compressão automática |
| **Componente Principal** | `WebAssetExporter` |
| **Sub-componentes** | `SectionMapper`, `FormatConverter`, `CompressionSlider`, `SizeOptimizer`, `ExportBySectionButton` |
| **Estado da UI** | Mapeamento de seções da LP → conversão WebP/JPEG → slider de compressão → otimizador mantém <200kb → exporta por seção |
| **Agente Acionado** | DesignAgent (exportação) |
| **Feedback Visual** | Tamanho de arquivo em tempo real, warning se >200kb, check verde quando otimizado |
| **SLA Visual** | 2s para otimizar cada asset |

### Processo 07.09 - Revisão de qualidade interna
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Passar checklist de QA automatizado com validações técnicas |
| **Componente Principal** | `DesignQAChecklist` |
| **Sub-componentes** | `ResolutionChecker`, `ColorConsistencyValidator`, `SpellingChecker`, `DimensionVerifier`, `QAStampButton` |
| **Estado da UI** | Checklist automático → validação de resolução (300/72 DPI) → consistência de cores → ortografia → dimensões → carimbo QA |
| **Agente Acionado** | DesignAgent (auto-validação) |
| **Feedback Visual** | Checks verdes automáticos, erros destacados em vermelho, carimbo "QA Aprovado" aparece quando tudo OK |
| **SLA Visual** | 3s para QA completo |

### Processo 07.10 - Exportação e entrega
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Exportar em formatos múltiplos e organizar na pasta do cliente |
| **Componente Principal** | `DesignDeliveryHub` |
| **Sub-componentes** | `FormatSelector`, `NamingConventionGenerator`, `FolderOrganizer`, `CalendarLinker`, `DeliverButton` |
| **Estado da UI** | Selector de formatos (PNG/JPG/PDF/MP4) → gera nomes padrão → organiza pastas → linka ao calendário → entrega |
| **Agente Acionado** | DesignAgent (entrega) + SMAgent (link) |
| **Feedback Visual** | Árvore de pastas gerada, nomes exibidos, toast "X arquivos entregues", link no calendário atualizado |
| **SLA Visual** | 5s para exportar pack |

### Processo 07.11 - Gestão de revisões
| Campo | Detalhe |
|-------|---------|
| **Ação do Usuário** | Visualizar feedback, aplicar mudanças e versionar arquivo |
| **Componente Principal** | `DesignRevisionTool` |
| **Sub-componentes** | `FeedbackOverlay`, `ChangeApplier`, `VersionComparator`, `NamingUpdater`, `ResendButton` |
| **Estado da UI** | Feedback sobreposto na arte → usuário aplica mudanças → compara v1 vs v2 side-by-side → atualiza nome (v2, v3) → reenvia |
| **Agente Acionado** | DesignAgent (revisão) |
| **Feedback Visual** | Diff visual entre versões, nome do arquivo atualizado automaticamente, toast "Versão X enviada" |
| **SLA Visual** | 24h para entregar revisão (SLA de processo) |

---

## 📊 RESUMO DA PARTE 2

| Seção | Processos | Componentes Principais | Sub-componentes Estimados |
|-------|-----------|----------------------|--------------------------|
| **05 - Social Media** | 11 | 11 | ~45 |
| **06 - Copywriting** | 10 | 10 | ~40 |
| **07 - Design Gráfico** | 11 | 11 | ~50 |
| **TOTAL PARTE 2** | **32** | **32** | **~135** |

---

## 🎯 PRÓXIMOS PASSOS

**Parte 3 (Final)** mapeará:
- Seção 08: Edição de Vídeo (11 processos) - VideoAgent
- Seção 09: Tráfego Pago (11 processos) - AdsAgent
- Seção 10: Financeiro (10 processos) - FinanceAgent

**Total Geral Após Parte 3:** 97 processos, ~97 componentes principais, ~380 sub-componentes, ~247 interações

Deseja prosseguir para a **Parte 3** ou revisar esta parte primeiro?
