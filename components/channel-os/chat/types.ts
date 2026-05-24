import type { ToolCall } from '../../../types/database';

export type ChatMessageRole = 'user' | 'assistant' | 'tool' | 'system';

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
  pending?: boolean;
  error?: string | null;
  model?: string | null;
}
