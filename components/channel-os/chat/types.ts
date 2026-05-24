export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  agent?: string;
  toolCallId?: string;
  toolName?: string;
  pending?: boolean;
  error?: string;
};
