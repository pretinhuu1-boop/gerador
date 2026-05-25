import { supabase } from '../supabase';

const GATEWAY_URL = import.meta.env.VITE_HERMES_GATEWAY_URL ?? 'http://localhost:8088';

export interface VideoTemplate {
  id: string;
  label: string;
  short_label: string;
  badge_color: string;
  aspect_ratio: string;
  width: number;
  height: number;
  fps: number;
  default_duration_seconds: number;
  recommended_for: string[];
  description: string;
  example_briefs: string[];
  requires_audio: boolean;
  requires_b_roll: boolean;
  status: string;
}

export interface TemplatesRegistry {
  templates: VideoTemplate[];
  count: number;
}

async function bearer(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

const DEMO_TEMPLATES: TemplatesRegistry = {
  count: 4,
  templates: [
    {
      id: 'StoriesVertical',
      label: 'Stories Vertical',
      short_label: 'Stories',
      badge_color: '#a855f7',
      aspect_ratio: '9:16',
      width: 1080,
      height: 1920,
      fps: 30,
      default_duration_seconds: 30,
      recommended_for: ['scary stories', 'history mistério', 'fact dump', 'conspiração', 'Shorts faceless'],
      description: 'Template padrão multi-uso pra Shorts/Reels faceless.',
      example_briefs: ['60s sobre uma cidade que desapareceu em 1985'],
      requires_audio: false,
      requires_b_roll: false,
      status: 'stable',
    },
    {
      id: 'RedditStories',
      label: 'Reddit Stories',
      short_label: 'Reddit',
      badge_color: '#ff4500',
      aspect_ratio: '9:16',
      width: 1080,
      height: 1920,
      fps: 30,
      default_duration_seconds: 38,
      recommended_for: ['AITA', 'Reddit storytelling', 'confession threads', 'revenge stories'],
      description: 'Header com post Reddit, beats como capítulos numerados.',
      example_briefs: ['AITA por contar pra família que meu irmão clonou minha vida?'],
      requires_audio: false,
      requires_b_roll: false,
      status: 'stable',
    },
    {
      id: 'TopList',
      label: 'Top List (countdown)',
      short_label: 'Top N',
      badge_color: '#facc15',
      aspect_ratio: '9:16',
      width: 1080,
      height: 1920,
      fps: 30,
      default_duration_seconds: 30,
      recommended_for: ['top 10', 'top 5', 'ranking', 'countdown listicle'],
      description: 'Countdown N→1 com número gigante por item.',
      example_briefs: ['Top 5 conspirações que se provaram reais'],
      requires_audio: false,
      requires_b_roll: false,
      status: 'stable',
    },
    {
      id: 'Audiogram',
      label: 'Audiogram',
      short_label: 'Audio',
      badge_color: '#22d3a8',
      aspect_ratio: '9:16',
      width: 1080,
      height: 1920,
      fps: 30,
      default_duration_seconds: 28,
      recommended_for: ['podcast clip', 'ASMR voiceover', 'sleep story', 'motivational quote'],
      description: 'Waveform reativo, hook flutuando, captions deslizando.',
      example_briefs: ['Por que dormimos pior quando estamos felizes?'],
      requires_audio: false,
      requires_b_roll: false,
      status: 'stable',
    },
  ],
};

export async function fetchTemplates(): Promise<TemplatesRegistry> {
  if (typeof window !== 'undefined' && window.location.search.includes('demo=1')) {
    return DEMO_TEMPLATES;
  }
  const token = await bearer();
  if (!token) throw new Error('Sem sessão Supabase — faça login.');
  const res = await fetch(`${GATEWAY_URL}/v1/templates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gateway ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as TemplatesRegistry;
}
