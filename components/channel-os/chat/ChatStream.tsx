import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';
import { Spinner } from '../../ui/Spinner';
import { useAuth } from '../../../hooks/useAuth';
import { cn } from '../../../lib/cn';
import type { ChatMessage } from './types';

export const ChatStream = ({
  messages,
  streaming,
}: {
  messages: ChatMessage[];
  streaming?: boolean;
}) => {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streaming]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6">
      <div className="mx-auto max-w-3xl flex flex-col gap-5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex gap-3 animate-fade-in', m.role === 'user' && 'flex-row-reverse')}
          >
            {m.role === 'user' ? (
              <Avatar
                size="sm"
                fallback={user?.displayName ?? user?.email ?? '?'}
                className="border-brand/30 bg-brand/10 text-brand shrink-0"
              />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={cn(
                'rounded-2xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed',
                m.role === 'user'
                  ? 'bg-brand/15 border border-brand/30 text-fg-primary'
                  : 'surface-panel',
              )}
            >
              {m.agent && m.role === 'assistant' && (
                <div className="text-[10px] font-mono text-fg-muted mb-1 uppercase tracking-wider">
                  {m.agent}
                </div>
              )}
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.error && (
                <div className="mt-2 text-xs text-danger border-t border-danger/20 pt-2">{m.error}</div>
              )}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex gap-3 animate-fade-in">
            <div className="h-8 w-8 shrink-0 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="surface-panel rounded-2xl px-4 py-2.5 inline-flex items-center gap-2 text-sm text-fg-muted">
              <Spinner size={14} className="text-brand" />
              Hermes pensando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
