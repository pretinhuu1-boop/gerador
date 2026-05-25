import { supabase } from '../supabase';
import type {
  HermesMission,
  HermesMissionStep,
  HermesMissionStatus,
} from '../../types/database';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

async function bearer(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export interface PlanMissionResponse {
  mission_id: string;
  title: string;
  summary?: string;
  steps: Array<{
    step_index: number;
    title: string;
    agent_key: string;
    tool_name: string;
    tool_args: Record<string, unknown>;
    depends_on?: number[];
    notes?: string;
  }>;
  status: HermesMissionStatus | string;
  error?: string;
}

export async function planMission(brief: string, sessionId?: string | null): Promise<PlanMissionResponse> {
  const token = await bearer();
  if (!token) throw new Error('Sem sessão Supabase — faça login.');

  const res = await fetch(`${GATEWAY_URL}/v1/missions/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ brief, session_id: sessionId ?? null }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as PlanMissionResponse;
}

export async function executeMission(missionId: string): Promise<{ mission_id: string; status: string }> {
  const token = await bearer();
  if (!token) throw new Error('Sem sessão Supabase — faça login.');

  const res = await fetch(`${GATEWAY_URL}/v1/missions/${missionId}/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  return await res.json();
}

export async function fetchMission(
  missionId: string,
): Promise<{ mission: HermesMission; steps: HermesMissionStep[] } | null> {
  const { data: m, error: mErr } = await supabase
    .from('hermes_missions')
    .select('*')
    .eq('id', missionId)
    .maybeSingle<HermesMission>();
  if (mErr) throw new Error(mErr.message);
  if (!m) return null;

  const { data: steps, error: sErr } = await supabase
    .from('hermes_mission_steps')
    .select('*')
    .eq('mission_id', missionId)
    .order('step_index');
  if (sErr) throw new Error(sErr.message);

  return { mission: m, steps: (steps as HermesMissionStep[]) ?? [] };
}

export async function listMissions(userId: string): Promise<HermesMission[]> {
  const { data, error } = await supabase
    .from('hermes_missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return (data as HermesMission[]) ?? [];
}

export function subscribeMission(
  missionId: string,
  onChange: (data: { mission?: HermesMission; step?: HermesMissionStep }) => void,
): () => void {
  const channel = supabase
    .channel(`mission:${missionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hermes_missions',
        filter: `id=eq.${missionId}`,
      },
      (payload) => {
        const mission = payload.new as HermesMission;
        if (mission) onChange({ mission });
      },
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hermes_mission_steps',
        filter: `mission_id=eq.${missionId}`,
      },
      (payload) => {
        const step = payload.new as HermesMissionStep;
        if (step) onChange({ step });
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
