import type { ToolCall } from '../../../types/database';

export type ChatMessageRole = 'user' | 'assistant' | 'tool' | 'system' | 'mission';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  agent?: string;
  toolCalls?: ToolCall[] | null;
  toolCallId?: string | null;
  toolName?: string | null;
  toolResult?: unknown;
  toolError?: string | null;
  /** When set, the bubble renders an embedded MissionCard with this mission. */
  missionId?: string;
  /** Optional title hint shown while the MissionCard loads. */
  missionTitle?: string;
  pending?: boolean;
  error?: string | null;
  model?: string | null;
}
