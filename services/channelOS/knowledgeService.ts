import { supabase } from '../supabase';

export type KnowledgeKind =
  | 'doc'
  | 'meta_prompt'
  | 'cinema_genre'
  | 'style_preset'
  | 'environment_preset'
  | 'narrative_preset'
  | 'lens_preset'
  | 'b_roll_scenario'
  | 'vibe_preset'
  | 'context_modifier'
  | 'texture_preset'
  | 'prompt'
  | 'vfx_preset'
  | 'remotion_template'
  | 'remotion_library'
  | 'remotion_skill'
  | 'remotion_workflow';

export interface KnowledgeRecord {
  id: string;
  kind: KnowledgeKind;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  metadata: {
    link?: string;
    install?: string;
    tags?: string[];
    source_file?: string;
    [k: string]: unknown;
  };
  active: boolean;
  /** null = global (seeded); UUID = owned by a specific user. */
  user_id: string | null;
  created_at: string;
}

export interface KnowledgeListResult {
  records: KnowledgeRecord[];
  total: number;
}

const DEMO_REMOTION: KnowledgeRecord[] = [
  {
    id: 'demo-1',
    kind: 'remotion_template',
    slug: 'template_tiktok_official',
    title: 'template-tiktok (official)',
    summary: 'Base 9:16 TikTok com captions word-by-word via Whisper.cpp.',
    content:
      'Template oficial Remotion pra Shorts/TikTok 9:16. Vem com captions auto-sync word-level via @remotion/install-whisper-cpp.',
    metadata: {
      link: 'https://github.com/remotion-dev/template-tiktok',
      install: 'npx create-video --template=remotion-dev/template-tiktok',
      tags: ['9:16', 'tiktok', 'captions', 'whisper', 'oficial'],
    },
    active: true,
    user_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    kind: 'remotion_library',
    slug: 'pkg_remotion_captions',
    title: '@remotion/captions',
    summary: 'Tipo Caption + serialize/parse SRT + tiktok-style helpers.',
    content: 'Pacote oficial pra captions.',
    metadata: {
      link: 'https://www.remotion.dev/docs/captions/api',
      install: 'npm i @remotion/captions',
      tags: ['captions', 'srt', 'oficial'],
    },
    active: true,
    user_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    kind: 'remotion_skill',
    slug: 'skill_audio_duration',
    title: 'getAudioDurationInSeconds',
    summary: 'Lê MP3/WAV e retorna duração exata em segundos.',
    content: 'Função do @remotion/media-utils.',
    metadata: {
      link: 'https://www.remotion.dev/docs/get-audio-duration-in-seconds',
      tags: ['audio', 'duration', 'essencial'],
    },
    active: true,
    user_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    kind: 'remotion_workflow',
    slug: 'workflow_short_video_maker_gyoridavid',
    title: 'gyoridavid/short-video-maker',
    summary: 'Script→Kokoro TTS→Whisper captions→Remotion render→MP4. MCP+REST.',
    content: 'Repo OSS 1.1k stars com pipeline Hermes-like.',
    metadata: {
      link: 'https://github.com/gyoridavid/short-video-maker',
      tags: ['pipeline', 'mcp', 'docker', 'mit'],
    },
    active: true,
    user_id: null,
    created_at: new Date().toISOString(),
  },
];

function isDemo(): boolean {
  return typeof window !== 'undefined' && window.location.search.includes('demo=1');
}

export async function listKnowledgeByKind(kind: KnowledgeKind): Promise<KnowledgeListResult> {
  if (isDemo()) {
    const records = DEMO_REMOTION.filter((r) => r.kind === kind);
    return { records, total: records.length };
  }
  const { data, count, error } = await supabase
    .from('hermes_knowledge')
    .select('id, kind, slug, title, summary, content, metadata, active, user_id, created_at', {
      count: 'exact',
    })
    .eq('kind', kind)
    .eq('active', true)
    .order('title', { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return {
    records: (data ?? []) as KnowledgeRecord[],
    total: count ?? data?.length ?? 0,
  };
}

export async function listKnowledgeCounts(): Promise<Record<KnowledgeKind, number>> {
  if (isDemo()) {
    const counts: Partial<Record<KnowledgeKind, number>> = {};
    for (const r of DEMO_REMOTION) {
      counts[r.kind] = (counts[r.kind] ?? 0) + 1;
    }
    return counts as Record<KnowledgeKind, number>;
  }
  const { data, error } = await supabase
    .from('hermes_knowledge')
    .select('kind')
    .eq('active', true)
    .limit(5000);
  if (error) throw new Error(error.message);
  const counts: Partial<Record<KnowledgeKind, number>> = {};
  for (const row of data ?? []) {
    const k = (row as { kind: KnowledgeKind }).kind;
    counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts as Record<KnowledgeKind, number>;
}

export interface NewKnowledgePin {
  kind: KnowledgeKind;
  title: string;
  summary?: string | null;
  content: string;
  link?: string | null;
  install?: string | null;
  tags?: string[];
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || `pin_${Date.now()}`;
}

/** Inserts a per-user pin into hermes_knowledge. RLS policy
 * `hermes_knowledge_user_write` permits this when user_id = auth.uid().
 * Slug is derived from title; collisions get a numeric suffix. */
export async function createKnowledgePin(input: NewKnowledgePin): Promise<KnowledgeRecord> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  if (!userId) throw new Error('Sem sessão — faça login pra criar pins.');

  const baseSlug = slugify(input.title);
  const metadata: Record<string, unknown> = {
    source: 'user_pin',
    ...(input.link ? { link: input.link } : {}),
    ...(input.install ? { install: input.install } : {}),
    ...(input.tags && input.tags.length ? { tags: input.tags } : {}),
  };

  // Try insert with the base slug; on unique-violation, append a counter.
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}_${attempt + 1}`;
    const { data, error } = await supabase
      .from('hermes_knowledge')
      .insert({
        user_id: userId,
        kind: input.kind,
        slug,
        title: input.title.trim(),
        summary: input.summary?.trim() || null,
        content: input.content.trim(),
        metadata,
        active: true,
      })
      .select('id, kind, slug, title, summary, content, metadata, active, user_id, created_at')
      .single();
    if (!error && data) return data as KnowledgeRecord;
    if (error?.code !== '23505') {
      // not a unique violation → real error
      throw new Error(error?.message ?? 'falha ao criar pin');
    }
  }
  throw new Error('não consegui gerar um slug único após 4 tentativas');
}

export async function deactivateKnowledgePin(id: string): Promise<void> {
  const { error } = await supabase
    .from('hermes_knowledge')
    .update({ active: false })
    .eq('id', id);
  if (error) throw new Error(error.message);
}
