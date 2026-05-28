import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Telescope,
  Wand2,
  Megaphone,
  Brain,
  History,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAppStore } from '../../../stores/appStore';
import { gatewayHealthcheck, sendHermesMessage, type HermesStreamEvent } from '../../../services/hermesGateway';
import { supabase } from '../../../services/supabase';
import {
  createSession,
  insertMessage,
  listMessages,
  listSessions,
  archiveSession,
  touchSession,
  renameSession,
} from '../../../services/channelOS/sessionsService';
import { planMission } from '../../../services/channelOS/missionsService';
import type { HermesSession, ToolCall } from '../../../types/database';
import { Button } from '../../ui/Button';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { StatusChip } from '../../ui/StatusChip';
import { TopAppBar } from '../../shell/TopAppBar';
import { AgentStatusInspector } from './AgentStatusInspector';
import { ChatComposer } from './ChatComposer';
import { ChatStream } from './ChatStream';
import { SessionsDrawer } from './SessionsDrawer';
import type { ChatMessage } from './types';

const SUGGESTIONS: Array<{
  icon: typeof Sparkles;
  label: string;
  prompt: string;
  tone: 'brand' | 'accent' | 'info' | 'warn';
}> = [
  {
    icon: Telescope,
    label: 'Achar nichos com gap',
    prompt:
      'Liste 5 nichos no YouTube que ainda têm pouca competição faceless mas demanda crescente. Mostre o porquê de cada um.',
    tone: 'brand',
  },
  {
    icon: Wand2,
    label: 'Analisar um canal',
    prompt: 'Analisa o canal @MrBeast pra mim — pontos fortes, fracos e o que dá pra clonar.',
    tone: 'accent',
  },
  {
    icon: Megaphone,
    label: 'Brainstorm de roteiros',
    prompt: 'Me dá 10 ideias de Shorts faceless de mistério/conspiração, com hook nos primeiros 3 segundos.',
    tone: 'info',
  },
  {
    icon: Brain,
    label: 'Diagnóstico do meu canal',
    prompt: 'Olha meus canais salvos e me diz qual está com sinal de pico de crescimento.',
    tone: 'warn',
  },
];

const newMessage = (m: Partial<ChatMessage> & { role: ChatMessage['role'] }): ChatMessage => ({
  id: crypto.randomUUID(),
  content: '',
  ...m,
});

