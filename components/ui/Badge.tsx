import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-bg-elevated text-fg-secondary border border-border-subtle',
        brand: 'bg-brand/15 text-brand border border-brand/30',
        accent: 'bg-accent/15 text-accent border border-accent/30',
        success: 'bg-success/15 text-success border border-success/30',
        warn: 'bg-warn/15 text-warn border border-warn/30',
        danger: 'bg-danger/15 text-danger border border-danger/30',
        info: 'bg-info/15 text-info border border-info/30',
      },
      size: { sm: 'text-[10px] px-1.5 py-0.5', md: 'text-xs px-2 py-0.5' },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, size, ...props }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
);
