import type { ToolCall } from '../types/database';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

export interface HermesStreamEvent {
  type:
    | 'session.created'
    | 'message.start'
    | 'message.delta'
    | 'message.complete'
    | 'tool.call'
    | 'tool.result'
    | 'agent.handoff'
    | 'error'
    | 'done';
  data: Record<string, unknown>;
}

export interface SendOptions {
  sessionId?: string | null;
  message: string;
  accessToken: string;
  workspace?: 'home' | 'scout' | 'channels' | 'memory' | 'mixed';
  signal?: AbortSignal;
  onEvent: (event: HermesStreamEvent) => void;
}

export async function sendHermesMessage(opts: SendOptions): Promise<void> {
  const res = await fetch(`${GATEWAY_URL}/v1/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.accessToken}`,
    },
    body: JSON.stringify({
      session_id: opts.sessionId,
      message: opts.message,
      workspace: opts.workspace ?? 'mixed',
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '');
    opts.onEvent({
      type: 'error',
      data: { message: `Gateway returned ${res.status}`, detail: body },
    });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload) continue;
      try {
        opts.onEvent(JSON.parse(payload));
      } catch (err) {
        console.warn('[hermes] bad SSE chunk', err, payload);
      }
    }
  }
}

export async function gatewayHealthcheck(): Promise<{ ok: boolean; detail?: string }> {
  try {
    const res = await fetch(`${GATEWAY_URL}/healthz`, { method: 'GET' });
    if (!res.ok) return { ok: false, detail: `status ${res.status}` };
    const j = await res.json().catch(() => null);
    return { ok: true, detail: j?.status };
  } catch (err) {
    return { ok: false, detail: (err as Error).message };
  }
}

export type { ToolCall };
