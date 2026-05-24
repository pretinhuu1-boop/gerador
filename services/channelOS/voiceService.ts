import { supabase } from '../supabase';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string | null;
  labels?: Record<string, string> | null;
  preview_url?: string | null;
}

interface VoicesResponse {
  configured: boolean;
  voices?: ElevenLabsVoice[];
  default?: string;
  error?: string;
}

async function bearer(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function listVoices(): Promise<VoicesResponse> {
  const token = await bearer();
  if (!token) return { configured: false, error: 'Sem sessão Supabase ativa' };

  const res = await fetch(`${GATEWAY_URL}/v1/voice/voices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return {
      configured: false,
      error: `gateway ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`,
    };
  }
  return (await res.json()) as VoicesResponse;
}

export interface SynthesizeOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  signal?: AbortSignal;
}

/** Returns an object URL with the MP3 — caller is responsible for revoking it. */
export async function synthesizeToObjectURL(opts: SynthesizeOptions): Promise<string> {
  const token = await bearer();
  if (!token) throw new Error('Sem sessão Supabase ativa — faça login.');

  const res = await fetch(`${GATEWAY_URL}/v1/voice/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text: opts.text,
      voice_id: opts.voiceId,
      model_id: opts.modelId,
    }),
    signal: opts.signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
