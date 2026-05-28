import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const base =
  'w-full bg-bg-elevated border border-border-subtle text-fg-primary placeholder:text-fg-muted rounded-lg px-3 py-2 text-sm transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input ref={ref} type={type} className={cn(base, className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(base, 'min-h-[80px] resize-y leading-relaxed', className)} {...props} />
  ),
);
Textarea.displayName = 'Textarea';
