// Hand-written types matching supabase/migrations/20260524000000_init_channel_os.sql
// Regenerate with: `supabase gen types typescript --local > types/database.ts`
// once the local stack is running.

export type PlatformKind = 'youtube' | 'tiktok' | 'instagram';
export type ChannelStatus = 'tracking' | 'archived' | 'deleted';
export type WorkspaceKind = 'scout' | 'content' | 'channel' | 'publisher' | 'mixed';
export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';
export type MemoryKind = 'preference' | 'fact' | 'goal' | 'channel_pin' | 'rule';
export type RunStatus = 'queued' | 'running' | 'done' | 'error' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  user_id: string;
  platform: PlatformKind;
  platform_id: string;
  handle: string | null;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  country: string | null;
  language: string | null;
  subscriber_count: number | null;
  view_count: number | null;
  video_count: number | null;
  status: ChannelStatus;
  score: number | null;
  score_breakdown: ScoreBreakdown;
  tags: string[];
  notes: string | null;
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChannelWithLatestMetric extends Channel {
  latest_metric_at: string | null;
  latest_subscriber_count: number | null;
  latest_view_count: number | null;
}

export interface ScoreBreakdown {
  growth?: number;
  engagement?: number;
  consistency?: number;
  monetization_potential?: number;
  competition_gap?: number;
  hermes_verdict?: string;
  [k: string]: unknown;
}

export interface ChannelMetric {
  id: string;
  channel_id: string;
  captured_at: string;
  subscriber_count: number | null;
  view_count: number | null;
  video_count: number | null;
  score: number | null;
  extra: Record<string, unknown>;
}

export interface ChannelVideo {
  id: string;
  channel_id: string;
  platform_video_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  duration_seconds: number | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  extra: Record<string, unknown>;
  fetched_at: string;
}

export interface HermesSession {
  id: string;
  user_id: string;
  title: string | null;
  workspace_kind: WorkspaceKind;
  context: Record<string, unknown>;
  last_message_at: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface HermesMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: MessageRole;
  content: string | null;
  tool_calls: ToolCall[] | null;
  tool_call_id: string | null;
  agent_name: string | null;
  model: string | null;
  usage: TokenUsage | null;
  created_at: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  status?: 'pending' | 'running' | 'done' | 'error';
  result?: unknown;
}

export interface TokenUsage {
  input?: number;
  output?: number;
  total?: number;
  cost_usd?: number;
}

export interface HermesMemory {
  id: string;
  user_id: string;
  kind: MemoryKind;
  content: string;
  metadata: Record<string, unknown>;
  importance: number;
  active: boolean;
  source_session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoutRun {
  id: string;
  user_id: string;
  session_id: string | null;
  query: string | null;
  parameters: Record<string, unknown>;
  status: RunStatus;
  started_at: string | null;
  ended_at: string | null;
  results_count: number;
  error: string | null;
  created_at: string;
}

export interface ScoutRunChannel {
  run_id: string;
  channel_id: string;
  score: number | null;
  rank: number | null;
}

// ============================================================
// Content drafts
// ============================================================

export type ContentFormat = 'short' | 'long' | 'reel' | 'tiktok' | 'flyer' | 'thumbnail';
export type ContentStatus =
  | 'draft'
  | 'approved'
  | 'rendering'
  | 'rendered'
  | 'published'
  | 'archived';

export interface ContentBeat {
  t?: number;
  text: string;
  b_roll?: string | null;
  caption?: string | null;
  voice?: string | null;
}

export interface ContentDraft {
  id: string;
  user_id: string;
  channel_id: string | null;
  session_id: string | null;
  format: ContentFormat;
  title: string;
  hook: string | null;
  thesis: string | null;
  beats: ContentBeat[];
  cta: string | null;
  hashtags: string[];
  duration_seconds: number | null;
  metadata: Record<string, unknown>;
  status: ContentStatus;
  generated_by: string | null;
  model: string | null;
  notes: string | null;
  template_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Content renders (MP4 pipeline)
// ============================================================

export type RenderStatus =
  | 'queued'
  | 'tts'
  | 'rendering'
  | 'uploading'
  | 'rendered'
  | 'error'
  | 'cancelled';

export type RenderQuality = 'preview' | 'final';

export interface RenderAudioClip {
  beat_index: number;
  url: string;
  duration_s: number;
}

export interface ContentRender {
  id: string;
  draft_id: string;
  user_id: string;
  status: RenderStatus;
  voice_id: string | null;
  quality: RenderQuality | string;
  mp4_url: string | null;
  audio_urls: RenderAudioClip[];
  duration_s: number | null;
  size_bytes: number | null;
  progress: number;
  stage: string | null;
  error: string | null;
  retry_count: number;
  started_at: string | null;
  ended_at: string | null;
  metadata: Record<string, unknown>;
  template_id: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Missions framework
// ============================================================

export type HermesMissionStatus =
  | 'draft'
  | 'planning'
  | 'approved'
  | 'running'
  | 'paused'
  | 'done'
  | 'error'
  | 'cancelled';

export type HermesMissionStepStatus =
  | 'pending'
  | 'running'
  | 'done'
  | 'error'
  | 'skipped'
  | 'cancelled';

export interface HermesMissionPlanStep {
  step_index: number;
  title: string;
  agent_key: string;
  tool_name: string | null;
  tool_args: Record<string, unknown>;
  depends_on?: number[];
  notes?: string;
}

export interface HermesMissionPlan {
  title: string;
  summary?: string;
  steps: HermesMissionPlanStep[];
}

export interface HermesMission {
  id: string;
  user_id: string;
  session_id: string | null;
  title: string;
  brief: string;
  plan: HermesMissionPlan | Record<string, unknown>;
  status: HermesMissionStatus;
  progress: number;
  outputs: Record<string, unknown>;
  metadata: Record<string, unknown>;
  total_steps: number;
  done_steps: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HermesMissionStep {
  id: string;
  mission_id: string;
  step_index: number;
  title: string;
  agent_key: string;
  tool_name: string | null;
  tool_args: Record<string, unknown>;
  depends_on: number[] | null;
  status: HermesMissionStepStatus;
  result: Record<string, unknown> | null;
  error: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HermesCustomAgent {
  id: string;
  user_id: string;
  key: string;
  name: string;
  badge: string;
  badge_color: string;
  role: string | null;
  description: string | null;
  model: string;
  system_prompt: string;
  allowed_tools: string[];
  temperature: number;
  active: boolean;
  created_by_mission: string | null;
  created_at: string;
  updated_at: string;
}
