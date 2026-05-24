import { supabase } from '../supabase';
import type { ContentBeat, ContentDraft, ContentFormat, ContentStatus } from '../../types/database';

export interface ListDraftsOptions {
  status?: ContentStatus | ContentStatus[];
  channelId?: string;
  limit?: number;
}

export async function listDrafts(
  userId: string,
  options: ListDraftsOptions = {},
): Promise<ContentDraft[]> {
  let q = supabase
    .from('content_drafts')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(options.limit ?? 50);

  if (options.channelId) q = q.eq('channel_id', options.channelId);
  if (options.status) {
    const arr = Array.isArray(options.status) ? options.status : [options.status];
    q = q.in('status', arr);
  } else {
    q = q.neq('status', 'archived');
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as ContentDraft[]) ?? [];
}

export interface CreateDraftInput {
  userId: string;
  title: string;
  format?: ContentFormat;
  channelId?: string | null;
  hook?: string;
  thesis?: string;
  beats?: ContentBeat[];
  cta?: string;
  hashtags?: string[];
  duration_seconds?: number;
  metadata?: Record<string, unknown>;
  notes?: string;
}

export async function createDraft(input: CreateDraftInput): Promise<ContentDraft> {
  const { data, error } = await supabase
    .from('content_drafts')
    .insert({
      user_id: input.userId,
      channel_id: input.channelId ?? null,
      format: input.format ?? 'short',
      title: input.title,
      hook: input.hook ?? null,
      thesis: input.thesis ?? null,
      beats: input.beats ?? [],
      cta: input.cta ?? null,
      hashtags: input.hashtags ?? [],
      duration_seconds: input.duration_seconds ?? null,
      metadata: input.metadata ?? {},
      notes: input.notes ?? null,
    })
    .select()
    .single<ContentDraft>();
  if (error) throw new Error(`Falha ao criar draft: ${error.message}`);
  return data;
}

export interface UpdateDraftInput
  extends Partial<Omit<ContentDraft, 'id' | 'user_id' | 'created_at' | 'updated_at'>> {}

export async function updateDraft(id: string, patch: UpdateDraftInput): Promise<ContentDraft> {
  const { data, error } = await supabase
    .from('content_drafts')
    .update(patch)
    .eq('id', id)
    .select()
    .single<ContentDraft>();
  if (error) throw new Error(`Falha ao atualizar draft: ${error.message}`);
  return data;
}

export async function archiveDraft(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_drafts')
    .update({ status: 'archived' })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function getDraft(id: string): Promise<ContentDraft | null> {
  const { data, error } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', id)
    .maybeSingle<ContentDraft>();
  if (error) throw new Error(error.message);
  return data;
}
