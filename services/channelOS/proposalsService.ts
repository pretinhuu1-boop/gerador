import { supabase } from '../supabase';
import type { HermesMemory } from '../../types/database';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

export type ProposalKind = 'skill' | 'automation' | 'memory_pin' | 'mission_template';

export interface ImproverProposal extends HermesMemory {
  metadata: {
    proposal?: boolean;
    proposal_kind?: ProposalKind;
    rationale?: string;
    steps?: string[];
    [k: string]: unknown;
  };
}

/** Reads pending proposals — hermes_memory rows with metadata.proposal === true. */
export async function listProposals(userId: string): Promise<ImproverProposal[]> {
  const { data, error } = await supabase
    .from('hermes_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .contains('metadata', { proposal: true })
    .order('updated_at', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data as ImproverProposal[]) ?? [];
}

/** Approves a proposal: strips the proposal flag so it becomes a regular pin
 *  (drops down to importance 4 if it was the default 5). Keeps proposal_kind
 *  in metadata for audit. */
export async function approveProposal(id: string, currentMetadata: Record<string, unknown>): Promise<void> {
  const nextMeta = { ...currentMetadata, proposal: false, approved_at: new Date().toISOString() };
  const { error } = await supabase
    .from('hermes_memory')
    .update({ metadata: nextMeta, importance: 4 })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

/** Rejects a proposal: soft-delete (active=false). */
export async function rejectProposal(id: string): Promise<void> {
  const { error } = await supabase.from('hermes_memory').update({ active: false }).eq('id', id);
  if (error) throw new Error(error.message);
}

/** Triggers the Improver via POST /v1/improver/run — analyzes the last `days`
 *  of activity + persists fresh proposals. Returns the raw tool response. */
export async function runImprover(days: number = 7): Promise<{
  proposals: Array<Record<string, unknown>>;
  persisted: number;
  window_days: number;
}> {
  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;
  if (!token) throw new Error('Sem sessão — faça login.');
  const res = await fetch(`${GATEWAY_URL}/v1/improver/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ days }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  return res.json();
}
