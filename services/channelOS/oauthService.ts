import { supabase } from '../supabase';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

export type OAuthPlatform = 'youtube' | 'tiktok' | 'instagram';

export interface OAuthConnection {
  id: string;
  platform: OAuthPlatform;
  external_account_id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  scopes: string[];
  connected_at: string;
  expires_at: string | null;
}

async function bearer(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  if (!t) throw new Error('Sem sessão — faça login.');
  return t;
}

export async function listConnections(): Promise<OAuthConnection[]> {
  const token = await bearer();
  const res = await fetch(`${GATEWAY_URL}/v1/oauth/connections`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Gateway ${res.status}`);
  const data = (await res.json()) as { connections: OAuthConnection[] };
  return data.connections;
}

export async function startGoogleConnect(): Promise<string> {
  const token = await bearer();
  const res = await fetch(`${GATEWAY_URL}/v1/oauth/google/start`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { authorize_url: string };
  return data.authorize_url;
}

export async function deleteConnection(id: string): Promise<void> {
  const token = await bearer();
  const res = await fetch(`${GATEWAY_URL}/v1/oauth/connections/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Gateway ${res.status}`);
}

export interface PublishYouTubeInput {
  renderId: string;
  connectionId: string;
  title: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'private' | 'unlisted' | 'public';
  madeForKids?: boolean;
}

export interface PublishYouTubeResult {
  video_id: string | null;
  url: string | null;
  snippet: Record<string, unknown> | null;
  status: Record<string, unknown> | null;
}

export async function publishToYouTube(input: PublishYouTubeInput): Promise<PublishYouTubeResult> {
  const token = await bearer();
  const res = await fetch(`${GATEWAY_URL}/v1/publish/youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      render_id: input.renderId,
      connection_id: input.connectionId,
      title: input.title,
      description: input.description ?? '',
      tags: input.tags ?? [],
      category_id: input.categoryId ?? '22',
      privacy_status: input.privacyStatus ?? 'private',
      made_for_kids: input.madeForKids ?? false,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as PublishYouTubeResult;
}