export const ChatHome = () => {
  const { user } = useAuth();
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<HermesSession[] | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // ---- gateway health ----
  useEffect(() => {
    let cancelled = false;
    const check = () => gatewayHealthcheck().then((r) => !cancelled && setGatewayOk(r.ok));
    check();
    const id = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // ---- sessions list ----
  const refreshSessions = useCallback(async () => {
    if (!user) return;
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const list = await Promise.race([
        listSessions(user.id),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout 6s')), 6000)),
      ]);
      setSessions(list);
    } catch (e) {
      setSessionsError(e instanceof Error ? e.message : String(e));
    } finally {
      setSessionsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // ---- session load ----
  const loadSession = useCallback(async (id: string) => {
    setSessionId(id);
    setDrawerOpen(false);
    try {
      const msgs = await listMessages(id);
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content ?? '',
          agent: m.agent_name ?? undefined,
          model: m.model ?? undefined,
          toolCalls: m.tool_calls ?? undefined,
          toolCallId: m.tool_call_id ?? undefined,
        })),
      );
    } catch (e) {
      setMessages([
        newMessage({
          role: 'system',
          content: `Falha ao carregar sessão: ${e instanceof Error ? e.message : String(e)}`,
        }),
      ]);
    }
  }, []);

  const startNewSession = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setDrawerOpen(false);
  }, []);

  const onArchive = useCallback(
    async (id: string) => {
      try {
        await archiveSession(id);
        if (id === sessionId) startNewSession();
        await refreshSessions();
      } catch (e) {
        console.error('archive failed', e);
      }
    },
    [sessionId, startNewSession, refreshSessions],
  );

  // ---- send ----
  const send = useCallback(
    async (text: string) => {
      if (!user || !text.trim() || streaming) return;

      // Stub mode when gateway offline OR no Supabase auth session
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      // Persist user message in memory immediately
      const userMsg = newMessage({ role: 'user', content: text });
      setMessages((prev) => [...prev, userMsg]);

      // /mission shortcut — bypass orchestrator, call plan endpoint directly.
      // Same behavior as Hermes invoking plan_mission via tool calling, but
      // skips the SSE round-trip so the MissionCard appears ~1s faster.
      const missionMatch = text.match(/^\s*\/mission\s+([\s\S]+)/i);
      if (missionMatch && accessToken && gatewayOk !== false) {
        const brief = missionMatch[1].trim();
        setStreaming(true);
        try {
          const plan = await planMission(brief, sessionId);
          if (plan.error) {
            setMessages((prev) => [
              ...prev,
              newMessage({
                role: 'assistant',
                agent: 'mission-planner',
                content: `Não consegui planejar essa missão: ${plan.error}`,
                error: plan.error,
              }),
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              newMessage({
                role: 'mission',
                missionId: plan.mission_id,
                missionTitle: plan.title,
              }),
              newMessage({
                role: 'assistant',
                agent: 'hermes',
                content:
                  (plan.summary ?? '') +
                  '\n\nPlano gerado. Revisa as etapas acima e clica em **Aprovar e rodar** quando quiser que eu execute.',
              }),
            ]);
          }
        } catch (e) {
          setMessages((prev) => [
            ...prev,
            newMessage({
              role: 'assistant',
              agent: 'mission-planner',
              content: `Falha planejando missão: ${e instanceof Error ? e.message : String(e)}`,
              error: e instanceof Error ? e.message : String(e),
            }),
          ]);
        } finally {
          setStreaming(false);
        }
        return;
      }

      if (gatewayOk === false || !accessToken) {
        const stubMsg = newMessage({
          role: 'assistant',
          agent: gatewayOk === false ? 'gateway-offline' : 'auth-required',
          content:
            gatewayOk === false
              ? 'Hermes gateway offline. Suba `docker compose up hermes-gateway` com `OPENROUTER_API_KEY` no `.env` pra ter streaming real. Enquanto isso, o workspace **Scout** funciona standalone — descoberta + scoring + persistência rodam direto do navegador.'
              : 'Sem sessão Supabase ativa. Faça login pra que o gateway possa autenticar suas requests.',
        });
        setMessages((prev) => [...prev, stubMsg]);
        return;
      }

      // Ensure a session exists (creates if needed)
      let currentSessionId = sessionId;
      try {
        if (!currentSessionId) {
          const created = await createSession(user.id, 'mixed');
          currentSessionId = created.id;
          setSessionId(created.id);
        }
        // Persist the user message
        await insertMessage({
          sessionId: currentSessionId,
          userId: user.id,
          role: 'user',
          content: text,
        });
        await touchSession(currentSessionId);
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        setMessages((prev) => [
          ...prev,
          newMessage({
            role: 'assistant',
            agent: 'storage-error',
            content: `Não consegui persistir essa mensagem no Supabase (${errMsg}). A conversa segue em memória nesta sessão.`,
          }),
        ]);
        // continue anyway with streaming, just without persistence
      }

      // Auto-name session from first message
      if (!sessions?.some((s) => s.id === currentSessionId && s.title)) {
        renameSession(currentSessionId!, text.slice(0, 60)).catch(() => undefined);
      }

      // Set up streaming placeholder
      const streamId = crypto.randomUUID();
      const placeholder: ChatMessage = {
        id: streamId,
        role: 'assistant',
        content: '',
        pending: true,
      };
      setMessages((prev) => [...prev, placeholder]);
      setStreaming(true);

      const abort = new AbortController();
      abortRef.current = abort;

      let agent: string | undefined;
      let model: string | undefined;
      let activeStreamId = streamId;
      let toolCallsForCurrent: ToolCall[] = [];

      try {
        await sendHermesMessage({
          sessionId: currentSessionId,
          message: text,
          accessToken,
          workspace: 'mixed',
          signal: abort.signal,
          onEvent: (event: HermesStreamEvent) => {
            switch (event.type) {
              case 'agent.start':
                agent = (event.agent as string) ?? (event.data?.name as string);
                model = (event.data?.model as string) ?? model;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === activeStreamId ? { ...m, agent, model, pending: true } : m,
                  ),
                );
                break;

              case 'agent.handoff': {
                // start a new bubble for the sub-agent
                const handoffId = crypto.randomUUID();
                activeStreamId = handoffId;
                toolCallsForCurrent = [];
                setMessages((prev) => [
                  ...prev,
                  {
                    id: handoffId,
                    role: 'assistant',
                    content: '',
                    agent: (event.data?.to as string) ?? 'agent',
                    pending: true,
                  },
                ]);
                break;
              }

              case 'message.delta': {
                const piece = (event as { content?: string }).content ?? (event.data?.content as string) ?? '';
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === activeStreamId
                      ? { ...m, content: m.content + piece, pending: true }
                      : m,
                  ),
                );
                break;
              }

              case 'tool.call': {
                const id = (event.data?.id as string) ?? crypto.randomUUID();
                const name = (event.data?.name as string) ?? 'unknown';
                let args: Record<string, unknown> = {};
                try {
                  args = JSON.parse((event.data?.arguments_raw as string) ?? '{}');
                } catch {
                  /* ignore */
                }
                const tc: ToolCall = { id, name, arguments: args, status: 'running' };
                toolCallsForCurrent = [...toolCallsForCurrent, tc];
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === activeStreamId ? { ...m, toolCalls: toolCallsForCurrent } : m,
                  ),
                );
                break;
              }

              case 'tool.result': {
                const id = (event.data?.id as string) ?? '';
                const result = event.data?.result;
                const isError = Boolean(event.data?.is_error);
                const tcName =
                  toolCallsForCurrent.find((t) => t.id === id)?.name ?? 'tool';
                setMessages((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    role: 'tool',
                    content: '',
                    toolCallId: id,
                    toolName: tcName,
                    toolResult: result,
                    toolError: isError ? (result as { error?: string })?.error ?? 'erro' : null,
                  },
                ]);
                break;
              }

              case 'message.complete': {
                const final = (event.data?.content as string) ?? '';
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === activeStreamId
                      ? { ...m, content: final || m.content, pending: false }
                      : m,
                  ),
                );
                break;
              }

              case 'error': {
                const detail =
                  (event.data?.message as string) ??
                  (event.data?.detail as string) ??
                  'falha desconhecida';
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === activeStreamId ? { ...m, pending: false, error: detail } : m,
                  ),
                );
                break;
              }

              case 'done':
                setStreaming(false);
                refreshSessions();
                break;
            }
          },
        });
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === activeStreamId
              ? { ...m, pending: false, error: e instanceof Error ? e.message : String(e) }
              : m,
          ),
        );
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [user, sessionId, sessions, gatewayOk, streaming, refreshSessions],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const empty = messages.length === 0;
  const greeting = (user?.displayName ?? user?.email?.split('@')[0] ?? 'criador').split(' ')[0];

  const activeSessionTitle = useMemo(
    () => sessions?.find((s) => s.id === sessionId)?.title ?? undefined,
    [sessions, sessionId],
  );

  const viewOptions = useMemo(
    () => [
      { value: 'atual' as const, label: 'Atual' },
      { value: 'sessoes' as const, label: 'Sessões', count: sessions?.length ?? 0 },
    ],
    [sessions?.length],
  );

  return (
    <div className="h-full flex">
      <div className="flex-1 min-w-0 flex flex-col">
        <TopAppBar
          extraCrumb={activeSessionTitle}
          center={
            <SegmentedControl
              value={drawerOpen ? 'sessoes' : 'atual'}
              onChange={(v) => setDrawerOpen(v === 'sessoes')}
              options={viewOptions}
            />
          }
          right={
            <>
              {gatewayOk === null ? (
                <StatusChip>checando…</StatusChip>
              ) : gatewayOk ? (
                <StatusChip tone="online" dot>
                  online
                </StatusChip>
              ) : (
                <StatusChip tone="pending" dot>
                  offline
                </StatusChip>
              )}
              {sessionId && (
                <Button variant="ghost" size="sm" onClick={startNewSession}>
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Nova</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(true)}>
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sessões</span>
              </Button>
            </>
          }
        />

        <div className="flex-1 min-h-0 flex flex-col canvas-grid">
          {empty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto py-12">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-2xl text-center"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 border border-brand/30 shadow-glow-brand mb-5">
                  <Sparkles className="h-6 w-6 text-brand-light" />
                </div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-fg-primary">
                  Oi, {greeting}.{' '}
                  <span className="text-gradient-brand">O que vamos atacar hoje?</span>
                </h1>
                <p className="text-fg-secondary text-sm mt-2 max-w-lg mx-auto">
                  Selecione uma ação ou comece a digitar.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 text-left">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        if (s.label.includes('canal') || s.label.includes('nichos')) {
                          setActiveWorkspace('scout');
                        } else {
                          send(s.prompt);
                        }
                      }}
                      className="group text-left bg-bg-panel border border-border-subtle hover:border-brand/40 hover:bg-bg-elevated/50 rounded-lg p-3.5 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 shrink-0 rounded-md flex items-center justify-center border ${
                            s.tone === 'brand'
                              ? 'bg-brand/15 border-brand/30 text-brand-light'
                              : s.tone === 'accent'
                                ? 'bg-accent/15 border-accent/30 text-accent'
                                : s.tone === 'info'
                                  ? 'bg-info/15 border-info/30 text-info'
                                  : 'bg-tertiary/15 border-tertiary/30 text-tertiary'
                          }`}
                        >
                          <s.icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-fg-primary">{s.label}</div>
                          <div className="text-[11px] text-fg-muted line-clamp-2 mt-0.5 leading-snug">
                            {s.prompt}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <ChatStream messages={messages} />
          )}

          <div className="shrink-0 border-t border-border-subtle bg-bg-panel/80 backdrop-blur px-4 sm:px-8 py-4">
            <div className="mx-auto max-w-3xl">
              <ChatComposer
                disabled={false}
                streaming={streaming}
                onCancel={cancel}
                placeholder={
                  gatewayOk === false
                    ? 'Gateway offline — você pode digitar, vou responder com stub.'
                    : 'Pede pro Hermes... ex: "achar 5 canais de mistério com até 50k subs"'
                }
                onSubmit={send}
              />
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-fg-muted">
                <div className="flex items-center gap-1.5">
                  <span>/scout</span>
                  <span>·</span>
                  <span>/content</span>
                  <span>·</span>
                  <span>/memory</span>
                  <span>·</span>
                  <span>/skill</span>
                </div>
                <span className="hidden sm:inline">
                  Hermes 4.3-36B → 4-14B · custo médio R$0.08/conversa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AgentStatusInspector />

      <SessionsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sessions={sessions}
        loading={sessionsLoading}
        error={sessionsError}
        activeId={sessionId}
        onSelect={loadSession}
        onArchive={onArchive}
        onNew={startNewSession}
        onRefresh={refreshSessions}
      />
    </div>
  );
};
