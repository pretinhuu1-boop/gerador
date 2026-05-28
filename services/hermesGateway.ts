import type { ToolCall } from '../types/database';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

export type HermesEventType =
  | 'session.created'
  | 'agent.start'
  | 'agent.handoff'
  | 'message.delta'
  | 'message.complete'
  | 'tool.call'
  | 'tool.result'
  | 'error'
  | 'done';

export interface HermesStreamEvent {
  type: HermesEventType;
  agent?: string;
  data?: Record<string, unknown>;
  [k: string]: unknown;
}

export interface SendOptions {
  sessionId: string | null;
  message: string;
  accessToken: string;
  workspace?: 'home' | 'scout' | 'channels' | 'memory' | 'mixed';
  history?: Array<{ role: string; content: string }>;
  signal?: AbortSignal;
  onEvent: (event: HermesStreamEvent) => void;
}

export async function sendHermesMessage(opts: SendOptions): Promise<void> {
  const res = await fetch(`${GATEWAY_URL}/v1/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${opts.accessToken}`,
    },
    body: JSON.stringify({
      session_id: opts.sessionId,
      message: opts.message,
      workspace: opts.workspace ?? 'mixed',
      history: opts.history ?? [],
    }),
    signal: opts.signal,
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '');
    opts.onEvent({
      type: 'error',
      data: { message: `Gateway returned ${res.status}`, detail: body.slice(0, 400) },
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
    // SSE frames are separated by blank lines
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const trimmed = frame.trim();
      if (!trimmed) continue;
      let eventName: string | undefined;
      const dataLines: string[] = [];
      for (const line of trimmed.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim();
        else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
      }
      const payload = dataLines.join('\n');
      if (!payload) continue;
      try {
        const parsed = JSON.parse(payload) as HermesStreamEvent;
        if (eventName && !parsed.type) parsed.type = eventName as HermesEventType;
        opts.onEvent(parsed);
      } catch (err) {
        console.warn('[hermes] bad SSE chunk', err, payload.slice(0, 120));
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
