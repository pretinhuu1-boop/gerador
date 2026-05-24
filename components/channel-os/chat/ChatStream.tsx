import { useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from './types';

export const ChatStream = ({ messages }: { messages: ChatMessage[] }) => {
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initials = user?.displayName ?? user?.email ?? '?';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6">
      <div className="mx-auto max-w-3xl flex flex-col gap-5 min-w-0">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} userInitials={initials} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
