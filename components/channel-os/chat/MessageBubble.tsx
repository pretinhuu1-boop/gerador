import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronRight, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { cn } from '../../../lib/cn';
import { Markdown } from './Markdown';
import type { ChatMessage } from './types';

const AGENT_LABELS: Record<string, string> = {
  orchestrator: 'Hermes',
  scout: 'Scout',
  'gateway-offline': 'Gateway offline',
  'auth-required': 'Auth requerida',
  'storage-error': 'Erro de armazenamento',
  system: 'Sistema',
};

const agentDisplay = (raw?: string | null): string => {
  if (!raw) return '';
  return AGENT_LABELS[raw] ?? raw;
};

export const MessageBubble = ({
  message,
  userInitials,
}: {
  message: ChatMessage;
  userInitials: string;
}) => {
  if (message.role === 'tool') return <ToolResultBubble message={message} />;
  if (message.role === 'system') return <SystemNotice message={message} />;

  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 min-w-0 animate-fade-in', isUser && 'flex-row-reverse')}>
      {isUser ? (
        <Avatar
          size="sm"
          fallback={userInitials}
          className="border-brand/30 bg-brand/10 text-brand shrink-0"
        />
      ) : (
        <div className="h-8 w-8 shrink-0 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      )}
      <div
        className={cn(
          'min-w-0 rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed overflow-hidden',
          isUser ? 'bg-brand/15 border border-brand/30 text-fg-primary' : 'surface-panel',
        )}
      >
        {message.agent && !isUser && (
          <div className="text-[10px] font-mono text-fg-muted mb-1.5 tracking-wider inline-flex items-center gap-1.5">
            <span className="uppercase">{agentDisplay(message.agent)}</span>
            {message.model && (
              <Badge variant="default" size="sm" className="font-mono">
                {message.model.split('/').pop()}
              </Badge>
            )}
          </div>
        )}
        {message.content && (
          isUser ? (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          ) : (
            <Markdown>{message.content}</Markdown>
          )
        )}
        {message.pending && !message.content && (
          <span className="inline-flex h-2 gap-1 items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-fg-muted animate-pulse" style={{ animationDelay: '300ms' }} />
          </span>
        )}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.toolCalls.map((tc) => (
              <Badge key={tc.id} variant="info" size="sm" className="font-mono">
                <Wrench className="h-3 w-3" /> {tc.name}
              </Badge>
            ))}
          </div>
        )}
        {message.error && (
          <div className="mt-2 text-xs text-danger border-t border-danger/20 pt-2 inline-flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" /> {message.error}
          </div>
        )}
      </div>
    </div>
  );
};

const ToolResultBubble = ({ message }: { message: ChatMessage }) => {
  const [open, setOpen] = useState(false);
  const failed = Boolean(message.toolError);
  const label = message.toolName ?? 'tool';
  const summary = failed
    ? message.toolError
    : message.content?.slice(0, 60) ||
      summarizeResult(message.toolResult).slice(0, 60);

  return (
    <div className="animate-fade-in pl-11">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-mono transition-colors',
          failed
            ? 'border-danger/30 bg-danger/10 text-danger hover:bg-danger/20'
            : 'border-info/30 bg-info/10 text-info hover:bg-info/20',
        )}
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {failed ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
        <span className="font-semibold">{label}</span>
        {summary && <span className="opacity-70 truncate max-w-xs">— {summary}</span>}
      </button>
      {open && (
        <pre className="mt-1.5 max-w-xl text-[11px] font-mono text-fg-secondary surface-panel rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
          {failed ? message.toolError : pretty(message.toolResult ?? message.content)}
        </pre>
      )}
    </div>
  );
};

const SystemNotice = ({ message }: { message: ChatMessage }) => (
  <div className="animate-fade-in mx-auto max-w-md text-center text-xs text-fg-muted py-2">
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 surface-panel">
      <Sparkles className="h-3 w-3 text-brand" /> {message.content}
    </span>
  </div>
);

function summarizeResult(result: unknown): string {
  if (result == null) return '';
  if (typeof result === 'string') return result;
  if (typeof result === 'object') {
    const obj = result as Record<string, unknown>;
    if (typeof obj.title === 'string') return obj.title;
    if (typeof obj.error === 'string') return obj.error;
    return Object.keys(obj).slice(0, 3).join(', ');
  }
  return String(result);
}

function pretty(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
