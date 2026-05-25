import { supabase } from '../supabase';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

export interface AgentDescriptor {
  key: string;
  name: string;
  badge: string;
  badge_color: string;
  role: string;
  description: string;
  is_main: boolean;
  model: string;
  model_chain: string[];
  allowed_tools: string[];
  tools_count: number;
  temperature: number;
  system_prompt_chars: number;
  cache_system_prompt: boolean;
}

export interface AgentsRegistry {
  agents: AgentDescriptor[];
  fallback_chain: string[];
  models: {
    orchestrator: string;
    agent: string;
    improver: string;
  };
}

async function bearer(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function fetchAgentsRegistry(): Promise<AgentsRegistry> {
  // DEMO MOCK — ?demo=1 in URL → render the workspace without a running gateway.
  if (typeof window !== 'undefined' && window.location.search.includes('demo=1')) {
    return DEMO_REGISTRY;
  }
  const token = await bearer();
  if (!token) throw new Error('Sem sessão Supabase — faça login.');
  const res = await fetch(`${GATEWAY_URL}/v1/agents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as AgentsRegistry;
}

const DEMO_REGISTRY: AgentsRegistry = {
  agents: [
    {
      key: 'orchestrator',
      name: 'Hermes',
      badge: 'HER',
      badge_color: '#a855f7',
      role: 'Orquestrador',
      description:
        'Decide e delega — recebe seu pedido, escolhe qual subagente chamar, consolida o resultado.',
      is_main: true,
      model: 'nousresearch/hermes-4.3-36b',
      model_chain: ['nousresearch/hermes-4.3-36b', 'anthropic/claude-sonnet-4.5'],
      allowed_tools: [
        'delegate_to_scout',
        'delegate_to_content',
        'pin_memory',
        'list_memory',
        'recall_memory',
        'deactivate_memory',
      ],
      tools_count: 6,
      temperature: 0.7,
      system_prompt_chars: 1842,
      cache_system_prompt: true,
    },
    {
      key: 'scout',
      name: 'Scout',
      badge: 'SCT',
      badge_color: '#38f8a7',
      role: 'Discovery YouTube',
      description:
        'Descobre canais por nicho, audita métricas, extrai blueprint de vídeos vencedores e lê sentiment de comentários.',
      is_main: false,
      model: 'nousresearch/hermes-4-14b',
      model_chain: ['nousresearch/hermes-4-14b', 'anthropic/claude-sonnet-4.5'],
      allowed_tools: [
        'fetch_youtube_channel',
        'scout_youtube_channel',
        'discover_youtube_channels',
        'extract_video_blueprint',
        'read_top_comments',
        'pin_memory',
        'list_memory',
        'recall_memory',
      ],
      tools_count: 8,
      temperature: 0.4,
      system_prompt_chars: 1576,
      cache_system_prompt: true,
    },
    {
      key: 'content',
      name: 'Content',
      badge: 'CNT',
      badge_color: '#facc15',
      role: 'Roteirização',
      description:
        'Brainstorm de ideias, redação de roteiros estruturados com hook/beats/CTA, preview de voz ElevenLabs.',
      is_main: false,
      model: 'nousresearch/hermes-4-14b',
      model_chain: ['nousresearch/hermes-4-14b', 'anthropic/claude-sonnet-4.5'],
      allowed_tools: [
        'brainstorm_ideas',
        'write_script',
        'list_content_drafts',
        'extract_video_blueprint',
        'read_top_comments',
        'list_elevenlabs_voices',
        'preview_voice',
        'pin_memory',
        'list_memory',
        'recall_memory',
      ],
      tools_count: 10,
      temperature: 0.7,
      system_prompt_chars: 1923,
      cache_system_prompt: true,
    },
  ],
  fallback_chain: ['anthropic/claude-sonnet-4.5'],
  models: {
    orchestrator: 'nousresearch/hermes-4.3-36b',
    agent: 'nousresearch/hermes-4-14b',
    improver: 'nousresearch/hermes-4.3-36b',
  },
};

export interface AgentMetrics {
  key: string;
  total_calls: number;
  last_used_at: string | null;
}

/** Aggregates per-agent activity by querying hermes_messages (assistant/tool turns
 * carry agent_name). Cheap-and-cheerful for the dashboard counters. */
export async function fetchAgentMetrics(userId: string): Promise<AgentMetrics[]> {
  const { data, error } = await supabase
    .from('hermes_messages')
    .select('agent_name, created_at')
    .eq('user_id', userId)
    .not('agent_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  const byAgent = new Map<string, AgentMetrics>();
  for (const row of data ?? []) {
    const key = (row as { agent_name: string }).agent_name;
    const ts = (row as { created_at: string }).created_at;
    if (!byAgent.has(key)) {
      byAgent.set(key, { key, total_calls: 0, last_used_at: ts });
    }
    const entry = byAgent.get(key)!;
    entry.total_calls += 1;
    if (!entry.last_used_at || ts > entry.last_used_at) entry.last_used_at = ts;
  }
  return Array.from(byAgent.values());
}
