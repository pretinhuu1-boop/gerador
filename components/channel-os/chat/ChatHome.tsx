import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Telescope, Wand2, Megaphone, Brain, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useAppStore } from '../../../stores/appStore';
import { gatewayHealthcheck } from '../../../services/hermesGateway';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { ChatComposer } from './ChatComposer';
import { ChatStream } from './ChatStream';
import type { ChatMessage } from './types';

const SUGGESTIONS: Array<{ icon: typeof Sparkles; label: string; prompt: string; tone: 'brand' | 'accent' | 'info' | 'warn' }> = [
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
    prompt:
      'Me dá 10 ideias de Shorts faceless de mistério/conspiração, com hook nos primeiros 3 segundos.',
    tone: 'info',
  },
  {
    icon: Brain,
    label: 'Diagnóstico do meu canal',
    prompt: 'Olha meus canais salvos e me diz qual está com sinal de pico de crescimento.',
    tone: 'warn',
  },
];

export const ChatHome = () => {
  const { user } = useAuth();
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    gatewayHealthcheck().then((r) => {
      if (!cancelled) setGatewayOk(r.ok);
    });
    const id = setInterval(() => {
      gatewayHealthcheck().then((r) => !cancelled && setGatewayOk(r.ok));
    }, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const empty = messages.length === 0;
  const greeting = (user?.displayName ?? user?.email?.split('@')[0] ?? 'criador').split(' ')[0];

  return (
    <div className="h-full flex flex-col">
      <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-6 border-b border-border-subtle/50 backdrop-blur bg-bg-base/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand" />
          <h2 className="font-display font-semibold text-sm">Hermes</h2>
          <Badge variant="brand" size="sm" className="ml-1 font-mono">
            chat
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-fg-muted">
          {gatewayOk === null ? (
            <span className="opacity-60">checando gateway…</span>
          ) : gatewayOk ? (
            <span className="inline-flex items-center gap-1 text-success">
              <CheckCircle2 className="h-3 w-3" /> gateway online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-warn">
              <AlertCircle className="h-3 w-3" /> gateway offline · scout funciona standalone
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        {empty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto py-12">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-2xl text-center"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 border border-brand/30 shadow-glow-brand mb-5">
                <Sparkles className="h-6 w-6 text-brand" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                Oi, {greeting}. <span className="text-gradient-brand">O que vamos atacar hoje?</span>
              </h1>
              <p className="text-fg-secondary text-sm mt-2 max-w-lg mx-auto">
                Hermes é seu chefe de operações de canal. Pede pra ele caçar nicho, analisar concorrência,
                roteirizar, e ele invoca o subagente certo.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-8 text-left">
                {SUGGESTIONS.map((s) => (
                  <Card
                    key={s.label}
                    interactive
                    onClick={() => {
                      // For Phase 0: route obvious cases to standalone workspaces.
                      if (s.label.includes('canal') || s.label.includes('nichos')) {
                        setActiveWorkspace('scout');
                      } else {
                        setMessages([{ id: crypto.randomUUID(), role: 'user', content: s.prompt }]);
                      }
                    }}
                    className="group hover:border-brand/40 hover:shadow-glow-brand"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border ${
                          s.tone === 'brand'
                            ? 'bg-brand/15 border-brand/30 text-brand'
                            : s.tone === 'accent'
                              ? 'bg-accent/15 border-accent/30 text-accent'
                              : s.tone === 'info'
                                ? 'bg-info/15 border-info/30 text-info'
                                : 'bg-warn/15 border-warn/30 text-warn'
                        }`}
                      >
                        <s.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{s.label}</div>
                        <div className="text-xs text-fg-muted line-clamp-2 mt-1">{s.prompt}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <ChatStream messages={messages} streaming={streaming} />
        )}

        <div className="shrink-0 border-t border-border-subtle/50 bg-bg-base/80 backdrop-blur px-4 sm:px-8 py-4">
          <div className="mx-auto max-w-3xl">
            <ChatComposer
              disabled={streaming || gatewayOk === false}
              placeholder={
                gatewayOk === false
                  ? 'Hermes gateway offline — rode `docker compose up hermes-gateway` ou use Scout direto'
                  : 'Pede pro Hermes... ex: "achar 5 canais de mistério com até 50k subs"'
              }
              onSubmit={(text) => {
                if (!text.trim()) return;
                setMessages((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), role: 'user', content: text },
                  {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content:
                      'Hermes Gateway ainda não está plugado no streaming nesta build. Use o workspace Scout (sidebar) pra rodar a análise de canal real agora — o roteamento de chat→tool entra no próximo deploy.',
                    agent: 'system',
                  },
                ]);
                setStreaming(false);
              }}
            />
            <p className="mt-2 text-center text-[11px] text-fg-muted">
              {gatewayOk
                ? 'Hermes Orchestrator (Hermes 4.3-36B) · subagentes Hermes 4-14B via OpenRouter'
                : 'streaming desativado · scout workspace funciona standalone'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
