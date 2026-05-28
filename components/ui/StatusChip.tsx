import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/**
 * Dense status pill — used across all workspaces for agent/render/channel state.
 * Per Stitch spec: rounded-full, 10px label, 15% opacity bg + 100% text color.
 */
const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap',
  {
    variants: {
      tone: {
        default: 'bg-fg-muted/15 text-fg-secondary',
        online: 'bg-success/15 text-success',
        idle: 'bg-fg-muted/15 text-fg-muted',
        pending: 'bg-tertiary/15 text-tertiary',
        blocked: 'bg-danger/15 text-danger',
        brand: 'bg-brand/15 text-brand-light',
        info: 'bg-info/15 text-info',
      },
    },
    defaultVariants: { tone: 'default' },
  },
);

export interface StatusChipProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  dot?: boolean;
}

export const StatusChip = ({ className, tone, dot, children, ...props }: StatusChipProps) => (
  <span className={cn(chipVariants({ tone }), className)} {...props}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);
