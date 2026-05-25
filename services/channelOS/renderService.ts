import { supabase } from '../supabase';
import type { ContentRender, RenderQuality } from '../../types/database';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

async function bearer(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export interface CreateRenderInput {
  draftId: string;
  voiceId?: string;
  quality?: RenderQuality;
}

export async function createRender(input: CreateRenderInput): Promise<{ render_id: string }> {
  const token = await bearer();
  if (!token) throw new Error('Sem sessão Supabase — faça login.');
  const res = await fetch(`${GATEWAY_URL}/v1/render/draft/${input.draftId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      voice_id: input.voiceId,
      quality: input.quality ?? 'preview',
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as { render_id: string };
}

export async function fetchRender(renderId: string): Promise<ContentRender | null> {
  const { data, error } = await supabase
    .from('content_renders')
    .select('*')
    .eq('id', renderId)
    .maybeSingle<ContentRender>();
  if (error) throw new Error(error.message);
  return data;
}

export async function latestRenderForDraft(draftId: string): Promise<ContentRender | null> {
  const { data, error } = await supabase
    .from('content_renders')
    .select('*')
    .eq('draft_id', draftId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<ContentRender>();
  if (error) throw new Error(error.message);
  return data;
}

/** Subscribes to row updates on a specific render. Returns an unsubscribe function. */
export function subscribeRender(renderId: string, onChange: (row: ContentRender) => void): () => void {
  const channel = supabase
    .channel(`render:${renderId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'content_renders',
        filter: `id=eq.${renderId}`,
      },
      (payload) => {
        const row = payload.new as ContentRender | undefined;
        if (row) onChange(row);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
