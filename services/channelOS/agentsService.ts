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
