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
    .select('id, kind, slug, title, summary, content, metadata, active, created_at', {
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
