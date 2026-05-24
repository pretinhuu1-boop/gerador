import { supabase } from '../supabase';
import type {
  HermesMemory,
  HermesMessage,
  HermesSession,
  MemoryKind,
  MessageRole,
  ToolCall,
  WorkspaceKind,
} from '../../types/database';

// ---------------- sessions ----------------

export async function listSessions(userId: string, limit = 30): Promise<HermesSession[]> {
  const { data, error } = await supabase
    .from('hermes_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as HermesSession[]) ?? [];
}

export async function createSession(
  userId: string,
  workspace: WorkspaceKind = 'mixed',
  initialContext: Record<string, unknown> = {},
): Promise<HermesSession> {
  const { data, error } = await supabase
    .from('hermes_sessions')
    .insert({
      user_id: userId,
      workspace_kind: workspace,
      context: initialContext,
    })
    .select()
    .single<HermesSession>();
  if (error) throw new Error(`Falha ao criar sessão: ${error.message}`);
  return data;
}

export async function renameSession(sessionId: string, title: string): Promise<void> {
  const trimmed = title.trim().slice(0, 80);
  if (!trimmed) return;
  const { error } = await supabase
    .from('hermes_sessions')
    .update({ title: trimmed })
    .eq('id', sessionId);
  if (error) throw new Error(error.message);
}

export async function archiveSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('hermes_sessions')
    .update({ archived: true })
    .eq('id', sessionId);
  if (error) throw new Error(error.message);
}

export async function touchSession(sessionId: string): Promise<void> {
  await supabase
    .from('hermes_sessions')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', sessionId);
}

// ---------------- messages ----------------

export async function listMessages(sessionId: string): Promise<HermesMessage[]> {
  const { data, error } = await supabase
    .from('hermes_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as HermesMessage[]) ?? [];
}

interface InsertMessageInput {
  sessionId: string;
  userId: string;
  role: MessageRole;
  content?: string | null;
  toolCalls?: ToolCall[] | null;
  toolCallId?: string | null;
  agentName?: string | null;
  model?: string | null;
  usage?: HermesMessage['usage'];
}

export async function insertMessage(input: InsertMessageInput): Promise<HermesMessage> {
  const { data, error } = await supabase
    .from('hermes_messages')
    .insert({
      session_id: input.sessionId,
      user_id: input.userId,
      role: input.role,
      content: input.content ?? null,
      tool_calls: input.toolCalls ?? null,
      tool_call_id: input.toolCallId ?? null,
      agent_name: input.agentName ?? null,
      model: input.model ?? null,
      usage: input.usage ?? null,
    })
    .select()
    .single<HermesMessage>();
  if (error) throw new Error(`Falha ao salvar mensagem: ${error.message}`);
  return data;
}

// ---------------- memory ----------------

export async function listMemoryPins(userId: string): Promise<HermesMemory[]> {
  const { data, error } = await supabase
    .from('hermes_memory')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('importance', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as HermesMemory[]) ?? [];
}

interface CreateMemoryInput {
  userId: string;
  kind: MemoryKind;
  content: string;
  importance?: number;
  metadata?: Record<string, unknown>;
  sourceSessionId?: string | null;
}

export async function createMemoryPin(input: CreateMemoryInput): Promise<HermesMemory> {
  const { data, error } = await supabase
    .from('hermes_memory')
    .insert({
      user_id: input.userId,
      kind: input.kind,
      content: input.content,
      importance: Math.max(1, Math.min(5, input.importance ?? 3)),
      metadata: input.metadata ?? {},
      source_session_id: input.sourceSessionId ?? null,
    })
    .select()
    .single<HermesMemory>();
  if (error) throw new Error(`Falha ao criar pin de memória: ${error.message}`);
  return data;
}

export async function deactivateMemoryPin(id: string): Promise<void> {
  const { error } = await supabase.from('hermes_memory').update({ active: false }).eq('id', id);
  if (error) throw new Error(error.message);
}
