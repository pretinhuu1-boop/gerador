import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { interactive?: boolean }>(
  ({ className, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'surface-panel p-4 transition-all',
        interactive && 'hover:border-border hover:bg-bg-elevated/40 cursor-pointer',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-start justify-between gap-3 mb-3', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-display text-base font-semibold text-fg-primary', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-fg-secondary', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';
