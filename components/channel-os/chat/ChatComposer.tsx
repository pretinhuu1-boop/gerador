import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../../lib/cn';

export const ChatComposer = ({
  onSubmit,
  disabled,
  placeholder,
}: {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = `${Math.min(ref.current.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSubmit(value);
    setValue('');
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={cn(
        'relative surface-elevated rounded-2xl px-4 py-3 transition-all focus-within:border-brand focus-within:shadow-glow-brand',
        disabled && 'opacity-60',
      )}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder ?? 'Pede pro Hermes...'}
        disabled={disabled}
        rows={1}
        className="w-full bg-transparent resize-none text-sm text-fg-primary placeholder:text-fg-muted focus:outline-none scrollbar-none pr-12"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!value.trim() || disabled}
        className={cn(
          'absolute right-3 bottom-3 h-8 w-8 inline-flex items-center justify-center rounded-lg transition-all',
          value.trim() && !disabled
            ? 'bg-brand text-brand-contrast hover:bg-brand-muted shadow-glow-brand active:scale-95'
            : 'bg-bg-elevated text-fg-muted cursor-not-allowed',
        )}
        aria-label="Enviar"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
};
