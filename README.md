# Channel OS

Sistema operacional para canais de conteúdo. Um shell agent-first onde **Hermes** (orquestrador LLM) coordena subagentes especializados pra **descobrir canais (Scout)**, **roteirizar conteúdo**, **operar canais** e **publicar** — tudo em um workspace só.

> **Fase 0 (MVP — esta build):** Scout funcionando ponta-a-ponta + shell de chat fullscreen + Hermes Gateway dockerizado com Orchestrator + Scout subagente via OpenRouter. Studios legados (Image/Video/Tools com Gemini/VEO) ficam acessíveis pela sidebar.

---

## Stack

| Camada | Tech |
|---|---|
| **Frontend** | React 19 + Vite 6 + TypeScript + Tailwind 3 + Framer Motion + Zustand + Supabase JS |
| **Auth & DB** | Supabase (local via Docker — `supabase start`) — Postgres 17, RLS por usuário |
| **Hermes Gateway** | Python 3.12 + FastAPI + SSE + httpx + tenacity |
| **Inferência** | OpenRouter (Hermes 4.3-36B orquestrador · Hermes 4-14B subagentes) |
| **Conectores Fase 0** | YouTube Data API v3, Supabase |
| **Conectores Fases 1-3** | Apify (scrapers TikTok/IG), ElevenLabs (TTS), Replicate (fallback), Postiz, Notion, Cloudflare R2, Resend |

Render programático (Remotion) entra na **Fase 2-3** pra templates faceless padronizados.

---

## Setup local

### 1. Pré-requisitos

- Node 20+
- Docker + Docker Compose
- Supabase CLI: `npm i -g supabase`
- (opcional pra Hermes Chat) chave OpenRouter — https://openrouter.ai/keys
- (opcional pra Scout real) chave YouTube Data API v3 — https://console.cloud.google.com/

### 2. Frontend

```bash
npm install
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL/ANON_KEY após `supabase start` (passo 3)
npm run dev          # http://localhost:3000
```

### 3. Supabase local

```bash
supabase start       # primeira vez baixa imagens (≈5 min)
supabase status      # copia API URL + anon key + service_role + JWT secret pro .env.local
supabase db reset    # aplica migrations sob supabase/migrations/
```

Studio em http://localhost:54323 (UI), API em http://localhost:54321.

Criar um usuário de teste: abra o Studio → **Authentication** → **Add user** (email + senha). O trigger `on_auth_user_created` cria um `profiles` row automaticamente.

### 4. Hermes Gateway (Docker)

```bash
# Copia .env (mesmas vars do .env.local + OPENROUTER_API_KEY + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_JWT_SECRET)
cp .env.example docker/.env
docker compose -f docker/docker-compose.yml --env-file docker/.env up -d

curl http://localhost:8088/healthz   # smoke test
```

> Sem chave OpenRouter o Scout standalone (sidebar) continua funcionando — ele chama YouTube + Supabase direto do front-end. O Hermes Chat só fica online quando OPENROUTER_API_KEY está setado.

---

## Estrutura de pastas

```
.
├── App.tsx                          # LoginGate → AppShell
├── index.html / index.tsx           # Vite entry
├── styles/globals.css               # design tokens + Tailwind directives
├── tailwind.config.js               # design system
├── components/
│   ├── ui/                          # Button, Card, Input, Badge, Avatar, Tooltip, Skeleton, Spinner
│   ├── shell/                       # AppShell, Sidebar, LoginScreen
│   ├── channel-os/
│   │   ├── Home.tsx                 # router por workspace ativo
│   │   ├── chat/                    # ChatHome (fullscreen), ChatComposer, ChatStream
│   │   ├── scout/                   # ScoutWorkspace + ChannelCard + ChannelDetail + ScoreRing
│   │   ├── channels/                # ChannelsWorkspace (lista persistida)
│   │   └── memory/                  # MemoryWorkspace (Hermes pins)
│   ├── ImageStudio.tsx              # legacy — Gemini flyers
│   ├── VideoStudio.tsx              # legacy — VEO 3
│   ├── ToolsStudio.tsx              # legacy
│   └── studios/…                    # legacy sub-modules
├── services/
│   ├── supabase.ts                  # client browser
│   ├── authService.ts               # Supabase Auth wrapper
│   ├── hermesGateway.ts             # SSE client pro gateway Python
│   ├── geminiService.ts             # legacy
│   └── channelOS/
│       ├── youtubeApi.ts            # YouTube Data API v3 client (browser-side)
│       ├── scoring.ts               # algoritmo de score heurístico
│       └── scoutService.ts          # resolve → score → persist Supabase
├── hooks/useAuth.ts
├── stores/appStore.ts               # zustand (surface, sidebar, workspace ativo)
├── types/database.ts                # tipos do schema
├── lib/cn.ts                        # tailwind-merge helper
├── supabase/
│   ├── config.toml
│   └── migrations/20260524000000_init_channel_os.sql
├── hermes-gateway/                  # Python service (FastAPI)
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── src/
│       ├── main.py                  # FastAPI + SSE
│       ├── config.py                # pydantic-settings
│       ├── auth.py                  # JWT verify (Supabase)
│       ├── orchestrator.py          # Hermes top-level
│       ├── agents/{base,scout}.py
│       ├── tools/                   # registry + youtube_tools + scout_tools
│       └── connectors/              # openrouter, supabase_client, youtube
└── docker/docker-compose.yml
```

---

## Modelo mental

**Hermes** é o seu chefe de operações. Ele:
1. Conversa com você (chat fullscreen home).
2. Quando você pede algo de especialista, ele invoca o **subagente** certo via tool calling:
   - **Scout** — descoberta, análise e tracking de canais.
   - *Em breve:* **Content** (roteirização + templates Remotion), **Channel** (operar seus canais), **Publisher** (agendar/publicar).
3. Tudo registra em **memória persistente** (`hermes_memory`) — preferências, metas, fatos do seu negócio que ele referência depois.
4. Cada conversa fica salva em `hermes_sessions` + `hermes_messages` com RLS por usuário.

---

## Comandos úteis

```bash
npm run dev                  # frontend dev
npm run build                # frontend build
npm run typecheck            # tsc --noEmit

npm run supabase:start       # supabase local up
npm run supabase:reset       # reset DB + reaplica migrations
npm run supabase:stop        # tear down

npm run gateway:dev          # rodar gateway Python local (sem Docker)
npm run gateway:up           # docker compose up hermes-gateway
npm run stack:up             # docker compose up all services
```

---

## Próximas fases

| Fase | Foco | Subagentes novos | Conectores |
|------|------|------------------|------------|
| **1** | Scout multi-plataforma + Hermes Chat com memory ativa | — | Apify (scrapers TikTok/IG), expand YouTube |
| **2** | ContentAgent: roteiros + Remotion templates faceless + TTS | Content | ElevenLabs, Replicate, Remotion |
| **3** | Publisher: publicação multi-plataforma agendada | Channel, Publisher | Postiz, YT OAuth Upload, TikTok Posting, IG Graph |
| **4** | Loop de auto-aprimoramento: ImproverAgent revisa replies, escreve novas tools, propõe migrations | Improver | Notion MCP, GDrive MCP |

---

## Licença / privacidade

Single-user por padrão (RLS isolado por `auth.uid()`). Multi-tenant pronto pra Fase 4 trocando algumas políticas. Nada de dados sai do seu Supabase local — exceto chamadas LLM (OpenRouter) e fetches públicos (YouTube API).
